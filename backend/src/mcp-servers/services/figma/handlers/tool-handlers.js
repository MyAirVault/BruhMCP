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
	// Get service-defined tools from enhanced config
	const serviceTools = serviceConfig._enhanced?.tools || [];
	const serviceTool = serviceTools.find(tool => tool.name === toolName);
	
	if (serviceTool) {
		// Handle service-defined tools
		if (serviceTool.endpoint) {
			// Simple endpoint call
			const endpoint = serviceConfig.endpoints[serviceTool.endpoint];
			if (endpoint) {
				const response = await fetch(`${serviceConfig.baseURL}${endpoint}`, {
					headers: serviceConfig.authHeader(apiKey),
				});
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = await response.json();
				return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
			}
		} else if (serviceTool.handler) {
			// Custom handler call
			const handler = serviceConfig.customHandlers?.[serviceTool.handler];
			if (handler) {
				// Get original config for handler
				const originalConfig = serviceConfig._enhanced ? serviceConfig._original || serviceConfig._enhanced : serviceConfig;
				const result = await handler(originalConfig, apiKey, ...(serviceTool.parameters ? Object.values(_args) : []));
				return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
			}
		}
	}

	// Legacy tool handling for backward compatibility
	if (toolName === `get_${mcpType}_user_info` || toolName === 'get_user_info') {
		const userInfo = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
			headers: serviceConfig.authHeader(apiKey),
		});
		if (!userInfo.ok) {
			throw new Error(`API Error: ${userInfo.status} ${userInfo.statusText}`);
		}
		const data = await userInfo.json();
		return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
	}

	if (toolName === `list_${mcpType}_files` || toolName === 'list_files') {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.files) {
			const originalConfig = serviceConfig._enhanced ? serviceConfig._original || serviceConfig._enhanced : serviceConfig;
			const result = await serviceConfig.customHandlers.files(originalConfig, apiKey);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
	}

	if (toolName === `get_${mcpType}_team_projects` || toolName === 'get_team_projects') {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.teamProjects) {
			const { teamId } = _args;
			if (!teamId) {
				throw new Error('teamId is required for this operation');
			}
			const originalConfig = serviceConfig._enhanced ? serviceConfig._original || serviceConfig._enhanced : serviceConfig;
			const result = await serviceConfig.customHandlers.teamProjects(originalConfig, apiKey, teamId);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
	}

	if (toolName === `get_${mcpType}_file_details` || toolName === 'get_file_details') {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.fileDetails) {
			const { fileKey } = _args;
			if (!fileKey) {
				throw new Error('fileKey is required for this operation');
			}
			const originalConfig = serviceConfig._enhanced ? serviceConfig._original || serviceConfig._enhanced : serviceConfig;
			const result = await serviceConfig.customHandlers.fileDetails(originalConfig, apiKey, fileKey);
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
	// Use service-defined tools from enhanced config if available
	const serviceTools = serviceConfig._enhanced?.tools || [];
	
	if (serviceTools.length > 0) {
		// Convert service tools to MCP format
		return serviceTools.map(tool => ({
			name: tool.name,
			description: tool.description,
			inputSchema: {
				type: 'object',
				properties: tool.parameters || {},
				required: Object.keys(tool.parameters || {}).filter(key => 
					tool.parameters[key].required
				),
			},
		}));
	}

	// Fallback to generating tools from endpoints (legacy)
	const tools = [];

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

	// Add service-specific enhanced tools for legacy configs
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
