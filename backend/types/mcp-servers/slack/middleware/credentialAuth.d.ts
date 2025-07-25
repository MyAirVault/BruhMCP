/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {Function} Express middleware function
 */
export function createCredentialAuthMiddleware(): Function;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {Function} Express middleware function
 */
export function createLightweightAuthMiddleware(): Function;
/**
 * Create cache performance monitoring middleware for development
 * @returns {Function} Express middleware function
 */
export function createCachePerformanceMiddleware(): Function;
/**
 * Slack error structure for OAuth operations
 */
export type SlackError = {
    /**
     * - Error message
     */
    message?: string | undefined;
    /**
     * - Error type classification
     */
    errorType?: string | undefined;
    /**
     * - Original error message
     */
    originalError?: string | undefined;
    /**
     * - Error code
     */
    code?: string | undefined;
    /**
     * - HTTP status code
     */
    status?: number | undefined;
    /**
     * - Error stack trace
     */
    stack?: string | undefined;
};
/**
 * Extended error options for Slack error responses
 */
export type ExtendedErrorOptions = import("../../../utils/errorResponse.js").ErrorOptions & {
    expectedFormat?: string;
    error?: string;
    errorCode?: string;
    requiresReauth?: boolean;
};
/**
 * Extended OAuth update data for Slack
 */
export type SlackOAuthUpdateData = import("../../../db/queries/mcpInstances/types.js").OAuthUpdateData & {
    teamId?: string;
};
//# sourceMappingURL=credentialAuth.d.ts.map