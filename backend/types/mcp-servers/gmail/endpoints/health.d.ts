/**
 * Health check endpoint for Gmail MCP service
 * Provides service status and configuration information
 */
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {number} port - Service port
 * @property {string} version - Service version
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {string} iconPath - Icon path
 * @property {string[]} scopes - OAuth scopes
 */
/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} responseTimeMs - Response time in milliseconds
 * @property {NodeJS.MemoryUsage} memoryUsage - Memory usage information
 * @property {string} nodeVersion - Node.js version
 */
/**
 * @typedef {Object} HealthStatus
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Health status
 * @property {number} uptime - Uptime in seconds
 * @property {number} port - Service port
 * @property {string} version - Service version
 * @property {string} authType - Authentication type
 * @property {string} timestamp - Timestamp
 * @property {string} description - Description
 * @property {string} iconPath - Icon path
 * @property {string[]} scopes - OAuth scopes
 * @property {Object} capabilities - Service capabilities
 * @property {Object} endpoints - Available endpoints
 * @property {Object} oauth - OAuth configuration
 * @property {PerformanceMetrics} [performance] - Performance metrics
 */
/**
 * Get health status for Gmail service
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @returns {HealthStatus} Health status information
 */
export function healthCheck(serviceConfig: ServiceConfig): HealthStatus;
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Authentication type
     */
    authType: string;
    /**
     * - Service description
     */
    description: string;
    /**
     * - Icon path
     */
    iconPath: string;
    /**
     * - OAuth scopes
     */
    scopes: string[];
};
export type PerformanceMetrics = {
    /**
     * - Response time in milliseconds
     */
    responseTimeMs: number;
    /**
     * - Memory usage information
     */
    memoryUsage: NodeJS.MemoryUsage;
    /**
     * - Node.js version
     */
    nodeVersion: string;
};
export type HealthStatus = {
    /**
     * - Service name
     */
    service: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Health status
     */
    status: string;
    /**
     * - Uptime in seconds
     */
    uptime: number;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Authentication type
     */
    authType: string;
    /**
     * - Timestamp
     */
    timestamp: string;
    /**
     * - Description
     */
    description: string;
    /**
     * - Icon path
     */
    iconPath: string;
    /**
     * - OAuth scopes
     */
    scopes: string[];
    /**
     * - Service capabilities
     */
    capabilities: Object;
    /**
     * - Available endpoints
     */
    endpoints: Object;
    /**
     * - OAuth configuration
     */
    oauth: Object;
    /**
     * - Performance metrics
     */
    performance?: PerformanceMetrics | undefined;
};
//# sourceMappingURL=health.d.ts.map