/**
 * Common constants and types for Figma API modules
 */

const { axiosGet, axiosPost, axiosPut, axiosDelete } = require('../../../utils/axiosUtils.js');

const FIGMA_BASE_URL = 'https://api.figma.com/v1';

/**
 * @typedef {Object} CommentPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} CommentRequestBody
 * @property {string} message - Comment message
 * @property {Object} [client_meta] - Client metadata for position
 * @property {number} client_meta.x - X coordinate
 * @property {number} client_meta.y - Y coordinate
 */

/**
 * Handle common API response errors
 * @param {Response} response - Fetch response object
 * @param {string} context - Context for error message
 */
async function handleApiError(response, context) {
	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error(`${context} not found or not accessible`);
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions or feature not available');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}
}

/**
 * Make authenticated request to Figma API
 * @param {string} endpoint - API endpoint
 * @param {string} apiKey - User's Figma API key
 * @param {Object} [options] - Fetch options
 * @param {Object} [options.headers] - Additional headers
 * @param {string} [options.method] - HTTP method
 * @param {string} [options.body] - Request body
 * @returns {Promise<any>}
 */
async function makeAuthenticatedRequest(endpoint, apiKey, options = {}) {
	const url = endpoint.startsWith('http') ? endpoint : `${FIGMA_BASE_URL}${endpoint}`;
	
	/** @type {Record<string, string>} */
	const headers = {
		'X-Figma-Token': apiKey,
		'Content-Type': 'application/json',
	};

	// Add additional headers if provided
	if (options.headers) {
		Object.assign(headers, options.headers);
	}
	
	const method = options.method || 'GET';
	const axiosOptions = {
		...options,
		headers,
	};
	
	let response;
	switch (method.toUpperCase()) {
		case 'GET':
			response = await axiosGet(url, axiosOptions);
			break;
		case 'POST':
			response = await axiosPost(url, options.body ? JSON.parse(options.body) : null, axiosOptions);
			break;
		case 'PUT':
			response = await axiosPut(url, options.body ? JSON.parse(options.body) : null, axiosOptions);
			break;
		case 'DELETE':
			response = await axiosDelete(url, axiosOptions);
			break;
		default:
			response = await axiosGet(url, axiosOptions);
	}

	return response;
}
module.exports = {
	FIGMA_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest
};