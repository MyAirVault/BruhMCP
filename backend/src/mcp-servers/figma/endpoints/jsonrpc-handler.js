/**
 * Figma MCP JSON-RPC protocol handler using official SDK
 * Using persistent connection approach like Figma-Context-MCP
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
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
		this.transport = null;
		this.setupTools();
	}

	/**
	 * Setup MCP tools using the official SDK - copying Figma-Context-MCP pattern
	 */
	setupTools() {
		const toolsData = getTools();

		// Register tools like Figma-Context-MCP does
		toolsData.tools.forEach(
			/** @type {any} */ tool => {
				this.server.tool(
					tool.name,
					tool.description,
					/** @type {any} */ (this.convertInputSchema(tool.inputSchema)),
					async (/** @type {any} */ args) => {
						console.log(`🔧 Tool call: ${tool.name} for ${this.serviceConfig.name}`);

						try {
							const result = await executeToolCall(tool.name, args, this.apiKey);

							// Return in the same format as Figma-Context-MCP
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
			}
		);
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
	 * Process incoming JSON-RPC message using StreamableHTTP transport like Figma-Context-MCP
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - JSON-RPC message
	 * @returns {Promise<void>}
	 */
	async processMessage(req, res, message) {
		try {
			// Create StreamableHTTP transport for this request (like Figma-Context-MCP)
			if (!this.transport) {
				this.transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => `figma-${Date.now()}`,
					onsessioninitialized: (sessionId) => {
						console.log(`Figma MCP session initialized: ${sessionId}`);
					},
				});
				
				// Connect the server to the transport
				await this.server.connect(this.transport);
			}

			// Handle the request using the transport
			await this.transport.handleRequest(req, res, message);
		} catch (/** @type {any} */ error) {
			console.error('StreamableHTTP processing error:', error);

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

