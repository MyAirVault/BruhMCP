/**
 * Notion service health check endpoint
 * Returns service status and configuration
 */
/**
 * Health check for Notion service
 * @param {{name: string, displayName: string, version: string, port: number, authType: string, description: string}} config - Service configuration
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
export { healthCheck as getHealthStatus };
//# sourceMappingURL=health.d.ts.map