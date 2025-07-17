/**
 * Performs health check for Discord service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health check result
 */
export function healthCheck(serviceConfig: Object): Object;
/**
 * Performs detailed health check with external dependencies
 * @param {Object} serviceConfig - Service configuration
 * @param {string} instanceId - Instance ID for testing
 * @param {string} token - Token for testing Discord API connectivity
 * @returns {Promise<Object>} Detailed health check result
 */
export function detailedHealthCheck(serviceConfig: Object, instanceId: string, token: string): Promise<Object>;
//# sourceMappingURL=health.d.ts.map