export type ServiceType = import("../types/service-types.js").ServiceType;
export type ServiceFunctions = import("../types/service-types.js").ServiceFunctions;
export type ServiceError = import("../types/service-types.js").ServiceError;
/**
 * @typedef {import('../types/service-types.js').ServiceType} ServiceType
 * @typedef {import('../types/service-types.js').ServiceFunctions} ServiceFunctions
 * @typedef {import('../types/service-types.js').ServiceError} ServiceError
 */
/**
 * Dynamically imports service functions
 * @param {string} servicePath - Path to service directory
 * @param {string} functionName - Name of the function file to import
 * @returns {Promise<Function|null>} Imported function or null if failed
 */
export function importServiceFunction(servicePath: string, functionName: string): Promise<Function | null>;
/**
 * Loads all functions for a service based on its type
 * @param {string} servicePath - Path to service directory
 * @param {ServiceType} serviceType - Service type
 * @returns {Promise<ServiceFunctions>} Loaded functions
 */
export function loadServiceFunctions(servicePath: string, serviceType: ServiceType): Promise<ServiceFunctions>;
/**
 * Loads a specific function for a service
 * @param {string} servicePath - Path to service directory
 * @param {string} functionName - Function name to load
 * @returns {Promise<Function|null>} Loaded function or null if failed
 */
export function loadSpecificFunction(servicePath: string, functionName: string): Promise<Function | null>;
/**
 * Gets function names required for a service type
 * @param {ServiceType} serviceType - Service type
 * @returns {string[]} Array of function names
 */
export function getFunctionNamesForType(serviceType: ServiceType): string[];
/**
 * Validates that a function has the expected signature
 * @param {Function} func - Function to validate
 * @param {string} functionName - Expected function name
 * @returns {boolean} True if function is valid
 */
export function validateFunctionSignature(func: Function, functionName: string): boolean;
/**
 * Gets expected parameter count for a function
 * @param {string} functionName - Function name
 * @returns {number} Expected parameter count
 */
export function getExpectedParameterCount(functionName: string): number;
/**
 * Creates a service error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {string} [serviceName] - Service name
 * @param {string} [functionName] - Function name
 * @param {Error} [originalError] - Original error
 * @returns {ServiceError} Service error object
 */
export function createServiceError(code: string, message: string, serviceName?: string, functionName?: string, originalError?: Error): ServiceError;
/**
 * Safely calls a service function with error handling
 * @param {Function} func - Function to call
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @param {...*} args - Function arguments
 * @returns {Promise<*>} Function result or error object
 */
export function safeCallFunction(func: Function, serviceName: string, functionName: string, ...args: any[]): Promise<any>;
//# sourceMappingURL=service-loader.d.ts.map