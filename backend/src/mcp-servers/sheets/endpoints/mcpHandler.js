/**
 * Google Sheets MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

const { McpServer  } = require('@modelcontextprotocol/sdk/server/mcp');
const { StreamableHTTPServerTransport  } = require('@modelcontextprotocol/sdk/server/streamableHttp');
const { isInitializeRequest  } = require('@modelcontextprotocol/sdk/types');
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
	 * Get or create transport for a session
	 * @param {string} sessionId - Session identifier
	 * @param {import('express').Request} [_req] - Express request object (unused)
	 * @param {import('express').Response} [_res] - Express response object (unused)
	 * @returns {StreamableHTTPServerTransport} Transport instance
	 */
	getTransport(sessionId, _req, _res) {
		if (!this.transports[sessionId]) {
			console.log(`📡 Creating new transport for session: ${sessionId}`);
			this.transports[sessionId] = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
		}
		return this.transports[sessionId];
	}

	/**
	 * Handle MCP request using new SDK signature
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 * @param {Object} message - MCP message body
	 */
	async handleMCPRequest(req, res, message) {
		const sessionId = req.headers['x-session-id']?.toString() || randomUUID();
		const transport = this.getTransport(sessionId, req, res);
		
		// Connect server to transport if not connected
		if (!this.initialized) {
			await this.server.connect(transport);
			this.initialized = true;
		}
		
		// Handle initialize requests specially
		if (isInitializeRequest(message)) {
			console.log(`🔧 Handling initialize request for session: ${sessionId}`);
			this.initialized = true;
		}
		
		// Send request and get response
		const response = await transport.handleRequest(req, res, message);
		res.json(response);
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