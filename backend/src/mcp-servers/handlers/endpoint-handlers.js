import fetch from 'node-fetch';

/**
 * Handle generic endpoint requests
 * @param {Object} params - Endpoint request parameters
 * @param {string} params.endpoint - Endpoint name
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} API response data
 */
export async function handleGenericEndpoint({ endpoint, serviceConfig, apiKey }) {
	// Check if there's a custom handler
	if (serviceConfig.customHandlers && serviceConfig.customHandlers[endpoint]) {
		const result = await serviceConfig.customHandlers[endpoint](serviceConfig, apiKey);
		return result;
	}

	// Check if endpoint exists in configuration
	if (!serviceConfig.endpoints[endpoint]) {
		throw new Error(`Endpoint '${endpoint}' not supported for ${serviceConfig.name}`);
	}

	// Determine base URL
	const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;

	// Create headers object
	const headers = {};
	if (serviceConfig.auth?.header) {
		headers[serviceConfig.auth.header] = apiKey;
	} else {
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

	// Make API call
	const endpointPath = serviceConfig.endpoints[endpoint];
	const url = `${baseURL}${endpointPath}`;
	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Handle parameterized endpoint requests
 * @param {Object} params - Parameterized endpoint request parameters
 * @param {string} params.endpoint - Endpoint name
 * @param {Array} params.pathParams - Path parameters
 * @param {string} params.mcpType - MCP type
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} API response data
 */
export async function handleParameterizedEndpoint({ endpoint, pathParams, mcpType, serviceConfig, apiKey }) {
	let endpointPath;
	let url;

	// Determine base URL
	const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;

	// Create headers object
	const headers = {};
	if (serviceConfig.auth?.header) {
		headers[serviceConfig.auth.header] = apiKey;
	} else {
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

	switch (endpoint) {
		case 'files':
			if (mcpType === 'figma') {
				const fileKey = pathParams[0];
				if (pathParams[1] === 'comments') {
					endpointPath = serviceConfig.endpoints.fileComments(fileKey);
				} else {
					endpointPath = serviceConfig.endpoints.fileDetails(fileKey);
				}
				url = `${baseURL}${endpointPath}`;
			}
			break;
		case 'repos':
			if (mcpType === 'github' && pathParams.length >= 2) {
				const [owner, repo, ...rest] = pathParams;
				if (rest.length === 0) {
					endpointPath = serviceConfig.endpoints.repoDetails(owner, repo);
				} else if (rest[0] === 'issues') {
					endpointPath = serviceConfig.endpoints.repoIssues(owner, repo);
				} else if (rest[0] === 'pulls') {
					endpointPath = serviceConfig.endpoints.repoPulls(owner, repo);
				}
				url = `${baseURL}${endpointPath}`;
			}
			break;
		case 'teams':
			if (mcpType === 'figma' && pathParams.length >= 1) {
				const teamId = pathParams[0];
				if (pathParams[1] === 'projects') {
					endpointPath = serviceConfig.endpoints.teamProjects(teamId);
				}
				url = `${baseURL}${endpointPath}`;
			}
			break;
		default:
			throw new Error(`Parameterized endpoint '${endpoint}' not supported`);
	}

	if (!url) {
		throw new Error(`Invalid parameters for ${endpoint} endpoint`);
	}

	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Handle user info endpoint requests
 * @param {Object} params - User info request parameters
 * @param {Object} params.serviceConfig - Service configuration
 * @param {string} params.apiKey - API key for authentication
 * @returns {Promise<Object>} User info data
 */
export async function handleUserInfo({ serviceConfig, apiKey }) {
	// Determine base URL
	const baseURL = serviceConfig.api?.baseURL || serviceConfig.baseURL;

	// Create headers object
	const headers = {};
	if (serviceConfig.auth?.header) {
		headers[serviceConfig.auth.header] = apiKey;
	} else {
		headers['Authorization'] = `Bearer ${apiKey}`;
	}

	const response = await fetch(`${baseURL}${serviceConfig.endpoints.me}`, { headers });

	if (!response.ok) {
		throw new Error(`${serviceConfig.name} API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}
