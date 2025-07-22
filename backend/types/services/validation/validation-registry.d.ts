export const validationRegistry: ValidationRegistry;
export type ValidatorModule = {
    /**
     * - Default export validator function/class
     */
    default: Function;
};
export type ServiceValidator = Function | Object;
export type FileSystemError = {
    /**
     * - Error code (e.g., 'ENOENT')
     */
    code: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - File path that caused the error
     */
    path?: string | undefined;
};
/**
 * @typedef {Object} ValidatorModule
 * @property {Function} default - Default export validator function/class
 */
/**
 * @typedef {Function|Object} ServiceValidator
 * @property {Function} [validate] - Validation function
 * @property {string} [name] - Validator name
 * @property {string} [version] - Validator version
 */
/**
 * @typedef {Object} FileSystemError
 * @property {string} code - Error code (e.g., 'ENOENT')
 * @property {string} message - Error message
 * @property {string} [path] - File path that caused the error
 */
/**
 * Validation registry that discovers and manages service validators
 */
declare class ValidationRegistry {
    /** @type {Map<string, ServiceValidator>} */
    validators: Map<string, ServiceValidator>;
    /** @type {boolean} */
    initialized: boolean;
    /**
     * Initialize the registry by discovering validators from MCP server folders
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Load validator for a specific service
     * @param {string} serviceName - Name of the service
     * @param {string} mcpServersPath - Path to MCP servers directory
     * @returns {Promise<void>}
     */
    loadServiceValidator(serviceName: string, mcpServersPath: string): Promise<void>;
    /**
     * Get validator for a service
     * @param {string} serviceName - Name of the service
     * @returns {ServiceValidator|null} Validator instance or null if not found
     */
    getValidator(serviceName: string): ServiceValidator | null;
    /**
     * Register a validator manually
     * @param {string} serviceName - Name of the service
     * @param {ServiceValidator} validator - Validator instance
     * @returns {void}
     */
    registerValidator(serviceName: string, validator: ServiceValidator): void;
    /**
     * Get all registered services
     * @returns {string[]} Array of service names
     */
    getRegisteredServices(): string[];
    /**
     * Check if a service has a validator
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if validator exists
     */
    hasValidator(serviceName: string): boolean;
}
export {};
//# sourceMappingURL=validation-registry.d.ts.map