/**
 * Notion MCP Tools Endpoint
 * Handles tool discovery and execution for MCP clients
 */

import { NotionMCPHandler } from './mcp-handler.js';
import { handleNotionError } from '../utils/error-handler.js';
import { Logger } from '../utils/logger.js';

/**
 * Handle tools endpoint - provides tool discovery and execution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function handleToolsEndpoint(req, res) {
	try {
		const { bearerToken, instanceId, userId } = req;

		if (!bearerToken) {
			return res.status(401).json({
				error: 'Unauthorized',
				message: 'Bearer token required for tools endpoint',
			});
		}

		// Create MCP handler instance
		const serviceConfig = {
			name: 'notion',
			version: '1.0.0',
		};

		const mcpHandler = new NotionMCPHandler(serviceConfig, bearerToken);

		// Handle different HTTP methods
		switch (req.method) {
			case 'GET':
				// Return available tools
				const tools = await getAvailableTools(mcpHandler);
				res.json(tools);
				break;

			case 'POST':
				// Execute tool
				const result = await executeToolRequest(mcpHandler, req, res);
				if (result) {
					res.json(result);
				}
				break;

			default:
				res.status(405).json({
					error: 'Method not allowed',
					allowedMethods: ['GET', 'POST'],
				});
		}
	} catch (error) {
		Logger.error('Tools endpoint error:', error);
		const errorInfo = handleNotionError(error);
		res.status(500).json({
			error: 'Internal server error',
			message: errorInfo.message,
			instanceId: req.instanceId,
		});
	}
}

/**
 * Get available tools from MCP handler
 * @param {NotionMCPHandler} mcpHandler - MCP handler instance
 * @returns {Promise<Object>} Available tools
 */
async function getAvailableTools(mcpHandler) {
	// Mock list tools request
	const listToolsRequest = {
		method: 'tools/list',
		params: {},
		id: 'list-tools',
	};

	try {
		const response = await mcpHandler.server.processRequest(listToolsRequest);
		return response.result || { tools: [] };
	} catch (error) {
		Logger.error('Failed to get available tools:', error);
		return { tools: [] };
	}
}

/**
 * Execute tool request
 * @param {NotionMCPHandler} mcpHandler - MCP handler instance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Tool execution result
 */
async function executeToolRequest(mcpHandler, req, res) {
	const { tool, arguments: args } = req.body;

	if (!tool) {
		return res.status(400).json({
			error: 'Bad request',
			message: 'Tool name is required',
		});
	}

	// Create tool call request
	const toolCallRequest = {
		method: 'tools/call',
		params: {
			name: tool,
			arguments: args || {},
		},
		id: `tool-call-${Date.now()}`,
	};

	try {
		const response = await mcpHandler.server.processRequest(toolCallRequest);
		return response.result;
	} catch (error) {
		Logger.error(`Tool execution error for ${tool}:`, error);
		const errorInfo = handleNotionError(error);
		return res.status(500).json({
			error: 'Tool execution failed',
			message: errorInfo.message,
			tool: tool,
		});
	}
}
