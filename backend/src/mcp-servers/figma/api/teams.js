/**
 * Figma Teams and Projects API operations
 * Handles team and project-related requests to Figma API
 */

const { makeAuthenticatedRequest, handleApiError } = require('./common.js');

/**
 * Get team projects
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaTeamProjects(teamId, apiKey) {
	if (!teamId) {
		throw new Error('Team ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/teams/${teamId}/projects`, apiKey);
	await handleApiError(response, 'Team');

	const data = await response.json();
	return data;
}

/**
 * Get project files
 * @param {string} projectId - Project ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaProjectFiles(projectId, apiKey) {
	if (!projectId) {
		throw new Error('Project ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/projects/${projectId}/files`, apiKey);
	await handleApiError(response, 'Project');

	const data = await response.json();
	return data;
}

/**
 * Get team components
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
async function getFigmaTeamComponents(teamId, apiKey) {
	if (!teamId) {
		throw new Error('Team ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/teams/${teamId}/components`, apiKey);
	await handleApiError(response, 'Team');

	const data = await response.json();
	return data;
}
module.exports = {
	getFigmaTeamProjects,
	getFigmaProjectFiles,
	getFigmaTeamComponents
};