/**
 * Google Drive API Integration
 * Core Google Drive API operations using OAuth Bearer tokens
 */

import { formatFileResponse, formatFileListResponse, formatUploadResponse, formatDriveInfoResponse } from '../utils/googledrive-formatting.js';
import { validateFileId, validateFileName, validateMimeType, validateEmailAddress, validateDomainName, validateLocalPath, validatePermissionType, validatePermissionRole } from '../utils/validation.js';

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

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Google Drive API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Google Drive API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Google Drive API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	
	// Validate response data
	if (!data || (typeof data !== 'object' && typeof data !== 'string')) {
		throw new Error('Invalid response data from Google Drive API');
	}
	
	console.log(`✅ Google Drive API Response: ${response.status}`);

	return data;
}

/**
 * Make authenticated upload request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeUploadRequest(endpoint, bearerToken, options = {}) {
	const url = `${UPLOAD_API_BASE}${endpoint}`;

	const requestOptions = {
		method: options.method || 'POST',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			...options.headers,
		},
		...options,
	};

	console.log(`📡 Google Drive Upload Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Google Drive Upload API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Google Drive Upload API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	
	// Validate response data
	if (!data || (typeof data !== 'object' && typeof data !== 'string')) {
		throw new Error('Invalid response data from Google Drive Upload API');
	}
	
	console.log(`✅ Google Drive Upload Response: ${response.status}`);

	return data;
}

/**
 * List files and folders in Google Drive
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Files list result
 */
export async function listFiles(args, bearerToken) {
	const { query = '', maxResults = 10, orderBy = 'modifiedTime', folderId, includeItemsFromAllDrives = false } = args;

	// Validate input parameters
	if (maxResults < 1 || maxResults > 1000) {
		throw new Error('maxResults must be between 1 and 1000');
	}

	if (folderId) {
		try {
			validateFileId(folderId);
		} catch (error) {
			throw new Error(`Invalid folder ID: ${error.message}`);
		}
	}

	// Build search query
	let searchQuery = query;
	if (folderId) {
		searchQuery = searchQuery ? `${searchQuery} and '${folderId}' in parents` : `'${folderId}' in parents`;
	}

	const params = new URLSearchParams();
	if (searchQuery) {
		params.append('q', searchQuery);
	}
	params.append('pageSize', maxResults.toString());
	params.append('orderBy', orderBy);
	params.append('includeItemsFromAllDrives', includeItemsFromAllDrives.toString());
	params.append('supportsAllDrives', 'true');
	params.append('fields', 'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, permissions, shared, starred, trashed)');

	const endpoint = `/files?${params.toString()}`;
	const result = await makeDriveRequest(endpoint, bearerToken);

	return formatFileListResponse(result);
}

/**
 * Get metadata for a specific file or folder
 * @param {Object} args - File metadata arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File metadata result
 */
export async function getFileMetadata(args, bearerToken) {
	const { fileId, fields = 'id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink,permissions,shared,starred,trashed' } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const params = new URLSearchParams();
	params.append('fields', fields);
	params.append('supportsAllDrives', 'true');

	const endpoint = `/files/${fileId}?${params.toString()}`;
	const result = await makeDriveRequest(endpoint, bearerToken);

	return formatFileResponse(result);
}

/**
 * Download a file from Google Drive
 * @param {Object} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Download result
 */
