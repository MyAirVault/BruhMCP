/**
 * Google Sheets MCP Service Routes
 * Express route handlers for the Sheets service
 */

const { getOrCreateHandler  } = require('./services/handlerSessions');
const { ErrorResponses  } = require('../../utils/errorResponse');

/**
 * Service Configuration Type
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {number} port - Service port
 * @property {string} version - Service version
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {string} iconPath - Icon path
 * @property {string[]} scopes - OAuth scopes
 */

/**
 * Health Status Type
 * @typedef {Object} HealthStatus
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Health status
 * @property {number} uptime - Uptime in seconds
 * @property {number} port - Service port
 * @property {string} version - Service version
 * @property {string} authType - Authentication type
 * @property {string} timestamp - Timestamp
 * @property {string} description - Description
 * @property {string} iconPath - Icon path
 * @property {string[]} scopes - OAuth scopes
 * @property {Object} capabilities - Service capabilities
 * @property {Object} endpoints - Available endpoints
 * @property {Object} oauth - OAuth configuration
 */

/**
 * Get health status for Sheets service
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @returns {HealthStatus} Health status information
 */
function getHealthStatus(serviceConfig) {
	const uptime = process.uptime();
	
	/** @type {HealthStatus} */
	const healthStatus = {
		service: serviceConfig.name,
		displayName: serviceConfig.displayName,
		status: 'healthy',
		uptime: Math.floor(uptime),
		port: serviceConfig.port,
		version: serviceConfig.version,
		authType: serviceConfig.authType,
		timestamp: new Date().toISOString(),
		description: serviceConfig.description,
		iconPath: serviceConfig.iconPath,
		scopes: serviceConfig.scopes,
		capabilities: {
			oauth2: true,
			bearerTokens: true,
			multiTenant: true,
			credentialCaching: true,
			sessionManagement: true,
			mcpProtocol: '2.0'
		},
		endpoints: {
			health: '/health',
			instanceHealth: '/:instanceId/health',
			mcpJsonRpc: '/:instanceId/mcp',
			mcpBase: '/:instanceId',
			oauthDiscovery: '/.well-known/oauth-authorization-server/:instanceId'
		},
		oauth: {
			authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
			tokenUrl: 'https://oauth2.googleapis.com/token',
			userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
			revokeUrl: 'https://oauth2.googleapis.com/revoke',
			scopes: serviceConfig.scopes
		}
	};
	
	return healthStatus;
}


/**
 * Setup routes for the Sheets service
 * @param {import('express').Application} app - Express app instance
 * @param {ServiceConfig} SERVICE_CONFIG - Service configuration
 * @param {import('express').RequestHandler} credentialAuthMiddleware - Credential auth middleware
 * @param {import('express').RequestHandler} lightweightAuthMiddleware - Lightweight auth middleware
 */
function setupRoutes(app, SERVICE_CONFIG, credentialAuthMiddleware, lightweightAuthMiddleware) {
	/**
	 * Global health endpoint (no instance required)
	 * @param {import('express').Request} _ - Express request object (unused)
	 * @param {import('express').Response} res - Express response object
	 */
	app.get('/health', (_, res) => {
		try {
			const healthStatus = getHealthStatus(SERVICE_CONFIG);
			res.json(healthStatus);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} service health check failed`, {
				metadata: { service: SERVICE_CONFIG.name, errorMessage },
			});
		}
	});

	/**
	 * OAuth well-known endpoint for OAuth 2.0 discovery
	 * @param {import('express').Request} _ - Express request object (unused)
	 * @param {import('express').Response} res - Express response object
	 */
	app.get('/.well-known/oauth-authorization-server/:instanceId', (_, res) => {
		res.json({
			issuer: `https://accounts.google.com`,
			authorization_endpoint: 'https://accounts.google.com/o/oauth2/auth',
			token_endpoint: 'https://oauth2.googleapis.com/token',
			userinfo_endpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
			revocation_endpoint: 'https://oauth2.googleapis.com/revoke',
			scopes_supported: SERVICE_CONFIG.scopes,
			response_types_supported: ['code'],
			grant_types_supported: ['authorization_code', 'refresh_token'],
			token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
		});
	});

	/**
	 * Instance health endpoint (using lightweight auth - no credential caching needed)
	 * @param {import('express').Request & {instanceId: string}} req - Express request object with instanceId
	 * @param {import('express').Response} res - Express response object
	 */
	app.get('/:instanceId/health', lightweightAuthMiddleware, /** @type {(req: any, res: any) => void} */ (req, res) => {
		try {
			const healthStatus = {
				...getHealthStatus(SERVICE_CONFIG),
				instanceId: (/** @type {{instanceId: string}} */ (req)).instanceId,
				message: 'Instance-specific health check',
				authType: 'oauth',
				scopes: SERVICE_CONFIG.scopes,
			};
			res.json(healthStatus);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} instance health check failed`, {
				instanceId: (/** @type {{instanceId: string}} */ (req)).instanceId,
				metadata: { service: SERVICE_CONFIG.name, errorMessage },
			});
		}
	});

	/**
	 * MCP JSON-RPC endpoint at base instance URL for Claude Code compatibility
	 * @param {import('express').Request & {instanceId: string, bearerToken?: string}} req - Express request object with auth data
	 * @param {import('express').Response} res - Express response object
	 */
	app.post('/:instanceId', credentialAuthMiddleware, /** @type {(req: any, res: any) => Promise<void>} */ async (req, res) => {
		try {
			// Get or create persistent handler for this instance
			const mcpHandler = getOrCreateHandler((/** @type {{instanceId: string}} */ (req)).instanceId, SERVICE_CONFIG, (/** @type {{bearerToken?: string}} */ (req)).bearerToken || '');

			// Process the MCP message with persistent handler (using new SDK signature)
			await mcpHandler.handleMCPRequest(req, res, req.body);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('MCP processing error:', errorMessage);

			// Return proper MCP JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	/**
	 * MCP JSON-RPC endpoint at /mcp path (requires full credential authentication with caching)
	 * @param {import('express').Request & {instanceId: string, bearerToken?: string}} req - Express request object with auth data
	 * @param {import('express').Response} res - Express response object
	 */
	app.post('/:instanceId/mcp', credentialAuthMiddleware, /** @type {(req: any, res: any) => Promise<void>} */ async (req, res) => {
		try {
			// Get or create persistent handler for this instance
			const mcpHandler = getOrCreateHandler((/** @type {{instanceId: string}} */ (req)).instanceId, SERVICE_CONFIG, (/** @type {{bearerToken?: string}} */ (req)).bearerToken || '');

			// Process the MCP message with persistent handler (using new SDK signature)
			await mcpHandler.handleMCPRequest(req, res, req.body);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('MCP processing error:', errorMessage);

			// Return proper MCP JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	/**
	 * 404 handler for unmatched routes
	 * @param {import('express').Request} req - Express request object
	 * @param {import('express').Response} res - Express response object
	 */
	app.use('*', (req, res) => {
		ErrorResponses.notFound(res, 'Endpoint', {
			metadata: {
				service: SERVICE_CONFIG.name,
				requested: `${req.method} ${req.originalUrl}`,
				availableEndpoints: [
					'GET /health (global)',
					'GET /:instanceId/health',
					'POST /:instanceId (JSON-RPC 2.0)',
					'POST /:instanceId/mcp (JSON-RPC 2.0)',
					'GET /.well-known/oauth-authorization-server/:instanceId',
				],
			},
		});
	});
}

module.exports = {
	setupRoutes
};