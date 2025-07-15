/**
 * OAuth Integration Utilities for Gmail Service
 * Handles integration with centralized OAuth service for token management
 */
/**
 * Refresh tokens using OAuth service
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Object} New token response
 */
export function refreshWithOAuthService(params: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Object;
/**
 * Exchange credentials for tokens using OAuth service
 * @param {Object} params - Exchange parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {Array} params.scopes - Required OAuth scopes
 * @returns {Object} Token response
 */
export function exchangeTokens(params: {
    clientId: string;
    clientSecret: string;
    scopes: any[];
}): Object;
/**
 * Validate OAuth credentials using OAuth service
 * @param {Object} params - Validation parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Object} Validation result
 */
export function validateOAuthCredentials(params: {
    clientId: string;
    clientSecret: string;
}): Object;
/**
 * Check if OAuth service is available
 * @returns {boolean} True if OAuth service is available
 */
export function isOAuthServiceAvailable(): boolean;
/**
 * Get OAuth service providers
 * @returns {Object} Available providers
 */
export function getOAuthProviders(): Object;
//# sourceMappingURL=oauth-integration.d.ts.map