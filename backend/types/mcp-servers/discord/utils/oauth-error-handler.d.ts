/**
 * Parses OAuth error and returns structured error information
 * @param {Error} error - The error to parse
 * @returns {Object} Structured error information
 */
export function parseOAuthError(error: Error): Object;
/**
 * Handles OAuth error and returns appropriate response
 * @param {Error} error - The error to handle
 * @param {string} instanceId - Instance ID for logging
 * @param {string} operation - Operation being performed
 * @returns {Object} Error response data
 */
export function handleOAuthError(error: Error, instanceId: string, operation: string): Object;
/**
 * Checks if error requires re-authentication
 * @param {Error} error - The error to check
 * @returns {boolean} True if re-authentication is required
 */
export function requiresReauthentication(error: Error): boolean;
/**
 * Checks if error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is retryable
 */
export function isRetryableError(error: Error): boolean;
/**
 * Gets retry delay for retryable errors
 * @param {Error} error - The error to check
 * @returns {number|null} Retry delay in milliseconds or null if not retryable
 */
export function getRetryDelay(error: Error): number | null;
/**
 * Creates user-friendly error message
 * @param {Error} error - The error to create message for
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(error: Error): string;
/**
 * Creates error response for Express
 * @param {Object} res - Express response object
 * @param {Error} error - The error to respond with
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation being performed
 */
export function sendOAuthErrorResponse(res: Object, error: Error, instanceId: string, operation: string): void;
/**
 * Maps Discord API errors to OAuth error types
 * @param {Object} discordError - Discord API error response
 * @returns {Object} Mapped error information
 */
export function mapDiscordApiError(discordError: Object): Object;
/**
 * Validates OAuth error response format
 * @param {Object} errorResponse - Error response to validate
 * @returns {boolean} True if valid error response format
 */
export function isValidOAuthErrorResponse(errorResponse: Object): boolean;
/**
 * Creates structured error for logging
 * @param {Error} error - Original error
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation name
 * @param {Object} context - Additional context
 * @returns {Object} Structured error object
 */
export function createStructuredError(error: Error, instanceId: string, operation: string, context?: Object): Object;
export namespace OAUTH_ERROR_TYPES {
    let INVALID_REFRESH_TOKEN: string;
    let INVALID_CLIENT: string;
    let INVALID_GRANT: string;
    let INVALID_SCOPE: string;
    let UNAUTHORIZED_CLIENT: string;
    let ACCESS_DENIED: string;
    let UNSUPPORTED_RESPONSE_TYPE: string;
    let INVALID_REQUEST: string;
    let NETWORK_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let RATE_LIMITED: string;
    let UNKNOWN_ERROR: string;
}
//# sourceMappingURL=oauth-error-handler.d.ts.map