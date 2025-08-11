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
 * OAuth token response
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
};
/**
 * Refresh token data
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
 * Token validation result
 */
export type TokenValidationResult = {
    /**
     * - Whether token is valid
     */
    valid: boolean;
    /**
     * - Token scope
     */
    scope: string;
    /**
     * - Seconds until expiration (Notion tokens don't expire)
     */
    expiresIn: number;
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Workspace name
     */
    workspaceName: string;
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
 * Notion API user response
 */
export type NotionUserResponse = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User name
     */
    name: string;
    /**
     * - User type
     */
    type: string;
    /**
     * - Avatar URL
     */
    avatar_url: string;
};
/**
 * User information from token
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
     * - User type
     */
    type: string;
    /**
     * - Avatar URL
     */
    avatarUrl: string;
};
/**
 * Notion OAuth token API response
 */
export type NotionTokenResponse = {
    /**
     * - Access token
     */
    access_token: string;
    /**
     * - Refresh token (optional)
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token type
     */
    token_type?: string | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
/**
 * OAuth validation and token management utilities for Notion
 * Handles OAuth 2.0 token exchange and refresh operations
 */
/**
 * OAuth credentials for token exchange
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {Array<string>} scopes - Required OAuth scopes
 */
/**
 * OAuth token response
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 */
/**
 * Exchange OAuth credentials for Bearer token via OAuth service
 * @param {OAuthCredentials} credentials - OAuth credentials
 * @returns {Promise<TokenResponse>} Token response with access_token and refresh_token
 */
export function exchangeOAuthForBearer(credentials: OAuthCredentials): Promise<TokenResponse>;
/**
 * Refresh token data
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
 * Token validation result
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} scope - Token scope
 * @property {number} expiresIn - Seconds until expiration (Notion tokens don't expire)
 * @property {string} userId - User ID
 * @property {string} workspaceName - Workspace name
 */
/**
 * Validate OAuth Bearer token with Notion
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<TokenValidationResult>} Token validation result
 */
export function validateBearerToken(bearerToken: string): Promise<TokenValidationResult>;
/**
 * Token expiration data
 * @typedef {Object} TokenData
 * @property {number} expiresAt - Token expiration timestamp
 */
/**
 * Check if Bearer token is expired or will expire soon
 * Note: Notion tokens don't expire, so this always returns false
 * @param {TokenData} tokenData - Token data with expiration info
 * @param {number} [bufferMinutes=5] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(tokenData: TokenData, bufferMinutes?: number): boolean;
/**
 * Notion API user response
 * @typedef {Object} NotionUserResponse
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} type - User type
 * @property {string} avatar_url - Avatar URL
 */
/**
 * User information from token
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} type - User type
 * @property {string} avatarUrl - Avatar URL
 */
/**
 * Notion OAuth token API response
 * @typedef {Object} NotionTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token (optional)
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 */
/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Promise<UserInfo>} User information
 */
export function getUserInfoFromToken(bearerToken: string): Promise<UserInfo>;
/**
 * Direct Notion OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export function refreshBearerTokenDirect(refreshData: RefreshData): Promise<TokenResponse>;
/**
 * Revoke OAuth token
 * Note: Notion doesn't provide a token revocation endpoint
 * @param {string} token - Token to revoke (access or refresh token)
 * @returns {Promise<boolean>} True if revocation was successful
 */
export function revokeToken(token: string): Promise<boolean>;
//# sourceMappingURL=oauthValidation.d.ts.map