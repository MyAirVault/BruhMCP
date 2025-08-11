/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCredentialAuthMiddleware(): import("express").RequestHandler;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createLightweightAuthMiddleware(): import("express").RequestHandler;
/**
 * Create cache performance monitoring middleware for development
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware(): import("express").RequestHandler;
//# sourceMappingURL=credentialAuth.d.ts.map