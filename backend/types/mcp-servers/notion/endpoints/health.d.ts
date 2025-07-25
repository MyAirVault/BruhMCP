/**
 * Notion service health check endpoint
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
 * Health check for Notion service
 * @param {ServiceConfig} config - Service configuration
 * @returns {Object} Health status object
 */
export function healthCheck(config: ServiceConfig): Object;
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