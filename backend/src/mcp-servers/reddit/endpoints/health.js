/**
 * Reddit service health check endpoint
 * Returns service status and configuration
 */


/**
 * Health check for Reddit service
 * @param {{name: string, displayName: string, version: string, port: number, authType: string, description: string}} config - Service configuration
 * @returns {{service: string, displayName: string, status: string, version: string, port: number, authType: string, description: string, endpoints: Object, features: Object, timestamp: string}} Health status object
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