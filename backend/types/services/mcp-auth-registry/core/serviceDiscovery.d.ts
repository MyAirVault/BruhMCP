export type ServiceType = import('../types/serviceTypes.js').ServiceType;
export type ServiceRegistryMap = import('../types/serviceTypes.js').ServiceRegistryMap;
export type ServiceRegistryEntry = import('../types/serviceTypes.js').ServiceRegistryEntry;
/**
 * @typedef {import('../types/serviceTypes.js').ServiceType} ServiceType
 * @typedef {import('../types/serviceTypes.js').ServiceRegistryMap} ServiceRegistryMap
 * @typedef {import('../types/serviceTypes.js').ServiceRegistryEntry} ServiceRegistryEntry
 */
/**
 * Discovers available MCP services and their capabilities
 * @param {string} servicesDir - Path to mcp-servers directory
 * @returns {Promise<ServiceRegistryMap>} Service registry mapping
 */
export function discoverServices(servicesDir: string): Promise<ServiceRegistryMap>;
/**
 * Analyzes a service directory to create registry entry
 * @param {string} serviceName - Name of the service
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<ServiceRegistryEntry|null>} Service registry entry or null if invalid
 */
export function analyzeServiceDirectory(serviceName: string, servicePath: string): Promise<ServiceRegistryEntry | null>;
/**
 * Determines service type based on available files
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<ServiceType|null>} Service type or null if invalid
 */
export function determineServiceType(servicePath: string): Promise<ServiceType | null>;
/**
 * Checks if service has all required files for its type
 * @param {string} servicePath - Path to service directory
 * @param {ServiceType} serviceType - Service type
 * @returns {Promise<boolean>} True if service is healthy
 */
export function checkServiceHealth(servicePath: string, serviceType: ServiceType): Promise<boolean>;
/**
 * Gets required files for a service type
 * @param {ServiceType} serviceType - Service type
 * @returns {string[]} Array of required file names
 */
export function getRequiredFiles(serviceType: ServiceType): string[];
/**
 * Gets available service names from registry
 * @param {ServiceRegistryMap} registry - Service registry
 * @returns {string[]} Array of service names
 */
export function getAvailableServices(registry: ServiceRegistryMap): string[];
/**
 * Gets services by type
 * @param {ServiceRegistryMap} registry - Service registry
 * @param {ServiceType} type - Service type to filter by
 * @returns {string[]} Array of service names matching type
 */
export function getServicesByType(registry: ServiceRegistryMap, type: ServiceType): string[];
/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
export function fileExists(filePath: string): Promise<boolean>;
//# sourceMappingURL=serviceDiscovery.d.ts.map