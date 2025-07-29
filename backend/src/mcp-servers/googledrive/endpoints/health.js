/**
 * Google Drive service health check endpoint
 * Returns service status and configuration
 */

/**
 * Health check for Google Drive service
 * @param {Object} config - Service configuration
 * @param {string} config.name - Service name
 * @param {string} config.displayName - Service display name  
 * @param {string} config.version - Service version
 * @param {number} config.port - Service port
 * @param {string} config.authType - Authentication type
 * @param {string} config.description - Service description
 * @returns {Object} Health status object
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

module.exports = {
  healthCheck
};