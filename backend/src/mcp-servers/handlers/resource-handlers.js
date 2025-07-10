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
	if (resourcePath === `${mcpType}/user/profile`) {
		const userInfo = await fetch(`${serviceConfig.baseURL}${serviceConfig.endpoints.me}`, {
			headers: serviceConfig.authHeader(apiKey),
		});
		const data = await userInfo.json();
		return {
			contents: [
				{
					uri: `${mcpType}://user/profile`,
					mimeType: 'application/json',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
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
