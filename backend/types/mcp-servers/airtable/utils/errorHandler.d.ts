/**
 * Custom error classes
 */
export class AirtableError extends Error {
    /**
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {number} statusCode - HTTP status code
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, code: string, statusCode: number, details?: Record<string, string | number | boolean | Object>);
    /** @type {string} */
    code: string;
    /** @type {number} */
    statusCode: number;
    /** @type {Record<string, string | number | boolean | Object>} */
    details: Record<string, string | number | boolean | Object>;
    /** @type {string} */
    timestamp: string;
}
export class ValidationError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class AuthenticationError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class AuthorizationError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class NotFoundError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class RateLimitError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {number} retryAfter - Retry after seconds
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, retryAfter: number, details?: Record<string, string | number | boolean | Object>);
    /** @type {number} */
    retryAfter: number;
}
export class UnprocessableEntityError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class InternalServerError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class ServiceUnavailableError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class NetworkError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
}
export class TimeoutError extends AirtableError {
    /**
     * @param {string} message - Error message
     * @param {Record<string, string | number | boolean | Object>} details - Error details
     */
    constructor(message: string, details?: Record<string, string | number | boolean | Object>);
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
     * @param {string|number|null} id - Request ID
     * @returns {Object}
     */
    static toMCPError(error: AirtableError, id?: string | number | null): Object;
    /**
     * Get MCP error code from Airtable error
     * @param {AirtableError} error - Airtable error
     * @returns {number}
     */
    static getMCPErrorCode(error: AirtableError): number;
    /**
     * Create HTTP error response
     * @param {AirtableError} error - Airtable error
     * @returns {{status: number, body: Object}}
     */
    static toHTTPError(error: AirtableError): {
        status: number;
        body: Object;
    };
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
/**
 * Error middleware for Express
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Request object
 * @param {import('express').Response} res - Response object
 * @param {import('express').NextFunction} _next - Next middleware
 */
export function errorMiddleware(err: Error, req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction): void;
/**
 * Async error wrapper
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn - Async function to wrap
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export function asyncErrorHandler(fn: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>): (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void;
/**
 * Error recovery helper
 * @template T
 * @param {() => Promise<T>} operation - Operation to execute
 * @param {{maxRetries?: number, retryDelay?: number, context?: Record<string, string | number | boolean>}} options - Recovery options
 * @returns {Promise<T>}
 */
export function withErrorRecovery<T>(operation: () => Promise<T>, options?: {
    maxRetries?: number | undefined;
    retryDelay?: number | undefined;
    context?: Record<string, string | number | boolean> | undefined;
}): Promise<T>;
//# sourceMappingURL=errorHandler.d.ts.map