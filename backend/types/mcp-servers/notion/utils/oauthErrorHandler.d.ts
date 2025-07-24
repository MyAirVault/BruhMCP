/**
 * OAuth Error Handler for Notion MCP Service
 * Handles OAuth-specific error scenarios and token refresh failures
 */
/**
 * Handle token refresh failures with appropriate error mapping
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The refresh error
 * @param {Function} updateOAuthStatus - Function to update OAuth status
 * @returns {Promise<Object>} Error response object
 */
export function handleTokenRefreshFailure(instanceId: string, error: Error, updateOAuthStatus: Function): Promise<Object>;
/**
 * Log OAuth errors with appropriate context
 * @param {Error} error - The OAuth error
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - The instance ID
 */
export function logOAuthError(error: Error, operation: string, instanceId: string): void;
/**
 * Create standardized OAuth error response
 * @param {string} errorType - The error type
 * @param {string} message - Error message
 * @param {Object} metadata - Additional error metadata
 * @returns {Object} Standardized error object
 */
export function createOAuthError(errorType: string, message: string, metadata?: Object): Object;
/**
 * Handle Notion-specific API errors and OAuth errors
 * @param {Error} error - The error to handle
 * @returns {Object} Formatted error response
 */
export function handleNotionError(error: Error): Object;
//# sourceMappingURL=oauthErrorHandler.d.ts.map