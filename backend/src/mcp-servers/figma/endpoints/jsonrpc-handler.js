/**
 * Figma MCP JSON-RPC protocol handler
 * Implements proper JSON-RPC 2.0 message handling for Figma MCP server
 */

import { executeToolCall } from './call.js';
import { getTools } from './tools.js';

export class FigmaMCPJsonRpcHandler {
	constructor(serviceConfig, apiKey) {
		this.serviceConfig = serviceConfig;
		this.apiKey = apiKey;
		this.initialized = false;
	}

	/**
	 * Process incoming JSON-RPC message
	 * @param {Object} message - JSON-RPC message
	 * @returns {Object|null} Response object or null for notifications
	 */
	async processMessage(message) {
		// Validate JSON-RPC format
		if (!this.isValidJsonRpc(message)) {
			return this.createErrorResponse(message.id || null, -32600, 'Invalid Request');
		}

		const { method, params, id } = message;

		try {
			// Handle different MCP methods
			switch (method) {
				case 'initialize':
					return await this.handleInitialize(params, id);

				case 'tools/list':
					return await this.handleToolsList(params, id);

				case 'tools/call':
					return await this.handleToolsCall(params, id);

				case 'resources/list':
					return await this.handleResourcesList(params, id);

				case 'resources/read':
					return await this.handleResourcesRead(params, id);

				default:
					return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
			}
		} catch (error) {
			console.error(`JSON-RPC error for method ${method}:`, error);
			return this.createErrorResponse(id, -32603, 'Internal error', { details: error.message });
		}
	}

	/**
	 * Validate JSON-RPC 2.0 message format
	 */
	isValidJsonRpc(message) {
		return (
			message &&
			message.jsonrpc === '2.0' &&
			typeof message.method === 'string' &&
			(message.id !== undefined || message.id === null)
		);
	}

	/**
	 * Handle initialize method
	 */
	async handleInitialize(params, id) {
		console.log(`🚀 Initialize request for ${this.serviceConfig.name} MCP Server`);

		if (!params || !params.protocolVersion) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing protocolVersion');
		}

		// Validate protocol version
		if (params.protocolVersion !== '2024-11-05') {
			return this.createErrorResponse(id, -32602, 'Unsupported protocol version');
		}

		this.initialized = true;

		return this.createSuccessResponse(id, {
			protocolVersion: '2024-11-05',
			capabilities: {
				tools: {},
			},
			serverInfo: {
				name: `${this.serviceConfig.displayName} MCP Server`,
				version: this.serviceConfig.version,
			},
			instructions: `This is a ${this.serviceConfig.displayName} MCP server providing tools for Figma API integration. Available tools: get_figma_file, get_figma_components, get_figma_styles, get_figma_comments`,
		});
	}

	/**
	 * Handle tools/list method
	 */
	async handleToolsList(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		console.log(`🔧 Tools list request for ${this.serviceConfig.name} MCP Server`);

		const toolsData = getTools();

		// Handle pagination cursor (optional)
		const cursor = params?.cursor;
		
		return this.createSuccessResponse(id, {
			tools: toolsData.tools.map(tool => ({
				name: tool.name,
				description: tool.description,
				inputSchema: tool.inputSchema,
			})),
			// No pagination needed for Figma tools, but include nextCursor if provided
			...(cursor && { nextCursor: null })
		});
	}

	/**
	 * Handle tools/call method
	 */
	async handleToolsCall(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		if (!params || !params.name) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing tool name');
		}

		const { name: toolName, arguments: args = {} } = params;

		console.log(`🔧 Tool call: ${toolName} for ${this.serviceConfig.name}`);

		try {
			const result = await executeToolCall(toolName, args, this.apiKey);

			return this.createSuccessResponse(id, {
				content: result.content || [
					{
						type: 'text',
						text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
					},
				],
			});
		} catch (error) {
			// Return success response with isError flag as per MCP spec
			return this.createSuccessResponse(id, {
				content: [
					{
						type: 'text',
						text: `Error executing ${toolName}: ${error.message}`,
					},
				],
				isError: true,
			});
		}
	}

	/**
	 * Create success response
	 */
	createSuccessResponse(id, result) {
		return {
			jsonrpc: '2.0',
			id,
			result,
		};
	}

	/**
	 * Create error response
	 */
	createErrorResponse(id, code, message, data = null) {
		const response = {
			jsonrpc: '2.0',
			id,
			error: {
				code,
				message,
			},
		};

		if (data) {
			response.error.data = data;
		}

		return response;
	}

	/**
	 * Handle resources/list method
	 */
	async handleResourcesList(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		console.log(`📋 Resources list request for ${this.serviceConfig.name} MCP Server`);

		// Figma server doesn't provide resources, return empty list
		return this.createSuccessResponse(id, {
			resources: [],
		});
	}

	/**
	 * Handle resources/read method
	 */
	async handleResourcesRead(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		if (!params || !params.uri) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing resource URI');
		}

		console.log(`📄 Resource read request for ${params.uri}`);

		// Figma server doesn't provide resources
		return this.createErrorResponse(id, -31001, 'Resource not found');
	}
}