export async function downloadFile(args, bearerToken) {
	const { fileId, localPath, exportFormat } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!localPath) {
		throw new Error('Local path is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	// Validate local path
	try {
		validateLocalPath(localPath);
	} catch (error) {
		throw new Error(`Invalid local path: ${error.message}`);
	}

	let endpoint;
	if (exportFormat) {
		endpoint = `/files/${fileId}/export?mimeType=${encodeURIComponent(exportFormat)}`;
	} else {
		endpoint = `/files/${fileId}?alt=media`;
	}

	const url = `${DRIVE_API_BASE}${endpoint}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${bearerToken}`
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to download file: ${errorText}`);
	}

	// Import fs and path modules
	const fs = await import('fs/promises');
	const path = await import('path');

	try {
		// Validate response has content
		if (!response.body) {
			throw new Error('Empty response body from Google Drive API');
		}

		// Create directory if it doesn't exist
		const dirPath = path.dirname(localPath);
		try {
			await fs.mkdir(dirPath, { recursive: true });
		} catch (dirError) {
			throw new Error(`Failed to create directory ${dirPath}: ${dirError.message}`);
		}

		// Get file content
		let arrayBuffer;
		try {
			arrayBuffer = await response.arrayBuffer();
		} catch (bufferError) {
			throw new Error(`Failed to read response content: ${bufferError.message}`);
		}

		if (!arrayBuffer || arrayBuffer.byteLength === 0) {
			throw new Error('Empty file content received from Google Drive API');
		}

		// Write file
		try {
			await fs.writeFile(localPath, Buffer.from(arrayBuffer));
		} catch (writeError) {
			throw new Error(`Failed to write file to ${localPath}: ${writeError.message}`);
		}

		console.log(`✅ File downloaded successfully to: ${localPath}`);

		return {
			success: true,
			localPath,
			message: `File downloaded successfully to: ${localPath}`,
			fileId,
			exportFormat: exportFormat || null
		};
	} catch (error) {
		// Clean up partial file if it exists
		try {
			await fs.unlink(localPath);
		} catch (unlinkError) {
			// Ignore cleanup errors
		}
		throw new Error(`Failed to download file: ${error.message}`);
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

		// Get file stats to validate it's not empty
		const stats = await fs.stat(localPath);
		if (stats.size === 0) {
			throw new Error(`File is empty: ${localPath}`);
		}

		fileContent = await fs.readFile(localPath);
		
		if (!fileContent || fileContent.length === 0) {
			throw new Error(`File content is empty: ${localPath}`);
		}
	} catch (error) {
		throw new Error(`Failed to read file from ${localPath}: ${error.message}`);
	}

	// Auto-detect MIME type if not provided
	let detectedMimeType = mimeType;
	if (!detectedMimeType) {
		const extension = path.extname(localPath).toLowerCase();
		const mimeTypes = {
			'.pdf': 'application/pdf',
			'.txt': 'text/plain',
			'.doc': 'application/msword',
			'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'.xls': 'application/vnd.ms-excel',
			'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'.ppt': 'application/vnd.ms-powerpoint',
			'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.png': 'image/png',
			'.gif': 'image/gif',
			'.mp4': 'video/mp4',
			'.mp3': 'audio/mpeg',
			'.zip': 'application/zip',
			'.json': 'application/json',
			'.html': 'text/html',
			'.css': 'text/css',
			'.js': 'text/javascript'
		};
		detectedMimeType = mimeTypes[extension] || 'application/octet-stream';
	}

	// Validate MIME type
	try {
		validateMimeType(detectedMimeType);
	} catch (error) {
		throw new Error(`Invalid MIME type: ${error.message}`);
	}

	const metadata = {
		name: fileName
	};

	if (parentFolderId) {
		metadata.parents = [parentFolderId];
	}

	const formData = new FormData();
	formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	formData.append('file', new Blob([fileContent], { type: detectedMimeType }));

	const endpoint = '/files?uploadType=multipart&supportsAllDrives=true';
	const result = await makeUploadRequest(endpoint, bearerToken, {
		method: 'POST',
		body: formData,
		headers: {} // Don't set Content-Type for FormData
	});

	return formatUploadResponse(result, localPath);
}

/**
 * Create a new folder in Google Drive
 * @param {Object} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Folder creation result
 */
export async function createFolder(args, bearerToken) {
	const { folderName, parentFolderId } = args;

	// Validate input parameters
	if (!folderName) {
		throw new Error('Folder name is required');
	}

	try {
		validateFileName(folderName);
	} catch (error) {
		throw new Error(`Invalid folder name: ${error.message}`);
	}

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error.message}`);
		}
	}

	const metadata = {
		name: folderName,
		mimeType: 'application/vnd.google-apps.folder'
	};

	if (parentFolderId) {
		metadata.parents = [parentFolderId];
	}

	const endpoint = '/files?supportsAllDrives=true';
	const result = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata
	});

	return formatFileResponse(result);
}

/**
 * Delete a file or folder from Google Drive
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
 */
export async function deleteFile(args, bearerToken) {
	const { fileId } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const endpoint = `/files/${fileId}?supportsAllDrives=true`;
	
	// Make DELETE request (no response body expected)
	const url = `${DRIVE_API_BASE}${endpoint}`;
	const response = await fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${bearerToken}`
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Google Drive API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Google Drive API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	console.log(`✅ File deleted successfully: ${fileId}`);

	return {
		success: true,
		message: 'File deleted successfully',
		fileId
	};
}

/**
 * Copy a file in Google Drive
 * @param {Object} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Copy result
 */
export async function copyFile(args, bearerToken) {
	const { fileId, newName, parentFolderId } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!newName) {
		throw new Error('New name is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	try {
		validateFileName(newName);
	} catch (error) {
		throw new Error(`Invalid new name: ${error.message}`);
	}

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error.message}`);
		}
	}

	const metadata = {
		name: newName
	};

	if (parentFolderId) {
		metadata.parents = [parentFolderId];
	}

	const endpoint = `/files/${fileId}/copy?supportsAllDrives=true`;
	const result = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: metadata
	});

	return formatFileResponse(result);
}

