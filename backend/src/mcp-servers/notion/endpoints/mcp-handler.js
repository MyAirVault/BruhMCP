/**
 * Notion MCP Handler
 * Implements MCP protocol for Notion integration using @modelcontextprotocol/sdk
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

import { NotionService } from '../api/notion-api.js';
import {
	formatSearchResults,
	formatPageData,
	formatDatabaseData,
	formatBlocksData,
	formatQueryResults,
	formatUserData,
} from '../utils/notion-formatting.js';
import { handleNotionError, createMCPErrorResponse } from '../utils/error-handler.js';
import {
	isValidPageId,
	isValidDatabaseId,
	isValidBlockId,
	isValidSearchQuery,
	validatePageCreationData,
	validateDatabaseCreationData,
	validateBlockData,
	sanitizeSearchQuery,
	sanitizePageId,
} from '../utils/validation.js';
import { Logger } from '../utils/logger.js';

// Zod schemas for tool validation
const SearchSchema = z.object({
	query: z.string().min(1, 'Query is required'),
	page_size: z.number().min(1).max(100).optional(),
	start_cursor: z.string().optional(),
	sort: z
		.object({
			direction: z.enum(['ascending', 'descending']).optional(),
			timestamp: z.enum(['created_time', 'last_edited_time']).optional(),
		})
		.optional(),
	filter: z
		.object({
			value: z.enum(['page', 'database']).optional(),
			property: z.string().optional(),
		})
		.optional(),
});

const GetPageSchema = z.object({
	page_id: z.string().min(1, 'Page ID is required'),
});

const GetPageBlocksSchema = z.object({
	page_id: z.string().min(1, 'Page ID is required'),
	start_cursor: z.string().optional(),
	page_size: z.number().min(1).max(100).optional(),
});

const CreatePageSchema = z.object({
	parent: z.object({
		type: z.enum(['page_id', 'database_id']),
		page_id: z.string().optional(),
		database_id: z.string().optional(),
	}),
	properties: z.record(z.any()).optional(),
	children: z.array(z.any()).optional(),
});

const UpdatePageSchema = z.object({
	page_id: z.string().min(1, 'Page ID is required'),
	properties: z.record(z.any()).optional(),
	archived: z.boolean().optional(),
});

const GetDatabaseSchema = z.object({
	database_id: z.string().min(1, 'Database ID is required'),
});

const QueryDatabaseSchema = z.object({
	database_id: z.string().min(1, 'Database ID is required'),
	filter: z.any().optional(),
	sorts: z.array(z.any()).optional(),
	start_cursor: z.string().optional(),
	page_size: z.number().min(1).max(100).optional(),
});

const CreateDatabaseSchema = z.object({
	parent: z.object({
		type: z.literal('page_id'),
		page_id: z.string(),
	}),
	title: z.array(z.any()),
	properties: z.record(z.any()),
});

const UpdateDatabaseSchema = z.object({
	database_id: z.string().min(1, 'Database ID is required'),
	title: z.array(z.any()).optional(),
	properties: z.record(z.any()).optional(),
});

const AppendBlocksSchema = z.object({
	page_id: z.string().min(1, 'Page ID is required'),
	children: z.array(z.any()).min(1, 'At least one block is required'),
});

const DeleteBlockSchema = z.object({
	block_id: z.string().min(1, 'Block ID is required'),
});

const GetCurrentUserSchema = z.object({});

const ListUsersSchema = z.object({
	start_cursor: z.string().optional(),
	page_size: z.number().min(1).max(100).optional(),
});

export class NotionMCPHandler {
	/**
	 * @param {Object} serviceConfig - Service configuration
	 * @param {string} bearerToken - OAuth Bearer token
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
		this.notionService = new NotionService({ bearerToken });
		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;

		this.setupTools();
	}

	/**
	 * Setup MCP tools using new SDK .tool() pattern
	 */
	setupTools() {
		// Tool 1: search
		this.server.tool(
			'search',
			'Search for pages and databases in Notion',
			{
				query: z.string().describe('Search query'),
				page_size: z
					.number()
					.min(1)
					.max(100)
					.optional()
					.default(10)
					.describe('Number of results to return (1-100)'),
				start_cursor: z.string().optional().describe('Pagination cursor'),
				sort: z
					.object({
						direction: z.enum(['ascending', 'descending']).optional().describe('Sort direction'),
						timestamp: z.enum(['created_time', 'last_edited_time']).optional().describe('Sort timestamp'),
					})
					.optional()
					.describe('Sort options'),
				filter: z
					.object({
						value: z.enum(['page', 'database']).optional().describe('Filter by type'),
						property: z.string().optional().describe('Filter property'),
					})
					.optional()
					.describe('Filter options'),
			},
			async ({ query, page_size, start_cursor, sort, filter }) => {
				console.log(`🔧 Tool call: search for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleSearch({ query, page_size, start_cursor, sort, filter });
					return result;
				} catch (error) {
					console.error(`❌ Error searching Notion:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching Notion: ${error.message}` }],
					};
				}
			}
		);

		// Tool 2: get_page
		this.server.tool(
			'get_page',
			'Get a specific page by ID',
			{
				page_id: z.string().describe('Page ID'),
			},
			async ({ page_id }) => {
				console.log(`🔧 Tool call: get_page for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleGetPage({ page_id });
					return result;
				} catch (error) {
					console.error(`❌ Error getting page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page: ${error.message}` }],
					};
				}
			}
		);

		// Tool 3: get_page_blocks
		this.server.tool(
			'get_page_blocks',
			'Get blocks/content of a page',
			{
				page_id: z.string().describe('Page ID'),
				start_cursor: z.string().optional().describe('Pagination cursor'),
				page_size: z.number().min(1).max(100).optional().default(100).describe('Number of blocks to return'),
			},
			async ({ page_id, start_cursor, page_size }) => {
				console.log(`🔧 Tool call: get_page_blocks for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleGetPageBlocks({ page_id, start_cursor, page_size });
					return result;
				} catch (error) {
					console.error(`❌ Error getting page blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page blocks: ${error.message}` }],
					};
				}
			}
		);

		// Tool 4: create_page
		this.server.tool(
			'create_page',
			'Create a new page',
			{
				parent: z
					.object({
						type: z.enum(['page_id', 'database_id']).describe('Parent type'),
						page_id: z.string().optional().describe('Parent page ID'),
						database_id: z.string().optional().describe('Parent database ID'),
					})
					.describe('Parent page or database'),
				properties: z.record(z.any()).optional().describe('Page properties'),
				children: z.array(z.any()).optional().describe('Page content blocks'),
			},
			async ({ parent, properties, children }) => {
				console.log(`🔧 Tool call: create_page for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleCreatePage({ parent, properties, children });
					return result;
				} catch (error) {
					console.error(`❌ Error creating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating page: ${error.message}` }],
					};
				}
			}
		);

		// Tool 5: update_page
		this.server.tool(
			'update_page',
			'Update page properties',
			{
				page_id: z.string().describe('Page ID'),
				properties: z.record(z.any()).optional().describe('Properties to update'),
				archived: z.boolean().optional().describe('Archive status'),
			},
			async ({ page_id, properties, archived }) => {
				console.log(`🔧 Tool call: update_page for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleUpdatePage({ page_id, properties, archived });
					return result;
				} catch (error) {
					console.error(`❌ Error updating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating page: ${error.message}` }],
					};
				}
			}
		);

		// Tool 6: get_database
		this.server.tool(
			'get_database',
			'Get database information',
			{
				database_id: z.string().describe('Database ID'),
			},
			async ({ database_id }) => {
				console.log(`🔧 Tool call: get_database for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleGetDatabase({ database_id });
					return result;
				} catch (error) {
					console.error(`❌ Error getting database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting database: ${error.message}` }],
					};
				}
			}
		);

		// Tool 7: query_database
		this.server.tool(
			'query_database',
			'Query database entries',
			{
				database_id: z.string().describe('Database ID'),
				filter: z.any().optional().describe('Filter criteria'),
				sorts: z.array(z.any()).optional().describe('Sort criteria'),
				start_cursor: z.string().optional().describe('Pagination cursor'),
				page_size: z.number().min(1).max(100).optional().default(100).describe('Number of results'),
			},
			async ({ database_id, filter, sorts, start_cursor, page_size }) => {
				console.log(`🔧 Tool call: query_database for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleQueryDatabase({
						database_id,
						filter,
						sorts,
						start_cursor,
						page_size,
					});
					return result;
				} catch (error) {
					console.error(`❌ Error querying database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error querying database: ${error.message}` }],
					};
				}
			}
		);

		// Tool 8: create_database
		this.server.tool(
			'create_database',
			'Create a new database',
			{
				parent: z
					.object({
						type: z.literal('page_id').describe('Parent type (must be page_id)'),
						page_id: z.string().describe('Parent page ID'),
					})
					.describe('Parent page'),
				title: z.array(z.any()).describe('Database title'),
				properties: z.record(z.any()).describe('Database properties schema'),
			},
			async ({ parent, title, properties }) => {
				console.log(`🔧 Tool call: create_database for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleCreateDatabase({ parent, title, properties });
					return result;
				} catch (error) {
					console.error(`❌ Error creating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating database: ${error.message}` }],
					};
				}
			}
		);

		// Tool 9: update_database
		this.server.tool(
			'update_database',
			'Update database properties',
			{
				database_id: z.string().describe('Database ID'),
				title: z.array(z.any()).optional().describe('Database title'),
				properties: z.record(z.any()).optional().describe('Database properties schema'),
			},
			async ({ database_id, title, properties }) => {
				console.log(`🔧 Tool call: update_database for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleUpdateDatabase({ database_id, title, properties });
					return result;
				} catch (error) {
					console.error(`❌ Error updating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating database: ${error.message}` }],
					};
				}
			}
		);

		// Tool 10: append_blocks
		this.server.tool(
			'append_blocks',
			'Append blocks to a page',
			{
				page_id: z.string().describe('Page ID'),
				children: z.array(z.any()).describe('Blocks to append'),
			},
			async ({ page_id, children }) => {
				console.log(`🔧 Tool call: append_blocks for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleAppendBlocks({ page_id, children });
					return result;
				} catch (error) {
					console.error(`❌ Error appending blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error appending blocks: ${error.message}` }],
					};
				}
			}
		);

		// Tool 11: delete_block
		this.server.tool(
			'delete_block',
			'Delete a block',
			{
				block_id: z.string().describe('Block ID'),
			},
			async ({ block_id }) => {
				console.log(`🔧 Tool call: delete_block for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleDeleteBlock({ block_id });
					return result;
				} catch (error) {
					console.error(`❌ Error deleting block:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting block: ${error.message}` }],
					};
				}
			}
		);

		// Tool 12: get_current_user
		this.server.tool('get_current_user', 'Get current user information', {}, async () => {
			console.log(`🔧 Tool call: get_current_user for ${this.serviceConfig.name}`);
			try {
				const result = await this.handleGetCurrentUser({});
				return result;
			} catch (error) {
				console.error(`❌ Error getting current user:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting current user: ${error.message}` }],
				};
			}
		});

		// Tool 13: list_users
		this.server.tool(
			'list_users',
			'List all users',
			{
				start_cursor: z.string().optional().describe('Pagination cursor'),
				page_size: z.number().min(1).max(100).optional().default(100).describe('Number of users to return'),
			},
			async ({ start_cursor, page_size }) => {
				console.log(`🔧 Tool call: list_users for ${this.serviceConfig.name}`);
				try {
					const result = await this.handleListUsers({ start_cursor, page_size });
					return result;
				} catch (error) {
					console.error(`❌ Error listing users:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing users: ${error.message}` }],
					};
				}
			}
		);
	}

	/**
	 * Handle search requests
	 */
	async handleSearch(args) {
		const validatedArgs = SearchSchema.parse(args);
		const { query, page_size, start_cursor, sort, filter } = validatedArgs;

		if (!isValidSearchQuery(query)) {
			throw new Error('Invalid search query');
		}

		const sanitizedQuery = sanitizeSearchQuery(query);
		const searchOptions = {
			page_size,
			start_cursor,
			sort,
			filter,
		};

		const result = await this.notionService.search(sanitizedQuery, searchOptions);
		const formattedResult = formatSearchResults(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle get page requests
	 */
	async handleGetPage(args) {
		const validatedArgs = GetPageSchema.parse(args);
		const { page_id } = validatedArgs;

		if (!isValidPageId(page_id)) {
			throw new Error('Invalid page ID format');
		}

		const sanitizedPageId = sanitizePageId(page_id);
		const result = await this.notionService.getPage(sanitizedPageId);
		const formattedResult = formatPageData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle get page blocks requests
	 */
	async handleGetPageBlocks(args) {
		const validatedArgs = GetPageBlocksSchema.parse(args);
		const { page_id, start_cursor } = validatedArgs;

		if (!isValidPageId(page_id)) {
			throw new Error('Invalid page ID format');
		}

		const sanitizedPageId = sanitizePageId(page_id);
		const result = await this.notionService.getPageBlocks(sanitizedPageId, start_cursor);
		const formattedResult = formatBlocksData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle create page requests
	 */
	async handleCreatePage(args) {
		const validatedArgs = CreatePageSchema.parse(args);
		const validation = validatePageCreationData(validatedArgs);

		if (!validation.valid) {
			throw new Error(`Invalid page data: ${validation.errors.join(', ')}`);
		}

		const result = await this.notionService.createPage(validatedArgs);
		const formattedResult = formatPageData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle update page requests
	 */
	async handleUpdatePage(args) {
		const validatedArgs = UpdatePageSchema.parse(args);
		const { page_id, properties, archived } = validatedArgs;

		if (!isValidPageId(page_id)) {
			throw new Error('Invalid page ID format');
		}

		const sanitizedPageId = sanitizePageId(page_id);
		const updateData = { properties, archived };
		const result = await this.notionService.updatePage(sanitizedPageId, updateData);
		const formattedResult = formatPageData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle get database requests
	 */
	async handleGetDatabase(args) {
		const validatedArgs = GetDatabaseSchema.parse(args);
		const { database_id } = validatedArgs;

		if (!isValidDatabaseId(database_id)) {
			throw new Error('Invalid database ID format');
		}

		const result = await this.notionService.getDatabase(database_id);
		const formattedResult = formatDatabaseData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle query database requests
	 */
	async handleQueryDatabase(args) {
		const validatedArgs = QueryDatabaseSchema.parse(args);
		const { database_id, filter, sorts, start_cursor, page_size } = validatedArgs;

		if (!isValidDatabaseId(database_id)) {
			throw new Error('Invalid database ID format');
		}

		const queryOptions = { filter, sorts, start_cursor, page_size };
		const result = await this.notionService.queryDatabase(database_id, queryOptions);
		const formattedResult = formatQueryResults(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle create database requests
	 */
	async handleCreateDatabase(args) {
		const validatedArgs = CreateDatabaseSchema.parse(args);
		const validation = validateDatabaseCreationData(validatedArgs);

		if (!validation.valid) {
			throw new Error(`Invalid database data: ${validation.errors.join(', ')}`);
		}

		const result = await this.notionService.createDatabase(validatedArgs);
		const formattedResult = formatDatabaseData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle update database requests
	 */
	async handleUpdateDatabase(args) {
		const validatedArgs = UpdateDatabaseSchema.parse(args);
		const { database_id, title, properties } = validatedArgs;

		if (!isValidDatabaseId(database_id)) {
			throw new Error('Invalid database ID format');
		}

		const updateData = { title, properties };
		const result = await this.notionService.updateDatabase(database_id, updateData);
		const formattedResult = formatDatabaseData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle append blocks requests
	 */
	async handleAppendBlocks(args) {
		const validatedArgs = AppendBlocksSchema.parse(args);
		const { page_id, children } = validatedArgs;

		if (!isValidPageId(page_id)) {
			throw new Error('Invalid page ID format');
		}

		// Validate block data
		for (const block of children) {
			const validation = validateBlockData(block);
			if (!validation.valid) {
				throw new Error(`Invalid block data: ${validation.errors.join(', ')}`);
			}
		}

		const sanitizedPageId = sanitizePageId(page_id);
		const result = await this.notionService.appendBlocks(sanitizedPageId, children);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Handle delete block requests
	 */
	async handleDeleteBlock(args) {
		const validatedArgs = DeleteBlockSchema.parse(args);
		const { block_id } = validatedArgs;

		if (!isValidBlockId(block_id)) {
			throw new Error('Invalid block ID format');
		}

		const result = await this.notionService.deleteBlock(block_id);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	}

	/**
	 * Handle get current user requests
	 */
	async handleGetCurrentUser(args) {
		GetCurrentUserSchema.parse(args);
		const result = await this.notionService.getCurrentUser();
		const formattedResult = formatUserData(result);

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle list users requests
	 */
	async handleListUsers(args) {
		const validatedArgs = ListUsersSchema.parse(args);
		const { start_cursor } = validatedArgs;

		const result = await this.notionService.listUsers(start_cursor);
		const formattedResult = {
			users: result.results?.map(user => formatUserData(user)) || [],
			has_more: result.has_more,
			next_cursor: result.next_cursor,
		};

		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(formattedResult, null, 2),
				},
			],
		};
	}

	/**
	 * Handle MCP request (Express route handler)
	 */
	async handleMCPRequest(req, res, body) {
		try {
			// Validate request body
			if (!body || typeof body !== 'object') {
				return res.status(400).json({
					error: 'Invalid request body',
				});
			}

			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(body)}`);

			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(body)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: newSessionId => {
						console.log(`✅ Notion MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});

				// Setup cleanup on transport close with timeout
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};

				// Add error cleanup to prevent memory leaks
				transport.onerror = (error) => {
					console.error(`🚨 Transport error for session ${transport.sessionId}:`, error);
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport after error for session: ${transport.sessionId}`);
					}
				};

				// Add session timeout to prevent abandoned transports
				const sessionTimeout = setTimeout(() => {
					if (transport.sessionId && this.transports[transport.sessionId]) {
						delete this.transports[transport.sessionId];
						console.log(`⏰ Cleaned up abandoned transport for session: ${transport.sessionId}`);
					}
				}, 30 * 60 * 1000); // 30 minutes timeout

				// Store timeout reference for cleanup
				transport.sessionTimeout = sessionTimeout;

				// Connect server to transport
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// No session ID and not an initialization request
				console.log(`❌ No session ID for non-initialization request`);
				return res.status(400).json({
					error: 'Session ID required for non-initialization requests',
				});
			}

			// Process the request with new SDK pattern
			const response = await transport.handleRequest(body);
			
			// Check if response has already been sent
			if (!res.headersSent) {
				res.json(response);
			} else {
				console.warn('⚠️ Response headers already sent, skipping response');
			}
		} catch (error) {
			Logger.error('MCP request handling error:', error);
			const errorResponse = createMCPErrorResponse(handleNotionError(error), body?.id || null);
			
			// Check if response has already been sent
			if (!res.headersSent) {
				res.json(errorResponse);
			} else {
				console.warn('⚠️ Response headers already sent, skipping error response');
			}
		}
	}
}
