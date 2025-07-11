import fetch from 'node-fetch';

/**
 * Handle resource content retrieval for MCP protocol
 * @param {Object} params - Resource retrieval parameters
 * @param {string} params.resourcePath - Path to the resource
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} Resource content
 */
export async function handleResourceContent({ resourcePath, mcpType, serviceConfig, apiKey }) {
	// Handle different resource path formats
	let parsedPath = resourcePath;
	
	// If resourcePath starts with mcpType://, extract the path part
	if (resourcePath.startsWith(`${mcpType}://`)) {
		parsedPath = resourcePath.replace(`${mcpType}://`, '');
	}

	if (parsedPath === 'user/profile') {
		// Determine base URL
		const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;
		
		// Create headers object
		const headers = {};
		if (serviceConfig.auth?.header) {
			headers[serviceConfig.auth.header] = apiKey;
		} else {
			headers['Authorization'] = `Bearer ${apiKey}`;
		}
		
		const userInfo = await fetch(`${baseURL}${serviceConfig.endpoints.me}`, {
			headers,
		});
		
		if (!userInfo.ok) {
			throw new Error(`Failed to fetch user profile: ${userInfo.status} ${userInfo.statusText}`);
		}
		
		const data = await userInfo.json();
		return {
			contents: [
				{
					uri: `figma://user/profile`,
					mimeType: 'application/json',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	if (parsedPath === 'files/list') {
		if (serviceConfig.customHandlers && serviceConfig.customHandlers.files) {
			const result = await serviceConfig.customHandlers.files(serviceConfig, apiKey);
			return {
				contents: [
					{
						uri: `figma://files/list`,
						mimeType: 'application/json',
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		}
	}

	throw new Error(`Resource ${resourcePath} not found`);
}

/**
 * Generate resources list based on service configuration
 * @param {Object} serviceConfig - Service configuration
 * @param {string} mcpType - MCP type
 * @returns {Array} List of available resources
 */
export function generateResources(serviceConfig, mcpType) {
	const resources = [];

	// Generate resources based on service configuration
	Object.keys(serviceConfig.endpoints).forEach(endpoint => {
		switch (endpoint) {
			case 'me':
				resources.push({
					uri: `${mcpType}://user/profile`,
					name: `${serviceConfig.name} User Profile`,
					description: `Current user's ${serviceConfig.name} profile information`,
					mimeType: 'application/json',
				});
				break;
			case 'files':
				resources.push({
					uri: `${mcpType}://files/list`,
					name: `${serviceConfig.name} Files`,
					description: `List of files in ${serviceConfig.name}`,
					mimeType: 'application/json',
				});
				break;
			case 'repos':
				resources.push({
					uri: `${mcpType}://repositories/list`,
					name: `${serviceConfig.name} Repositories`,
					description: `List of repositories in ${serviceConfig.name}`,
					mimeType: 'application/json',
				});
				break;
		}
	});

	return resources;
}
