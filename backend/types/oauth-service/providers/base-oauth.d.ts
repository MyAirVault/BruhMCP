/**
 * @fileoverview Base OAuth Provider
 * Common functionality shared across all OAuth providers
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [field] - Field that failed validation
 * @property {string[]} [errors] - Array of error messages
 */
/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {number} [expires_in] - Token expiration time in seconds
 * @property {string} [token_type] - Token type (usually 'Bearer')
 * @property {string} [scope] - Granted scopes
 */
/**
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - User display name
 * @property {string} [given_name] - User first name
 * @property {string} [surname] - User last name
 */
/**
 * @typedef {Object} AuthParams
 * @property {string} client_id - OAuth Client ID
 * @property {string[]} [scopes] - Required OAuth scopes
 * @property {string} state - State parameter for security
 * @property {string} redirect_uri - Redirect URI after authorization
 */
/**
 * @typedef {Object} ExchangeParams
 * @property {string} code - Authorization code from callback
 * @property {string} client_id - OAuth Client ID
 * @property {string} client_secret - OAuth Client Secret
 * @property {string} redirect_uri - Redirect URI used in authorization
 */
/**
 * @typedef {Object} RefreshParams
 * @property {string} refresh_token - Refresh token
 * @property {string} client_id - OAuth Client ID
 * @property {string} client_secret - OAuth Client Secret
 */
/**
 * Base OAuth Provider class
 */
export class baseOAuth {
    /**
     * @param {string} providerName - Name of the OAuth provider
     */
    constructor(providerName: string);
    /** @type {string} */
    providerName: string;
    /** @type {string|null} */
    authUrl: string | null;
    /** @type {string|null} */
    tokenUrl: string | null;
    /** @type {string|null} */
    userInfoUrl: string | null;
    /** @type {string|null} */
    revokeUrl: string | null;
    /**
     * Validate OAuth credentials format (to be implemented by subclasses)
     * @param {string} clientId - OAuth Client ID
     * @param {string} clientSecret - OAuth Client Secret
     * @returns {Promise<ValidationResult>} Validation result
     */
    validateCredentials(clientId: string, clientSecret: string): Promise<ValidationResult>;
    /**
     * Generate OAuth authorization URL (to be implemented by subclasses)
     * @param {AuthParams} params - Authorization parameters
     * @returns {Promise<string>} Authorization URL
     */
    generateAuthorizationUrl(params: AuthParams): Promise<string>;
    /**
     * Exchange authorization code for tokens (to be implemented by subclasses)
     * @param {ExchangeParams} params - Exchange parameters
     * @returns {Promise<TokenResponse>} Token response
     */
    exchangeAuthorizationCode(params: ExchangeParams): Promise<TokenResponse>;
    /**
     * Refresh access token (to be implemented by subclasses)
     * @param {RefreshParams} params - Refresh parameters
     * @returns {Promise<TokenResponse>} New token response
     */
    refreshAccessToken(params: RefreshParams): Promise<TokenResponse>;
    /**
     * Validate token scopes (to be implemented by subclasses)
     * @param {TokenResponse} tokens - Token response
     * @returns {Promise<ValidationResult>} Scope validation result
     */
    validateTokenScopes(tokens: TokenResponse): Promise<ValidationResult>;
    /**
     * Get user information (to be implemented by subclasses)
     * @param {string} accessToken - Access token
     * @returns {Promise<UserInfo>} User information
     */
    getUserInfo(accessToken: string): Promise<UserInfo>;
    /**
     * Revoke OAuth token (to be implemented by subclasses)
     * @param {string} token - Token to revoke
     * @returns {Promise<boolean>} True if revocation was successful
     */
    revokeToken(token: string): Promise<boolean>;
    /**
     * Common error handler for OAuth API calls
     * @param {Response} response - Fetch response
     * @param {string} operation - Operation name for error context
     * @returns {Promise<any>} Parsed response or throws error
     */
    handleApiResponse(response: Response, operation: string): Promise<any>;
    /**
     * Common validation for required parameters
     * @param {Record<string, any>} params - Parameters to validate
     * @param {string[]} required - Required parameter names
     * @throws {Error} If required parameters are missing
     */
    validateRequiredParams(params: Record<string, any>, required: string[]): void;
    /**
     * Common token validation
     * @param {TokenResponse} tokens - Token response
     * @returns {ValidationResult} Validation result
     */
    validateTokenResponse(tokens: TokenResponse): ValidationResult;
    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getProviderName(): string;
    /**
     * Get provider URLs
     * @returns {{authUrl: string|null, tokenUrl: string|null, userInfoUrl: string|null, revokeUrl: string|null}} Provider URLs
     */
    getProviderUrls(): {
        authUrl: string | null;
        tokenUrl: string | null;
        userInfoUrl: string | null;
        revokeUrl: string | null;
    };
}
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Field that failed validation
     */
    field?: string | undefined;
    /**
     * - Array of error messages
     */
    errors?: string[] | undefined;
};
export type TokenResponse = {
    /**
     * - OAuth access token
     */
    access_token: string;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration time in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token type (usually 'Bearer')
     */
    token_type?: string | undefined;
    /**
     * - Granted scopes
     */
    scope?: string | undefined;
};
export type UserInfo = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - User display name
     */
    name?: string | undefined;
    /**
     * - User first name
     */
    given_name?: string | undefined;
    /**
     * - User last name
     */
    surname?: string | undefined;
};
export type AuthParams = {
    /**
     * - OAuth Client ID
     */
    client_id: string;
    /**
     * - Required OAuth scopes
     */
    scopes?: string[] | undefined;
    /**
     * - State parameter for security
     */
    state: string;
    /**
     * - Redirect URI after authorization
     */
    redirect_uri: string;
};
export type ExchangeParams = {
    /**
     * - Authorization code from callback
     */
    code: string;
    /**
     * - OAuth Client ID
     */
    client_id: string;
    /**
     * - OAuth Client Secret
     */
    client_secret: string;
    /**
     * - Redirect URI used in authorization
     */
    redirect_uri: string;
};
export type RefreshParams = {
    /**
     * - Refresh token
     */
    refresh_token: string;
    /**
     * - OAuth Client ID
     */
    client_id: string;
    /**
     * - OAuth Client Secret
     */
    client_secret: string;
};
//# sourceMappingURL=base-oauth.d.ts.map