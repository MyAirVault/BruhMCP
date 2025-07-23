/**
 * Figma Files API operations
 * Handles file-related requests to Figma API
 */

import { makeAuthenticatedRequest, handleApiError } from './common.js';

/**
 * Get file details from Figma API
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFile(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get file nodes by their IDs
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to fetch
 * @returns {Promise<any>}
 */
export async function getFigmaNodes(fileKey, apiKey, nodeIds) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!nodeIds || nodeIds.length === 0) {
		throw new Error('Node IDs are required');
	}

	const ids = nodeIds.join(',');
	const response = await makeAuthenticatedRequest(`/files/${fileKey}/nodes?ids=${ids}`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get file metadata
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFileMeta(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/meta`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get file versions
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFileVersions(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/versions`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get file at specific version
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} versionId - Version ID to retrieve
 * @returns {Promise<any>}
 */
export async function getFigmaFileWithVersion(fileKey, apiKey, versionId) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!versionId) {
		throw new Error('Version ID is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}?version=${versionId}`, apiKey);
	await handleApiError(response, 'Figma file or version');

	const data = await response.json();
	return data;
}