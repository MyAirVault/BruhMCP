/**
 * Slack file operations
 * Handles file uploading and info retrieval
 */

const { makeSlackRequest  } = require('./requestHandler');
const { formatFile  } = require('../../utils/slackFormatting');

/**
 * @typedef {Object} UploadFileArgs
 * @property {string} channels - Channel IDs to upload to
 * @property {string} content - File content
 * @property {string} filename - File name
 * @property {string} [title] - File title
 * @property {string} [filetype] - File type
 * @property {string} [initial_comment] - Initial comment
 */

/**
 * @typedef {Object} FileInfoArgs
 * @property {string} file - File ID
 */

/**
 * @typedef {import('../../middleware/types.js').SlackFile} SlackFile
 */

/**
 * @typedef {Object} SlackFileResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackFile} [file] - File object
 * @property {string} [error] - Error message
 */

/**
 * @typedef {import('../../utils/messageFormatting.js').FormattedFile} FormattedFile
 */

/**
 * @typedef {Object} FileUploadResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedFile|null} file - Formatted file object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Upload a file to Slack
 * @param {UploadFileArgs} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileUploadResult>} Upload result
 */
async function uploadFile(args, bearerToken) {
	const { channels, content, filename, title, filetype, initial_comment } = args;

	const formData = new FormData();
	formData.append('channels', channels);
	formData.append('content', content);
	formData.append('filename', filename);

	if (title) formData.append('title', title);
	if (filetype) formData.append('filetype', filetype);
	if (initial_comment) formData.append('initial_comment', initial_comment);

	/** @type {SlackFileResponse} */
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
 * @typedef {Object} FileInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedFile|null} file - Formatted file object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Get information about a file
 * @param {FileInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileInfoResult>} File info result
 */
async function getFileInfo(args, bearerToken) {
	const { file } = args;

	const params = new URLSearchParams({ file });
	/** @type {SlackFileResponse} */
	const response = await makeSlackRequest(`/files.info?${params}`, bearerToken);

	return {
		...response,
		file: response.file ? formatFile(response.file) : null,
		summary: `Retrieved info for file: ${response.file?.name || file}`,
	};
}
module.exports = {
  uploadFile,
  getFileInfo
};