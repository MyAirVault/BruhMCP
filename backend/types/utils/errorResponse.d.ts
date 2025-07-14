/**
 * Standardized error response utility
 * Provides consistent error formatting across the entire backend
 * @fileoverview Creates uniform error responses for all API endpoints
 */
/**
 * Standard error response structure
 * @typedef {Object} ErrorResponse
 * @property {Object} error - Error details
 * @property {string} error.code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @property {string} error.message - Human-readable error message
 * @property {Array<Object>} [error.details] - Additional error details (for validation errors)
 * @property {string} [error.instanceId] - Instance ID if applicable
 * @property {string} [error.userId] - User ID if applicable
 * @property {string} error.timestamp - ISO timestamp of when error occurred
 */
/**
 * Creates a standardized error response
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code (uppercase with underscores)
 * @param {string} message - Human-readable error message
 * @param {Object} [options] - Additional options
 * @param {Array<Object>} [options.details] - Validation error details
 * @param {string} [options.instanceId] - Instance ID
 * @param {string} [options.userId] - User ID
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Object} Standardized error response object
 */
export function createErrorResponse(statusCode: number, code: string, message: string, options?: {
    details?: Object[] | undefined;
    instanceId?: string | undefined;
    userId?: string | undefined;
    metadata?: Object | undefined;
}): Object;
/**
 * Sends a standardized error response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [options] - Additional options
 */
export function sendErrorResponse(res: import("express").Response, statusCode: number, code: string, message: string, options?: Object): void;
/**
 * Converts Zod validation errors to standard format
 * @param {import('zod').ZodError} zodError - Zod validation error
 * @returns {Array<Object>} Formatted validation details
 */
export function formatZodErrors(zodError: import("zod").ZodError): Array<Object>;
/**
 * Error handler middleware for Express
 * Catches unhandled errors and formats them consistently
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function errorHandler(err: Error, req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
export namespace ErrorResponses {
    function unauthorized(res: any, message?: string, options?: {}): void;
    function forbidden(res: any, message?: string, options?: {}): void;
    function invalidToken(res: any, message?: string, options?: {}): void;
    function missingToken(res: any, message?: string, options?: {}): void;
    function validation(res: any, message?: string, details?: any[], options?: {}): void;
    function invalidInput(res: any, message?: string, options?: {}): void;
    function missingField(res: any, field: any, options?: {}): void;
    function notFound(res: any, resource?: string, options?: {}): void;
    function alreadyExists(res: any, resource?: string, options?: {}): void;
    function instanceNotFound(res: any, instanceId: any, options?: {}): void;
    function instanceUnavailable(res: any, instanceId: any, options?: {}): void;
    function serviceDisabled(res: any, serviceName: any, options?: {}): void;
    function serviceUnavailable(res: any, serviceName?: string, options?: {}): void;
    function rateLimited(res: any, message?: string, options?: {}): void;
    function internal(res: any, message?: string, options?: {}): void;
    function databaseError(res: any, message?: string, options?: {}): void;
    function externalApiError(res: any, service: any, message?: string, options?: {}): void;
    function credentialsInvalid(res: any, service: any, options?: {}): void;
}
/**
 * Standard error response structure
 */
export type ErrorResponse = {
    /**
     * - Error details
     */
    error: {
        code: string;
        message: string;
        details?: Object[] | undefined;
        instanceId?: string | undefined;
        userId?: string | undefined;
        timestamp: string;
    };
};
//# sourceMappingURL=errorResponse.d.ts.map