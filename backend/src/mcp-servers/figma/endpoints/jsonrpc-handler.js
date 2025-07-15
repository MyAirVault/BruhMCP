/**
 * Figma MCP JSON-RPC protocol handler using official SDK
 * Implements proper JSON-RPC 2.0 message handling for Figma MCP server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { executeToolCall } from './call.js';
import { getTools } from './tools.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */

export class FigmaMCPJsonRpcHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} apiKey
	 */
	constructor(serviceConfig, apiKey) {
		this.serviceConfig = serviceConfig;
		this.apiKey = apiKey;
		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		this.setupTools();
	}

	/**
	 * Setup MCP tools using the official SDK
	 */
	setupTools() {
		const toolsData = getTools();
		
		// Register each tool with the server
		toolsData.tools.forEach(/** @type {any} */ (tool) => {
			this.server.tool(
				tool.name,
				tool.description,
				/** @type {any} */ (this.convertInputSchema(tool.inputSchema)),
				async (/** @type {any} */ args) => {
					console.log(`🔧 Tool call: ${tool.name} for ${this.serviceConfig.name}`);
					
					try {
						const result = await executeToolCall(tool.name, args, this.apiKey);
						
						return {
							content: /** @type {any} */ (result).content || [
								{
									type: 'text',
									text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
								},
							],
						};
					} catch (/** @type {any} */ error) {
						return {
							content: [
								{
									type: 'text',
									text: `Error executing ${tool.name}: ${error.message}`,
								},
							],
							isError: true,
						};
					}
				}
			);
		});
	}

	/**
	 * Convert JSON schema to Zod schema for MCP SDK
	 * @param {any} inputSchema - JSON schema object
	 * @returns {any} Zod schema object
	 */
	convertInputSchema(inputSchema) {
		/** @type {any} */ const zodSchema = {};
		
		if (inputSchema.properties) {
			Object.entries(inputSchema.properties).forEach(([key, /** @type {any} */ prop]) => {
				let zodType;
				
				switch (prop.type) {
					case 'string':
						zodType = z.string();
						break;
					case 'number':
						zodType = z.number();
						break;
					case 'boolean':
						zodType = z.boolean();
						break;
					case 'object':
						zodType = z.object({});
						break;
					case 'array':
						zodType = z.array(z.unknown());
						break;
					default:
						zodType = z.unknown();
				}
				
				if (prop.description) {
					zodType = zodType.describe(prop.description);
				}
				
				if (!inputSchema.required || !inputSchema.required.includes(key)) {
					zodType = zodType.optional();
				}
				
				zodSchema[key] = zodType;
			});
		}
		
		return zodSchema;
	}

	/**
	 * Process incoming JSON-RPC message using the official SDK
	 * @param {any} message - JSON-RPC message
	 * @returns {Promise<any>} Response object or null for notifications
	 */
	async processMessage(message) {
		// Use the server's connect method to handle the message
		try {
			// Create a mock transport that handles single messages
			const transport = new MockTransport();
			
			// Connect the server to the transport
			await this.server.connect(transport);
			
			// Simulate receiving the message
			const response = await transport.simulateMessage(message);
			
			return response;
		} catch (/** @type {any} */ error) {
			console.error('SDK processing error:', error);
			
			// Return proper JSON-RPC error response
			return {
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message }
				}
			};
		}
	}
}

/**
 * Mock transport for single message processing
 */
class MockTransport {
	constructor() {
		/** @type {any} */ this.onMessage = null;
		/** @type {any} */ this.onError = null;
		/** @type {any} */ this.onClose = null;
		/** @type {any} */ this.responsePromise = null;
		/** @type {any} */ this.responseResolve = null;
	}

	async start() {
		// No-op for mock transport
	}

	async send(/** @type {any} */ message) {
		// Resolve the response promise with the message
		if (this.responseResolve) {
			this.responseResolve(message);
		}
	}

	async close() {
		// No-op for mock transport
	}

	/**
	 * Simulate processing a message and return the response
	 * @param {any} message - JSON-RPC message
	 * @returns {Promise<any>} Response object
	 */
	async simulateMessage(message) {
		// Create a promise to capture the response
		this.responsePromise = new Promise((resolve) => {
			this.responseResolve = resolve;
		});
		
		// Simulate receiving the message
		if (this.onMessage) {
			this.onMessage(message);
		}
		
		// Wait for the response
		return await this.responsePromise;
	}
}