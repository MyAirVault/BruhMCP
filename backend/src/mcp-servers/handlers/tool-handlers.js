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
export async function handleToolExecution({ toolName, args = {}, mcpType, serviceConfig, apiKey }) {
	// Determine base URL
	const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;

	// Create headers object
	const headers = {};
	if (serviceConfig.auth?.header) {
		headers[serviceConfig.auth.header] = apiKey;
	} else {
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

	// Handle tools defined in service configuration
	if (serviceConfig.tools) {
		for (const tool of serviceConfig.tools) {
			if (tool.name === toolName) {
				// Use custom handler if available
				if (tool.handler && serviceConfig.customHandlers?.[tool.handler]) {
					const result = await serviceConfig.customHandlers[tool.handler](serviceConfig, apiKey, args);
					return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
				}

				// Use endpoint if available
				if (tool.endpoint && serviceConfig.endpoints?.[tool.endpoint]) {
					const endpoint = serviceConfig.endpoints[tool.endpoint];
					const response = await fetch(`${baseURL}${endpoint}`, { headers });

					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}

					const data = await response.json();
					return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
				}
			}
		}
	}

	// Legacy tool naming patterns for backward compatibility
	if (toolName === `get_user_info` || toolName === `get_${mcpType}_user_info`) {
		if (serviceConfig.endpoints?.me) {
			const response = await fetch(`${baseURL}${serviceConfig.endpoints.me}`, { headers });

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		}
	}

	if (toolName === `list_files` || toolName === `list_${mcpType}_files`) {
		if (serviceConfig.customHandlers?.files) {
			const result = await serviceConfig.customHandlers.files(serviceConfig, apiKey);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}

		if (serviceConfig.endpoints?.files) {
			const response = await fetch(`${baseURL}${serviceConfig.endpoints.files}`, { headers });

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		}
	}

	if (toolName === `get_team_projects`) {
		if (args.teamId && serviceConfig.customHandlers?.teamProjects) {
			const result = await serviceConfig.customHandlers.teamProjects(serviceConfig, apiKey, args.teamId);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
		throw new Error('Team ID is required for get_team_projects tool');
	}

	if (toolName === `get_file_details`) {
		if (args.fileKey && serviceConfig.customHandlers?.fileDetails) {
			const result = await serviceConfig.customHandlers.fileDetails(serviceConfig, apiKey, args.fileKey);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		}
		throw new Error('File key is required for get_file_details tool');
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

	// Use tools from service configuration if available
	if (serviceConfig.tools) {
		return serviceConfig.tools.map(tool => ({
			name: tool.name,
			description: tool.description,
			inputSchema: {
				type: 'object',
				properties: tool.parameters || {},
				required: Object.keys(tool.parameters || {}).filter(key => tool.parameters[key].required === true),
			},
		}));
	}

	// Legacy tool generation for backward compatibility
	Object.keys(serviceConfig.endpoints || {}).forEach(endpoint => {
		switch (endpoint) {
			case 'me':
				tools.push({
					name: 'get_user_info',
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
					name: 'list_files',
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
					name: 'list_repositories',
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
