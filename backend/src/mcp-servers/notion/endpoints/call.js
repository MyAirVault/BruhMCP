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
 * Execute a Notion tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Record<string, unknown>} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Notion API
 * @returns {Promise<Record<string, unknown>>} Tool execution result
 * @throws {Error} If tool execution fails or validation errors occur
 */
async function executeToolCall(toolName, args, bearerToken) {
	switch (toolName) {
		case 'search':
			return await searchNotion(args, bearerToken);
		case 'get_page':
			return await getPage(args, bearerToken);
		case 'get_page_blocks':
			return await getPageBlocks(args, bearerToken);
		case 'create_page':
			return await createPage(args, bearerToken);
		case 'update_page':
			return await updatePage(args, bearerToken);
		case 'get_database':
			return await getDatabase(args, bearerToken);
		case 'query_database':
			return await queryDatabase(args, bearerToken);
		case 'create_database':
			return await createDatabase(args, bearerToken);
		case 'update_database':
			return await updateDatabase(args, bearerToken);
		case 'append_blocks':
			return await appendBlocks(args, bearerToken);
		case 'delete_block':
			return await deleteBlock(args, bearerToken);
		case 'get_current_user':
			return await getCurrentUser(args, bearerToken);
		case 'list_users':
			return await listUsers(args, bearerToken);
		case 'raw_api_call':
			return await makeRawApiCall(args, bearerToken);
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

		/** @type {{ tool?: string, arguments?: Record<string, unknown>, id?: string }} */
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
		Logger.error('Call endpoint error:', error);
		
		/** @type {{ statusCode?: number, code?: number, message: string, details?: unknown }} */
		const errorInfo = handleNotionError(error);
		
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

