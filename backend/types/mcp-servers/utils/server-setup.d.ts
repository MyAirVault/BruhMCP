/**
 * Parse and validate credentials from environment
 * @returns {Object} Parsed credentials object
 */
export function parseCredentials(): Object;
/**
 * Validate service configuration and credentials
 * @param {string} mcpType - MCP type name
 * @param {Object} credentials - Parsed credentials
 * @returns {Object} Service configuration and API key
 */
export function validateServiceConfig(mcpType: string, credentials: Object): Object;
/**
 * Get environment variables for server setup
 * @returns {Object} Environment variables
 */
export function getEnvironmentVariables(): Object;
/**
 * Setup graceful shutdown handlers
 * @param {string} serviceName - Service name for logging
 */
export function setupGracefulShutdown(serviceName: string): void;
/**
 * Create health check endpoint handler
 * @param {Object} params - Health check parameters
 * @param {string} params.serviceName - Service name
 * @param {string} params.mcpId - MCP instance ID
 * @param {string} params.mcpType - MCP type
 * @param {string} params.userId - User ID
 * @param {string} params.apiKey - API key (for status check)
 * @returns {Function} Health check handler
 */
export function createHealthCheckHandler({ serviceName, mcpId, mcpType, userId, apiKey }: {
    serviceName: string;
    mcpId: string;
    mcpType: string;
    userId: string;
    apiKey: string;
}): Function;
//# sourceMappingURL=server-setup.d.ts.map