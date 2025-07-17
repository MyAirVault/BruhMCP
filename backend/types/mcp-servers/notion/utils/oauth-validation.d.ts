/**
 * Exchange OAuth authorization code for Bearer token
 * @param {Object} params - OAuth exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token response
 */
export function exchangeOAuthForBearer({ code, clientId, clientSecret, redirectUri }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<Object>;
/**
 * Refresh Bearer token using OAuth service
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export function refreshBearerToken({ refreshToken, clientId, clientSecret }: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Refresh Bearer token using direct Notion OAuth API
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export function refreshBearerTokenDirect({ refreshToken, clientId, clientSecret }: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Validate Bearer token with Notion API
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<Object>} Validation result
 */
export function validateBearerToken(bearerToken: string): Promise<Object>;
//# sourceMappingURL=oauth-validation.d.ts.map