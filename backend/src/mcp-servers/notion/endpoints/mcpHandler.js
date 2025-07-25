/**
 * Notion MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { NotionService } from '../api/notionApi.js';
import {
	searchPagesSchema,
	getPageSchema
} from './schemas.js';

// Import types from notionFormatting.js
/**
 * @typedef {import('../utils/notionFormatting.js').NotionRichText} NotionRichText
 * @typedef {import('../utils/notionFormatting.js').NotionUser} NotionUser
 * @typedef {import('../utils/notionFormatting.js').NotionParent} NotionParent
 * @typedef {import('../utils/notionFormatting.js').NotionProperty} NotionProperty
 * @typedef {import('../utils/notionFormatting.js').NotionFilter} NotionFilter
 * @typedef {import('../utils/notionFormatting.js').NotionSort} NotionSort
 * @typedef {import('../utils/notionFormatting.js').NotionPage} NotionPage
 * @typedef {import('../utils/notionFormatting.js').NotionDatabase} NotionDatabase
 * @typedef {import('../utils/notionFormatting.js').NotionBlock} NotionBlock
 * @typedef {import('../utils/notionFormatting.js').NotionSearchResponse} NotionSearchResponse
 * @typedef {import('../utils/notionFormatting.js').NotionBlocksResponse} NotionBlocksResponse
 * @typedef {import('../utils/notionFormatting.js').NotionQueryResponse} NotionQueryResponse
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

/**
 * @typedef {Object} NotionSearchOptions
 * @property {number} [page_size] - Number of results to return
 * @property {string} [start_cursor] - Pagination cursor
 * @property {ZodSearchSort} [sort] - Sort criteria
 * @property {ZodSearchFilter} [filter] - Filter criteria
 */

/**
 * @typedef {Object} ZodSearchFilter
 * @property {'page'|'database'} [value] - Filter by type
 * @property {string} [property] - Filter property
 */

/**
 * @typedef {Object} ZodSearchSort
 * @property {'ascending'|'descending'} [direction] - Sort direction
 * @property {'created_time'|'last_edited_time'} [timestamp] - Sort timestamp
 */

/**
 * @typedef {Object} ZodParent
 * @property {'page_id'|'database_id'} [type] - Parent type
 * @property {string} [page_id] - Page ID
 * @property {string} [database_id] - Database ID
 */

/**
 * @typedef {Record<string, Object>} ZodProperties
 * Properties from Zod schema as generic objects
 */

/**
 * @typedef {Object[]} ZodBlocks
 * Blocks from Zod schema as generic objects
 */

/**
 * @typedef {Object[]} ZodRichTextArray
 * Rich text from Zod schema as generic objects
 */

/**
 * @typedef {Object[]} ZodSorts
 * Sorts from Zod schema as generic objects
 */

/**
 * @typedef {Object} NotionPageCreateData
 * @property {ZodParent} parent - Parent page or database
 * @property {ZodProperties} [properties] - Page properties
 * @property {ZodBlocks} [children] - Page content blocks
 */

/**
 * @typedef {Object} NotionPageUpdateData
 * @property {ZodProperties} [properties] - Properties to update
 * @property {boolean} [archived] - Archive status
 */

/**
 * @typedef {Object} NotionDatabaseQueryOptions
 * @property {Object} [filter] - Filter criteria
 * @property {ZodSorts} [sorts] - Sort criteria
 * @property {string} [start_cursor] - Pagination cursor
 * @property {number} [page_size] - Number of results
 */

/**
 * @typedef {Object} NotionDatabaseCreateData
 * @property {ZodParent} parent - Parent page
 * @property {ZodRichTextArray} title - Database title
 * @property {ZodProperties} properties - Database properties schema
 */

/**
 * @typedef {Object} NotionDatabaseUpdateData
 * @property {ZodRichTextArray} [title] - Database title
 * @property {ZodProperties} [properties] - Database properties schema
 */

/**
 * @typedef {Object} MCPRequest
 * @property {string} [id] - Request ID
 * @property {string} method - Method name
 * @property {Object} [params] - Parameters
 */

/**
 * @typedef {Object} MCPToolResult
 * @property {Array<{type: string, text: string}>} content - Response content
 * @property {boolean} [isError] - Whether this is an error response
 */

