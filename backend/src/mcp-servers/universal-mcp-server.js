import express from 'express';
import { createMCPRouter } from './routes/mcp-routes.js';
import {
	parseCredentials,
	validateServiceConfig,
	getEnvironmentVariables,
	setupGracefulShutdown,
	createHealthCheckHandler,
} from './utils/server-setup.js';

/**
 * Universal MCP Server - Main entry point
 * Supports multiple MCP types with a unified interface
 */

// Initialize Express app
const app = express();
app.use(express.json());

// Get environment variables
const { port, mcpId, userId, mcpType } = getEnvironmentVariables();

// Parse and validate credentials
const credentials = parseCredentials();

// Validate service configuration
const { serviceConfig, apiKey } = validateServiceConfig(mcpType, credentials);

// Create and mount MCP router
const mcpRouter = createMCPRouter(serviceConfig, mcpType, apiKey, port);
app.use(`/mcp/${mcpType}`, mcpRouter);

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
