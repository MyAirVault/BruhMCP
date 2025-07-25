export type OAuthStatus = {
    /**
     * - OAuth status
     */
    status: string;
    /**
     * - Access token
     */
    accessToken: string | null;
    /**
     * - Refresh token
     */
    refreshToken: string | null;
    /**
     * - Token expiration date
     */
    tokenExpiresAt: Date | null;
    /**
     * - OAuth scope
     */
    scope: string | null;
};
export type ErrorAnalysis = {
    /**
     * - Error type
     */
    type: string;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - User-friendly error message
     */
    userMessage: string;
    /**
     * - Whether the operation should be retried
     */
    shouldRetry: boolean;
    /**
     * - Log level for the error
     */
    logLevel: string;
};
export type ExtendedError = Error & {
    code?: string;
};
export namespace OAUTH_ERROR_TYPES {
    let INVALID_REFRESH_TOKEN: string;
    let INVALID_CLIENT: string;
    let INVALID_REQUEST: string;
    let NETWORK_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let UNKNOWN_ERROR: string;
}
/**
 * Parse OAuth error and determine appropriate action
 * @param {ExtendedError} error - OAuth error
 * @returns {ErrorAnalysis} Error analysis
 */
export function parseOAuthError(error: ExtendedError): ErrorAnalysis;
/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {ExtendedError} error - Refresh error
 * @param {function(string, OAuthStatus): Promise<void>} updateOAuthStatus - Database update function
 * @returns {Promise<{instanceId: string, error: string, errorCode: string, requiresReauth: boolean, shouldRetry: boolean, logLevel: string, originalError: string}>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: ExtendedError, updateOAuthStatus: (arg0: string, arg1: OAuthStatus) => Promise<void>): Promise<{
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
 * @param {ExtendedError} error - OAuth error
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error: ExtendedError, attempt: number, maxAttempts: number): boolean;
/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {ExtendedError} error - OAuth error
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt: number, error: ExtendedError): number;
/**
 * Log OAuth error with appropriate level
 * @param {ExtendedError} error - OAuth error
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 */
export function logOAuthError(error: ExtendedError, context: string, instanceId: string): void;
/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {ExtendedError} error - OAuth error
 * @param {string} context - Error context
 * @returns {{success: boolean, instanceId: string, context: string, error: string, errorCode: string, requiresReauth: boolean, shouldRetry: boolean, timestamp: string, metadata: {originalError: string, errorType: string, logLevel: string}}} Standardized error response
 */
export function createOAuthErrorResponse(instanceId: string, error: ExtendedError, context: string): {
    success: boolean;
    instanceId: string;
    context: string;
    error: string;
    errorCode: string;
    requiresReauth: boolean;
    shouldRetry: boolean;
    timestamp: string;
    metadata: {
        originalError: string;
        errorType: string;
        logLevel: string;
    };
};
//# sourceMappingURL=oauthErrorHandler.d.ts.map