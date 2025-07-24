/**
 * Slack file operations
 * Handles file uploading and info retrieval
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatFile } from '../../utils/slackFormatting.js';

/**
 * Upload a file to Slack
 * @param {Object} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFile(args, bearerToken) {
	const { channels, content, filename, title, filetype, initial_comment } = args;

	const formData = new FormData();
	formData.append('channels', channels);
	formData.append('content', content);
	formData.append('filename', filename);

	if (title) formData.append('title', title);
	if (filetype) formData.append('filetype', filetype);
	if (initial_comment) formData.append('initial_comment', initial_comment);

	const response = await makeSlackRequest('/files.upload', bearerToken, {
		method: 'POST',
		formData,
	});

	return {
		...response,
		file: response.file ? formatFile(response.file) : null,
		summary: `Uploaded file: ${filename} to ${channels}`,
	};
}

/**
 * Get information about a file
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} File info result
 */
export async function getFileInfo(args, bearerToken) {
	const { file } = args;

	const params = new URLSearchParams({ file });
	const response = await makeSlackRequest(`/files.info?${params}`, bearerToken);

	return {
		...response,
		file: response.file ? formatFile(response.file) : null,
		summary: `Retrieved info for file: ${response.file?.name || file}`,
	};
}