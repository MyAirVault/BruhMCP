/**
 * Figma Variables API operations (Enterprise only)
 * Handles variable-related requests to Figma API
 */

const { makeAuthenticatedRequest } = require('./common.js');

/**
 * Handle Variables API specific errors
 * @param {Response} response - Fetch response object
 * @param {string} context - Context for error message
 */
async function handleVariablesApiError(response, context) {
	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error(`${context} not found or not accessible`);
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}
}

/**
 * Get local variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaLocalVariables(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/variables/local`, apiKey);
	await handleVariablesApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get published variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaPublishedVariables(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/variables/published`, apiKey);
	await handleVariablesApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Create variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to create
 * @returns {Promise<any>}
 */
async function postFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/variables`, apiKey, {
		method: 'POST',
		body: JSON.stringify(variableData),
	});

	await handleVariablesApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Update variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to update
 * @returns {Promise<any>}
 */
async function putFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/variables`, apiKey, {
		method: 'PUT',
		body: JSON.stringify(variableData),
	});

	await handleVariablesApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Delete variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data specifying what to delete
 * @returns {Promise<any>}
 */
async function deleteFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/variables`, apiKey, {
		method: 'DELETE',
		body: JSON.stringify(variableData),
	});

	await handleVariablesApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}
module.exports = {
	getFigmaLocalVariables,
	getFigmaPublishedVariables,
	postFigmaVariables,
	putFigmaVariables,
	deleteFigmaVariables
};