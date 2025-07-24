/**
 * Google Drive File Operations Module
 * Handles file upload, download, and basic file management
 */

import { formatFileResponse, formatUploadResponse } from '../../utils/googledriveFormatting.js';
import { validateFileId, validateFileName, validateMimeType, validateLocalPath } from '../../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

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

		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Failed to access Google Drive API: ${error.message}`);
	}
}

/**
 * Upload a file to Google Drive
 * @param {Object} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Upload result
 */
export async function uploadFile(args, bearerToken) {
	const { localPath, fileName, parentFolderId, mimeType } = args;

	// Validate input parameters
	if (!localPath) {
		throw new Error('Local path is required');
	}

	if (!fileName) {
		throw new Error('File name is required');
	}

	try {
		validateLocalPath(localPath);
	} catch (error) {
		throw new Error(`Invalid local path: ${error.message}`);
	}

	try {
		validateFileName(fileName);
	} catch (error) {
		throw new Error(`Invalid file name: ${error.message}`);
	}

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error.message}`);
		}
	}

	// Import fs and path modules
	const fs = await import('fs/promises');
	const path = await import('path');

	let fileContent;
	try {
		// Check if file exists and is readable
		try {
			await fs.access(localPath, fs.constants.F_OK | fs.constants.R_OK);
		} catch (accessError) {
			throw new Error(`File not found or not readable: ${localPath}`);
		}

		fileContent = await fs.readFile(localPath);
	} catch (error) {
		throw new Error(`Failed to read file: ${error.message}`);
	}

	// Detect MIME type if not provided
	const detectedMimeType = mimeType || detectMimeType(path.extname(localPath));

	// Prepare metadata
	const metadata = {
		name: fileName,
	};

	if (parentFolderId) {
		metadata.parents = [parentFolderId];
	}

	// Create multipart upload
	const boundary = 'foo_bar_baz';
	const delimiter = `\r\n--${boundary}\r\n`;
	const closeDelimiter = `\r\n--${boundary}--`;

	const metadataString = JSON.stringify(metadata);

	const multipartRequestBody = 
		delimiter +
		'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
		metadataString +
		delimiter +
		`Content-Type: ${detectedMimeType}\r\n\r\n`;

	// Combine metadata and file content
	const bodyBuffer = Buffer.concat([
		Buffer.from(multipartRequestBody),
		fileContent,
		Buffer.from(closeDelimiter),
	]);

	const url = `${UPLOAD_API_BASE}/files?uploadType=multipart`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				'Content-Type': `multipart/related; boundary=${boundary}`,
				'Content-Length': bodyBuffer.length.toString(),
			},
			body: bodyBuffer,
		});

		if (!response.ok) {
			const errorData = await response.text();
			let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorData);
				if (errorJson.error && errorJson.error.message) {
					errorMessage = `Upload failed: ${errorJson.error.message}`;
				}
			} catch {
				// Use default error message
			}

			throw new Error(errorMessage);
		}

		const fileData = await response.json();
		return formatUploadResponse(fileData);
	} catch (error) {
		throw new Error(`Failed to upload file: ${error.message}`);
	}
}

/**
 * Download a file from Google Drive
 * @param {Object} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Download result
 */
export async function downloadFile(args, bearerToken) {
	const { fileId, localPath } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!localPath) {
		throw new Error('Local path is required for download');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	try {
		validateLocalPath(localPath);
	} catch (error) {
		throw new Error(`Invalid local path: ${error.message}`);
	}

	// Import fs module
	const fs = await import('fs/promises');
	const path = await import('path');

	// Ensure directory exists
	const directory = path.dirname(localPath);
	try {
		await fs.mkdir(directory, { recursive: true });
	} catch (error) {
		throw new Error(`Failed to create directory: ${error.message}`);
	}

	// First, get file metadata to know its properties
	const metadata = await getFileMetadata({ fileId }, bearerToken);

	// Check if it's a Google Workspace file
	const isGoogleWorkspaceFile = metadata.mimeType.startsWith('application/vnd.google-apps.');

	let downloadUrl;
	if (isGoogleWorkspaceFile) {
		// For Google Workspace files, we need to export them
		const exportMimeType = getExportMimeType(metadata.mimeType);
		downloadUrl = `${DRIVE_API_BASE}/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
	} else {
		// For regular files, use the standard download endpoint
		downloadUrl = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;
	}

	try {
		const response = await fetch(downloadUrl, {
			headers: {
				Authorization: `Bearer ${bearerToken}`,
			},
		});

		if (!response.ok) {
			const errorData = await response.text();
			let errorMessage = `Download failed: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorData);
				if (errorJson.error && errorJson.error.message) {
					errorMessage = `Download failed: ${errorJson.error.message}`;
				}
			} catch {
				// Use default error message
			}

			throw new Error(errorMessage);
		}

		// Save the file
		const buffer = await response.arrayBuffer();
		await fs.writeFile(localPath, Buffer.from(buffer));

		return {
			success: true,
			fileId,
			localPath,
			fileName: metadata.name,
			mimeType: metadata.mimeType,
			size: buffer.byteLength,
			message: `File downloaded successfully to ${localPath}`,
		};
	} catch (error) {
		throw new Error(`Failed to download file: ${error.message}`);
	}
}

/**
 * Get file metadata
 * @param {Object} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File metadata
 */
export async function getFileMetadata(args, bearerToken) {
	const { fileId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const fields = 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink,owners,shared,permissions,trashed';
	const endpoint = `/files/${fileId}?fields=${fields}`;

	const data = await makeDriveRequest(endpoint, bearerToken);
	return formatFileResponse(data);
}

/**
 * Detect MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} MIME type
 */
function detectMimeType(extension) {
	const mimeTypes = {
		'.txt': 'text/plain',
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'application/javascript',
		'.json': 'application/json',
		'.pdf': 'application/pdf',
		'.doc': 'application/msword',
		'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'.xls': 'application/vnd.ms-excel',
		'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'.ppt': 'application/vnd.ms-powerpoint',
		'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
		'.zip': 'application/zip',
		'.tar': 'application/x-tar',
		'.gz': 'application/gzip',
	};

	return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Get export MIME type for Google Workspace files
 * @param {string} googleMimeType - Google Workspace MIME type
 * @returns {string} Export MIME type
 */
function getExportMimeType(googleMimeType) {
	const exportTypes = {
		'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'application/vnd.google-apps.drawing': 'image/png',
		'application/vnd.google-apps.script': 'application/vnd.google-apps.script+json',
	};

	return exportTypes[googleMimeType] || 'application/pdf';
}