/**
 * Determine if an error requires user re-authentication
 * @param {Error} error - The error to check
 * @returns {boolean} True if re-authentication is required
 */
export function requiresReauthentication(error: Error): boolean;
/**
 * Determine if an error is temporary/retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is temporary
 */
export function isTemporaryError(error: Error): boolean;
/**
 * Extract structured error information from error object
 * @param {Error} error - The error to parse
 * @returns {Object} Structured error information
 */
export function parseSlackError(error: Error): Object;
/**
 * Handle token refresh failures with appropriate error responses
 * @param {string} instanceId - Instance ID for logging
 * @param {Error} error - The refresh error
 * @param {Function} updateOAuthStatus - Function to update OAuth status
 * @returns {Object} Error response object
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: Function): Object;
/**
 * Log OAuth errors with structured information
 * @param {Error} error - The error to log
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - Instance ID for context
 */
export function logOAuthError(error: Error, operation: string, instanceId: string): void;
/**
 * Create user-friendly error messages for different error types
 * @param {Object} parsedError - Parsed error information
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(parsedError: Object): string;
/**
 * Determine retry delay based on error type
 * @param {Object} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @returns {number} Retry delay in milliseconds
 */
export function getRetryDelay(parsedError: Object, attemptNumber: number): number;
/**
 * Check if an error should be retried
 * @param {Object} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @param {number} maxAttempts - Maximum retry attempts
 * @returns {boolean} True if should retry
 */
export function shouldRetry(parsedError: Object, attemptNumber: number, maxAttempts?: number): boolean;
/**
 * Create an OAuth error response object
 * @param {string} instanceId - Instance ID
 * @param {Object} parsedError - Parsed error information
 * @returns {Object} OAuth error response
 */
export function createOAuthErrorResponse(instanceId: string, parsedError: Object): Object;
//# sourceMappingURL=oauthErrorHandler.d.ts.map