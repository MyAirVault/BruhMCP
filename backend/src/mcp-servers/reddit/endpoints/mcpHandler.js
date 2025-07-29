/**
 * Reddit MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

const { McpServer  } = require('@modelcontextprotocol/sdk/server/mcp');
const { StreamableHTTPServerTransport  } = require('@modelcontextprotocol/sdk/server/streamableHttp');
const { isInitializeRequest  } = require('@modelcontextprotocol/sdk/types');
const { randomUUID  } = require('node:crypto');
const { z  } = require('zod');

const { executeToolCall  } = require('./call');
const { getTools  } = require('./tools');

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

class RedditMCPHandler {
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
		const toolsData = /** @type {{tools: Array<{name: string, description: string, inputSchema: Object}>}} */ (getTools());
		
		// Convert JSON schemas to Zod schemas and register tools
		toolsData.tools.forEach(/** @param {{name: string, description: string, inputSchema: Object}} tool */ tool => {
			const zodSchema = this.convertJsonSchemaToZod(tool.inputSchema);
			
			this.server.tool(
				tool.name,
				tool.description,
				zodSchema.shape,
				async (args, _extra) => {
					console.log(`🔧 Tool call: ${tool.name} for ${this.serviceConfig.name}`);
					try {
						const result = await executeToolCall(tool.name, args, this.bearerToken);
						return /** @type {{content: Array<{type: 'text', text: string}>, isError?: boolean}} */ (result);
					} catch (error) {
						console.error(`❌ Error executing ${tool.name}:`, error);
						return {
							isError: true,
							content: [{ type: 'text', text: `Error executing ${tool.name}: ${/** @type {Error} */ (error).message}` }]
						};
					}
				}
			);
		});
	}

	/**
	 * Convert JSON schema to Zod schema
	 * @param {Object} jsonSchema - JSON schema object
	 * @returns {import('zod').ZodObject<Record<string, import('zod').ZodType>>} Zod schema
	 */
	convertJsonSchemaToZod(jsonSchema) {
		/** @type {Record<string, import('zod').ZodType>} */
		const zodSchema = {};
		
		if (/** @type {{properties?: Record<string, Object>}} */ (jsonSchema).properties) {
			Object.entries(/** @type {{properties: Record<string, Object>}} */ (jsonSchema).properties).forEach(([key, prop]) => {
				let zodType;
				
				switch (/** @type {{type: string, enum?: string[], minimum?: number, maximum?: number, description?: string, default?: any, items?: {type: string}}} */ (prop).type) {
					case 'string':
						zodType = z.string();
						if (/** @type {{enum?: string[]}} */ (prop).enum) {
							zodType = z.enum(/** @type {[string, ...string[]]} */ (/** @type {{enum: string[]}} */ (prop).enum));
						}
						break;
					case 'number':
						zodType = z.number();
						if (/** @type {{minimum?: number}} */ (prop).minimum !== undefined) {
							zodType = zodType.min(/** @type {{minimum: number}} */ (prop).minimum);
						}
						if (/** @type {{maximum?: number}} */ (prop).maximum !== undefined) {
							zodType = zodType.max(/** @type {{maximum: number}} */ (prop).maximum);
						}
						break;
					case 'boolean':
						zodType = z.boolean();
						break;
					case 'array':
						zodType = z.array(z.string()); // Default to string array
						if (/** @type {{items?: {type: string}}} */ (prop).items && /** @type {{items: {type: string}}} */ (prop).items.type === 'string') {
							zodType = z.array(z.string());
						}
						break;
					default:
						zodType = z.string(); // Default to string for unknown types
				}
				
				// Add description if available
				if (/** @type {{description?: string}} */ (prop).description) {
					zodType = zodType.describe(/** @type {{description: string}} */ (prop).description);
				}
				
				// Add default value if available
				const propDefault = /** @type {{default?: string | number | boolean}} */ (prop).default;
				if (propDefault !== undefined) {
					if (typeof propDefault === 'string') {
						zodType = /** @type {import('zod').ZodString} */ (zodType).optional().default(propDefault);
					} else if (typeof propDefault === 'number') {
						zodType = /** @type {import('zod').ZodNumber} */ (zodType).optional().default(propDefault);
					} else if (typeof propDefault === 'boolean') {
						zodType = /** @type {import('zod').ZodBoolean} */ (zodType).optional().default(propDefault);
					} else {
						zodType = zodType.optional();
					}
				} else if (!/** @type {{required?: string[]}} */ (jsonSchema).required || !/** @type {{required: string[]}} */ (jsonSchema).required.includes(key)) {
					zodType = zodType.optional();
				}
				
				zodSchema[key] = zodType;
			});
		}
		
		return z.object(zodSchema);
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
	 * @returns {{serviceName: string, displayName: string, version: string, activeSessions: number, initialized: boolean, availableTools: number, bearerTokenPresent: boolean}} Handler statistics
	 */
	getStatistics() {
		return {
			serviceName: this.serviceConfig.name,
			displayName: this.serviceConfig.displayName,
			version: this.serviceConfig.version,
			activeSessions: Object.keys(this.transports).length,
			initialized: this.initialized,
			availableTools: /** @type {{tools: Array<Object>}} */ (getTools()).tools.length,
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
			return /** @type {Promise<void>} */ (new Promise((resolve) => {
				transport.close();
				resolve(undefined);
			}));
		});
		
		await Promise.all(cleanupPromises);
		this.transports = {};
		
		console.log(`✅ ${this.serviceConfig.name} MCP handler cleanup completed`);
	}
}

module.exports = {
	RedditMCPHandler
};