export type CachedCredential = import('./types.js').CachedCredential;
export type DatabaseInstance = import('./types.js').DatabaseInstance;
export type NewOAuthTokens = import('./types.js').NewOAuthTokens;
export type ExpressRequest = import('./types.js').ExpressRequest;
export type ExpressResponse = import('./types.js').ExpressResponse;
export type ExpressNext = import('./types.js').ExpressNext;
export type TokenRefreshOptions = import('./types.js').TokenRefreshOptions;
/**
 * @typedef {import('./types.js').CachedCredential} CachedCredential
 * @typedef {import('./types.js').DatabaseInstance} DatabaseInstance
 * @typedef {import('./types.js').NewOAuthTokens} NewOAuthTokens
 * @typedef {import('./types.js').ExpressRequest} ExpressRequest
 * @typedef {import('./types.js').ExpressResponse} ExpressResponse
 * @typedef {import('./types.js').ExpressNext} ExpressNext
 * @typedef {import('./types.js').TokenRefreshOptions} TokenRefreshOptions
 */
/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): Promise<void>} Express middleware function
 */
export function createCredentialAuthMiddleware(): (arg0: ExpressRequest, arg1: ExpressResponse, arg2: ExpressNext) => Promise<void>;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): Promise<void>} Express middleware function
 */
export function createLightweightAuthMiddleware(): (arg0: ExpressRequest, arg1: ExpressResponse, arg2: ExpressNext) => Promise<void>;
/**
 * Create cache performance monitoring middleware for development
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): void} Express middleware function
 */
export function createCachePerformanceMiddleware(): (arg0: ExpressRequest, arg1: ExpressResponse, arg2: ExpressNext) => void;
//# sourceMappingURL=credentialAuth.d.ts.map