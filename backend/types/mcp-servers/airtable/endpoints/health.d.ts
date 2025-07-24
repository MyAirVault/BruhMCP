/**
 * Airtable service health check endpoint
 * Returns service status and configuration
 */
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} version - Service version
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 */
/**
 * @typedef {Object} HealthResponse
 * @property {string} service - Service name
 * @property {string} displayName - Display name
 * @property {string} status - Health status
 * @property {string} version - Service version
 * @property {number} port - Service port
 * @property {string} authType - Authentication type
 * @property {string} description - Service description
 * @property {Object} endpoints - Available endpoints
 * @property {string} endpoints.health - Health endpoint
 * @property {string} endpoints.instanceHealth - Instance health endpoint
 * @property {string} endpoints.mcp - MCP endpoint
 * @property {Object} features - Service features
 * @property {boolean} features.multiTenant - Multi-tenant support
 * @property {boolean} features.credentialCaching - Credential caching support
 * @property {boolean} features.sessionManagement - Session management support
 * @property {string} timestamp - Response timestamp
 */
/**
 * Health check for Airtable service
 * @param {ServiceConfig} config - Service configuration
 * @returns {HealthResponse} Health status object
 */
export function healthCheck(config: ServiceConfig): HealthResponse;
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
};
export type HealthResponse = {
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
    };
    /**
     * - Service features
     */
    features: {
        multiTenant: boolean;
        credentialCaching: boolean;
        sessionManagement: boolean;
    };
    /**
     * - Response timestamp
     */
    timestamp: string;
};
//# sourceMappingURL=health.d.ts.map