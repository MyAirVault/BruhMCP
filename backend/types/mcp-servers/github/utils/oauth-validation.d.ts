/**
 * Exchange OAuth credentials for Bearer token via OAuth service
 * @param {Object} credentials - OAuth credentials
 * @param {string} credentials.clientId - OAuth Client ID
 * @param {string} credentials.clientSecret - OAuth Client Secret
 * @param {Array} credentials.scopes - Required OAuth scopes
 * @returns {Object} Token response with access_token and refresh_token
 */
export function exchangeOAuthForBearer(credentials: {
    clientId: string;
    clientSecret: string;
    scopes: any[];
}): Object;
/**
 * Refresh an expired Bearer token using refresh token
 * @param {Object} refreshData - Refresh token data
 * @param {string} refreshData.refreshToken - OAuth refresh token
 * @param {string} refreshData.clientId - OAuth Client ID
 * @param {string} refreshData.clientSecret - OAuth Client Secret
 * @returns {Object} New token response
 */
export function refreshBearerToken(refreshData: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Object;
/**
 * Validate OAuth Bearer token
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Object} Token validation result
 */
export function validateBearerToken(bearerToken: string): Object;
/**
 * Check if Bearer token is expired or will expire soon
 * @param {Object} tokenData - Token data with expiration info
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {number} bufferMinutes - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(tokenData: {
    expiresAt: number;
}, bufferMinutes?: number): boolean;
/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Object} User information
 */
export function getUserInfoFromToken(bearerToken: string): Object;
/**
 * Direct GitHub OAuth token refresh (bypass OAuth service)
 * @param {Object} refreshData - Refresh token data
 * @param {string} refreshData.refreshToken - OAuth refresh token
 * @param {string} refreshData.clientId - OAuth Client ID
 * @param {string} refreshData.clientSecret - OAuth Client Secret
 * @returns {Object} New token response
 */
export function refreshBearerTokenDirect(refreshData: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Object;
/**
 * Revoke GitHub OAuth token
 * @param {string} token - Token to revoke (access token)
 * @param {string} clientId - OAuth Client ID
 * @param {string} clientSecret - OAuth Client Secret
 * @returns {boolean} True if revocation was successful
 */
export function revokeToken(token: string, clientId: string, clientSecret: string): boolean;
//# sourceMappingURL=oauth-validation.d.ts.map