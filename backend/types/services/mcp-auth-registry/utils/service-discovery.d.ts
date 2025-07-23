export type ServiceConfig = import("../types/auth-types.js").ServiceConfig;
export type AuthRegistryConfig = import("../types/auth-types.js").AuthRegistryConfig;
export type OAuthHandler = import("../types/auth-types.js").OAuthHandler;
export type ValidatorType = import("../types/auth-types.js").ValidatorType;
export type DiscoveredService = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Service directory path
     */
    path: string;
    /**
     * - Authentication type
     */
    type: "oauth" | "apikey";
    /**
     * - Whether service has validator
     */
    hasValidator: boolean;
    /**
     * - Whether service has OAuth handler
     */
    hasOAuthHandler: boolean;
};
/**
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').AuthRegistryConfig} AuthRegistryConfig
 * @typedef {import('../types/auth-types.js').OAuthHandler} OAuthHandler
 * @typedef {import('../types/auth-types.js').ValidatorType} ValidatorType
 */
/**
 * @typedef {Object} DiscoveredService
 * @property {string} name - Service name
 * @property {string} path - Service directory path
 * @property {'oauth'|'apikey'} type - Authentication type
 * @property {boolean} hasValidator - Whether service has validator
 * @property {boolean} hasOAuthHandler - Whether service has OAuth handler
 */
/**
 * Discovers all MCP services in the services directory
 * @param {string} servicesPath - Path to MCP services directory
 * @returns {Promise<Array<DiscoveredService>>} Array of discovered services
 */
export function discoverServices(servicesPath: string): Promise<Array<DiscoveredService>>;
/**
 * Analyzes a service directory to determine its capabilities
 * @param {string} serviceName - Name of the service
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<DiscoveredService|null>} Service info or null if invalid
 */
export function analyzeService(serviceName: string, servicePath: string): Promise<DiscoveredService | null>;
/**
 * Loads a service module dynamically
 * @param {string} modulePath - Path to the module
 * @returns {Promise<Object|null>} Loaded module or null if failed
 */
export function loadServiceModule(modulePath: string): Promise<Object | null>;
/**
 * Registers a discovered service with the auth registry
 * @param {DiscoveredService} serviceInfo - Service information
 * @returns {Promise<ServiceConfig|null>} Service configuration or null if failed
 */
export function registerService(serviceInfo: DiscoveredService): Promise<ServiceConfig | null>;
/**
 * Determines required credential fields based on service type
 * @param {'oauth'|'apikey'} type - Service authentication type
 * @returns {Array<string>} Required credential fields
 */
export function determineRequiredFields(type: "oauth" | "apikey"): Array<string>;
/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export function fileExists(filePath: string): Promise<boolean>;
//# sourceMappingURL=service-discovery.d.ts.map