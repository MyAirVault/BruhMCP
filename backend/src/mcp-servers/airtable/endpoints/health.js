/**
 * Airtable service health check endpoint
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
 * @typedef {Object} HealthResponse
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Health status
 * @property {string} version - Service version
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {Object} endpoints - Available endpoints
 * @property {string} endpoints.health - Health endpoint
 * @property {string} endpoints.instanceHealth - Instance health endpoint
 * @property {string} endpoints.mcp - MCP endpoint
 * @property {Object} features - Service features
 * @property {boolean} features.multiTenant - Multi-tenant support
 * @property {boolean} features.credentialCaching - Credential caching support
 * @property {boolean} features.sessionManagement - Session management support
 * @property {string} timestamp - Response timestamp
 */

/**
 * Health check for Airtable service
 * @param {ServiceConfig} config - Service configuration
 * @returns {HealthResponse} Health status object
 */
function healthCheck(config) {
  /** @type {HealthResponse} */
  const response = {
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
      mcp: 'POST /:instanceId/mcp'
    },
    features: {
      multiTenant: true,
      credentialCaching: true,
      sessionManagement: true
    },
    timestamp: new Date().toISOString()
  };
  return response;
}

module.exports = { healthCheck };