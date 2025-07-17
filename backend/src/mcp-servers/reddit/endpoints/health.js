/**
 * Reddit service health check endpoint
 * Returns service status and configuration
 */

/**
 * Health check for Reddit service
 * @param {Object} config - Service configuration
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