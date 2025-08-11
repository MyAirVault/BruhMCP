export type ServiceError = import("../types/serviceTypes.js").ServiceError;
export namespace ERROR_CODES {
    let SERVICE_NOT_FOUND: string;
    let SERVICE_INACTIVE: string;
    let FUNCTION_NOT_FOUND: string;
    let INVALID_CREDENTIALS: string;
    let AUTH_REQUIRED: string;
    let INVALID_SERVICE_TYPE: string;
    let REGISTRY_NOT_INITIALIZED: string;
    let FUNCTION_EXECUTION_ERROR: string;
    let VALIDATION_ERROR: string;
    let OAUTH_ERROR: string;
    let INSTANCE_CREATION_ERROR: string;
    let INSTANCE_REVOCATION_ERROR: string;
}
/**
 * Creates a standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [details] - Additional error details
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(code: string, message: string, details?: Object): Object;
/**
 * Creates a standardized success response
 * @param {string} message - Success message
 * @param {Object} [data] - Response data
 * @returns {Object} Standardized success response
 */
export function createSuccessResponse(message: string, data?: Object): Object;
/**
 * Handles service not found errors
 * @param {string} serviceName - Service name
 * @returns {Object} Error response
 */
export function handleServiceNotFound(serviceName: string): Object;
/**
 * Handles function not found errors
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @returns {Object} Error response
 */
export function handleFunctionNotFound(serviceName: string, functionName: string): Object;
/**
 * Handles authentication required errors
 * @returns {Object} Error response
 */
export function handleAuthRequired(): Object;
/**
 * Handles invalid service type errors
 * @param {string} serviceName - Service name
 * @param {string} expectedType - Expected service type
 * @param {string} actualType - Actual service type
 * @returns {Object} Error response
 */
export function handleInvalidServiceType(serviceName: string, expectedType: string, actualType: string): Object;
/**
 * Handles registry not initialized errors
 * @returns {Object} Error response
 */
export function handleRegistryNotInitialized(): Object;
/**
 * Handles function execution errors
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @param {Error} error - Original error
 * @returns {Object} Error response
 */
export function handleFunctionExecutionError(serviceName: string, functionName: string, error: Error): Object;
/**
 * Handles validation errors
 * @param {string} field - Field that failed validation
 * @param {string} reason - Validation failure reason
 * @returns {Object} Error response
 */
export function handleValidationError(field: string, reason: string): Object;
/**
 * Handles OAuth errors
 * @param {string} serviceName - Service name
 * @param {string} reason - OAuth error reason
 * @returns {Object} Error response
 */
export function handleOAuthError(serviceName: string, reason: string): Object;
/**
 * Validates request parameters
 * @param {Record<string, any>} params - Parameters to validate
 * @param {string[]} requiredFields - Required field names
 * @returns {Object|null} Error response or null if valid
 */
export function validateRequestParams(params: Record<string, any>, requiredFields: string[]): Object | null;
/**
 * Validates service credentials based on service type
 * @param {import('../types/serviceTypes.js').CredentialsData} credentials - Credentials to validate
 * @param {import('../types/serviceTypes.js').ServiceType} serviceType - Service type
 * @returns {Object|null} Error response or null if valid
 */
export function validateCredentials(credentials: import("../types/serviceTypes.js").CredentialsData, serviceType: import("../types/serviceTypes.js").ServiceType): Object | null;
/**
 * Logs error with context
 * @param {string} context - Error context
 * @param {Error|string} error - Error to log
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
export function logError(context: string, error: Error | string, metadata?: Object): void;
/**
 * Logs warning with context
 * @param {string} context - Warning context
 * @param {string} message - Warning message
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
export function logWarning(context: string, message: string, metadata?: Object): void;
/**
 * Safely executes an async function with error handling
 * @param {Function} fn - Function to execute
 * @param {string} context - Execution context for logging
 * @param {*} defaultValue - Default value to return on error
 * @returns {Promise<*>} Function result or default value
 */
export function safeExecute(fn: Function, context: string, defaultValue?: any): Promise<any>;
//# sourceMappingURL=errorHandlers.d.ts.map