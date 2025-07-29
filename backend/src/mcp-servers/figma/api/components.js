/**
 * Figma Components and Styles API operations
 * Handles component and style-related requests to Figma API
 */

const { makeAuthenticatedRequest, handleApiError } = require('./common.js');

/**
 * Get published components from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaComponents(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/components`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get published styles from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaStyles(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/styles`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get component sets from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaComponentSets(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/component_sets`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get individual component information
 * @param {string} componentKey - Component key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaComponentInfo(componentKey, apiKey) {
	if (!componentKey) {
		throw new Error('Component key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/components/${componentKey}`, apiKey);
	await handleApiError(response, 'Component');

	const data = await response.json();
	return data;
}

/**
 * Get component set information
 * @param {string} componentSetKey - Component set key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaComponentSetInfo(componentSetKey, apiKey) {
	if (!componentSetKey) {
		throw new Error('Component set key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/component_sets/${componentSetKey}`, apiKey);
	await handleApiError(response, 'Component set');

	const data = await response.json();
	return data;
}
module.exports = {
	getFigmaComponents,
	getFigmaStyles,
	getFigmaComponentSets,
	getFigmaComponentInfo,
	getFigmaComponentSetInfo
};