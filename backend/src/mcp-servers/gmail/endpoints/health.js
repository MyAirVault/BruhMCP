/**
 * Health check endpoint for Gmail MCP service
 * Provides service status and configuration information
 */

/**
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
 * @typedef {Object} PerformanceMetrics
 * @property {number} responseTimeMs - Response time in milliseconds
 * @property {NodeJS.MemoryUsage} memoryUsage - Memory usage information
 * @property {string} nodeVersion - Node.js version
 */

/**
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
 * @property {PerformanceMetrics} [performance] - Performance metrics
 */

/**
 * Get health status for Gmail service
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @returns {HealthStatus} Health status information
 */
export function healthCheck(serviceConfig) {
  const startTime = process.hrtime();
  const uptime = process.uptime();
  
  // Basic service health information
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

  // Add performance metrics
  const endTime = process.hrtime(startTime);
  const responseTimeMs = (endTime[0] * 1000) + (endTime[1] / 1e6);
  
  healthStatus.performance = {
    responseTimeMs: parseFloat(responseTimeMs.toFixed(3)),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version
  };

  return healthStatus;
}