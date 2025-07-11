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

	// Enhanced Figma tools
	if (toolName === `get_${mcpType}_team_projects`) {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.teamProjects) {
			const { teamId } = _args;
			if (!teamId) {
				throw new Error('teamId is required for this operation');
			}
			const result = await serviceConfig.customHandlers.teamProjects(serviceConfig, apiKey, teamId);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
	}

	if (toolName === `get_${mcpType}_file_details`) {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.fileDetails) {
			const { fileKey } = _args;
			if (!fileKey) {
				throw new Error('fileKey is required for this operation');
			}
			const result = await serviceConfig.customHandlers.fileDetails(serviceConfig, apiKey, fileKey);
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

	// Add service-specific enhanced tools
	if (mcpType === 'figma' && serviceConfig.customHandlers) {
		if (serviceConfig.customHandlers.teamProjects) {
			tools.push({
				name: `get_${mcpType}_team_projects`,
				description: `Get projects for a specific team from ${serviceConfig.name}`,
				inputSchema: {
					type: 'object',
					properties: {
						teamId: {
							type: 'string',
							description: 'The team ID to get projects for'
						}
					},
					required: ['teamId'],
				},
			});
		}

		if (serviceConfig.customHandlers.fileDetails) {
			tools.push({
				name: `get_${mcpType}_file_details`,
				description: `Get detailed information about a specific file from ${serviceConfig.name}`,
				inputSchema: {
					type: 'object',
					properties: {
						fileKey: {
							type: 'string',
							description: 'The file key to get details for'
						}
					},
					required: ['fileKey'],
				},
			});
		}
	}

	return tools;
}
