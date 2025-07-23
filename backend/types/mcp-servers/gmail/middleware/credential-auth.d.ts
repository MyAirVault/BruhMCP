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
export { checkCachedCredentials, hasCachedBearerToken, setupRequestWithCachedToken, getTokenInfo, isAccessTokenValid, cacheAndSetupToken, cacheNewTokens, setupRequestWithNewTokens, setupLightweightRequest } from "./credential-management.js";
export { attemptTokenRefresh, recordSuccessfulRefreshMetrics, recordFailedRefreshMetrics, updateDatabaseWithNewTokens, processSuccessfulRefresh, processFailedRefresh, performTokenRefresh } from "./token-refresh.js";
export { createSystemErrorResponse, createLightweightSystemErrorResponse, handleRefreshFailure, createRefreshFailureResponse, createReauthenticationResponse, logRefreshFallback } from "./auth-error-handler.js";
export { logSuccessfulTokenRefresh, logFailedTokenRefresh, logReauthenticationRequired, createAuditLogEntry, logTokenValidationSuccess } from "./audit-logger.js";
//# sourceMappingURL=credential-auth.d.ts.map