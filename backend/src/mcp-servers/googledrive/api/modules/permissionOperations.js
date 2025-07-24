/**
 * Google Drive Permission Operations Module
 * Handles file sharing and permission management
 */

import { validateFileId, validateEmailAddress, validateDomainName, validatePermissionType, validatePermissionRole } from '../../utils/validation.js';

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

		const data = await response.json();
		return data;
	} catch (error) {
		throw new Error(`Failed to access Google Drive API: ${error.message}`);
	}
}

/**
 * Share a file with specific users or make it public
 * @param {Object} args - Sharing arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Sharing result
 */
export async function shareFile(args, bearerToken) {
	const { fileId, emailAddress, role = 'reader', type = 'user', sendNotificationEmail = true, emailMessage } = args;

	if (!fileId) {
		throw new Error('File ID is required');
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

	// Build permission object
	const permission = {
		type,
		role,
	};

	// Add email address for user or group types
	if (type === 'user' || type === 'group') {
		if (!emailAddress) {
			throw new Error('Email address is required for user or group permissions');
		}
		try {
			validateEmailAddress(emailAddress);
		} catch (error) {
			throw new Error(`Invalid email address: ${error.message}`);
		}
		permission.emailAddress = emailAddress;
	}

	// Add domain for domain type
	if (type === 'domain') {
		if (!emailAddress) {
			throw new Error('Domain is required for domain permissions');
		}
		try {
			validateDomainName(emailAddress); // emailAddress contains domain for domain type
		} catch (error) {
			throw new Error(`Invalid domain: ${error.message}`);
		}
		permission.domain = emailAddress;
	}

	// Build query parameters
	const params = new URLSearchParams({
		sendNotificationEmail: sendNotificationEmail.toString(),
	});

	if (emailMessage && sendNotificationEmail) {
		params.append('emailMessage', emailMessage);
	}

	const endpoint = `/files/${fileId}/permissions?${params.toString()}`;
	const data = await makeDriveRequest(endpoint, bearerToken, {
		method: 'POST',
		body: permission,
	});

	return {
		success: true,
		fileId,
		permissionId: data.id,
		type: data.type,
		role: data.role,
		emailAddress: data.emailAddress,
		domain: data.domain,
		message: `File shared successfully`,
	};
}

/**
 * Get permissions for a file
 * @param {Object} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File permissions
 */
export async function getFilePermissions(args, bearerToken) {
	const { fileId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		throw new Error(`Invalid file ID: ${error.message}`);
	}

	const endpoint = `/files/${fileId}/permissions?fields=permissions(id,type,role,emailAddress,domain,displayName,photoLink)`;
	const data = await makeDriveRequest(endpoint, bearerToken);

	return {
		fileId,
		permissions: data.permissions || [],
		count: (data.permissions || []).length,
	};
}