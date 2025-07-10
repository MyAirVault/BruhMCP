import fetch from 'node-fetch';

/**
 * Handle tool execution for MCP protocol
 * @param {Object} params - Tool execution parameters
 * @param {string} params.toolName - Name of the tool to execute
 * @param {Object} params.args - Tool arguments
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} Tool execution result
 */
export async function handleToolExecution({ toolName, args: _args = {}, mcpType, serviceConfig, apiKey }) {
	// Route tool calls to appropriate endpoints
	if (toolName === `get_${mcpType}_user_info`) {
		const userInfo = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
			headers: serviceConfig.authHeader(apiKey),
		});
		const data = await userInfo.json();
		return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
	}

	if (toolName === `list_${mcpType}_files`) {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.files) {
			const result = await serviceConfig.customHandlers.files(serviceConfig, apiKey);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
	}

	if (toolName === `list_${mcpType}_repositories`) {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.repos) {
			const result = await serviceConfig.customHandlers.repos(serviceConfig, apiKey);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
	}

	throw new Error(`Tool ${toolName} not found`);
}

/**
 * Generate tools list based on service configuration
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @returns {Array} List of available tools
 */
export function generateTools(serviceConfig, mcpType) {
	const tools = [];

	// Generate tools based on service configuration
	Object.keys(serviceConfig.endpoints).forEach(endpoint => {
		switch (endpoint) {
			case 'me':
				tools.push({
					name: `get_${mcpType}_user_info`,
					description: `Get current user information from ${serviceConfig.name}`,
					inputSchema: {
						type: 'object',
						properties: {},
						required: [],
					},
				});
				break;
			case 'files':
				tools.push({
					name: `list_${mcpType}_files`,
					description: `List files from ${serviceConfig.name}`,
					inputSchema: {
						type: 'object',
						properties: {},
						required: [],
					},
				});
				break;
			case 'repos':
				tools.push({
					name: `list_${mcpType}_repositories`,
					description: `List repositories from ${serviceConfig.name}`,
					inputSchema: {
						type: 'object',
						properties: {},
						required: [],
					},
				});
				break;
		}
	});

	return tools;
}
