export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Service authentication type
     */
    type: "oauth" | "apikey";
    /**
     * - Credential validator
     */
    validator: any;
    /**
     * - OAuth handler (for OAuth services)
     */
    oauthHandler?: any;
    /**
     * - Required credential fields
     */
    requiredFields: Array<string>;
};
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
export type RegistryStatistics = {
    /**
     * - Total number of services
     */
    totalServices: number;
    /**
     * - Number of OAuth services
     */
    oauthServices: number;
    /**
     * - Number of API key services
     */
    apiKeyServices: number;
    /**
     * - Services grouped by type
     */
    servicesByType: {
        oauth: Array<string>;
        apikey: Array<string>;
    };
    /**
     * - Whether registry is initialized
     */
    initialized: boolean;
};
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {'oauth'|'apikey'} type - Service authentication type
 * @property {any} validator - Credential validator
 * @property {any} [oauthHandler] - OAuth handler (for OAuth services)
 * @property {Array<string>} requiredFields - Required credential fields
 */
/**
 * @typedef {Object} AuthRegistryConfig
 * @property {string} servicesPath - Path to MCP services directory
 * @property {string} baseUrl - Base URL for callbacks
 * @property {boolean} autoDiscovery - Enable automatic service discovery
 * @property {number} [discoveryInterval] - Service discovery interval in ms
 */
/**
 * @typedef {Object} RegistryStatistics
 * @property {number} totalServices - Total number of services
 * @property {number} oauthServices - Number of OAuth services
 * @property {number} apiKeyServices - Number of API key services
 * @property {Object} servicesByType - Services grouped by type
 * @property {Array<string>} servicesByType.oauth - OAuth service names
 * @property {Array<string>} servicesByType.apikey - API key service names
 * @property {boolean} initialized - Whether registry is initialized
 */
/**
 * MCP Authentication Registry Class
 * Manages authentication flows for all registered MCP services
 */
declare class AuthRegistryImpl {
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
     * @param {Partial<AuthRegistryConfig>} [config] - Registry configuration
     * @returns {Promise<void>}
     */
    initialize(config?: Partial<AuthRegistryConfig>): Promise<void>;
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
     * @returns {RegistryStatistics} Registry statistics
     */
    getStatistics(): RegistryStatistics;
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
export const authRegistry: AuthRegistryImpl;
import OAuthCoordinator from './coordinators/oauth-coordinator.js';
import ApiKeyCoordinator from './coordinators/apikey-coordinator.js';
import express from 'express';
export { AuthRegistryImpl as MCPAuthRegistry };
//# sourceMappingURL=index.d.ts.map