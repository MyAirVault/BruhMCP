export type ServiceRegistryMap = import("../types/service-types.js").ServiceRegistryMap;
export type ServiceRegistryEntry = import("../types/service-types.js").ServiceRegistryEntry;
export type ServiceError = import("../types/service-types.js").ServiceError;
/**
 * @typedef {import('../types/service-types.js').ServiceRegistryMap} ServiceRegistryMap
 * @typedef {import('../types/service-types.js').ServiceRegistryEntry} ServiceRegistryEntry
 * @typedef {import('../types/service-types.js').ServiceError} ServiceError
 */
/**
 * Main service registry class
 */
export class ServiceRegistry {
    /**
     * Initialize the registry
     * @param {string} servicesPath - Path to mcp-servers directory
     * @returns {Promise<void>}
     */
    initialize(servicesPath: string): Promise<void>;
    /**
     * Get service by name
     * @param {string} serviceName - Service name
     * @returns {ServiceRegistryEntry | null} Service entry or null if not found
     */
    getService(serviceName: string): ServiceRegistryEntry | null;
    /**
     * Check if service exists and is active
     * @param {string} serviceName - Service name
     * @returns {boolean} True if service exists and is active
     */
    hasService(serviceName: string): boolean;
    /**
     * Get all available service names
     * @returns {string[]} Array of available service names
     */
    getAvailableServices(): string[];
    /**
     * Get services by type
     * @param {import('../types/service-types.js').ServiceType} type - Service type
     * @returns {string[]} Array of service names matching type
     */
    getServicesByType(type: import("../types/service-types.js").ServiceType): string[];
    /**
     * Call service function
     * @param {string} serviceName - Service name
     * @param {string} functionName - Function name
     * @param {...*} args - Function arguments
     * @returns {Promise<*>} Function result
     */
    callServiceFunction(serviceName: string, functionName: string, ...args: any[]): Promise<any>;
    /**
     * Check if service has a specific function
     * @param {string} serviceName - Service name
     * @param {string} functionName - Function name
     * @returns {boolean} True if service has the function
     */
    hasServiceFunction(serviceName: string, functionName: string): boolean;
    /**
     * Reload a specific service
     * @param {string} serviceName - Service name to reload
     * @returns {Promise<boolean>} True if reload successful
     */
    reloadService(serviceName: string): Promise<boolean>;
    /**
     * Get registry statistics
     * @returns {{initialized: boolean, totalServices: number, activeServices: number, servicesByType: Object.<string, number>, services: string[]}} Registry statistics
     */
    getStats(): {
        initialized: boolean;
        totalServices: number;
        activeServices: number;
        servicesByType: {
            [x: string]: number;
        };
        services: string[];
    };
    #private;
}
//# sourceMappingURL=registry.d.ts.map