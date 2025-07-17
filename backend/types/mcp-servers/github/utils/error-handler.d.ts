/**
 * Error middleware for Express
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export function errorMiddleware(err: Error, req: Object, res: Object, next: Function): void;
/**
 * Async error wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function}
 */
export function asyncErrorHandler(fn: Function): Function;
/**
 * Error recovery helper
 * @param {Function} operation - Operation to execute
 * @param {Object} options - Recovery options
 * @returns {Promise}
 */
export function withErrorRecovery(operation: Function, options?: Object): Promise<any>;
/**
 * Custom error classes
 */
export class GitHubError extends Error {
    constructor(message: any, code: any, statusCode: any, details?: {});
    code: any;
    statusCode: any;
    details: {};
    timestamp: string;
}
export class ValidationError extends GitHubError {
    constructor(message: any, details?: {});
}
export class AuthenticationError extends GitHubError {
    constructor(message: any, details?: {});
}
export class AuthorizationError extends GitHubError {
    constructor(message: any, details?: {});
}
export class NotFoundError extends GitHubError {
    constructor(message: any, details?: {});
}
export class RateLimitError extends GitHubError {
    constructor(message: any, retryAfter: any, details?: {});
    retryAfter: any;
}
export class UnprocessableEntityError extends GitHubError {
    constructor(message: any, details?: {});
}
export class InternalServerError extends GitHubError {
    constructor(message: any, details?: {});
}
export class ServiceUnavailableError extends GitHubError {
    constructor(message: any, details?: {});
}
export class NetworkError extends GitHubError {
    constructor(message: any, details?: {});
}
export class TimeoutError extends GitHubError {
    constructor(message: any, details?: {});
}
export class ConflictError extends GitHubError {
    constructor(message: any, details?: {});
}
export class AbuseDetectionError extends GitHubError {
    constructor(message: any, retryAfter: any, details?: {});
    retryAfter: any;
}
/**
 * Error handler class
 */
export class GitHubErrorHandler {
    /**
     * Create error from HTTP response
     * @param {Response} response - HTTP response
     * @returns {GitHubError}
     */
    static fromResponse(response: Response): GitHubError;
    /**
     * Create error from JavaScript error
     * @param {Error} error - JavaScript error
     * @returns {GitHubError}
     */
    static fromError(error: Error): GitHubError;
    /**
     * Handle and log error
     * @param {Error} error - Error to handle
     * @param {Object} context - Error context
     * @returns {GitHubError}
     */
    static handle(error: Error, context?: Object): GitHubError;
    /**
     * Create MCP error response
     * @param {GitHubError} error - GitHub error
     * @param {string|number} id - Request ID
     * @returns {Object}
     */
    static toMCPError(error: GitHubError, id?: string | number): Object;
    /**
     * Get MCP error code from GitHub error
     * @param {GitHubError} error - GitHub error
     * @returns {number}
     */
    static getMCPErrorCode(error: GitHubError): number;
    /**
     * Create HTTP error response
     * @param {GitHubError} error - GitHub error
     * @returns {Object}
     */
    static toHTTPError(error: GitHubError): Object;
    /**
     * Check if error is retryable
     * @param {GitHubError} error - GitHub error
     * @returns {boolean}
     */
    static isRetryable(error: GitHubError): boolean;
    /**
     * Get retry delay for error
     * @param {GitHubError} error - GitHub error
     * @param {number} attempt - Retry attempt number
     * @returns {number} Delay in milliseconds
     */
    static getRetryDelay(error: GitHubError, attempt: number): number;
    /**
     * Categorize error for metrics
     * @param {GitHubError} error - GitHub error
     * @returns {string}
     */
    static categorizeError(error: GitHubError): string;
    /**
     * Create error summary for logging
     * @param {GitHubError} error - GitHub error
     * @returns {Object}
     */
    static createErrorSummary(error: GitHubError): Object;
    /**
     * Handle multiple errors
     * @param {Array<Error>} errors - Array of errors
     * @param {Object} context - Error context
     * @returns {Array<GitHubError>}
     */
    static handleMultiple(errors: Array<Error>, context?: Object): Array<GitHubError>;
    /**
     * Check if error indicates repository access issues
     * @param {GitHubError} error - GitHub error
     * @returns {boolean}
     */
    static isRepositoryAccessError(error: GitHubError): boolean;
    /**
     * Check if error indicates authentication issues
     * @param {GitHubError} error - GitHub error
     * @returns {boolean}
     */
    static isAuthenticationError(error: GitHubError): boolean;
    /**
     * Get suggested actions for error
     * @param {GitHubError} error - GitHub error
     * @returns {Array<string>}
     */
    static getSuggestedActions(error: GitHubError): Array<string>;
}
export default GitHubErrorHandler;
//# sourceMappingURL=error-handler.d.ts.map