/**
 * Move a file to a different folder in Google Drive
 * @param {Object} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Move result
 */
export async function moveFile(args, bearerToken) {
	const { fileId, newParentFolderId, removeFromParents } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!newParentFolderId) {
		throw new Error('New parent folder ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	try {
		validateFileId(newParentFolderId);
	} catch (error) {
		throw new Error(`Invalid new parent folder ID: ${error.message}`);
	}

	if (removeFromParents && Array.isArray(removeFromParents)) {
		for (const parentId of removeFromParents) {
			try {
				validateFileId(parentId);
			} catch (error) {
				throw new Error(`Invalid parent ID in removeFromParents: ${error.message}`);
			}
		}
	}

	const params = new URLSearchParams();
	params.append('addParents', newParentFolderId);
	params.append('supportsAllDrives', 'true');

	if (removeFromParents && removeFromParents.length > 0) {
		params.append('removeParents', removeFromParents.join(','));
	}

	const endpoint = `/files/${fileId}?${params.toString()}`;
	const result = await makeDriveRequest(endpoint, bearerToken, {
		method: 'PATCH'
	});

	return formatFileResponse(result);
}

/**
 * Share a file or folder with specific users or make it publicly accessible
 * @param {Object} args - Share arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Share result
 */
export async function shareFile(args, bearerToken) {
	const { fileId, type, role, emailAddress, domain, sendNotificationEmail = true } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	if (!type) {
		throw new Error('Permission type is required');
	}

	if (!role) {
		throw new Error('Permission role is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	try {
		validatePermissionType(type);
	} catch (error) {
		throw new Error(`Invalid permission type: ${error.message}`);
	}

	try {
		validatePermissionRole(role);
	} catch (error) {
		throw new Error(`Invalid permission role: ${error.message}`);
	}

	if (type === 'user' && !emailAddress) {
		throw new Error('Email address is required for user permission type');
	}

	if (type === 'group' && !emailAddress) {
		throw new Error('Email address is required for group permission type');
	}

	if (type === 'domain' && !domain) {
		throw new Error('Domain is required for domain permission type');
	}

	if (emailAddress) {
		try {
			validateEmailAddress(emailAddress);
		} catch (error) {
			throw new Error(`Invalid email address: ${error.message}`);
		}
	}

	if (domain) {
		try {
			validateDomainName(domain);
		} catch (error) {
			throw new Error(`Invalid domain name: ${error.message}`);
		}
	}

	const permission = {
		type,
		role
	};

	if (emailAddress) permission.emailAddress = emailAddress;
	if (domain) permission.domain = domain;

	const params = new URLSearchParams();
	params.append('supportsAllDrives', 'true');
	params.append('sendNotificationEmail', sendNotificationEmail.toString());

	const endpoint = `/files/${fileId}/permissions?${params.toString()}`;
	const result = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: permission
	});

	return result;
}

/**
 * Search for files in Google Drive using advanced search syntax
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export async function searchFiles(args, bearerToken) {
	const { query, maxResults = 10, orderBy = 'modifiedTime' } = args;

	// Validate input parameters
	if (!query) {
		throw new Error('Search query is required');
	}

	if (typeof query !== 'string' || query.trim() === '') {
		throw new Error('Search query must be a non-empty string');
	}

	if (maxResults < 1 || maxResults > 1000) {
		throw new Error('maxResults must be between 1 and 1000');
	}

	const params = new URLSearchParams();
	params.append('q', query);
	params.append('pageSize', maxResults.toString());
	params.append('orderBy', orderBy);
	params.append('supportsAllDrives', 'true');
	params.append('includeItemsFromAllDrives', 'true');
	params.append('fields', 'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, webContentLink, shared, starred, trashed)');

	const endpoint = `/files?${params.toString()}`;
	const result = await makeDriveRequest(endpoint, bearerToken);

	return formatFileListResponse(result, query);
}

/**
 * Get sharing permissions for a file or folder
 * @param {Object} args - Permissions arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Permissions result
 */
export async function getFilePermissions(args, bearerToken) {
	const { fileId } = args;

	// Validate input parameters
	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const endpoint = `/files/${fileId}/permissions?supportsAllDrives=true`;
	const result = await makeDriveRequest(endpoint, bearerToken);

	return result;
}

/**
 * Get information about the user's Google Drive storage
 * @param {Object} args - Drive info arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Drive info result
 */
export async function getDriveInfo(args, bearerToken) {
	const endpoint = '/about?fields=storageQuota,user';
	const result = await makeDriveRequest(endpoint, bearerToken);

	return formatDriveInfoResponse(result);
}