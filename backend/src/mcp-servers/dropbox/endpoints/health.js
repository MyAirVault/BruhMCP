/**
 * Dropbox service health check endpoint
 * Returns service status and configuration
 */

/**
 * @typedef {import('../../../types/dropbox.js').ServiceConfig} ServiceConfig
 */

/**
 * @typedef {Object} HealthCheckResponse
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Service status
 * @property {string} version - Service version
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {Object} endpoints - Available endpoints
 * @property {string} endpoints.health - Health endpoint
 * @property {string} endpoints.instanceHealth - Instance health endpoint
 * @property {string} endpoints.mcp - MCP endpoint
 * @property {string} endpoints.oauth - OAuth endpoint
 * @property {Object} features - Available features
 * @property {boolean} features.oauth - OAuth support
 * @property {boolean} features.multiTenant - Multi-tenant support
 * @property {boolean} features.credentialCaching - Credential caching support
 * @property {boolean} features.sessionManagement - Session management support
 * @property {string} timestamp - ISO timestamp
 */

/**
 * Health check for Dropbox service
 * @param {ServiceConfig} config - Service configuration
 * @returns {HealthCheckResponse} Health status object
 */
function healthCheck(config) {
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
      oauth: 'GET /.well-known/oauth-authorization-server/:instanceId'
    },
    features: {
      oauth: true,
      multiTenant: true,
      credentialCaching: true,
      sessionManagement: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { healthCheck };