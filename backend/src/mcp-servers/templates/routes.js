import express from 'express';
import { handleToolExecution, generateTools } from './handlers/tool-handlers.js';
import { handleResourceContent, generateResources } from './handlers/resource-handlers.js';
import { handleGenericEndpoint, handleParameterizedEndpoint, handleUserInfo } from './handlers/endpoint-handlers.js';
import { MCPJsonRpcHandler } from './handlers/jsonrpc-handler.js';

/**
 * Create MCP router with all protocol endpoints
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @param {string} apiKey - API key for authentication
 * @param {number} port - Server port
 * @returns {express.Router} Configured MCP router
 */
export function createMCPRouter(serviceConfig, mcpType, apiKey, port) {
	const mcpRouter = express.Router();

	// Initialize JSON-RPC handler for MCP protocol
	const jsonRpcHandler = new MCPJsonRpcHandler(serviceConfig, mcpType, apiKey, port);

	// MCP JSON-RPC 2.0 Protocol: Main message handling endpoint
	mcpRouter.post('/', async (req, res) => {
		try {
			console.log(`🔌 JSON-RPC message received for ${serviceConfig.name} (Port: ${port})`, req.body);

			const response = await jsonRpcHandler.processMessage(req.body);

			if (response) {
				res.json(response);
			} else {
				// Notification (no response required)
				res.status(204).send();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`❌ JSON-RPC processing error: ${errorMessage}`);
			res.status(500).json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	// MCP JSON-RPC 2.0 Protocol: Alternative message endpoint
	mcpRouter.post('/message', async (req, res) => {
		try {
			console.log(`🔌 JSON-RPC message received at /message for ${serviceConfig.name} (Port: ${port})`, req.body);

			const response = await jsonRpcHandler.processMessage(req.body);

			if (response) {
				res.json(response);
			} else {
				// Notification (no response required)
				res.status(204).send();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`❌ JSON-RPC processing error at /message: ${errorMessage}`);
			res.status(500).json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	// MCP Protocol: Server info and capabilities discovery
	mcpRouter.get('/info', (req, res) => {
		console.log(`📋 Info request for ${serviceConfig.name} MCP Server (Port: ${port})`);
		res.json({
			name: `${serviceConfig.name} MCP Server`,
			version: '1.0.0',
			description: `Model Context Protocol server for ${serviceConfig.name} API integration`,
			author: 'MiniMCP System',
			license: 'MIT',
			homepage: `http://localhost:${port}`,
			repository: {
				type: 'mcp-server',
				service: mcpType,
			},
		});
	});

	// MCP Protocol: List all available tools (actions)
	mcpRouter.get('/tools', (req, res) => {
		const tools = generateTools(serviceConfig, mcpType);
		res.json({ tools });
	});

	// MCP Protocol: List all available resources (data sources)
	mcpRouter.get('/resources', (req, res) => {
		const resources = generateResources(serviceConfig, mcpType);
		res.json({ resources });
	});

	// MCP Protocol: Execute tools
	mcpRouter.post('/tools/:toolName', async (req, res) => {
		try {
			const { toolName } = req.params;
			const { arguments: args = {} } = req.body;

			console.log(`🔧 Tool execution: ${toolName} for ${serviceConfig.name} (Port: ${port})`);

			const result = await handleToolExecution({
				toolName,
				args,
				mcpType,
				serviceConfig,
				apiKey,
			});

			res.json(result);
		} catch (error) {
			const { toolName } = req.params;
			console.error(`❌ Tool execution failed: ${toolName} - ${error.message}`);
			res.status(500).json({ error: error.message });
		}
	});

	// MCP Protocol: Get resource content
	mcpRouter.get('/resources/*', async (req, res) => {
		try {
			const resourcePath = req.params[0];

			const result = await handleResourceContent({
				resourcePath,
				mcpType,
				serviceConfig,
				apiKey,
			});

			res.json(result);
		} catch (error) {
			if (error.message.includes('not found')) {
				res.status(404).json({ error: error.message });
			} else {
				res.status(500).json({ error: error.message });
			}
		}
	});

	// User info endpoint
	mcpRouter.get('/me', async (req, res) => {
		try {
			const data = await handleUserInfo({ serviceConfig, apiKey });
			res.json(data);
		} catch (error) {
			console.error('Error fetching user info:', error);
			res.status(500).json({ error: 'Failed to fetch user info: ' + error.message });
		}
	});

	// Generic endpoint handler
	mcpRouter.get('/:endpoint', async (req, res) => {
		try {
			const { endpoint } = req.params;

			const data = await handleGenericEndpoint({
				endpoint,
				serviceConfig,
				apiKey,
			});

			res.json(data);
		} catch (error) {
			if (error.message.includes('not supported')) {
				res.status(404).json({
					error: error.message,
					available_endpoints: Object.keys(serviceConfig.endpoints),
				});
			} else {
				console.error(`Error fetching ${req.params.endpoint}:`, error);
				res.status(500).json({ error: `Failed to fetch ${req.params.endpoint}: ` + error.message });
			}
		}
	});

	// Parameterized endpoints (e.g., /files/filekey, /repos/owner/repo)
	mcpRouter.get('/:endpoint/*', async (req, res) => {
		try {
			const { endpoint } = req.params;
			const pathParams = req.params[0].split('/');

			const data = await handleParameterizedEndpoint({
				endpoint,
				pathParams,
				mcpType,
				serviceConfig,
				apiKey,
			});

			res.json(data);
		} catch (error) {
			if (error.message.includes('not supported') || error.message.includes('Invalid parameters')) {
				res.status(400).json({
					error: error.message,
					service: serviceConfig.name,
				});
			} else {
				console.error(`Error fetching ${req.params.endpoint}:`, error);
				res.status(500).json({ error: `Failed to fetch ${req.params.endpoint}: ` + error.message });
			}
		}
	});

	return mcpRouter;
}
