/**
 * Parse OAuth error and determine appropriate action
 * @param {Error} error - OAuth error
 * @returns {Object} Error analysis
 */
export function parseOAuthError(error: Error): Object;
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
 * Determine if error should trigger retry logic
 * @param {Error} error - OAuth error
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error: Error, attempt: number, maxAttempts: number): boolean;
/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error} error - OAuth error
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt: number, error: Error): number;
/**
 * Log OAuth error with appropriate level
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 */
export function logOAuthError(error: Error, context: string, instanceId: string): void;
/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @returns {Object} Standardized error response
 */
export function createOAuthErrorResponse(instanceId: string, error: Error, context: string): Object;
export namespace OAUTH_ERROR_TYPES {
    let INVALID_REFRESH_TOKEN: string;
    let INVALID_CLIENT: string;
    let INVALID_REQUEST: string;
    let NETWORK_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let UNKNOWN_ERROR: string;
}
//# sourceMappingURL=oauthErrorHandler.d.ts.map