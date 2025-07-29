/**
 * Figma User API operations
 * Handles user-related requests to Figma API
 */

const { makeAuthenticatedRequest, handleApiError } = require('./common.js');

/**
 * Get user information
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaUser(apiKey) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest('/me', apiKey);
	await handleApiError(response, 'User');

	const data = await response.json();
	return data;
}
module.exports = {
	getFigmaUser
};