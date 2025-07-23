/**
 * Figma Comments API operations
 * Handles comment-related requests to Figma API
 */

import { makeAuthenticatedRequest, handleApiError } from './common.js';

/**
 * Get comments from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComments(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/comments`, apiKey);
	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Post a comment to a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} message - Comment message
 * @param {import('./common.js').CommentPosition} [position] - Comment position with x, y coordinates
 * @returns {Promise<any>}
 */
export async function postFigmaComment(fileKey, apiKey, message, position) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!message) {
		throw new Error('Message is required');
	}

	/** @type {import('./common.js').CommentRequestBody} */
	const requestBody = {
		message,
	};

	if (position) {
		requestBody.client_meta = {
			x: position.x,
			y: position.y,
		};
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/comments`, apiKey, {
		method: 'POST',
		body: JSON.stringify(requestBody),
	});

	await handleApiError(response, 'Figma file');

	const data = await response.json();
	return data;
}

/**
 * Delete a comment from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} commentId - Comment ID to delete
 * @returns {Promise<any>}
 */
export async function deleteFigmaComment(fileKey, apiKey, commentId) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!commentId) {
		throw new Error('Comment ID is required');
	}

	const response = await makeAuthenticatedRequest(`/files/${fileKey}/comments/${commentId}`, apiKey, {
		method: 'DELETE',
	});

	await handleApiError(response, 'Comment');

	const data = await response.json();
	return data;
}