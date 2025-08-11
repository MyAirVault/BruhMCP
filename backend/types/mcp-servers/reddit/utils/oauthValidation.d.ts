export type TokenInfo = import("../middleware/types.js").TokenInfo;
export type TokenRefreshResult = import("../middleware/types.js").TokenRefreshResult;
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
 * @fileoverview Reddit OAuth Validation Utilities
 * Utilities for validating and processing Reddit OAuth tokens and operations
 */
/**
 * @typedef {import('../middleware/types.js').TokenInfo} TokenInfo
 * @typedef {import('../middleware/types.js').TokenRefreshResult} TokenRefreshResult
 */
/**
 * Validates OAuth token format
 * @param {string} token - Token to validate
 * @returns {boolean} Whether the token format is valid
 */
export function validateTokenFormat(token: string): boolean;
/**
 * Validates OAuth scope format
 * @param {string} scope - Scope string to validate
 * @returns {boolean} Whether the scope format is valid
 */
export function validateScopeFormat(scope: string): boolean;
/**
 * Checks if a token is expired
 * @param {number} expiresAt - Token expiration timestamp
 * @param {number} [bufferMinutes=5] - Buffer time in minutes before considering expired
 * @returns {boolean} Whether the token is expired
 */
export function isTokenExpired(expiresAt: number, bufferMinutes?: number): boolean;
/**
 * Validates client ID format for Reddit
 * @param {string} clientId - Client ID to validate
 * @returns {boolean} Whether the client ID format is valid
 */
export function validateClientIdFormat(clientId: string): boolean;
/**
 * Validates client secret format for Reddit
 * @param {string} clientSecret - Client secret to validate
 * @returns {boolean} Whether the client secret format is valid
 */
export function validateClientSecretFormat(clientSecret: string): boolean;
/**
 * Extracts token information from various formats
 * @param {Object} tokenData - Token data in various formats
 * @returns {TokenInfo} Normalized token information
 */
export function extractTokenInfo(tokenData: Object): TokenInfo;
/**
 * Validates OAuth credentials object
 * @param {Object} credentials - Credentials object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateOAuthCredentials(credentials: Object): {
    valid: boolean;
    error?: string;
};
/**
 * Sanitizes token for logging (removes sensitive parts)
 * @param {string} token - Token to sanitize
 * @returns {string} Sanitized token
 */
export function sanitizeTokenForLogging(token: string): string;
/**
 * Creates a standardized error for OAuth validation failures
 * @param {string} message - Error message
 * @param {string} field - Field that failed validation
 * @returns {Error} Standardized error
 */
export function createOAuthValidationError(message: string, field: string): Error;
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
 * Direct Reddit OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export function refreshBearerTokenDirect(refreshData: RefreshData): Promise<TokenResponse>;
//# sourceMappingURL=oauthValidation.d.ts.map