export type AuthRegistryConfig = {
    /**
     * - Path to MCP services directory
     */
    servicesPath: string;
    /**
     * - Base URL for callbacks
     */
    baseUrl: string;
    /**
     * - Enable automatic service discovery
     */
    autoDiscovery: boolean;
    /**
     * - Service discovery interval in ms
     */
    discoveryInterval?: number | undefined;
};
/**
 * @typedef {Object} AuthRegistryConfig
 * @property {string} servicesPath - Path to MCP services directory
 * @property {string} baseUrl - Base URL for callbacks
 * @property {boolean} autoDiscovery - Enable automatic service discovery
 * @property {number} [discoveryInterval] - Service discovery interval in ms
 */
/**
 * MCP Authentication Registry Class
 * Manages service discovery and provides unified API for all MCP services
 */
export class MCPAuthRegistry {
    /** @type {ServiceRegistry} */
    serviceRegistry: ServiceRegistry;
    /** @type {boolean} */
    initialized: boolean;
    /** @type {import('express').Router|null} */
    router: import("express").Router | null;
    /** @type {NodeJS.Timeout|null} */
    discoveryInterval: NodeJS.Timeout | null;
    /**
     * Initializes the auth registry with automatic service discovery
     * @param {Partial<AuthRegistryConfig>} [config] - Registry configuration
     * @returns {Promise<void>}
     */
    initialize(config?: Partial<AuthRegistryConfig>): Promise<void>;
    /**
     * Gets the Express router for the auth registry
     * @returns {import('express').Router|null} Express router or null if not initialized
     */
    getRouter(): import("express").Router | null;
    /**
     * Gets list of all available services
     * @returns {string[]} Array of service names
     */
    getAvailableServices(): string[];
    /**
     * Checks if a service is available
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is available
     */
    hasService(serviceName: string): boolean;
    /**
     * Gets service information by name
     * @param {string} serviceName - Name of the service
     * @returns {import('./types/service-types.js').ServiceRegistryEntry|null} Service entry or null if not found
     */
    getService(serviceName: string): import("./types/service-types.js").ServiceRegistryEntry | null;
    /**
     * Gets services by type
     * @param {import('./types/service-types.js').ServiceType} type - Service type
     * @returns {string[]} Array of service names matching type
     */
    getServicesByType(type: import("./types/service-types.js").ServiceType): string[];
    /**
     * Gets registry statistics
     * @returns {Object} Registry statistics
     */
    getStatistics(): Object;
    /**
     * Logs registry summary
     * @returns {void}
     */
    logRegistrySummary(): void;
    /**
     * Starts automatic service discovery at regular intervals
     * @param {string} servicesPath - Path to MCP services directory
     * @param {number} interval - Discovery interval in milliseconds
     * @returns {void}
     */
    startAutoDiscovery(servicesPath: string, interval: number): void;
    /**
     * Stops automatic service discovery
     * @returns {void}
     */
    stopAutoDiscovery(): void;
    /**
     * Reloads a specific service
     * @param {string} serviceName - Service name to reload
     * @returns {Promise<boolean>} True if reload successful
     */
    reloadService(serviceName: string): Promise<boolean>;
    /**
     * Calls a service function
     * @param {string} serviceName - Service name
     * @param {string} functionName - Function name
     * @param {...*} args - Function arguments
     * @returns {Promise<*>} Function result
     */
    callServiceFunction(serviceName: string, functionName: string, ...args: any[]): Promise<any>;
    /**
     * Shuts down the auth registry
     * @returns {void}
     */
    shutdown(): void;
}
export const authRegistry: MCPAuthRegistry;
import { ServiceRegistry } from './core/registry.js';
//# sourceMappingURL=index.d.ts.map