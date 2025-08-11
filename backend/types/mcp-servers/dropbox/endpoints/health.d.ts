export type ServiceConfig = import("../../../types/dropbox.js").ServiceConfig;
export type HealthCheckResponse = {
    /**
     * - Service name
     */
    service: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service status
     */
    status: string;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Service port
     */
    port: number;
    /**
     * - Authentication type
     */
    authType: string;
    /**
     * - Service description
     */
    description: string;
    /**
     * - Available endpoints
     */
    endpoints: {
        health: string;
        instanceHealth: string;
        mcp: string;
        oauth: string;
    };
    /**
     * - Available features
     */
    features: {
        oauth: boolean;
        multiTenant: boolean;
        credentialCaching: boolean;
        sessionManagement: boolean;
    };
    /**
     * - ISO timestamp
     */
    timestamp: string;
};
/**
 * Dropbox service health check endpoint
 * Returns service status and configuration
 */
/**
 * @typedef {import('../../../types/dropbox.js').ServiceConfig} ServiceConfig
 */
/**
 * @typedef {Object} HealthCheckResponse
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Service status
 * @property {string} version - Service version
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {Object} endpoints - Available endpoints
 * @property {string} endpoints.health - Health endpoint
 * @property {string} endpoints.instanceHealth - Instance health endpoint
 * @property {string} endpoints.mcp - MCP endpoint
 * @property {string} endpoints.oauth - OAuth endpoint
 * @property {Object} features - Available features
 * @property {boolean} features.oauth - OAuth support
 * @property {boolean} features.multiTenant - Multi-tenant support
 * @property {boolean} features.credentialCaching - Credential caching support
 * @property {boolean} features.sessionManagement - Session management support
 * @property {string} timestamp - ISO timestamp
 */
/**
 * Health check for Dropbox service
 * @param {ServiceConfig} config - Service configuration
 * @returns {HealthCheckResponse} Health status object
 */
export function healthCheck(config: ServiceConfig): HealthCheckResponse;
//# sourceMappingURL=health.d.ts.map