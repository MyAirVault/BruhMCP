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
export { isValidInstanceId, createInstanceIdValidationError, validateInstance, validateInstanceExists, validateServiceActive, validateInstanceStatus, validateInstanceNotExpired, validateOAuthCredentials } from "./validation.js";
export { checkCachedCredentials, hasCachedBearerToken, setupRequestWithCachedToken, getTokenInfo, isAccessTokenValid, cacheAndSetupToken, cacheNewTokens, setupRequestWithNewTokens, setupLightweightRequest } from "./credentialManagement.js";
export { attemptTokenRefresh, recordSuccessfulRefreshMetrics, recordFailedRefreshMetrics, updateDatabaseWithNewTokens, processSuccessfulRefresh, processFailedRefresh, performTokenRefresh } from "./tokenRefresh.js";
export { createSystemErrorResponse, createLightweightSystemErrorResponse, handleRefreshFailure, createRefreshFailureResponse, createReauthenticationResponse, logRefreshFallback } from "./authErrorHandler.js";
export { logSuccessfulTokenRefresh, logFailedTokenRefresh, logReauthenticationRequired, createAuditLogEntry, logTokenValidationSuccess } from "./auditLogger.js";
//# sourceMappingURL=credentialAuth.d.ts.map