export class NotionMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
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
	 * Setup MCP tools using Zod schemas
	 */
	setupTools() {
		// Tool 1: search
		this.server.tool(
			"search",
			"Search for pages and databases in Notion",
			searchPagesSchema,
			async ({ query, sort, filter }) => {
				console.log(`🔧 Tool call: search for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build search args with proper type casting
					const searchArgs = { 
						query,
						...(filter && { filter: /** @type {{value: string, property: string}} */ (filter) }),
						...(sort && { sort: /** @type {{direction: 'ascending' | 'descending', timestamp: 'last_edited_time'}} */ (sort) })
					};
					const result = await notionService.search(searchArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching Notion:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching Notion: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 2: get_page
		this.server.tool(
			"get_page",
			"Get a specific page by ID",
			getPageSchema,
			async ({ page_id }) => {
				console.log(`🔧 Tool call: get_page for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.getPage({ pageId: page_id });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 3: get_page_blocks
		this.server.tool(
			"get_page_blocks",
			"Get blocks/content of a page",
			{
				page_id: z.string().describe("Page ID"),
				start_cursor: z.string().optional().describe("Pagination cursor")
			},
			async ({ page_id, start_cursor }) => {
				console.log(`🔧 Tool call: get_page_blocks for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.getPageBlocks({ pageId: page_id, start_cursor });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting page blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page blocks: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 4: create_page
		this.server.tool(
			"create_page",
			"Create a new page",
			{
				parent: z.object({
					type: z.enum(['page_id', 'database_id']).describe("Parent type"),
					page_id: z.string().optional().describe("Parent page ID"),
					database_id: z.string().optional().describe("Parent database ID")
				}).describe("Parent page or database"),
				properties: z.record(z.string(), z.unknown()).optional().describe("Page properties"),
				children: z.array(z.unknown()).optional().describe("Page content blocks")
			},
			async ({ parent, properties, children }) => {
				console.log(`🔧 Tool call: create_page for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build create page args with proper type casting
					const createPageArgs = { 
						parent: /** @type {NotionParent} */ (parent),
						properties: /** @type {Record<string, NotionProperty>} */ (properties || {}),
						...(children && { children: /** @type {NotionBlock[]} */ (children) })
					};
					const result = await notionService.createPage(createPageArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating page: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 5: update_page
		this.server.tool(
			"update_page",
			"Update page properties",
			{
				page_id: z.string().describe("Page ID"),
				properties: z.record(z.string(), z.unknown()).optional().describe("Properties to update"),
				archived: z.boolean().optional().describe("Archive status")
			},
			async ({ page_id, properties, archived }) => {
				console.log(`🔧 Tool call: update_page for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build update page args with proper type casting
					const updatePageArgs = { 
						pageId: page_id,
						...(properties && { properties: /** @type {Record<string, NotionProperty>} */ (properties) }),
						...(archived !== undefined && { archived })
					};
					const result = await notionService.updatePage(updatePageArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating page: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 6: get_database
		this.server.tool(
			"get_database",
			"Get database information",
			{
				database_id: z.string().describe("Database ID")
			},
			async ({ database_id }) => {
				console.log(`🔧 Tool call: get_database for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.getDatabase({ databaseId: database_id });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting database: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 7: query_database
		this.server.tool(
			"query_database",
			"Query database entries",
			{
				database_id: z.string().describe("Database ID"),
				filter: z.unknown().optional().describe("Filter criteria"),
				sorts: z.array(z.unknown()).optional().describe("Sort criteria"),
				start_cursor: z.string().optional().describe("Pagination cursor"),
				page_size: z.number().min(1).max(100).optional().default(100).describe("Number of results")
			},
			async ({ database_id, filter, sorts, start_cursor, page_size }) => {
				console.log(`🔧 Tool call: query_database for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build query database args with proper type casting
					/** @type {{ databaseId: string, filter?: NotionFilter, sorts?: NotionSort[], start_cursor?: string, page_size?: number }} */
					const queryArgs = { databaseId: database_id };
					if (filter) {
						queryArgs.filter = /** @type {NotionFilter} */ (filter);
					}
					if (sorts) {
						queryArgs.sorts = /** @type {NotionSort[]} */ (sorts);
					}
					if (start_cursor) {
						queryArgs.start_cursor = start_cursor;
					}
					if (page_size) {
						queryArgs.page_size = page_size;
					}
					const result = await notionService.queryDatabase(queryArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error querying database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error querying database: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 8: create_database
		this.server.tool(
			"create_database",
			"Create a new database",
			{
				parent: z.object({
					type: z.literal('page_id').describe("Parent type (must be page_id)"),
					page_id: z.string().describe("Parent page ID")
				}).describe("Parent page"),
				title: z.array(z.unknown()).describe("Database title"),
				properties: z.record(z.string(), z.unknown()).describe("Database properties schema")
			},
			async ({ parent, title, properties }) => {
				console.log(`🔧 Tool call: create_database for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build create database args with proper type casting
					const createDbArgs = {
						parent: /** @type {NotionParent} */ (parent),
						title: /** @type {NotionRichText[]} */ (title),
						properties: /** @type {Record<string, NotionProperty>} */ (properties)
					};
					const result = await notionService.createDatabase(createDbArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating database: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 9: update_database
		this.server.tool(
			"update_database",
			"Update database properties",
			{
				database_id: z.string().describe("Database ID"),
				title: z.array(z.unknown()).optional().describe("Database title"),
				properties: z.record(z.string(), z.unknown()).optional().describe("Database properties schema")
			},
			async ({ database_id, title, properties }) => {
				console.log(`🔧 Tool call: update_database for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build update database args with proper type casting
					const updateDbArgs = { 
						databaseId: database_id,
						...(title && { title: /** @type {NotionRichText[]} */ (title) }),
						...(properties && { properties: /** @type {Record<string, NotionProperty>} */ (properties) })
					};
					const result = await notionService.updateDatabase(updateDbArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating database: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 10: append_blocks
		this.server.tool(
			"append_blocks",
			"Append blocks to a page",
			{
				page_id: z.string().describe("Page ID"),
				children: z.array(z.unknown()).describe("Blocks to append")
			},
			async ({ page_id, children }) => {
				console.log(`🔧 Tool call: append_blocks for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					// Build append blocks args with proper type casting
					const appendArgs = {
						blockId: page_id,
						children: /** @type {NotionBlock[]} */ (children)
					};
					const result = await notionService.appendBlocks(appendArgs);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error appending blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error appending blocks: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 11: delete_block
		this.server.tool(
			"delete_block",
			"Delete a block",
			{
				block_id: z.string().describe("Block ID")
			},
			async ({ block_id }) => {
				console.log(`🔧 Tool call: delete_block for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.deleteBlock({ blockId: block_id });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error deleting block:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting block: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);

		// Tool 12: get_current_user
		this.server.tool("get_current_user", "Get current user information", {}, async () => {
			console.log(`🔧 Tool call: get_current_user for ${this.serviceConfig.name}`);
			try {
				const notionService = new NotionService({ bearerToken: this.bearerToken });
				const result = await notionService.getCurrentUser({});
				return {
					content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error getting current user:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting current user: ${error instanceof Error ? error.message : String(error)}` }]
				};
			}
		});

		// Tool 13: list_users
		this.server.tool(
			"list_users",
			"List all users",
			{
				start_cursor: z.string().optional().describe("Pagination cursor")
			},
			async ({ start_cursor }) => {
				console.log(`🔧 Tool call: list_users for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.listUsers({ start_cursor });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing users:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing users: ${error instanceof Error ? error.message : String(error)}` }]
					};
				}
			}
		);
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 * @param {MCPRequest} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
		const sessionIdString = Array.isArray(sessionId) ? sessionId[0] : sessionId;
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionIdString && this.transports[sessionIdString]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionIdString}`);
				transport = this.transports[sessionIdString];
			} else if (!sessionIdString && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Notion MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});
				
				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};
				
				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: (message && typeof message === 'object' && 'id' in message) ? message.id : null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: (message && typeof message === 'object' && 'id' in message) ? message.id : null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error instanceof Error ? error.message : String(error) },
				},
			});
		}
	}
}
