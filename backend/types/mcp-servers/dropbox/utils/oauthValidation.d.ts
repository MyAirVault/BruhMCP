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
 * Dropbox account info response from API
 */
export type DropboxAccountInfo = {
    /**
     * - Dropbox account ID
     */
    account_id: string;
    /**
     * - User email address
     */
    email: string;
    /**
     * - Email verification status
     */
    email_verified: boolean;
    /**
     * - User name object
     */
    name: {
        display_name: string;
        given_name: string;
        surname: string;
    };
    /**
     * - User locale
     */
    locale: string;
};
/**
 * Dropbox OAuth token response from API
 */
export type DropboxTokenResponse = {
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
     * - Granted scopes
     */
    scope?: string | undefined;
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
     * - Dropbox account ID
     */
    accountId: string;
    /**
     * - Token scope
     */
    scope: string;
    /**
     * - Seconds until expiration
     */
    expiresIn: number;
    /**
     * - User email
     */
    email: string;
    /**
     * - User display name
     */
    displayName: string;
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
 * User information from token
 */
export type UserInfo = {
    /**
     * - Dropbox account ID
     */
    accountId: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Given name
     */
    givenName: string;
    /**
     * - Surname
     */
    surname: string;
    /**
     * - User locale
     */
    locale: string;
    /**
     * - Email verification status
     */
    emailVerified: boolean;
};
/**
 * OAuth validation and token management utilities for Dropbox
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
 * Dropbox account info response from API
 * @typedef {Object} DropboxAccountInfo
 * @property {string} account_id - Dropbox account ID
 * @property {string} email - User email address
 * @property {boolean} email_verified - Email verification status
 * @property {Object} name - User name object
 * @property {string} name.display_name - Display name
 * @property {string} name.given_name - Given name
 * @property {string} name.surname - Surname
 * @property {string} locale - User locale
 */
/**
 * Dropbox OAuth token response from API
 * @typedef {Object} DropboxTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token (optional)
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Granted scopes
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
 * @property {string} accountId - Dropbox account ID
 * @property {string} scope - Token scope
 * @property {number} expiresIn - Seconds until expiration
 * @property {string} email - User email
 * @property {string} displayName - User display name
 */
/**
 * Validate OAuth Bearer token
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
 * @param {TokenData} tokenData - Token data with expiration info
 * @param {number} [bufferMinutes=5] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(tokenData: TokenData, bufferMinutes?: number): boolean;
/**
 * User information from token
 * @typedef {Object} UserInfo
 * @property {string} accountId - Dropbox account ID
 * @property {string} email - User email
 * @property {string} displayName - Display name
 * @property {string} givenName - Given name
 * @property {string} surname - Surname
 * @property {string} locale - User locale
 * @property {boolean} emailVerified - Email verification status
 */
/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Promise<UserInfo>} User information
 */
export function getUserInfoFromToken(bearerToken: string): Promise<UserInfo>;
/**
 * Direct Dropbox OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export function refreshBearerTokenDirect(refreshData: RefreshData): Promise<TokenResponse>;
//# sourceMappingURL=oauthValidation.d.ts.map