/**
 * Refreshes Discord OAuth tokens using the OAuth service
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export function refreshWithOAuthService(params: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Refreshes Discord OAuth tokens directly via Discord API
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export function refreshWithDiscordAPI(params: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Refreshes bearer token for an instance
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export function refreshBearerToken(params: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}): Promise<Object>;
/**
 * Validates Discord OAuth token
 * @param {string} accessToken - Access token to validate
 * @returns {Promise<Object>} Token validation result
 */
export function validateOAuthToken(accessToken: string): Promise<Object>;
/**
 * Gets Discord OAuth authorization URL
 * @param {Object} params - OAuth parameters
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.redirectUri - Redirect URI
 * @param {Array<string>} params.scopes - OAuth scopes
 * @param {string} params.state - State parameter
 * @returns {string} Authorization URL
 */
export function getOAuthAuthorizationUrl(params: {
    clientId: string;
    redirectUri: string;
    scopes: Array<string>;
    state: string;
}): string;
/**
 * Exchanges authorization code for tokens
 * @param {Object} params - Exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token data
 */
export function exchangeCodeForTokens(params: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}): Promise<Object>;
/**
 * Revokes Discord OAuth token
 * @param {Object} params - Revoke parameters
 * @param {string} params.token - Token to revoke
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<boolean>} Success status
 */
export function revokeOAuthToken(params: {
    token: string;
    clientId: string;
    clientSecret: string;
}): Promise<boolean>;
/**
 * Gets current user information using OAuth token
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} User information
 */
export function getCurrentUser(accessToken: string): Promise<Object>;
/**
 * Gets user's guilds using OAuth token
 * @param {string} accessToken - Access token
 * @returns {Promise<Array>} User's guilds
 */
export function getUserGuilds(accessToken: string): Promise<any[]>;
//# sourceMappingURL=oauth-integration.d.ts.map