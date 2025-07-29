/**
 * OAuth credentials for token exchange
 */
export type OAuthCredentials = {
    /**
     * - OAuth Client ID
     */
    clientId: string;
    /**
     * - OAuth Client Secret
     */
    clientSecret: string;
    /**
     * - Required OAuth scopes
     */
    scopes: Array<string>;
};
/**
 * OAuth token response from Slack
 */
export type TokenResponse = {
    /**
     * - Access token
     */
    access_token: string;
    /**
     * - Refresh token
     */
    refresh_token: string;
    /**
     * - Token expiration in seconds
     */
    expires_in: number;
    /**
     * - Token type (usually 'Bearer')
     */
    token_type: string;
    /**
     * - Granted scopes
     */
    scope: string;
    /**
     * - Slack team ID
     */
    team_id: string;
};
/**
 * Slack auth.test API response
 */
export type SlackAuthTestResponse = {
    /**
     * - Whether the request was successful
     */
    ok: boolean;
    /**
     * - Team URL
     */
    url: string;
    /**
     * - Team name
     */
    team: string;
    /**
     * - User name
     */
    user: string;
    /**
     * - Team ID
     */
    team_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Bot ID (if applicable)
     */
    bot_id?: string | undefined;
    /**
     * - Whether user is admin
     */
    is_admin?: boolean | undefined;
    /**
     * - Error message if ok is false
     */
    error?: string | undefined;
};
/**
 * Slack OAuth token response from oauth.v2.access
 */
export type SlackOAuthTokenResponse = {
    /**
     * - Whether the request was successful
     */
    ok: boolean;
    /**
     * - Access token
     */
    access_token: string;
    /**
     * - Refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token type (usually 'Bearer')
     */
    token_type: string;
    /**
     * - Granted scopes
     */
    scope: string;
    /**
     * - Team object with ID
     */
    team: {
        id: string;
    };
    /**
     * - Error message if ok is false
     */
    error?: string | undefined;
};
/**
 * Slack auth.revoke API response
 */
export type SlackRevokeResponse = {
    /**
     * - Whether the request was successful
     */
    ok: boolean;
    /**
     * - Whether token was revoked
     */
    revoked?: boolean | undefined;
    /**
     * - Error message if ok is false
     */
    error?: string | undefined;
};
/**
 * Extended Error object with additional properties
 */
export type ExtendedError = Error;
/**
 * Refresh token data for Slack
 */
export type RefreshData = {
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - OAuth Client ID
     */
    clientId: string;
    /**
     * - OAuth Client Secret
     */
    clientSecret: string;
};
/**
 * Token validation result for Slack
 */
export type TokenValidationResult = {
    /**
     * - Whether token is valid
     */
    valid: boolean;
    /**
     * - Team URL
     */
    url: string;
    /**
     * - Team name
     */
    team: string;
    /**
     * - User name
     */
    user: string;
    /**
     * - Team ID
     */
    team_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Bot ID (if applicable)
     */
    bot_id: string;
};
/**
 * Token expiration data
 */
export type TokenData = {
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
};
/**
 * User information from Slack token
 */
export type UserInfo = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User name
     */
    name: string;
    /**
     * - Team ID
     */
    team_id: string;
    /**
     * - Team name
     */
    team: string;
    /**
     * - Team URL
     */
    url: string;
    /**
     * - Whether user is admin
     */
    is_admin: boolean;
    /**
     * - Whether this is a bot token
     */
    is_bot: boolean;
};
/**
 * OAuth validation and token management utilities for Slack
 * Handles OAuth 2.0 token exchange and refresh operations for Slack API
 */
/**
 * OAuth credentials for token exchange
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {Array<string>} scopes - Required OAuth scopes
 */
/**
 * OAuth token response from Slack
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 * @property {string} team_id - Slack team ID
 */
/**
 * Slack auth.test API response
 * @typedef {Object} SlackAuthTestResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {string} url - Team URL
 * @property {string} team - Team name
 * @property {string} user - User name
 * @property {string} team_id - Team ID
 * @property {string} user_id - User ID
 * @property {string} [bot_id] - Bot ID (if applicable)
 * @property {boolean} [is_admin] - Whether user is admin
 * @property {string} [error] - Error message if ok is false
 */
/**
 * Slack OAuth token response from oauth.v2.access
 * @typedef {Object} SlackOAuthTokenResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 * @property {{id: string}} team - Team object with ID
 * @property {string} [error] - Error message if ok is false
 */
/**
 * Slack auth.revoke API response
 * @typedef {Object} SlackRevokeResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {boolean} [revoked] - Whether token was revoked
 * @property {string} [error] - Error message if ok is false
 */
/**
 * Extended Error object with additional properties
 * @typedef {Error} ExtendedError
 * @property {string} [code] - Error code
 * @property {number} [status] - HTTP status code
 */
/**
 * Exchange OAuth credentials for Bearer token via OAuth service
 * @param {OAuthCredentials} credentials - OAuth credentials
 * @returns {Promise<TokenResponse>} Token response with access_token and refresh_token
 */
export function exchangeOAuthForBearer(credentials: OAuthCredentials): Promise<TokenResponse>;
/**
 * Refresh token data for Slack
 * @typedef {Object} RefreshData
 * @property {string} refreshToken - OAuth refresh token
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 */
/**
 * Refresh an expired Bearer token using refresh token
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export function refreshBearerToken(refreshData: RefreshData): Promise<TokenResponse>;
/**
 * Token validation result for Slack
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} url - Team URL
 * @property {string} team - Team name
 * @property {string} user - User name
 * @property {string} team_id - Team ID
 * @property {string} user_id - User ID
 * @property {string} bot_id - Bot ID (if applicable)
 */
/**
 * Validate OAuth Bearer token with Slack
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<TokenValidationResult>} Token validation result
 */
export function validateBearerToken(bearerToken: string): Promise<TokenValidationResult>;
/**
 * User information from Slack token
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} team_id - Team ID
 * @property {string} team - Team name
 * @property {string} url - Team URL
 * @property {boolean} is_admin - Whether user is admin
 * @property {boolean} is_bot - Whether this is a bot token
 */
/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Promise<UserInfo>} User information
 */
export function getUserInfoFromToken(bearerToken: string): Promise<UserInfo>;
/**
 * Direct Slack OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export function refreshBearerTokenDirect(refreshData: RefreshData): Promise<TokenResponse>;
/**
 * Revoke OAuth token with Slack
 * @param {string} token - Token to revoke (access token)
 * @returns {Promise<boolean>} True if revocation was successful
 */
export function revokeToken(token: string): Promise<boolean>;
//# sourceMappingURL=oauthValidation.d.ts.map