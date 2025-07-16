export const validationRegistry: ValidationRegistry;
/**
 * Validation registry that discovers and manages service validators
 */
declare class ValidationRegistry {
    /** @type {Map<string, any>} */
    validators: Map<string, any>;
    initialized: boolean;
    /**
     * Initialize the registry by discovering validators from MCP server folders
     */
    initialize(): Promise<void>;
    /**
     * Load validator for a specific service
     * @param {string} serviceName - Name of the service
     * @param {string} mcpServersPath - Path to MCP servers directory
     */
    loadServiceValidator(serviceName: string, mcpServersPath: string): Promise<void>;
    /**
     * Get validator for a service
     * @param {string} serviceName - Name of the service
     * @returns {any|null} Validator instance or null if not found
     */
    getValidator(serviceName: string): any | null;
    /**
     * Register a validator manually
     * @param {string} serviceName - Name of the service
     * @param {any} validator - Validator instance
     */
    registerValidator(serviceName: string, validator: any): void;
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