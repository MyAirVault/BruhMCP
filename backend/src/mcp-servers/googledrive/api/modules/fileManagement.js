/**
 * Google Drive File Management Operations Module
 * Handles file/folder creation, deletion, copying, and moving
 */

import { formatFileResponse } from '../../utils/googledriveFormatting.js';
import { validateFileId, validateFileName } from '../../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
	const url = `${DRIVE_API_BASE}${endpoint}`;

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	if (options.body && typeof options.body === 'object' && !options.raw) {
		requestOptions.body = JSON.stringify(options.body);
	}

	try {
		const response = await fetch(url, requestOptions);

		if (!response.ok) {
			const errorData = await response.text();
			let errorMessage = `Drive API error: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorData);
				if (errorJson.error && errorJson.error.message) {
					errorMessage = `Drive API error: ${errorJson.error.message}`;
				}
			} catch {
				// Use default error message
			}

			throw new Error(errorMessage);
		}

		// DELETE operations may return empty response
		if (response.status === 204) {
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Failed to access Google Drive API: ${error.message}`);
	}
}

/**
 * Create a folder in Google Drive
 * @param {Object} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created folder info
 */
export async function createFolder(args, bearerToken) {
	const { folderName, parentFolderId } = args;

	if (!folderName) {
		throw new Error('Folder name is required');
	}

	try {
		validateFileName(folderName);
	} catch (error) {
		throw new Error(`Invalid folder name: ${error.message}`);
	}

	const metadata = {
		name: folderName,
		mimeType: 'application/vnd.google-apps.folder',
	};

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error.message}`);
		}
		metadata.parents = [parentFolderId];
	}

	const endpoint = '/files';
	const data = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata,
	});

	return formatFileResponse(data);
}

/**
 * Delete a file or folder from Google Drive
 * @param {Object} args - Deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Deletion result
 */
export async function deleteFile(args, bearerToken) {
	const { fileId, permanent = false } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	if (permanent) {
		// Permanently delete the file
		const endpoint = `/files/${fileId}`;
		await makeDriveRequest(endpoint, bearerToken, {
			method: 'DELETE',
		});

		return {
			success: true,
			fileId,
			message: 'File permanently deleted',
			action: 'deleted',
		};
	} else {
		// Move to trash
		const endpoint = `/files/${fileId}`;
		const data = await makeDriveRequest(endpoint, bearerToken, {
			method: 'PATCH',
			body: { trashed: true },
		});

		return {
			success: true,
			fileId,
			message: 'File moved to trash',
			action: 'trashed',
			file: formatFileResponse(data),
		};
	}
}

/**
 * Copy a file in Google Drive
 * @param {Object} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Copied file info
 */
export async function copyFile(args, bearerToken) {
	const { fileId, newName, destinationFolderId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const metadata = {};

	if (newName) {
		try {
			validateFileName(newName);
		} catch (error) {
			throw new Error(`Invalid new file name: ${error.message}`);
		}
		metadata.name = newName;
	}

	if (destinationFolderId) {
		try {
			validateFileId(destinationFolderId);
		} catch (error) {
			throw new Error(`Invalid destination folder ID: ${error.message}`);
		}
		metadata.parents = [destinationFolderId];
	}

	const endpoint = `/files/${fileId}/copy`;
	const data = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata,
	});

	return formatFileResponse(data);
}

/**
 * Move a file to a different folder in Google Drive
 * @param {Object} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Moved file info
 */
export async function moveFile(args, bearerToken) {
	const { fileId, destinationFolderId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!destinationFolderId) {
		throw new Error('Destination folder ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	try {
		validateFileId(destinationFolderId);
	} catch (error) {
		throw new Error(`Invalid destination folder ID: ${error.message}`);
	}

	// First, get the current parent(s)
	const fileMetadata = await makeDriveRequest(`/files/${fileId}?fields=parents`, bearerToken);
	const previousParents = fileMetadata.parents ? fileMetadata.parents.join(',') : '';

	// Move the file
	const endpoint = `/files/${fileId}`;
	const params = new URLSearchParams({
		addParents: destinationFolderId,
		removeParents: previousParents,
		fields: 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,shared',
	});

	const data = await makeDriveRequest(`${endpoint}?${params.toString()}`, bearerToken, {
		method: 'PATCH',
	});

	return formatFileResponse(data);
}