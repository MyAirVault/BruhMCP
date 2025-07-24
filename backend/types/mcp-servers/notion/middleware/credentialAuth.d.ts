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
export { performTokenRefresh } from "./tokenRefresh.js";
export { isValidInstanceId, createInstanceIdValidationError, validateInstance } from "./validation.js";
export { checkCachedCredentials, hasCachedBearerToken, setupRequestWithCachedToken, getTokenInfo, isAccessTokenValid, cacheAndSetupToken, setupLightweightRequest } from "./credentialManagement.js";
export { createSystemErrorResponse, createLightweightSystemErrorResponse, handleRefreshFailure, createRefreshFailureResponse, createReauthenticationResponse, logRefreshFallback } from "./authErrorHandler.js";
export { logSuccessfulTokenRefresh, logFailedTokenRefresh, logReauthenticationRequired, createAuditLogEntry } from "./auditLogger.js";
//# sourceMappingURL=credentialAuth.d.ts.map