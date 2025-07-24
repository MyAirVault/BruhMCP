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
export class AirtableError extends Error {
    constructor(message: any, code: any, statusCode: any, details?: {});
    code: any;
    statusCode: any;
    details: {};
    timestamp: string;
}
export class ValidationError extends AirtableError {
    constructor(message: any, details?: {});
}
export class AuthenticationError extends AirtableError {
    constructor(message: any, details?: {});
}
export class AuthorizationError extends AirtableError {
    constructor(message: any, details?: {});
}
export class NotFoundError extends AirtableError {
    constructor(message: any, details?: {});
}
export class RateLimitError extends AirtableError {
    constructor(message: any, retryAfter: any, details?: {});
    retryAfter: any;
}
export class UnprocessableEntityError extends AirtableError {
    constructor(message: any, details?: {});
}
export class InternalServerError extends AirtableError {
    constructor(message: any, details?: {});
}
export class ServiceUnavailableError extends AirtableError {
    constructor(message: any, details?: {});
}
export class NetworkError extends AirtableError {
    constructor(message: any, details?: {});
}
export class TimeoutError extends AirtableError {
    constructor(message: any, details?: {});
}
/**
 * Error handler class
 */
export class AirtableErrorHandler {
    /**
     * Create error from HTTP response
     * @param {Response} response - HTTP response
     * @returns {Promise<AirtableError>}
     */
    static fromResponse(response: Response): Promise<AirtableError>;
    /**
     * Create error from JavaScript error
     * @param {Error} error - JavaScript error
     * @returns {AirtableError}
     */
    static fromError(error: Error): AirtableError;
    /**
     * Handle and log error
     * @param {Error} error - Error to handle
     * @param {Object} context - Error context
     * @returns {AirtableError}
     */
    static handle(error: Error, context?: Object): AirtableError;
    /**
     * Create MCP error response
     * @param {AirtableError} error - Airtable error
     * @param {string|number} id - Request ID
     * @returns {Object}
     */
    static toMCPError(error: AirtableError, id?: string | number): Object;
    /**
     * Get MCP error code from Airtable error
     * @param {AirtableError} error - Airtable error
     * @returns {number}
     */
    static getMCPErrorCode(error: AirtableError): number;
    /**
     * Create HTTP error response
     * @param {AirtableError} error - Airtable error
     * @returns {Object}
     */
    static toHTTPError(error: AirtableError): Object;
    /**
     * Check if error is retryable
     * @param {AirtableError} error - Airtable error
     * @returns {boolean}
     */
    static isRetryable(error: AirtableError): boolean;
    /**
     * Get retry delay for error
     * @param {AirtableError} error - Airtable error
     * @param {number} attempt - Retry attempt number
     * @returns {number} Delay in milliseconds
     */
    static getRetryDelay(error: AirtableError, attempt: number): number;
    /**
     * Categorize error for metrics
     * @param {AirtableError} error - Airtable error
     * @returns {string}
     */
    static categorizeError(error: AirtableError): string;
    /**
     * Create error summary for logging
     * @param {AirtableError} error - Airtable error
     * @returns {Object}
     */
    static createErrorSummary(error: AirtableError): Object;
    /**
     * Handle multiple errors
     * @param {Array<Error>} errors - Array of errors
     * @param {Object} context - Error context
     * @returns {Array<AirtableError>}
     */
    static handleMultiple(errors: Array<Error>, context?: Object): Array<AirtableError>;
}
export default AirtableErrorHandler;
//# sourceMappingURL=errorHandler.d.ts.map