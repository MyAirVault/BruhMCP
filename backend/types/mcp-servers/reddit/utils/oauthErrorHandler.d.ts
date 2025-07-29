/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {Function} updateOAuthStatus - Database update function
 * @returns {Promise<{instanceId: string, error: string, errorCode: string, requiresReauth: boolean, shouldRetry: boolean, logLevel: string, originalError: string}>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: Function): Promise<{
    instanceId: string;
    error: string;
    errorCode: string;
    requiresReauth: boolean;
    shouldRetry: boolean;
    logLevel: string;
    originalError: string;
}>;
/**
 * Log OAuth error with appropriate level
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 */
export function logOAuthError(error: Error, context: string, instanceId: string): void;
//# sourceMappingURL=oauthErrorHandler.d.ts.map