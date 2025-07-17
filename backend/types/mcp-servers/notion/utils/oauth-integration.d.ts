/**
 * Exchange authorization code for access token using OAuth service
 * @param {Object} params - OAuth exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token response
 */
export function exchangeAuthCodeForToken({ code, clientId, clientSecret, redirectUri }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<Object>;
/**
 * Refresh access token using OAuth service
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export function refreshAccessToken({ refreshToken, clientId, clientSecret }: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Get OAuth authorization URL
 * @param {Object} params - Authorization parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.redirectUri - Redirect URI
 * @param {string} params.scope - Requested scopes
 * @param {string} params.state - State parameter for CSRF protection
 * @returns {string} Authorization URL
 */
export function getAuthorizationUrl({ clientId, redirectUri, scope, state }: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state: string;
}): string;
/**
 * Validate OAuth callback parameters
 * @param {Object} params - Callback parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.state - State parameter
 * @param {string} params.error - Error parameter
 * @returns {Object} Validation result
 */
export function validateOAuthCallback({ code, state, error }: {
    code: string;
    state: string;
    error: string;
}): Object;
//# sourceMappingURL=oauth-integration.d.ts.map