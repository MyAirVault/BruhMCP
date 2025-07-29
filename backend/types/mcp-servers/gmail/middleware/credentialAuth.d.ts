/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCredentialAuthMiddleware(): import('express').RequestHandler;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createLightweightAuthMiddleware(): import('express').RequestHandler;
/**
 * Create cache performance monitoring middleware for development
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware(): import('express').RequestHandler;
export declare let isValidInstanceId: typeof import("./validation.js").isValidInstanceId;
export declare let createInstanceIdValidationError: typeof import("./validation.js").createInstanceIdValidationError;
export declare let validateInstance: typeof import("./validation.js").validateInstance;
export declare let validateInstanceExists: typeof import("./validation.js").validateInstanceExists;
export declare let validateServiceActive: typeof import("./validation.js").validateServiceActive;
export declare let validateInstanceStatus: typeof import("./validation.js").validateInstanceStatus;
export declare let validateInstanceNotExpired: typeof import("./validation.js").validateInstanceNotExpired;
export declare let validateOAuthCredentials: typeof import("./validation.js").validateOAuthCredentials;
export declare let checkCachedCredentials: typeof import("./credentialManagement.js").checkCachedCredentials;
export declare let hasCachedBearerToken: typeof import("./credentialManagement.js").hasCachedBearerToken;
export declare let setupRequestWithCachedToken: typeof import("./credentialManagement.js").setupRequestWithCachedToken;
export declare let getTokenInfo: typeof import("./credentialManagement.js").getTokenInfo;
export declare let isAccessTokenValid: typeof import("./credentialManagement.js").isAccessTokenValid;
export declare let cacheAndSetupToken: typeof import("./credentialManagement.js").cacheAndSetupToken;
export declare let cacheNewTokens: typeof import("./credentialManagement.js").cacheNewTokens;
export declare let setupRequestWithNewTokens: typeof import("./credentialManagement.js").setupRequestWithNewTokens;
export declare let setupLightweightRequest: typeof import("./credentialManagement.js").setupLightweightRequest;
export declare let attemptTokenRefresh: typeof import("./tokenRefresh.js").attemptTokenRefresh;
export declare let recordSuccessfulRefreshMetrics: typeof import("./tokenRefresh.js").recordSuccessfulRefreshMetrics;
export declare let recordFailedRefreshMetrics: typeof import("./tokenRefresh.js").recordFailedRefreshMetrics;
export declare let updateDatabaseWithNewTokens: typeof import("./tokenRefresh.js").updateDatabaseWithNewTokens;
export declare let processSuccessfulRefresh: typeof import("./tokenRefresh.js").processSuccessfulRefresh;
export declare let processFailedRefresh: typeof import("./tokenRefresh.js").processFailedRefresh;
export declare let performTokenRefresh: typeof import("./tokenRefresh.js").performTokenRefresh;
export declare let createSystemErrorResponse: typeof import("./authErrorHandler.js").createSystemErrorResponse;
export declare let createLightweightSystemErrorResponse: typeof import("./authErrorHandler.js").createLightweightSystemErrorResponse;
export declare let handleRefreshFailure: typeof import("./authErrorHandler.js").handleRefreshFailure;
export declare let createRefreshFailureResponse: typeof import("./authErrorHandler.js").createRefreshFailureResponse;
export declare let createReauthenticationResponse: typeof import("./authErrorHandler.js").createReauthenticationResponse;
export declare let logRefreshFallback: typeof import("./authErrorHandler.js").logRefreshFallback;
export declare let logSuccessfulTokenRefresh: typeof import("./auditLogger.js").logSuccessfulTokenRefresh;
export declare let logFailedTokenRefresh: typeof import("./auditLogger.js").logFailedTokenRefresh;
export declare let logReauthenticationRequired: typeof import("./auditLogger.js").logReauthenticationRequired;
export declare let createAuditLogEntry: typeof import("./auditLogger.js").createAuditLogEntry;
export declare let logTokenValidationSuccess: typeof import("./auditLogger.js").logTokenValidationSuccess;
//# sourceMappingURL=credentialAuth.d.ts.map