import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
	parseCredentials,
	validateServiceConfig,
	getEnvironmentVariables,
	setupGracefulShutdown,
	createHealthCheckHandler,
} from './utils/server-setup.js';
// Note: MCP access control is handled at the main router level
// Individual MCP processes don't need access control as they are isolated by design

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Import service-specific routes
 * @param {string} mcpType - MCP type/service name
 * @returns {Function} createMCPRouter function
 */
async function importServiceRoutes(mcpType) {
	try {
		const servicePath = join(__dirname, 'services', mcpType, 'routes.js');
		const serviceModule = await import(`file://${servicePath}`);
		console.log(`✅ Loaded service-specific routes for ${mcpType}`);
		return serviceModule.createMCPRouter;
	} catch (error) {
		console.error(`❌ Failed to load routes for service ${mcpType}:`, error.message);
		console.error(`Expected route file: ${join(__dirname, 'services', mcpType, 'routes.js')}`);
		throw new Error(`Service ${mcpType} is missing required routes.js file`);
	}
}

/**
 * Universal MCP Server - Main entry point
 * Supports multiple MCP types with a unified interface
 */
async function startServer() {
	// Initialize Express app
	const app = express();
	app.use(express.json());

	// Get environment variables
	const { port, mcpId, userId, mcpType } = getEnvironmentVariables();

	// Parse and validate credentials
	const credentials = parseCredentials();

	// Validate service configuration
	const { serviceConfig, apiKey } = await validateServiceConfig(mcpType, credentials);

	// Dynamically import service-specific routes
	const createMCPRouter = await importServiceRoutes(mcpType);

	// Create and mount MCP router with instance isolation
	const mcpRouter = createMCPRouter(serviceConfig, mcpType, apiKey, port);
	app.use(`/${mcpId}/mcp/${mcpType}`, mcpRouter);

	// Health check endpoint
	const healthCheckHandler = createHealthCheckHandler({
		serviceName: serviceConfig.name,
		mcpId,
		mcpType,
		userId,
		apiKey,
	});
	app.get('/health', healthCheckHandler);

	// Start server
	app.listen(port, () => {
		console.log(`${serviceConfig.name} MCP server running on port ${port}`);
		console.log(`MCP ID: ${mcpId}`);
		console.log(`User ID: ${userId}`);
		console.log(`Service: ${serviceConfig.name}`);
		console.log(`API Key configured: ${apiKey ? 'Yes' : 'No'}`);
	});

	// Setup graceful shutdown
	setupGracefulShutdown(serviceConfig.name);
}

// Start the server
startServer().catch(error => {
	console.error('❌ Failed to start MCP server:', error);
	process.exit(1);
});
