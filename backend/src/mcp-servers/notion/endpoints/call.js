/**
 * Notion MCP Call Endpoint
 * Handles direct API calls and tool execution
 */

import { executeToolCall } from './tools.js';
import { handleNotionError } from '../utils/oauthErrorHandler.js';
import { Logger } from '../utils/validation.js';

/**
 * Handle call endpoint - provides direct API access and tool execution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function handleCallEndpoint(req, res) {
	try {
		const { bearerToken, instanceId, userId } = req;

		if (!bearerToken) {
			return res.status(401).json({
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: 'Bearer token required for call endpoint',
				},
				id: req.body?.id || null,
			});
		}

		const { tool, arguments: args } = req.body;

		if (!tool) {
			return res.status(400).json({
				jsonrpc: '2.0',
				error: {
					code: -32602,
					message: 'Tool name is required',
				},
				id: req.body?.id || null,
			});
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

