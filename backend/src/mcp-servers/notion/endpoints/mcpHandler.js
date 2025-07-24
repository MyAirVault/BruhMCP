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
	getPageSchema,
	getPageChildrenSchema,
	createPageSchema,
	updatePageSchema,
	getDatabaseSchema,
	queryDatabaseSchema,
	createDatabaseSchema,
	updateDatabaseSchema,
	appendBlockChildrenSchema,
	getUserSchema,
	listUsersSchema
} from './schemas.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
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
			async ({ query, page_size, start_cursor, sort, filter }) => {
				console.log(`🔧 Tool call: search for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.search(query, { page_size, start_cursor, sort, filter });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching Notion:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching Notion: ${error.message}` }]
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
					const result = await notionService.getPage(page_id);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page: ${error.message}` }]
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
				start_cursor: z.string().optional().describe("Pagination cursor"),
				page_size: z.number().min(1).max(100).optional().default(100).describe("Number of blocks to return")
			},
			async ({ page_id, start_cursor, page_size }) => {
				console.log(`🔧 Tool call: get_page_blocks for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.getPageBlocks(page_id, start_cursor);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting page blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting page blocks: ${error.message}` }]
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
					const result = await notionService.createPage({ parent, properties, children });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating page: ${error.message}` }]
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
					const result = await notionService.updatePage(page_id, { properties, archived });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating page:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating page: ${error.message}` }]
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
					const result = await notionService.getDatabase(database_id);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting database: ${error.message}` }]
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
					const result = await notionService.queryDatabase(database_id, { filter, sorts, start_cursor, page_size });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error querying database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error querying database: ${error.message}` }]
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
					const result = await notionService.createDatabase({ parent, title, properties });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating database: ${error.message}` }]
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
					const result = await notionService.updateDatabase(database_id, { title, properties });
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating database:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating database: ${error.message}` }]
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
					const result = await notionService.appendBlocks(page_id, children);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error appending blocks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error appending blocks: ${error.message}` }]
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
					const result = await notionService.deleteBlock(block_id);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error deleting block:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting block: ${error.message}` }]
					};
				}
			}
		);

		// Tool 12: get_current_user
		this.server.tool("get_current_user", "Get current user information", {}, async () => {
			console.log(`🔧 Tool call: get_current_user for ${this.serviceConfig.name}`);
			try {
				const notionService = new NotionService({ bearerToken: this.bearerToken });
				const result = await notionService.getCurrentUser();
				return {
					content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error getting current user:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting current user: ${error.message}` }]
				};
			}
		});

		// Tool 13: list_users
		this.server.tool(
			"list_users",
			"List all users",
			{
				start_cursor: z.string().optional().describe("Pagination cursor"),
				page_size: z.number().min(1).max(100).optional().default(100).describe("Number of users to return")
			},
			async ({ start_cursor, page_size }) => {
				console.log(`🔧 Tool call: list_users for ${this.serviceConfig.name}`);
				try {
					const notionService = new NotionService({ bearerToken: this.bearerToken });
					const result = await notionService.listUsers(start_cursor);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing users:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing users: ${error.message}` }]
					};
				}
			}
		);
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 * @param {Object} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
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
					id: message?.id || null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (/** @type {any} */ error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	}
}
