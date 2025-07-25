/**
 * Reddit service health check endpoint
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
 * Health check for Reddit service
 * @param {ServiceConfig} config - Service configuration
 * @returns {{service: string, displayName: string, status: string, version: string, port: number, authType: string, description: string, endpoints: Object, features: Object, timestamp: string}} Health status object
 */
export function healthCheck(config: ServiceConfig): {
    service: string;
    displayName: string;
    status: string;
    version: string;
    port: number;
    authType: string;
    description: string;
    endpoints: Object;
    features: Object;
    timestamp: string;
};
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
//# sourceMappingURL=health.d.ts.map