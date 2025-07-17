/**
 * Validate API token
 * @param {string} token - Token to validate
 * @returns {Promise<Object>} Validation result
 */
export function validateToken(token: string): Promise<Object>;
/**
 * Get token type from token string
 * @param {string} token - Token string
 * @returns {string} Token type
 */
export function getTokenType(token: string): string;
/**
 * Check if token has specific scope
 * @param {string} token - Token to check
 * @param {string} scope - Required scope
 * @returns {Promise<boolean>} True if token has scope
 */
export function hasScope(token: string, scope: string): Promise<boolean>;
/**
 * Create authorization header
 * @param {string} token - API token
 * @returns {Object} Authorization header
 */
export function createAuthHeader(token: string): Object;
/**
 * Create authentication middleware
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
export function createAuthMiddleware(options?: Object): Function;
/**
 * Generate API key (for testing purposes)
 * @param {string} type - Token type
 * @returns {string} Generated token
 */
export function generateTestToken(type?: string): string;
/**
 * Refresh token validation cache
 * @param {string} token - Token to refresh
 * @returns {Promise<Object>} Validation result
 */
export function refreshTokenValidation(token: string): Promise<Object>;
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
 * @param {Object} tokenValidation - Token validation result
 * @returns {boolean} True if expired
 */
export function isTokenExpired(tokenValidation: Object): boolean;
/**
 * Create token info object
 * @param {string} token - API token
 * @returns {Object} Token info
 */
export function createTokenInfo(token: string): Object;
/**
 * Validate multiple tokens
 * @param {Array} tokens - Array of tokens
 * @returns {Promise<Array>} Validation results
 */
export function validateMultipleTokens(tokens: any[]): Promise<any[]>;
/**
 * Create secure token display
 * @param {string} token - Token to display
 * @returns {string} Secure display string
 */
export function createSecureTokenDisplay(token: string): string;
export namespace TOKEN_TYPES {
    let PERSONAL_ACCESS_TOKEN: string;
    let LEGACY_API_KEY: string;
}
declare namespace _default {
    export { validateToken };
    export { getTokenType };
    export { hasScope };
    export { createAuthHeader };
    export { createAuthMiddleware };
    export { generateTestToken };
    export { refreshTokenValidation };
    export { clearTokenCache };
    export { getTokenCacheStats };
    export { isTokenExpired };
    export { createTokenInfo };
    export { validateMultipleTokens };
    export { createSecureTokenDisplay };
    export { TOKEN_TYPES };
}
export default _default;
//# sourceMappingURL=auth.d.ts.map