/**
 * Determine if an error requires user re-authentication
 * @param {SlackError} error - The error to check
 * @returns {boolean} True if re-authentication is required
 */
/**
 * @typedef {Object} SlackError
 * @property {string} [message] - Error message
 * @property {string} [code] - Error code
 * @property {number} [status] - HTTP status code
 * @property {string} [stack] - Error stack trace
 */
/**
 * @param {SlackError} error
 */
export function requiresReauthentication(error: SlackError): boolean;
/**
 * Determine if an error is temporary/retryable
 * @param {SlackError} error - The error to check
 * @returns {boolean} True if error is temporary
 */
export function isTemporaryError(error: SlackError): boolean;
/**
 * Extract structured error information from error object
 * @param {SlackError} error - The error to parse
 * @returns {ParsedSlackError} Structured error information
 */
/**
 * @typedef {Object} ParsedSlackError
 * @property {string} errorType - Standardized error type
 * @property {string} errorCode - Original error code
 * @property {string} errorMessage - Error message
 * @property {number} status - HTTP status code
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {boolean} isTemporary - Whether error is temporary/retryable
 * @property {SlackError} originalError - Original error object
 */
/**
 * @param {SlackError} error
 */
export function parseSlackError(error: SlackError): {
    errorType: string;
    errorCode: string;
    errorMessage: string;
    status: number;
    requiresReauth: boolean;
    isTemporary: boolean;
    originalError: SlackError;
};
/**
 * Handle token refresh failures with appropriate error responses
 * @param {string} instanceId - Instance ID for logging
 * @param {SlackError} error - The refresh error
 * @param {UpdateOAuthStatusFunction} updateOAuthStatus - Function to update OAuth status
 * @returns {Promise<OAuthErrorResponse>} Error response object
 */
/**
 * @typedef {Object} OAuthStatus
 * @property {string} status - OAuth status ('failed', 'active', etc.)
 * @property {string|null} [accessToken] - Access token
 * @property {string|null} [refreshToken] - Refresh token
 * @property {string|null} [tokenExpiresAt] - Token expiration timestamp
 * @property {string|null} [scope] - OAuth scope
 * @property {string} [error] - Error message
 */
/**
 * @typedef {function(string, OAuthStatus): Promise<void>} UpdateOAuthStatusFunction
 */
/**
 * @typedef {Object} OAuthErrorResponse
 * @property {string} error - Error message
 * @property {string} errorCode - Error code
 * @property {string} errorType - Error type
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} instanceId - Instance ID
 */
/**
 * @param {string} instanceId
 * @param {SlackError} error
 * @param {UpdateOAuthStatusFunction} updateOAuthStatus
 */
export function handleTokenRefreshFailure(instanceId: string, error: SlackError, updateOAuthStatus: UpdateOAuthStatusFunction): Promise<{
    error: string;
    errorCode: string;
    errorType: string;
    requiresReauth: boolean;
    instanceId: string;
}>;
/**
 * Log OAuth errors with structured information
 * @param {SlackError} error - The error to log
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - Instance ID for context
 * @returns {void}
 */
export function logOAuthError(error: SlackError, operation: string, instanceId: string): void;
/**
 * Create user-friendly error messages for different error types
 * @param {ParsedSlackError} parsedError - Parsed error information
 * @returns {string} User-friendly error message
 */
/**
 * @param {ParsedSlackError} parsedError
 */
export function createUserFriendlyMessage(parsedError: ParsedSlackError): string;
/**
 * Determine retry delay based on error type
 * @param {ParsedSlackError} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @returns {number} Retry delay in milliseconds
 */
export function getRetryDelay(parsedError: ParsedSlackError, attemptNumber: number): number;
/**
 * Check if an error should be retried
 * @param {ParsedSlackError} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @param {number} [maxAttempts=3] - Maximum retry attempts
 * @returns {boolean} True if should retry
 */
export function shouldRetry(parsedError: ParsedSlackError, attemptNumber: number, maxAttempts?: number): boolean;
/**
 * Create an OAuth error response object
 * @param {string} instanceId - Instance ID
 * @param {ParsedSlackError} parsedError - Parsed error information
 * @returns {OAuthErrorResponseWithDetails} OAuth error response
 */
/**
 * @typedef {Object} OAuthErrorResponseWithDetails
 * @property {boolean} success - Always false for error responses
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code
 * @property {string} errorType - Error type
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {boolean} isTemporary - Whether error is temporary
 * @property {string} instanceId - Instance ID
 * @property {string} timestamp - ISO timestamp
 */
/**
 * @param {string} instanceId
 * @param {ParsedSlackError} parsedError
 */
export function createOAuthErrorResponse(instanceId: string, parsedError: ParsedSlackError): {
    success: boolean;
    error: string;
    errorCode: string;
    errorType: string;
    requiresReauth: boolean;
    isTemporary: boolean;
    instanceId: string;
    timestamp: string;
};
export type SlackError = {
    /**
     * - Error message
     */
    message?: string | undefined;
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
export type ParsedSlackError = {
    /**
     * - Standardized error type
     */
    errorType: string;
    /**
     * - Original error code
     */
    errorCode: string;
    /**
     * - Error message
     */
    errorMessage: string;
    /**
     * - HTTP status code
     */
    status: number;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Whether error is temporary/retryable
     */
    isTemporary: boolean;
    /**
     * - Original error object
     */
    originalError: SlackError;
};
export type OAuthStatus = {
    /**
     * - OAuth status ('failed', 'active', etc.)
     */
    status: string;
    /**
     * - Access token
     */
    accessToken?: string | null | undefined;
    /**
     * - Refresh token
     */
    refreshToken?: string | null | undefined;
    /**
     * - Token expiration timestamp
     */
    tokenExpiresAt?: string | null | undefined;
    /**
     * - OAuth scope
     */
    scope?: string | null | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
};
export type UpdateOAuthStatusFunction = (arg0: string, arg1: OAuthStatus) => Promise<void>;
export type OAuthErrorResponse = {
    /**
     * - Error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode: string;
    /**
     * - Error type
     */
    errorType: string;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Instance ID
     */
    instanceId: string;
};
export type OAuthErrorResponseWithDetails = {
    /**
     * - Always false for error responses
     */
    success: boolean;
    /**
     * - User-friendly error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode: string;
    /**
     * - Error type
     */
    errorType: string;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Whether error is temporary
     */
    isTemporary: boolean;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - ISO timestamp
     */
    timestamp: string;
};
//# sourceMappingURL=oauthErrorHandler.d.ts.map