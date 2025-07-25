/**
 * Notion MCP Call Endpoint
 * Handles direct API calls and tool execution
 */

import { 
	searchNotion,
	getPage,
	getPageBlocks,
	createPage,
	updatePage,
	getDatabase,
	queryDatabase,
	createDatabase,
	updateDatabase,
	appendBlocks,
	deleteBlock,
	getCurrentUser,
	listUsers,
	makeRawApiCall
} from '../api/notionApi.js';
import { handleNotionError } from '../utils/oauthErrorHandler.js';
import { Logger } from '../utils/validation.js';

/**
 * @typedef {import('../middleware/types.js').ExpressRequest} ExpressRequest
 * @typedef {import('../middleware/types.js').ExpressResponse} ExpressResponse
 */

/**
 * @typedef {Object} SearchArgs
 * @property {string} [query] - Search query string
 * @property {{value: string, property: string}} [filter] - Filter conditions
 * @property {{direction: 'ascending'|'descending', timestamp: 'last_edited_time'}} [sort] - Sort conditions
 * @property {number} [page_size] - Number of results per page
 * @property {string} [start_cursor] - Pagination cursor
 */

/**
 * @typedef {Object} GetPageArgs
 * @property {string} pageId - The page ID to retrieve
 */

/**
 * @typedef {Object} GetPageBlocksArgs
 * @property {string} pageId - The page ID to get blocks from
 * @property {string} [start_cursor] - Pagination cursor
 * @property {number} [page_size] - Number of blocks per page
 */

/**
 * @typedef {Object} CreatePageArgs
 * @property {import('../utils/notionFormatting.js').NotionParent} parent - Parent page or database
 * @property {Record<string, import('../utils/notionFormatting.js').NotionProperty>} properties - Page properties
 * @property {import('../utils/notionFormatting.js').NotionBlock[]} [children] - Page content blocks
 */

/**
 * @typedef {Object} UpdatePageArgs
 * @property {string} pageId - The page ID to update
 * @property {Record<string, import('../utils/notionFormatting.js').NotionProperty>} [properties] - Updated properties
 * @property {boolean} [archived] - Whether the page is archived
 */

/**
 * @typedef {Object} AppendBlocksArgs
 * @property {string} pageId - The page ID to append blocks to
 * @property {import('../utils/notionFormatting.js').NotionBlock[]} children - Blocks to append
 */

/**
 * @typedef {Object} DeleteBlockArgs
 * @property {string} blockId - The block ID to delete
 */

/**
 * @typedef {Record<string, never>} GetCurrentUserArgs
 */

/**
 * @typedef {Object} ListUsersArgs
 * @property {string} [start_cursor] - Pagination cursor
 * @property {number} [page_size] - Number of users per page
 */

/**
 * @typedef {Object} GetDatabaseArgs
 * @property {string} databaseId - The database ID to retrieve
 */

/**
 * @typedef {Object} QueryDatabaseArgs
 * @property {string} databaseId - The database ID to query
 * @property {Record<string, unknown>} [filter] - Filter conditions for the query
 * @property {Array<{direction: 'ascending'|'descending', property?: string, timestamp?: 'created_time'|'last_edited_time'}>} [sorts] - Sort conditions for the query
 * @property {number} [page_size] - Number of results per page (max 100)
 * @property {string} [start_cursor] - Pagination cursor
 */

/**
 * @typedef {Object} CreateDatabaseArgs
 * @property {{type: string, page_id?: string, workspace?: string, database_id?: string}} parent - Parent page or workspace information
 * @property {Array<{type: 'text', text: {content: string}, plain_text: string}>} title - Database title as rich text array
 * @property {Record<string, import('../utils/notionFormatting.js').NotionProperty>} properties - Database properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */

/**
 * @typedef {Object} UpdateDatabaseArgs
 * @property {string} databaseId - The database ID to update
 * @property {Array<{type: 'text', text: {content: string}, plain_text: string}>} [title] - Updated title as rich text array
 * @property {Record<string, import('../utils/notionFormatting.js').NotionProperty>} [properties] - Updated properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */

/**
 * @typedef {Object} RawApiCallArgs
 * @property {string} endpoint - API endpoint path
 * @property {'GET'|'POST'|'PATCH'|'DELETE'} [method] - HTTP method (GET, POST, PATCH, DELETE)
 * @property {Record<string, unknown>} [body] - Request body/parameters
 */

