/**
 * OAuth error analysis result
 * @typedef {Object} ErrorAnalysis
 * @property {string} type - Error type from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} userMessage - User-friendly error message
 * @property {boolean} shouldRetry - Whether the operation should be retried
 * @property {string} logLevel - Logging level (error, warn, info)
 */
/**
 * Parse OAuth error and determine appropriate action
 * @param {Error} error - OAuth error
 * @returns {ErrorAnalysis} Error analysis
 */
export function parseOAuthError(error: Error): ErrorAnalysis;
/**
 * OAuth status update data
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status - OAuth status
 * @property {string|null} accessToken - Access token
 * @property {string|null} refreshToken - Refresh token
 * @property {string|null} tokenExpiresAt - Token expiration
 * @property {string|null} scope - OAuth scope
 */
/**
 * Token refresh failure response
 * @typedef {Object} RefreshFailureResponse
 * @property {string} instanceId - Instance ID
 * @property {string} error - Error message
 * @property {string} errorCode - Error code
 * @property {boolean} requiresReauth - Requires re-authentication
 * @property {boolean} shouldRetry - Should retry operation
 * @property {string} logLevel - Log level
 * @property {string} originalError - Original error message
 */
/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {function(string, OAuthStatusUpdate): Promise<void>} updateOAuthStatus - Database update function
 * @returns {Promise<RefreshFailureResponse>} Error response details
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: (arg0: string, arg1: OAuthStatusUpdate) => Promise<void>): Promise<RefreshFailureResponse>;
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
 * Standardized OAuth error response
 * @typedef {Object} OAuthErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} instanceId - Instance ID
 * @property {string} context - Error context
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code
 * @property {boolean} requiresReauth - Requires re-authentication
 * @property {boolean} shouldRetry - Should retry operation
 * @property {string} timestamp - Error timestamp
 * @property {{originalError: string, errorType: string, logLevel: string}} metadata - Error metadata
 */
/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @returns {OAuthErrorResponse} Standardized error response
 */
export function createOAuthErrorResponse(instanceId: string, error: Error, context: string): OAuthErrorResponse;
/**
 * OAuth error types enumeration
 */
export type OAUTH_ERROR_TYPES = string;
export namespace OAUTH_ERROR_TYPES {
    let INVALID_REFRESH_TOKEN: string;
    let INVALID_CLIENT: string;
    let INVALID_REQUEST: string;
    let NETWORK_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let UNKNOWN_ERROR: string;
}
/**
 * OAuth error analysis result
 */
export type ErrorAnalysis = {
    /**
     * - Error type from OAUTH_ERROR_TYPES
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
     * - Logging level (error, warn, info)
     */
    logLevel: string;
};
/**
 * OAuth status update data
 */
export type OAuthStatusUpdate = {
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
     * - Token expiration
     */
    tokenExpiresAt: string | null;
    /**
     * - OAuth scope
     */
    scope: string | null;
};
/**
 * Token refresh failure response
 */
export type RefreshFailureResponse = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode: string;
    /**
     * - Requires re-authentication
     */
    requiresReauth: boolean;
    /**
     * - Should retry operation
     */
    shouldRetry: boolean;
    /**
     * - Log level
     */
    logLevel: string;
    /**
     * - Original error message
     */
    originalError: string;
};
/**
 * Standardized OAuth error response
 */
export type OAuthErrorResponse = {
    /**
     * - Always false for errors
     */
    success: boolean;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Error context
     */
    context: string;
    /**
     * - User-friendly error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode: string;
    /**
     * - Requires re-authentication
     */
    requiresReauth: boolean;
    /**
     * - Should retry operation
     */
    shouldRetry: boolean;
    /**
     * - Error timestamp
     */
    timestamp: string;
    /**
     * - Error metadata
     */
    metadata: {
        originalError: string;
        errorType: string;
        logLevel: string;
    };
};
//# sourceMappingURL=oauthErrorHandler.d.ts.map