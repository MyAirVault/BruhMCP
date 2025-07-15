/**
 * Health check endpoint for Gmail MCP service
 * Provides service status and configuration information
 */

/**
 * Get health status for Gmail service
 * @param {Object} serviceConfig - Service configuration object
 * @returns {Object} Health status information
 */
export function healthCheck(serviceConfig) {
  const startTime = process.hrtime();
  const uptime = process.uptime();
  
  // Basic service health information
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