/**
 * Slack MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

const { McpServer  } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport  } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { isInitializeRequest  } = require('@modelcontextprotocol/sdk/types.js');
const { randomUUID  } = require('node:crypto');
const { registerSlackTools  } = require('./slackTools');

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

class SlackMCPHandler {
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
		
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;
		
		this.setupTools();
	}

	/**
	 * Setup MCP tools by registering all Slack tools
	 */
	setupTools() {
		registerSlackTools(this.server, this.bearerToken, this.serviceConfig.name);
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = /** @type {string|undefined} */ (req.headers['mcp-session-id']);
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (typeof sessionId === 'string' && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (typeof sessionId === 'undefined' && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = this.createNewTransport();
				
				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				this.sendBadRequestResponse(res, message);
				return;
			}

			// Handle the request using the appropriate transport
			if (transport) {
				console.log(`🔄 Handling request with transport`);
				await transport.handleRequest(req, res, message);
				console.log(`✅ Request handled successfully`);
			} else {
				throw new Error('No transport available for request');
			}
			
		} catch (error) {
			console.error('❌ StreamableHTTP processing error:', error);
			const errorInstance = error instanceof Error ? error : new Error(String(error));
			this.sendInternalErrorResponse(res, message, errorInstance);
		}
	}

	/**
	 * Create a new StreamableHTTPServerTransport with proper session handling
	 * @returns {StreamableHTTPServerTransport} New transport instance
	 */
	createNewTransport() {
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: (newSessionId) => {
				console.log(`✅ Slack MCP session initialized: ${newSessionId}`);
				// Store transport by session ID
				this.transports[newSessionId] = transport;
			},
		});
		
		// Setup cleanup on transport close
		transport.onclose = () => {
			const sessionId = transport.sessionId;
			if (typeof sessionId === 'string') {
				delete this.transports[sessionId];
				console.log(`🧹 Cleaned up transport for session: ${sessionId}`);
			}
		};
		
		return transport;
	}

	/**
	 * Send bad request response
	 * @param {import('express').Response} res - Express response
	 * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
	 */
	sendBadRequestResponse(res, message) {
		res.status(400).json({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Bad Request: No valid session ID provided and not an initialize request',
			},
			id: ('id' in message) ? message.id : null,
		});
	}

	/**
	 * Send internal error response
	 * @param {import('express').Response} res - Express response
	 * @param {import('@modelcontextprotocol/sdk/types.js').JSONRPCRequest|import('@modelcontextprotocol/sdk/types.js').JSONRPCResponse|import('@modelcontextprotocol/sdk/types.js').JSONRPCNotification} message - MCP message
	 * @param {Error} error - Error object
	 */
	sendInternalErrorResponse(res, message, error) {
		res.json({
			jsonrpc: '2.0',
			id: ('id' in message) ? message.id : null,
			error: {
				code: -32603,
				message: 'Internal error',
				data: { details: error.message },
			},
		});
	}
}

module.exports = {
	SlackMCPHandler
};