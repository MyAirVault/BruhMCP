/**
 * Notion MCP JSON-RPC Handler
 * Handles JSON-RPC requests for MCP protocol
 */

import { NotionMCPHandler } from './mcp-handler.js';
import { handleNotionError } from '../utils/error-handler.js';
import { Logger } from '../utils/logger.js';

/**
 * Handle JSON-RPC endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function handleJsonRpcEndpoint(req, res) {
	try {
		const { bearerToken, instanceId, userId } = req;

		if (!bearerToken) {
			return res.status(401).json({
				jsonrpc: '2.0',
				error: {
					code: -32600,
					message: 'Unauthorized - Bearer token required',
				},
				id: req.body?.id || null,
			});
		}

		// Validate JSON-RPC request format
		const { jsonrpc, method, params, id } = req.body;

		if (jsonrpc !== '2.0') {
			return res.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32600,
					message: 'Invalid Request - jsonrpc must be 2.0',
				},
				id: id || null,
			});
		}

		if (!method) {
			return res.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32600,
					message: 'Invalid Request - method is required',
				},
				id: id || null,
			});
		}

		// Create MCP handler instance
		const serviceConfig = {
			name: 'notion',
			version: '1.0.0',
		};

		const mcpHandler = new NotionMCPHandler(serviceConfig, bearerToken);

		// Process JSON-RPC request
		const response = await mcpHandler.handleMCPRequest(req, res, req.body);

		// Response is already sent by handleMCPRequest
	} catch (error) {
		Logger.error('JSON-RPC endpoint error:', error);
		const errorInfo = handleNotionError(error);

		// Send JSON-RPC error response
		res.status(500).json({
			jsonrpc: '2.0',
			error: {
				code: -32603,
				message: 'Internal error',
				data: {
					error: errorInfo.message,
					instanceId: req.instanceId,
				},
			},
			id: req.body?.id || null,
		});
	}
}

/**
 * Validate JSON-RPC request format
 * @param {Object} request - JSON-RPC request object
 * @returns {Object} Validation result
 */
export function validateJsonRpcRequest(request) {
	const errors = [];

	if (!request || typeof request !== 'object') {
		errors.push('Request must be a JSON object');
	}

	if (request.jsonrpc !== '2.0') {
		errors.push('jsonrpc must be "2.0"');
	}

	if (!request.method || typeof request.method !== 'string') {
		errors.push('method must be a string');
	}

	if (request.params !== undefined && typeof request.params !== 'object') {
		errors.push('params must be an object or array');
	}

	return {
		isValid: errors.length === 0,
		errors: errors,
	};
}

/**
 * Create JSON-RPC error response
 * @param {number} code - Error code
 * @param {string} message - Error message
 * @param {*} data - Additional error data
 * @param {*} id - Request ID
 * @returns {Object} JSON-RPC error response
 */
export function createJsonRpcErrorResponse(code, message, data, id) {
	return {
		jsonrpc: '2.0',
		error: {
			code: code,
			message: message,
			data: data,
		},
		id: id,
	};
}

/**
 * Create JSON-RPC success response
 * @param {*} result - Response result
 * @param {*} id - Request ID
 * @returns {Object} JSON-RPC success response
 */
export function createJsonRpcSuccessResponse(result, id) {
	return {
		jsonrpc: '2.0',
		result: result,
		id: id,
	};
}
