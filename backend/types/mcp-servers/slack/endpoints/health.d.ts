/**
 * Basic health check function for Slack MCP service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health status object
 */
export function healthCheck(serviceConfig: Object): Object;
/**
 * Get detailed health status for Slack MCP service
 * @returns {Promise<Object>} Health status object
 */
export function getHealthStatus(): Promise<Object>;
/**
 * Get basic health status (lightweight)
 * @returns {Object} Basic health status
 */
export function getBasicHealthStatus(): Object;
//# sourceMappingURL=health.d.ts.map