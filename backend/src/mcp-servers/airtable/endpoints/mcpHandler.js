/**
 * Airtable MCP JSON-RPC protocol handler using official SDK
 * Enhanced with comprehensive service layer and optimization
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { isInitializeRequest } = require('@modelcontextprotocol/sdk/types.js');
const { randomUUID } = require('node:crypto');
const { AirtableService } = require('../services/airtableService.js');
const { createLogger, measurePerformance } = require('../utils/logger.js');
const { AirtableErrorHandler } = require('../utils/errorHandler.js');
const { setupAllTools } = require('../tools/index.js');

const logger = createLogger('AirtableMCPHandler');

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} version - Service version
 */

/**
 * @typedef {import('http').IncomingMessage & {headers: Record<string, string | undefined>}} RequestWithHeaders
 */

/**
 * @typedef {import('http').ServerResponse & {status: function(number): ResponseObject, json: function(Object): void}} ResponseObject
 */

/**
 * @typedef {Object} MCPMessage
 * @property {string} [id] - Message ID
 * @property {string} [method] - Method name
 */

/**
 * @typedef {Object} HandlerStatistics
 * @property {Object} handler - Handler statistics
 * @property {boolean} handler.initialized - Initialization status
 * @property {number} handler.activeSessions - Active session count
 * @property {ServiceConfig} handler.serviceConfig - Service configuration
 * @property {Object} service - Service statistics
 */

class AirtableMCPHandler {
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
		
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;

		// Initialize Airtable service with enhanced configuration
		this.airtableService = new AirtableService({
			airtableApiKey: apiKey,
			useOptimization: true,
			useSimplification: true,
			timeout: 30000,
			retryAttempts: 3
		});

		// Setup performance monitoring
		this.setupPerformanceMonitoring();
		
		// Setup tools
		this.setupTools();

		logger.info('AirtableMCPHandler initialized with enhanced services', {
			serviceConfig,
			optimization: true,
			simplification: true
		});
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Wrap tool methods with performance measurement
		/** @type {(operation: string, fn: Function) => Function} */
		this.measurePerformance = measurePerformance || ((/** @type {string} */ _operation, /** @type {Function} */ fn) => fn);
	}

	/**
	 * Setup MCP tools using consolidated tool setup
	 */
	setupTools() {
		// Use the consolidated tool setup function
		if (this.measurePerformance) {
			setupAllTools(this.server, this.airtableService, this.measurePerformance, this.serviceConfig);
		} else {
			// Fallback if measurePerformance is not available
			/** @type {(operation: string, fn: Function) => Function} */
			const fallbackMeasurer = (/** @type {string} */ _operation, /** @type {Function} */ fn) => fn;
			setupAllTools(this.server, this.airtableService, fallbackMeasurer, this.serviceConfig);
		}
		
		logger.info('MCP tools setup completed', { 
			toolCount: 10,
			features: ['bases', 'records', 'search', 'statistics', 'batching']
		});
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {RequestWithHeaders} req - Express request object
	 * @param {ResponseObject} res - Express response object
	 * @param {MCPMessage} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		const requestId = message?.id || randomUUID();
		/** @type {string | undefined} */
		const sessionId = req.headers['mcp-session-id'];
		
		logger.info('Processing MCP request', {
			requestId,
			sessionId,
			method: message?.method,
			isInitialize: isInitializeRequest(message)
		});

		try {
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				logger.debug('Reusing existing transport', { sessionId });
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				logger.debug('Creating new transport for initialization');
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						logger.info('Airtable MCP session initialized', { sessionId: newSessionId });
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});

				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						logger.info('Transport cleaned up', { sessionId: transport.sessionId });
					}
				};

				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
				logger.debug('Server connected to transport');
			} else {
				// Invalid request - no session ID and not an initialize request
				logger.warn('Invalid request: No session ID and not initialize request');
				/** @type {ResponseObject} */
			const typedRes = /** @type {ResponseObject} */ (res);
			typedRes.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: requestId,
				});
				return;
			}

			// Handle the request using the appropriate transport
			logger.debug('Handling request with transport');
			/** @type {import('http').IncomingMessage} */
			const httpReq = /** @type {import('http').IncomingMessage} */ (req);
			/** @type {ResponseObject} */
			const httpRes = /** @type {ResponseObject} */ (res);
			await transport.handleRequest(httpReq, httpRes, message);
			
			logger.info('MCP request processed successfully', { requestId, sessionId });
			
		} catch (error) {
			/** @type {Error} */
			const errorObj = error instanceof Error ? error : new Error(String(error));
			const airtableError = AirtableErrorHandler.handle(errorObj, {
				operation: 'handleMCPRequest',
				requestId,
				sessionId,
				method: message?.method
			});

			logger.error('MCP request processing failed', {
				requestId,
				sessionId,
				error: airtableError.message,
				stack: airtableError.stack
			});

			// Return proper JSON-RPC error response
			const mcpError = AirtableErrorHandler.toMCPError(airtableError, requestId);
			/** @type {ResponseObject} */
			const typedRes = /** @type {ResponseObject} */ (res);
			typedRes.json(mcpError);
		}
	}

	/**
	 * Get handler statistics
	 * @returns {HandlerStatistics} Handler statistics
	 */
	getStatistics() {
		return {
			handler: {
				initialized: this.initialized,
				activeSessions: Object.keys(this.transports).length,
				serviceConfig: this.serviceConfig
			},
			service: this.airtableService.getStatistics()
		};
	}

	/**
	 * Health check
	 * @returns {Promise<Object>} Health status
	 */
	async healthCheck() {
		return await this.airtableService.healthCheck();
	}

	/**
	 * Shutdown handler
	 */
	async shutdown() {
		logger.info('Shutting down AirtableMCPHandler');
		
		// Close all transports
		for (const [sessionId, transport] of Object.entries(this.transports)) {
			try {
				if (transport.onclose) {
					transport.onclose();
				}
			} catch (error) {
				logger.warn('Error closing transport', { 
					sessionId, 
					error: error instanceof Error ? error.message : String(error) 
				});
			}
		}
		
		this.transports = {};
		this.initialized = false;
		
		// Clear caches
		this.airtableService.clearCaches();
		
		logger.info('AirtableMCPHandler shutdown completed');
	}
}

module.exports = { AirtableMCPHandler };