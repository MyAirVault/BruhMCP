/**
 * Reddit MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { executeToolCall } from './call.js';
import { getTools } from './tools.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class RedditMCPHandler {
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
		const toolsData = getTools();
		
		// Convert JSON schemas to Zod schemas and register tools
		toolsData.tools.forEach(tool => {
			const zodSchema = this.convertJsonSchemaToZod(tool.inputSchema);
			
			this.server.tool(
				tool.name,
				tool.description,
				zodSchema,
				async (args) => {
					console.log(`🔧 Tool call: ${tool.name} for ${this.serviceConfig.name}`);
					try {
						const result = await executeToolCall(tool.name, args, this.bearerToken);
						return result;
					} catch (error) {
						console.error(`❌ Error executing ${tool.name}:`, error);
						return {
							isError: true,
							content: [{ type: 'text', text: `Error executing ${tool.name}: ${error.message}` }]
						};
					}
				}
			);
		});
	}

	/**
	 * Convert JSON schema to Zod schema
	 * @param {Object} jsonSchema - JSON schema object
	 * @returns {Object} Zod schema
	 */
	convertJsonSchemaToZod(jsonSchema) {
		const zodSchema = {};
		
		if (jsonSchema.properties) {
			Object.entries(jsonSchema.properties).forEach(([key, prop]) => {
				let zodType;
				
				switch (prop.type) {
					case 'string':
						zodType = z.string();
						if (prop.enum) {
							zodType = z.enum(prop.enum);
						}
						break;
					case 'number':
						zodType = z.number();
						if (prop.minimum !== undefined) {
							zodType = zodType.min(prop.minimum);
						}
						if (prop.maximum !== undefined) {
							zodType = zodType.max(prop.maximum);
						}
						break;
					case 'boolean':
						zodType = z.boolean();
						break;
					case 'array':
						zodType = z.array(z.string()); // Default to string array
						if (prop.items && prop.items.type === 'string') {
							zodType = z.array(z.string());
						}
						break;
					default:
						zodType = z.any();
				}
				
				// Add description if available
				if (prop.description) {
					zodType = zodType.describe(prop.description);
				}
				
				// Add default value if available
				if (prop.default !== undefined) {
					zodType = zodType.optional().default(prop.default);
				} else if (!jsonSchema.required || !jsonSchema.required.includes(key)) {
					zodType = zodType.optional();
				}
				
				zodSchema[key] = zodType;
			});
		}
		
		return zodSchema;
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
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
						console.log(`✅ Reddit MCP session initialized: ${newSessionId}`);
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

	/**
	 * Update bearer token for all active sessions
	 * @param {string} newBearerToken
	 */
	updateBearerToken(newBearerToken) {
		this.bearerToken = newBearerToken;
		console.log(`🔄 Updated bearer token for ${this.serviceConfig.name} MCP handler`);
	}

	/**
	 * Get handler statistics
	 * @returns {Object} Handler statistics
	 */
	getStatistics() {
		return {
			serviceName: this.serviceConfig.name,
			displayName: this.serviceConfig.displayName,
			version: this.serviceConfig.version,
			activeSessions: Object.keys(this.transports).length,
			initialized: this.initialized,
			availableTools: getTools().tools.length,
			bearerTokenPresent: !!this.bearerToken
		};
	}

	/**
	 * Cleanup handler and close all sessions
	 */
	async cleanup() {
		console.log(`🧹 Cleaning up ${this.serviceConfig.name} MCP handler`);
		
		// Close all active transports
		const cleanupPromises = Object.values(this.transports).map(transport => {
			return new Promise((resolve) => {
				transport.close();
				resolve();
			});
		});
		
		await Promise.all(cleanupPromises);
		this.transports = {};
		
		console.log(`✅ ${this.serviceConfig.name} MCP handler cleanup completed`);
	}
}