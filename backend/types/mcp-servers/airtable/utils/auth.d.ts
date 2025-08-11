export type TokenValidationResult = {
    /**
     * - Whether token is valid
     */
    valid: boolean;
    /**
     * - Token type
     */
    type: string;
    /**
     * - Expiration time
     */
    expiresAt: string | null;
    /**
     * - Token scopes
     */
    scopes: Array<string>;
    /**
     * - User ID
     */
    userId: string;
};
export type AuthHeader = {
    /**
     * - Bearer token
     */
    Authorization: string;
};
export type AuthMiddlewareOptions = {
    /**
     * - Header containing token
     */
    tokenHeader?: string | undefined;
    /**
     * - Token prefix
     */
    tokenPrefix?: string | undefined;
    /**
     * - Whether to validate token
     */
    validateToken?: boolean | undefined;
    /**
     * - Whether to cache validation
     */
    cacheValidation?: boolean | undefined;
};
export type TokenInfo = {
    /**
     * - Token type
     */
    type: string;
    /**
     * - Token prefix
     */
    prefix: string;
    /**
     * - Token length
     */
    length: number;
    /**
     * - Creation timestamp
     */
    created: number;
};
export type TokenValidationResultWithInfo = {
    /**
     * - Token info
     */
    token: TokenInfo;
    /**
     * - Validation result
     */
    validation?: TokenValidationResult | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export namespace TOKEN_TYPES {
    let PERSONAL_ACCESS_TOKEN: string;
    let LEGACY_API_KEY: string;
}
/**
 * Get token type from token string
 * @param {string} token - Token string
 * @returns {string} Token type
 */
export function getTokenType(token: string): string;
/**
 * @typedef {Object} AuthHeader
 * @property {string} Authorization - Bearer token
 */
/**
 * Create authorization header
 * @param {string} token - API token
 * @returns {AuthHeader} Authorization header
 */
export function createAuthHeader(token: string): AuthHeader;
/**
 * @typedef {Object} AuthMiddlewareOptions
 * @property {string} [tokenHeader] - Header containing token
 * @property {string} [tokenPrefix] - Token prefix
 * @property {boolean} [validateToken] - Whether to validate token
 * @property {boolean} [cacheValidation] - Whether to cache validation
 */
/**
 * Create authentication middleware
 * @param {AuthMiddlewareOptions} [options] - Middleware options
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} Express middleware
 */
export function createAuthMiddleware(options?: AuthMiddlewareOptions): (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
/**
 * Generate API key (for testing purposes)
 * @param {string} type - Token type
 * @returns {string} Generated token
 */
export function generateTestToken(type?: string): string;
/**
 * Clear token cache
 */
export function clearTokenCache(): void;
/**
 * Get token cache statistics
 * @returns {Object} Cache statistics
 */
export function getTokenCacheStats(): Object;
/**
 * Check if token is expired (placeholder for future use)
 * @param {TokenValidationResult} tokenValidation - Token validation result
 * @returns {boolean} True if expired
 */
export function isTokenExpired(tokenValidation: TokenValidationResult): boolean;
/**
 * @typedef {Object} TokenInfo
 * @property {string} type - Token type
 * @property {string} prefix - Token prefix
 * @property {number} length - Token length
 * @property {number} created - Creation timestamp
 */
/**
 * Create token info object
 * @param {string} token - API token
 * @returns {TokenInfo} Token info
 */
export function createTokenInfo(token: string): TokenInfo;
/**
 * Create secure token display
 * @param {string} token - Token to display
 * @returns {string} Secure display string
 */
export function createSecureTokenDisplay(token: string): string;
/**
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} type - Token type
 * @property {string | null} expiresAt - Expiration time
 * @property {Array<string>} scopes - Token scopes
 * @property {string} userId - User ID
 */
/**
 * Validate API token
 * @param {string} token - Token to validate
 * @returns {Promise<TokenValidationResult>} Validation result
 */
export function validateToken(token: string): Promise<TokenValidationResult>;
/**
 * Check if token has specific scope
 * @param {string} token - Token to check
 * @param {string} scope - Required scope
 * @returns {Promise<boolean>} True if token has scope
 */
export function hasScope(token: string, scope: string): Promise<boolean>;
/**
 * Refresh token validation cache
 * @param {string} token - Token to refresh
 * @returns {Promise<Object>} Validation result
 */
export function refreshTokenValidation(token: string): Promise<Object>;
/**
 * @typedef {Object} TokenValidationResultWithInfo
 * @property {TokenInfo} token - Token info
 * @property {TokenValidationResult} [validation] - Validation result
 * @property {string} [error] - Error message
 */
/**
 * Validate multiple tokens
 * @param {Array<string>} tokens - Array of tokens
 * @returns {Promise<Array<TokenValidationResultWithInfo>>} Validation results
 */
export function validateMultipleTokens(tokens: Array<string>): Promise<Array<TokenValidationResultWithInfo>>;
//# sourceMappingURL=auth.d.ts.map