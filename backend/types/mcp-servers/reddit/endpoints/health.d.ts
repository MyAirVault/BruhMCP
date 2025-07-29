/**
 * Reddit service health check endpoint
 * Returns service status and configuration
 */
/**
 * Health check for Reddit service
 * @param {{name: string, displayName: string, version: string, port: number, authType: string, description: string}} config - Service configuration
 * @returns {{service: string, displayName: string, status: string, version: string, port: number, authType: string, description: string, endpoints: Object, features: Object, timestamp: string}} Health status object
 */
export function healthCheck(config: {
    name: string;
    displayName: string;
    version: string;
    port: number;
    authType: string;
    description: string;
}): {
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
//# sourceMappingURL=health.d.ts.map