/**
 * Standardized error response utility
 * Provides consistent error formatting across the entire backend
 * @fileoverview Creates uniform error responses for all API endpoints
 */
/**
 * Validation error detail structure
 * @typedef {Object} ValidationDetail
 * @property {string} field - Field name with validation error
 * @property {string} message - Validation error message
 * @property {string} code - Validation error code
 */
/**
 * Error object structure
 * @typedef {Object} ErrorObject
 * @property {string} code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @property {string} message - Human-readable error message
 * @property {string} timestamp - ISO timestamp of when error occurred
 * @property {Array<ValidationDetail>} [details] - Additional error details (for validation errors)
 * @property {string} [instanceId] - Instance ID if applicable
 * @property {string} [userId] - User ID if applicable
 * @property {string} [reason] - Error reason if applicable
 * @property {string} [expiresAt] - Expiration date if applicable
 * @property {string} [plan] - Plan type if applicable
 * @property {number} [currentCount] - Current count if applicable
 * @property {number} [maxInstances] - Maximum instances if applicable
 * @property {string} [upgradeMessage] - Upgrade message if applicable
 * @property {Object} [metadata] - Additional metadata
 */
/**
 * Standard error response structure
 * @typedef {Object} ErrorResponse
 * @property {ErrorObject} error - Error details
 */
/**
 * Options for error response creation
 * @typedef {Object} ErrorOptions
 * @property {Array<ValidationDetail>} [details] - Validation error details
 * @property {string} [instanceId] - Instance ID
 * @property {string} [userId] - User ID
 * @property {string} [reason] - Error reason
 * @property {string} [expiresAt] - Expiration date
 * @property {string} [plan] - Plan type
 * @property {number} [currentCount] - Current count
 * @property {number} [maxInstances] - Maximum instances
 * @property {string} [upgradeMessage] - Upgrade message
 * @property {Object} [metadata] - Additional metadata
 */
/**
 * Creates a standardized error response
 * @param {number} _statusCode - HTTP status code (not used in response, kept for API compatibility)
 * @param {string} code - Error code (uppercase with underscores)
 * @param {string} message - Human-readable error message
 * @param {ErrorOptions} [options] - Additional options
 * @returns {ErrorResponse} Standardized error response object
 */
export function createErrorResponse(_statusCode: number, code: string, message: string, options?: ErrorOptions): ErrorResponse;
/**
 * Sends a standardized error response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {ErrorOptions} [options] - Additional options
 */
export function sendErrorResponse(res: import("express").Response, statusCode: number, code: string, message: string, options?: ErrorOptions): void;
/**
 * Converts Zod validation errors to standard format
 * @param {import('zod').ZodError} zodError - Zod validation error
 * @returns {Array<ValidationDetail>} Formatted validation details
 */
export function formatZodErrors(zodError: import("zod").ZodError): Array<ValidationDetail>;
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
    function unauthorized(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function forbidden(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function invalidToken(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function missingToken(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function validation(res: import("express").Response, message?: string, details?: Array<ValidationDetail>, options?: ErrorOptions): void;
    function invalidInput(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function missingField(res: import("express").Response, field: string, options?: ErrorOptions): void;
    function notFound(res: import("express").Response, resource?: string, options?: ErrorOptions): void;
    function alreadyExists(res: import("express").Response, resource?: string, options?: ErrorOptions): void;
    function instanceNotFound(res: import("express").Response, instanceId: string, options?: ErrorOptions): void;
    function instanceUnavailable(res: import("express").Response, instanceId: string, options?: ErrorOptions): void;
    function serviceDisabled(res: import("express").Response, serviceName: string, options?: ErrorOptions): void;
    function serviceUnavailable(res: import("express").Response, serviceName?: string, options?: ErrorOptions): void;
    function rateLimited(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function internal(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function databaseError(res: import("express").Response, message?: string, options?: ErrorOptions): void;
    function externalApiError(res: import("express").Response, service: string, message?: string, options?: ErrorOptions): void;
    function credentialsInvalid(res: import("express").Response, service: string, options?: ErrorOptions): void;
}
/**
 * Validation error detail structure
 */
export type ValidationDetail = {
    /**
     * - Field name with validation error
     */
    field: string;
    /**
     * - Validation error message
     */
    message: string;
    /**
     * - Validation error code
     */
    code: string;
};
/**
 * Error object structure
 */
export type ErrorObject = {
    /**
     * - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
     */
    code: string;
    /**
     * - Human-readable error message
     */
    message: string;
    /**
     * - ISO timestamp of when error occurred
     */
    timestamp: string;
    /**
     * - Additional error details (for validation errors)
     */
    details?: ValidationDetail[] | undefined;
    /**
     * - Instance ID if applicable
     */
    instanceId?: string | undefined;
    /**
     * - User ID if applicable
     */
    userId?: string | undefined;
    /**
     * - Error reason if applicable
     */
    reason?: string | undefined;
    /**
     * - Expiration date if applicable
     */
    expiresAt?: string | undefined;
    /**
     * - Plan type if applicable
     */
    plan?: string | undefined;
    /**
     * - Current count if applicable
     */
    currentCount?: number | undefined;
    /**
     * - Maximum instances if applicable
     */
    maxInstances?: number | undefined;
    /**
     * - Upgrade message if applicable
     */
    upgradeMessage?: string | undefined;
    /**
     * - Additional metadata
     */
    metadata?: Object | undefined;
};
/**
 * Standard error response structure
 */
export type ErrorResponse = {
    /**
     * - Error details
     */
    error: ErrorObject;
};
/**
 * Options for error response creation
 */
export type ErrorOptions = {
    /**
     * - Validation error details
     */
    details?: ValidationDetail[] | undefined;
    /**
     * - Instance ID
     */
    instanceId?: string | undefined;
    /**
     * - User ID
     */
    userId?: string | undefined;
    /**
     * - Error reason
     */
    reason?: string | undefined;
    /**
     * - Expiration date
     */
    expiresAt?: string | undefined;
    /**
     * - Plan type
     */
    plan?: string | undefined;
    /**
     * - Current count
     */
    currentCount?: number | undefined;
    /**
     * - Maximum instances
     */
    maxInstances?: number | undefined;
    /**
     * - Upgrade message
     */
    upgradeMessage?: string | undefined;
    /**
     * - Additional metadata
     */
    metadata?: Object | undefined;
};
//# sourceMappingURL=errorResponse.d.ts.map