/**
 * Notion service health check endpoint
 * Returns service status and configuration
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} version - Service version  
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 */

/**
 * Health check for Notion service
 * @param {ServiceConfig} config - Service configuration
 * @returns {Object} Health status object
 */
export function healthCheck(config) {
	return {
		service: config.name,
		displayName: config.displayName,
		status: 'healthy',
		version: config.version,
		port: config.port,
		authType: config.authType,
		description: config.description,
		endpoints: {
			health: 'GET /health',
			instanceHealth: 'GET /:instanceId/health',
			mcp: 'POST /:instanceId/mcp',
			cacheTokens: 'POST /cache-tokens',
			oauthWellKnown: 'GET /.well-known/oauth-authorization-server/:instanceId',
		},
		features: {
			oauth: true,
			multiTenant: true,
			credentialCaching: true,
			sessionManagement: true,
		},
		timestamp: new Date().toISOString(),
	};
}
