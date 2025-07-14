/**
 * Health check endpoint for Figma MCP service
 */
/**
 * Health check handler
 * @param {{ name: string, displayName: string, port: number, version: string, authType: string }} config - Service configuration
 */
export function healthCheck(config: {
    name: string;
    displayName: string;
    port: number;
    version: string;
    authType: string;
}): {
    service: string;
    displayName: string;
    status: string;
    uptime: number;
    timestamp: string;
    port: number;
    version: string;
    authType: string;
};
//# sourceMappingURL=health.d.ts.map