export type AuthRegistryConfig = import("./types/auth-types.js").AuthRegistryConfig;
export type ServiceConfig = import("./types/auth-types.js").ServiceConfig;
/**
 * @typedef {import('./types/auth-types.js').AuthRegistryConfig} AuthRegistryConfig
 * @typedef {import('./types/auth-types.js').ServiceConfig} ServiceConfig
 */
/**
 * MCP Authentication Registry Class
 * Manages authentication flows for all registered MCP services
 */
export class MCPAuthRegistry {
    /** @type {OAuthCoordinator} */
    oauthCoordinator: OAuthCoordinator;
    /** @type {ApiKeyCoordinator} */
    apiKeyCoordinator: ApiKeyCoordinator;
    /** @type {Map<string, ServiceConfig>} */
    registeredServices: Map<string, ServiceConfig>;
    /** @type {boolean} */
    initialized: boolean;
    /** @type {express.Router|null} */
    router: express.Router | null;
    /**
     * Initializes the auth registry with automatic service discovery
     * @param {AuthRegistryConfig} [config] - Registry configuration
     * @returns {Promise<void>}
     */
    initialize(config?: AuthRegistryConfig): Promise<void>;
    /**
     * Discovers and registers all available MCP services
     * @param {string} servicesPath - Path to MCP services directory
     * @returns {Promise<void>}
     */
    discoverAndRegisterServices(servicesPath: string): Promise<void>;
    /**
     * Registers a discovered service with appropriate coordinator
     * @param {import('./utils/service-discovery.js').DiscoveredService} serviceInfo - Service information
     * @returns {Promise<void>}
     */
    registerDiscoveredService(serviceInfo: import("./utils/service-discovery.js").DiscoveredService): Promise<void>;
    /**
     * Creates Express routes for the auth registry
     * @returns {express.Router} Express router
     */
    createRoutes(): express.Router;
    /**
     * Gets the Express router for the auth registry
     * @returns {express.Router|null} Express router or null if not initialized
     */
    getRouter(): express.Router | null;
    /**
     * Gets list of all registered services
     * @returns {Array<ServiceConfig>} Array of service configurations
     */
    getRegisteredServices(): Array<ServiceConfig>;
    /**
     * Gets service configuration by name
     * @param {string} serviceName - Name of the service
     * @returns {ServiceConfig|null} Service configuration or null if not found
     */
    getServiceConfig(serviceName: string): ServiceConfig | null;
    /**
     * Checks if a service is registered
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is registered
     */
    hasService(serviceName: string): boolean;
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
     * Manually registers a service (for testing or custom services)
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    manuallyRegisterService(serviceConfig: ServiceConfig): void;
    /**
     * Shuts down the auth registry
     * @returns {void}
     */
    shutdown(): void;
}
export const authRegistry: MCPAuthRegistry;
import OAuthCoordinator = require("./coordinators/oauth-coordinator.js");
import ApiKeyCoordinator = require("./coordinators/apikey-coordinator.js");
import express = require("express");
//# sourceMappingURL=index.d.ts.map