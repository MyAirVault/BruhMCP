/**
 * Parse Notion API error response
 * @param {Error} error - Error object
 * @returns {Object} Parsed error information
 */
export function parseNotionError(error: Error): Object;
/**
 * Create user-friendly error message
 * @param {Object} errorInfo - Parsed error information
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(errorInfo: Object): string;
/**
 * Handle Notion API errors with retry logic
 * @param {Error} error - Error object
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum number of attempts
 * @returns {Object} Error handling result
 */
export function handleNotionError(error: Error, attempt?: number, maxAttempts?: number): Object;
/**
 * Create MCP error response
 * @param {Object} errorInfo - Error information
 * @param {string|number} requestId - Request ID
 * @returns {Object} MCP error response
 */
export function createMCPErrorResponse(errorInfo: Object, requestId: string | number): Object;
/**
 * Validate error handling configuration
 * @param {Object} config - Error handling configuration
 * @returns {boolean} True if valid
 */
export function validateErrorConfig(config: Object): boolean;
export namespace NotionErrorCodes {
    let INVALID_REQUEST: string;
    let INVALID_JSON: string;
    let INVALID_REQUEST_URL: string;
    let INVALID_REQUEST_METHOD: string;
    let UNAUTHORIZED: string;
    let RESTRICTED_RESOURCE: string;
    let OBJECT_NOT_FOUND: string;
    let RATE_LIMITED: string;
    let INTERNAL_SERVER_ERROR: string;
    let SERVICE_UNAVAILABLE: string;
    let DATABASE_CONNECTION_UNAVAILABLE: string;
    let GATEWAY_TIMEOUT: string;
    let CONFLICT_ERROR: string;
    let VALIDATION_ERROR: string;
}
//# sourceMappingURL=error-handler.d.ts.map