/**
 * @typedef {SearchArgs|GetPageArgs|GetPageBlocksArgs|CreatePageArgs|UpdatePageArgs|GetDatabaseArgs|QueryDatabaseArgs|CreateDatabaseArgs|UpdateDatabaseArgs|AppendBlocksArgs|DeleteBlockArgs|GetCurrentUserArgs|ListUsersArgs|RawApiCallArgs} ToolArgs
 */

/**
 * @typedef {Object} ErrorInfo
 * @property {number} [statusCode] - HTTP status code
 * @property {number} [code] - JSON-RPC error code
 * @property {string} message - Error message
 * @property {unknown} [details] - Additional error details
 */

/**
 * Execute a Notion tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {ToolArgs} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Notion API
 * @returns {Promise<Record<string, unknown>>} Tool execution result
 * @throws {Error} If tool execution fails or validation errors occur
 */
async function executeToolCall(toolName, args, bearerToken) {
	switch (toolName) {
		case 'search':
			return await searchNotion(/** @type {SearchArgs} */ (args), bearerToken);
		case 'get_page':
			return await getPage(/** @type {GetPageArgs} */ (args), bearerToken);
		case 'get_page_blocks':
			return await getPageBlocks(/** @type {GetPageBlocksArgs} */ (args), bearerToken);
		case 'create_page':
			return await createPage(/** @type {CreatePageArgs} */ (args), bearerToken);
		case 'update_page':
			return await updatePage(/** @type {UpdatePageArgs} */ (args), bearerToken);
		case 'get_database':
			return await getDatabase(/** @type {GetDatabaseArgs} */ (args), bearerToken);
		case 'query_database':
			return await queryDatabase(/** @type {QueryDatabaseArgs} */ (args), bearerToken);
		case 'create_database':
			return await createDatabase(/** @type {CreateDatabaseArgs} */ (args), bearerToken);
		case 'update_database':
			return await updateDatabase(/** @type {UpdateDatabaseArgs} */ (args), bearerToken);
		case 'append_blocks':
			return /** @type {Record<string, unknown>} */ (await appendBlocks(/** @type {AppendBlocksArgs} */ (args), bearerToken));
		case 'delete_block':
			return /** @type {Record<string, unknown>} */ (await deleteBlock(/** @type {DeleteBlockArgs} */ (args), bearerToken));
		case 'get_current_user':
			return /** @type {Record<string, unknown>} */ (await getCurrentUser(/** @type {GetCurrentUserArgs} */ (args), bearerToken));
		case 'list_users':
			return /** @type {Record<string, unknown>} */ (await listUsers(/** @type {ListUsersArgs} */ (args), bearerToken));
		case 'raw_api_call':
			return /** @type {Record<string, unknown>} */ (await makeRawApiCall(/** @type {RawApiCallArgs} */ (args), bearerToken));
		default:
			throw new Error(`Unknown tool: ${toolName}`);
	}
}

/**
 * Handle call endpoint - provides direct API access and tool execution
 * @param {ExpressRequest} req - Express request object with auth data
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 */
export async function handleCallEndpoint(req, res) {
	try {
		const { bearerToken, instanceId, userId } = req;

		if (!bearerToken) {
			res.status(401).json({
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: 'Bearer token required for call endpoint',
				},
				id: req.body?.id || null,
			});
			return;
		}

		/** @type {{ tool?: string, arguments?: ToolArgs, id?: string }} */
		const { tool, arguments: args } = req.body || {};

		if (!tool) {
			res.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32602,
					message: 'Tool name is required',
				},
				id: req.body?.id || null,
			});
			return;
		}

		Logger.info(`Call endpoint executing tool: ${tool}`, { instanceId, userId });

		// Execute tool call
		const result = await executeToolCall(tool, args || {}, bearerToken);

		res.json({
			jsonrpc: '2.0',
			result: result,
			id: req.body?.id || null,
		});
	} catch (error) {
		Logger.error('Call endpoint error:', /** @type {Error} */ (error));
		
		const errorInfo = /** @type {ErrorInfo} */ (handleNotionError(/** @type {Error} */ (error)));
		
		res.status(errorInfo.statusCode || 500).json({
			jsonrpc: '2.0',
			error: {
				code: errorInfo.code || -32603,
				message: errorInfo.message,
				data: {
					instanceId: req.instanceId,
					details: errorInfo.details,
				},
			},
			id: req.body?.id || null,
		});
	}
}

