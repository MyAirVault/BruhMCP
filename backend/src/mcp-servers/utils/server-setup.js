import serviceConfigs from '../config/service-configs.js';

/**
 * Parse and validate credentials from environment
 * @returns {Object} Parsed credentials object
 */
export function parseCredentials() {
	let credentials = {};
	try {
		credentials = JSON.parse(process.env.CREDENTIALS || '{}');
	} catch (error) {
		console.error('Failed to parse credentials:', error);
		process.exit(1);
	}
	return credentials;
}

/**
 * Validate service configuration and credentials
 * @param {string} mcpType - MCP type name
 * @param {Object} credentials - Parsed credentials
 * @returns {Object} Service configuration and API key
 */
export function validateServiceConfig(mcpType, credentials) {
	// Validate service type
	if (!mcpType || !serviceConfigs[mcpType]) {
		console.error(`Unsupported MCP type: ${mcpType}`);
		process.exit(1);
	}

	const serviceConfig = serviceConfigs[mcpType];
	const apiKey = credentials[serviceConfig.credentialField];

	if (!apiKey) {
		console.error(`No ${serviceConfig.credentialField} provided in credentials`);
		process.exit(1);
	}

	return { serviceConfig, apiKey };
}

/**
 * Get environment variables for server setup
 * @returns {Object} Environment variables
 */
export function getEnvironmentVariables() {
	const port = process.env.PORT || 3001;
	const mcpId = process.env.MCP_ID;
	const userId = process.env.USER_ID;
	const mcpType = process.env.MCP_TYPE;

	return { port, mcpId, userId, mcpType };
}

/**
 * Setup graceful shutdown handlers
 * @param {string} serviceName - Service name for logging
 */
export function setupGracefulShutdown(serviceName) {
	// Graceful shutdown
	process.on('SIGTERM', () => {
		console.log(`Received SIGTERM, shutting down ${serviceName} MCP server gracefully`);
		process.exit(0);
	});

	process.on('SIGINT', () => {
		console.log(`Received SIGINT, shutting down ${serviceName} MCP server`);
		process.exit(0);
	});
}

/**
 * Create health check endpoint handler
 * @param {Object} params - Health check parameters
 * @param {string} params.serviceName - Service name
 * @param {string} params.mcpId - MCP instance ID
 * @param {string} params.mcpType - MCP type
 * @param {string} params.userId - User ID
 * @param {string} params.apiKey - API key (for status check)
 * @returns {Function} Health check handler
 */
export function createHealthCheckHandler({ serviceName, mcpId, mcpType, userId, apiKey }) {
	return (req, res) => {
		res.json({
			status: 'healthy',
			service: serviceName,
			mcpId,
			mcpType,
			userId,
			timestamp: new Date().toISOString(),
			apiKeyConfigured: apiKey ? 'Yes' : 'No',
		});
	};
}
