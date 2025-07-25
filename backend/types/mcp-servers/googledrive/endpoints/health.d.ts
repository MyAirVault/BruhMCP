/**
 * Google Drive service health check endpoint
 * Returns service status and configuration
 */
/**
 * Health check for Google Drive service
 * @param {Object} config - Service configuration
 * @param {string} config.name - Service name
 * @param {string} config.displayName - Service display name
 * @param {string} config.version - Service version
 * @param {number} config.port - Service port
 * @param {string} config.authType - Authentication type
 * @param {string} config.description - Service description
 * @returns {Object} Health status object
 */
export function healthCheck(config: {
    name: string;
    displayName: string;
    version: string;
    port: number;
    authType: string;
    description: string;
}): Object;
//# sourceMappingURL=health.d.ts.map