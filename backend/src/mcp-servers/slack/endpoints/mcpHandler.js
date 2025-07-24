/**
 * Slack MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { registerSlackTools } from './slackTools.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class SlackMCPHandler {
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
	 * @param {Object} message - MCP message
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
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (error) {
			console.error('❌ StreamableHTTP processing error:', error);
			this.sendInternalErrorResponse(res, message, error);
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
			if (transport.sessionId) {
				delete this.transports[transport.sessionId];
				console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
			}
		};
		
		return transport;
	}

	/**
	 * Send bad request response
	 * @param {import('express').Response} res - Express response
	 * @param {Object} message - MCP message
	 */
	sendBadRequestResponse(res, message) {
		res.status(400).json({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Bad Request: No valid session ID provided and not an initialize request',
			},
			id: message?.id || null,
		});
	}

	/**
	 * Send internal error response
	 * @param {import('express').Response} res - Express response
	 * @param {Object} message - MCP message
	 * @param {Error} error - Error object
	 */
	sendInternalErrorResponse(res, message, error) {
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