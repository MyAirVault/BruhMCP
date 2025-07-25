/**
 * Google Drive List and Search Operations Module
 * Handles file listing, searching, and drive information
 */

import { formatFileListResponse, formatDriveInfoResponse } from '../../utils/googledriveFormatting.js';
import { validateFileId, validateMimeType } from '../../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {import('../../api/types.js').RequestOptions} [options] - Request options
 * @returns {Promise<Object>} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
	const url = `${DRIVE_API_BASE}${endpoint}`;

	/** @type {Record<string, string>} */
	const headersRecord = {
		Authorization: `Bearer ${bearerToken}`,
		'Content-Type': 'application/json',
	};

	// Add any additional headers from options
	if (options.headers) {
		Object.assign(headersRecord, options.headers);
	}

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: headersRecord,
	};

	// Add body if present
	if (options.body) {
		if (typeof options.body === 'object' && !options.raw) {
			requestOptions.body = JSON.stringify(options.body);
		} else if (typeof options.body === 'string' || options.body instanceof FormData) {
			requestOptions.body = options.body;
		}
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

		const jsonData = await response.json();
		return /** @type {Object} */ (jsonData);
	} catch (error) {
		throw new Error(`Failed to access Google Drive API: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * List files in Google Drive
 * @param {{
 *   parentFolderId?: string,
 *   pageSize?: number,
 *   pageToken?: string,
 *   showTrashed?: boolean,
 *   orderBy?: string
 * }} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} List result
 */
export async function listFiles(args, bearerToken) {
	const { parentFolderId, pageSize = 100, pageToken, showTrashed = false, orderBy = 'modifiedTime desc' } = args;

	// Build query
	const queryParts = [];

	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error instanceof Error ? error.message : String(error)}`);
		}
		queryParts.push(`'${parentFolderId}' in parents`);
	}

	if (!showTrashed) {
		queryParts.push('trashed = false');
	}

	const query = queryParts.length > 0 ? queryParts.join(' and ') : undefined;

	// Build endpoint with parameters
	const params = new URLSearchParams({
		pageSize: pageSize.toString(),
		orderBy,
		fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,shared,trashed)',
	});

	if (query) {
		params.append('q', query);
	}

	if (pageToken) {
		params.append('pageToken', pageToken);
	}

	const endpoint = `/files?${params.toString()}`;
	const data = await makeDriveRequest(endpoint, bearerToken);

	return formatFileListResponse(/** @type {import('../../utils/googledriveFormatting.js').GoogleDriveFilesResponse} */ (data));
}

/**
 * Search files in Google Drive
 * @param {{
 *   query?: string,
 *   name?: string,
 *   mimeType?: string,
 *   parentFolderId?: string,
 *   pageSize?: number,
 *   pageToken?: string,
 *   showTrashed?: boolean,
 *   orderBy?: string,
 *   searchInContent?: boolean
 * }} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Search result
 */
export async function searchFiles(args, bearerToken) {
	const {
		query,
		name,
		mimeType,
		parentFolderId,
		pageSize = 100,
		pageToken,
		showTrashed = false,
		orderBy = 'modifiedTime desc',
		searchInContent = false,
	} = args;

	// Build search query
	const queryParts = [];

	// Add custom query if provided
	if (query) {
		queryParts.push(query);
	}

	// Add name search
	if (name) {
		if (searchInContent) {
			queryParts.push(`(name contains '${name.replace(/'/g, "\\'")}' or fullText contains '${name.replace(/'/g, "\\'")}')`);
		} else {
			queryParts.push(`name contains '${name.replace(/'/g, "\\'")}'`);
		}
	}

	// Add MIME type filter
	if (mimeType) {
		try {
			validateMimeType(mimeType);
		} catch (error) {
			throw new Error(`Invalid MIME type: ${error instanceof Error ? error.message : String(error)}`);
		}
		queryParts.push(`mimeType = '${mimeType}'`);
	}

	// Add parent folder filter
	if (parentFolderId) {
		try {
			validateFileId(parentFolderId);
		} catch (error) {
			throw new Error(`Invalid parent folder ID: ${error instanceof Error ? error.message : String(error)}`);
		}
		queryParts.push(`'${parentFolderId}' in parents`);
	}

	// Add trash filter
	if (!showTrashed) {
		queryParts.push('trashed = false');
	}

	if (queryParts.length === 0) {
		throw new Error('At least one search criterion is required');
	}

	const finalQuery = queryParts.join(' and ');

	// Build endpoint with parameters
	const params = new URLSearchParams({
		q: finalQuery,
		pageSize: pageSize.toString(),
		orderBy,
		fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,shared,trashed)',
	});

	if (pageToken) {
		params.append('pageToken', pageToken);
	}

	const endpoint = `/files?${params.toString()}`;
	const data = await makeDriveRequest(endpoint, bearerToken);

	return formatFileListResponse(/** @type {import('../../utils/googledriveFormatting.js').GoogleDriveFilesResponse} */ (data));
}

/**
 * Get Google Drive storage information
 * @param {Object} _args - Arguments (unused but kept for consistency)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Drive info
 */
export async function getDriveInfo(_args, bearerToken) {
	const endpoint = '/about?fields=storageQuota,user';
	const data = await makeDriveRequest(endpoint, bearerToken);

	return formatDriveInfoResponse(data);
}