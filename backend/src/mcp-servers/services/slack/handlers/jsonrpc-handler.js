import { handleToolExecution, generateTools } from './tool-handlers.js';
import { handleResourceContent, generateResources } from './resource-handlers.js';

/**
 * MCP JSON-RPC protocol handler
 * Implements proper JSON-RPC 2.0 message handling for MCP servers
 */
export class MCPJsonRpcHandler {
	constructor(serviceConfig, mcpType, apiKey, port) {
		this.serviceConfig = serviceConfig;
		this.mcpType = mcpType;
		this.apiKey = apiKey;
		this.port = port;
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
					return await this.handleToolsList(id);

				case 'tools/call':
					return await this.handleToolsCall(params, id);

				case 'resources/list':
					return await this.handleResourcesList(id);

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
		console.log(`🚀 Initialize request for ${this.serviceConfig.name} MCP Server (Port: ${this.port})`);

		this.initialized = true;

		return this.createSuccessResponse(id, {
			protocolVersion: '2024-11-05',
			capabilities: {
				tools: {},
				resources: {},
			},
			serverInfo: {
				name: `${this.serviceConfig.name} MCP Server`,
				version: '1.0.0',
			},
			instructions: `This is a ${this.serviceConfig.name} MCP server providing tools and resources for ${this.serviceConfig.name} API integration.`,
		});
	}

	/**
	 * Handle tools/list method
	 */
	async handleToolsList(id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -32002, 'Server not initialized');
		}

		console.log(`🔧 Tools list request for ${this.serviceConfig.name} MCP Server (Port: ${this.port})`);

		const tools = generateTools(this.serviceConfig, this.mcpType);

		return this.createSuccessResponse(id, {
			tools: tools.map(tool => ({
				name: tool.name,
				description: tool.description,
				inputSchema: tool.inputSchema || {
					type: 'object',
					properties: {},
					required: [],
				},
			})),
		});
	}

	/**
	 * Handle tools/call method
	 */
	async handleToolsCall(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -32002, 'Server not initialized');
		}

		if (!params || !params.name) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing tool name');
		}

		const { name: toolName, arguments: args = {} } = params;

		console.log(`🔧 Tool call: ${toolName} for ${this.serviceConfig.name} (Port: ${this.port})`);

		try {
			const result = await handleToolExecution({
				toolName,
				args,
				mcpType: this.mcpType,
				serviceConfig: this.serviceConfig,
				apiKey: this.apiKey,
			});

			return this.createSuccessResponse(id, {
				content: [
					{
						type: 'text',
						text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
					},
				],
			});
		} catch (error) {
			return this.createErrorResponse(id, -32603, `Tool execution failed: ${error.message}`, {
				toolName,
				details: error.message,
			});
		}
	}

	/**
	 * Handle resources/list method
	 */
	async handleResourcesList(id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -32002, 'Server not initialized');
		}

		console.log(`📋 Resources list request for ${this.serviceConfig.name} MCP Server (Port: ${this.port})`);

		const resources = generateResources(this.serviceConfig, this.mcpType);

		return this.createSuccessResponse(id, {
			resources: resources.map(resource => ({
				uri: resource.uri,
				name: resource.name,
				description: resource.description,
				mimeType: resource.mimeType || 'application/json',
			})),
		});
	}

	/**
	 * Handle resources/read method
	 */
	async handleResourcesRead(params, id) {
		if (!this.initialized) {
			return this.createErrorResponse(id, -32002, 'Server not initialized');
		}

		if (!params || !params.uri) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing resource URI');
		}

		try {
			// Extract resource path from URI
			const resourcePath = params.uri.replace(/^.*\/resources\//, '');

			const result = await handleResourceContent({
				resourcePath,
				mcpType: this.mcpType,
				serviceConfig: this.serviceConfig,
				apiKey: this.apiKey,
			});

			return this.createSuccessResponse(id, {
				contents: [
					{
						uri: params.uri,
						mimeType: 'application/json',
						text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
					},
				],
			});
		} catch (error) {
			return this.createErrorResponse(id, -32603, `Resource read failed: ${error.message}`, {
				uri: params.uri,
				details: error.message,
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
}
