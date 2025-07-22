/**
 * Handle OAuth flow for a created instance
 * @param {Object} params - OAuth flow parameters
 * @param {string} params.instanceId - Created instance ID
 * @param {string} params.provider - OAuth provider (google, microsoft, etc.)
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.serviceName - MCP service name
 * @returns {Promise<Object>} OAuth flow result
 */
export function handleOAuthFlow(params: {
    instanceId: string;
    provider: string;
    clientId: string;
    clientSecret: string;
    serviceName: string;
}): Promise<Object>;
/**
 * Get OAuth provider name based on service name
 * @param {string} serviceName - MCP service name
 * @returns {string} OAuth provider name
 */
export function getOAuthProvider(serviceName: string): string;
/**
 * Get OAuth scopes based on service name
 * @param {string} serviceName - MCP service name
 * @returns {string[]} OAuth scopes
 */
export function getOAuthScopes(serviceName: string): string[];
/**
 * Cache OAuth tokens for a service instance
 * @param {string} instanceId - Instance ID
 * @param {Object} tokens - OAuth tokens
 * @param {string} serviceName - MCP service name
 */
export function cacheOAuthTokens(instanceId: string, tokens: Object, serviceName: string): Promise<void>;
/**
 * Delete MCP instance (cleanup on OAuth failure)
 * @param {string} instanceId - Instance ID to delete
 */
export function deleteMCPInstance(instanceId: string): Promise<void>;
/**
 * Get service port from database based on service name
 * @param {string} serviceName - MCP service name
 * @returns {Promise<number>} Service port
 */
export function getServicePort(serviceName: string): Promise<number>;
/**
 * Validate OAuth credentials before starting flow
 * @param {string} provider - OAuth provider
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Promise<Object>} Validation result
 */
export function validateOAuthCredentials(provider: string, clientId: string, clientSecret: string): Promise<Object>;
/**
 * Check if OAuth service is available
 * @returns {Promise<boolean>} True if OAuth service is available
 */
export function isOAuthServiceAvailable(): Promise<boolean>;
//# sourceMappingURL=oauth-helpers.d.ts.map