/**
 * Health check endpoint for Figma MCP service
 */

/**
 * Health check handler
 * @param {{ name: string, displayName: string, port: number, version: string, authType: string }} config - Service configuration
 */
export function healthCheck(config) {
	return {
		service: config.name,
		displayName: config.displayName,
		status: 'healthy',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		port: config.port,
		version: config.version,
		authType: config.authType,
	};
}
