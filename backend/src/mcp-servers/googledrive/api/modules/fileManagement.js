/**
 * Google Drive File Management Operations Module
 * Handles file/folder creation, deletion, copying, and moving
 */

const { formatFileResponse  } = require('../../utils/googledriveFormatting');
const { validateFileId, validateFileName  } = require('../../utils/validation');

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method='GET'] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {Record<string, any>} [body] - Request body
 * @property {boolean} [raw] - Whether to send raw body
 */

/**
 * @typedef {Object} CreateFolderArgs
 * @property {string} folderName - Name of the folder to create
 * @property {string} [parentFolderId] - ID of parent folder
 */

/**
 * @typedef {Object} DeleteFileArgs
 * @property {string} fileId - ID of file to delete
 * @property {boolean} [permanent=false] - Whether to permanently delete
 */

/**
 * @typedef {Object} CopyFileArgs
 * @property {string} fileId - ID of file to copy
 * @property {string} [newName] - New name for copied file
 * @property {string} [destinationFolderId] - Destination folder ID
 */

/**
 * @typedef {Object} MoveFileArgs
 * @property {string} fileId - ID of file to move
 * @property {string} destinationFolderId - Destination folder ID
 */

/**
 * @typedef {Object} DriveFileMetadata
 * @property {string} name - File name
 * @property {string} mimeType - MIME type
 * @property {string[]} [parents] - Parent folder IDs
 */

/**
 * @typedef {Object} DriveApiResponse
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} mimeType - MIME type
 * @property {string} [size] - File size
 * @property {string} createdTime - Creation time
 * @property {string} modifiedTime - Modification time
 * @property {string[]} [parents] - Parent folder IDs
 * @property {string} webViewLink - Web view link
 * @property {Object[]} owners - File owners
 * @property {boolean} shared - Whether file is shared
 */

/**
 * @typedef {Object} FileOperationResult
 * @property {boolean} success - Operation success status
 * @property {string} fileId - File ID
 * @property {string} message - Result message
 * @property {string} action - Action performed
 * @property {Object} [file] - File details (for non-permanent delete)
 */

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} options - Request options
 * @returns {Promise<DriveApiResponse | null>} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
	const url = `${DRIVE_API_BASE}${endpoint}`;

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
	};

	if (options.body && typeof options.body === 'object' && !options.raw) {
		requestOptions.body = JSON.stringify(options.body);
	} else if (options.body) {
		requestOptions.body = String(options.body);
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
		return /** @type {DriveApiResponse} */ (data);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to access Google Drive API: ${errorMessage}`);
	}
}

/**
 * Create a folder in Google Drive
 * @param {CreateFolderArgs} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Created folder info
 */
async function createFolder(args, bearerToken) {
	const { folderName, parentFolderId } = args;

	if (!folderName) {
		throw new Error('Folder name is required');
	}

	try {
		validateFileName(folderName);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid folder name: ${errorMessage}`);
	}

	/** @type {DriveFileMetadata} */
	const metadata = {
		name: folderName,
		mimeType: 'application/vnd.google-apps.folder',
	};

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Invalid parent folder ID: ${errorMessage}`);
		}
		metadata.parents = [parentFolderId];
	}

	const endpoint = '/files';
	const data = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata,
	});

	if (!data) {
		throw new Error('Failed to create folder: No response data');
	}

	return formatFileResponse(data);
}

/**
 * Delete a file or folder from Google Drive
 * @param {DeleteFileArgs} args - Deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FileOperationResult>} Deletion result
 */
async function deleteFile(args, bearerToken) {
	const { fileId, permanent = false } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid file ID: ${errorMessage}`);
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

		if (!data) {
			throw new Error('Failed to move file to trash: No response data');
		}

		return {
			success: true,
			fileId,
			message: 'File moved to trash',
			action: 'trashed',
			file: formatFileResponse(data) || undefined,
		};
	}
}

/**
 * Copy a file in Google Drive
 * @param {CopyFileArgs} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Copied file info
 */
async function copyFile(args, bearerToken) {
	const { fileId, newName, destinationFolderId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid file ID: ${errorMessage}`);
	}

	/** @type {Partial<DriveFileMetadata>} */
	const metadata = {};

	if (newName) {
		try {
			validateFileName(newName);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid new file name: ${errorMessage}`);
		}
		metadata.name = newName;
	}

	if (destinationFolderId) {
		try {
			validateFileId(destinationFolderId);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid destination folder ID: ${errorMessage}`);
		}
		metadata.parents = [destinationFolderId];
	}

	const endpoint = `/files/${fileId}/copy`;
	const data = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata,
	});

	if (!data) {
		throw new Error('Failed to copy file: No response data');
	}

	return formatFileResponse(data);
}

/**
 * Move a file to a different folder in Google Drive
 * @param {MoveFileArgs} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../utils/googledriveFormatting.js').FormattedFile|null>} Moved file info
 */
async function moveFile(args, bearerToken) {
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid file ID: ${errorMessage}`);
	}

	try {
		validateFileId(destinationFolderId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid destination folder ID: ${errorMessage}`);
	}

	// First, get the current parent(s)
	const fileMetadata = await makeDriveRequest(`/files/${fileId}?fields=parents`, bearerToken);
	const previousParents = fileMetadata && fileMetadata.parents ? fileMetadata.parents.join(',') : '';

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

	if (!data) {
		throw new Error('Failed to move file: No response data');
	}

	return formatFileResponse(data);
}
module.exports = {
  createFolder,
  deleteFile,
  copyFile,
  moveFile
};