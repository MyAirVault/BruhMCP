/**
 * Google Sheets MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

const { McpServer  } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport  } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { isInitializeRequest  } = require('@modelcontextprotocol/sdk/types.js');
const { randomUUID  } = require('node:crypto');
const { setupSheetsTools  } = require('./tools');

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

class SheetsMCPHandler {
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
		setupSheetsTools(this.server, this, this.serviceConfig.name);
	}


	/**
	 * Handle MCP request using session-based transport
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 * @param {Object} message - MCP message body
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = Array.isArray(req.headers['mcp-session-id']) ? req.headers['mcp-session-id'][0] : req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (typeof sessionId === 'string' && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Sheets MCP session initialized: ${newSessionId}`);
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
					id: (message && 'id' in message) ? message.id : null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: (message && 'id' in message) ? message.id : null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error instanceof Error ? error.message : String(error) },
				},
			});
		}
	}

	/**
	 * Clean up transport for a session
	 * @param {string} sessionId - Session identifier
	 */
	cleanupTransport(sessionId) {
		if (this.transports[sessionId]) {
			console.log(`🧹 Cleaning up transport for session: ${sessionId}`);
			delete this.transports[sessionId];
		}
	}
}

module.exports = {
	SheetsMCPHandler
};