/**
 * Figma Images API operations
 * Handles image and rendering-related requests to Figma API
 */

import { makeAuthenticatedRequest, handleApiError } from './common.js';

/**
 * Get rendered images from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to render
 * @param {string} [format='png'] - Image format (png, jpg, svg, pdf)
 * @param {number} [scale=1] - Image scale factor
 * @returns {Promise<any>}
 */
export async function getFigmaImages(fileKey, apiKey, nodeIds, format = 'png', scale = 1) {
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
	const params = new URLSearchParams({
		ids,
		format,
		scale: scale.toString(),
	});

	const response = await makeAuthenticatedRequest(`/images/${fileKey}?${params}`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Get image fills from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaImageFills(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/images`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}