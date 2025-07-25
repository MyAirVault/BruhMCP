/**
 * Google Drive Permission Operations Module
 * Handles file sharing and permission management
 */

import { validateFileId, validateEmailAddress, validateDomainName, validatePermissionType, validatePermissionRole } from '../../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method='GET'] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {string} [body] - Request body as JSON string
 * @property {boolean} [raw] - Whether to send raw body
 */

/**
 * @typedef {Object} DriveAPIErrorResponse
 * @property {{message: string}} error - Error object with message
 */

/**
 * @typedef {Object} Permission
 * @property {string} id - Permission ID
 * @property {string} type - Permission type (user, group, domain, anyone)
 * @property {string} role - Permission role (owner, organizer, fileOrganizer, writer, commenter, reader)
 * @property {string} [emailAddress] - Email address for user/group permissions
 * @property {string} [domain] - Domain for domain permissions
 * @property {string} [displayName] - Display name of the permission holder
 * @property {string} [photoLink] - Photo link of the permission holder
 */

/**
 * @typedef {Object} PermissionRequest
 * @property {string} type - Permission type
 * @property {string} role - Permission role
 * @property {string} [emailAddress] - Email address for user/group permissions
 * @property {string} [domain] - Domain for domain permissions
 */

/**
 * @typedef {Object} PermissionsListResponse
 * @property {Permission[]} permissions - Array of permissions
 */

/**
 * @typedef {Object} DriveAPIResponse
 * @property {string} [id] - Response ID
 * @property {string} [type] - Response type
 * @property {string} [role] - Response role
 * @property {string} [emailAddress] - Response email address
 * @property {string} [domain] - Response domain
 * @property {Permission[]} [permissions] - Response permissions array
 */

/**
 * @typedef {Object} ShareFileArgs
 * @property {string} fileId - File ID to share
 * @property {string} [emailAddress] - Email address or domain to share with
 * @property {string} [role='reader'] - Permission role
 * @property {string} [type='user'] - Permission type
 * @property {boolean} [sendNotificationEmail=true] - Whether to send notification email
 * @property {string} [emailMessage] - Custom email message
 */

/**
 * @typedef {Object} ShareFileResult
 * @property {boolean} success - Whether the operation was successful
 * @property {string} fileId - File ID that was shared
 * @property {string} permissionId - ID of the created permission
 * @property {string} type - Permission type
 * @property {string} role - Permission role
 * @property {string} [emailAddress] - Email address (if applicable)
 * @property {string} [domain] - Domain (if applicable)
 * @property {string} message - Success message
 */

/**
 * @typedef {Object} GetFilePermissionsArgs
 * @property {string} fileId - File ID to get permissions for
 */

/**
 * @typedef {Object} FilePermissionsResult
 * @property {string} fileId - File ID
 * @property {Permission[]} permissions - Array of permissions
 * @property {number} count - Number of permissions
 */

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} [options={}] - Request options
 * @returns {Promise<DriveAPIResponse>} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
	const url = `${DRIVE_API_BASE}${endpoint}`;

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
	};

	if (options.body) {
		requestOptions.body = options.body;
	}

	try {
		const response = await fetch(url, requestOptions);

		if (!response.ok) {
			const errorData = await response.text();
			let errorMessage = `Drive API error: ${response.status} ${response.statusText}`;

			try {
				/** @type {DriveAPIErrorResponse} */
				const errorJson = JSON.parse(errorData);
				if (errorJson.error && errorJson.error.message) {
					errorMessage = `Drive API error: ${errorJson.error.message}`;
				}
			} catch {
				// Use default error message
			}

			throw new Error(errorMessage);
		}

		const jsonData = await response.json();
		return /** @type {DriveAPIResponse} */ (jsonData);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(`Failed to access Google Drive API: ${errorMessage}`);
	}
}

/**
 * Share a file with specific users or make it public
 * @param {ShareFileArgs} args - Sharing arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ShareFileResult>} Sharing result
 */
export async function shareFile(args, bearerToken) {
	const { fileId, emailAddress, role = 'reader', type = 'user', sendNotificationEmail = true, emailMessage } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Validation failed';
		throw new Error(`Invalid file ID: ${errorMessage}`);
	}

	try {
		validatePermissionType(type);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Validation failed';
		throw new Error(`Invalid permission type: ${errorMessage}`);
	}

	try {
		validatePermissionRole(role);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Validation failed';
		throw new Error(`Invalid permission role: ${errorMessage}`);
	}

	// Build permission object
	/** @type {PermissionRequest} */
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
			const errorMessage = error instanceof Error ? error.message : 'Validation failed';
			throw new Error(`Invalid email address: ${errorMessage}`);
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
			const errorMessage = error instanceof Error ? error.message : 'Validation failed';
			throw new Error(`Invalid domain: ${errorMessage}`);
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
		body: JSON.stringify(permission),
	});

	return {
		success: true,
		fileId,
		permissionId: data.id || '',
		type: data.type || type,
		role: data.role || role,
		emailAddress: data.emailAddress,
		domain: data.domain,
		message: `File shared successfully`,
	};
}

/**
 * Get permissions for a file
 * @param {GetFilePermissionsArgs} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FilePermissionsResult>} File permissions
 */
export async function getFilePermissions(args, bearerToken) {
	const { fileId } = args;

	if (!fileId) {
		throw new Error('File ID is required');
	}

	try {
		validateFileId(fileId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Validation failed';
		throw new Error(`Invalid file ID: ${errorMessage}`);
	}

	const endpoint = `/files/${fileId}/permissions?fields=permissions(id,type,role,emailAddress,domain,displayName,photoLink)`;
	const data = await makeDriveRequest(endpoint, bearerToken);

	return {
		fileId,
		permissions: data.permissions || [],
		count: (data.permissions || []).length,
	};
}