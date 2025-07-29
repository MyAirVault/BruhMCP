/**
 * Common constants and utilities for Airtable API modules
 */

const { axios } = require('../../../utils/axiosUtils.js');

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

/**
 * @typedef {Object} AirtableRecord
 * @property {string} id - Record ID
 * @property {string} createdTime - Record creation timestamp
 * @property {Object} fields - Record fields
 */

/**
 * @typedef {Object} AirtableBase
 * @property {string} id - Base ID
 * @property {string} name - Base name
 * @property {string} permissionLevel - Permission level
 */

/**
 * @typedef {Object} AirtableField
 * @property {string} id - Field ID
 * @property {string} name - Field name
 * @property {string} type - Field type
 * @property {Object} [options] - Field options
 */

/**
 * @typedef {Object} AirtableView
 * @property {string} id - View ID
 * @property {string} name - View name
 * @property {string} type - View type
 */

/**
 * @typedef {Object} AirtableTable
 * @property {string} id - Table ID
 * @property {string} name - Table name
 * @property {string} primaryFieldId - Primary field ID
 * @property {AirtableField[]} fields - Table fields
 * @property {AirtableView[]} views - Table views
 */

/**
 * Handle common API response errors
 * @param {import('node-fetch').Response} response - Fetch response object
 * @param {string} context - Context for error message
 * @returns {Promise<void>}
 * @throws {Error} When API response indicates an error
 */
async function handleApiError(response, context) {
	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Airtable API key');
		}
		if (response.status === 404) {
			throw new Error(`${context} not found or not accessible`);
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions for this operation');
		}
		if (response.status === 422) {
			const rawData = await response.json().catch(() => ({}));
			/** @type {{error?: {message?: string}}} */
			const errorData = /** @type {{error?: {message?: string}}} */ (rawData);
			throw new Error(`Invalid request: ${errorData.error?.message || 'Validation failed'}`);
		}
		if (response.status === 429) {
			throw new Error('Rate limit exceeded - please try again later');
		}
		throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
	}
}

/**
 * @typedef {Object} RequestOptions
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {string} [method] - HTTP method
 * @property {string} [body] - Request body
 */

/**
 * Make authenticated request to Airtable API
 * @param {string} endpoint - API endpoint
 * @param {string} apiKey - User's Airtable API key
 * @param {RequestOptions} [options] - Fetch options
 * @returns {Promise<import('node-fetch').Response>}
 */
async function makeAuthenticatedRequest(endpoint, apiKey, options = {}) {
	const url = endpoint.startsWith('http') ? endpoint : `${AIRTABLE_BASE_URL}${endpoint}`;
	
	/** @type {Record<string, string>} */
	const headers = {
		'Authorization': `Bearer ${apiKey}`,
		'Content-Type': 'application/json',
	};

	// Add additional headers if provided
	if (options.headers) {
		Object.assign(headers, options.headers);
	}
	
	const response = await axios({
		method: options.method || 'GET',
		url: url,
		headers,
		data: options.body,
		...options
	});

	// Create a fetch-like response object for backwards compatibility
	/** @type {any} */
	const fetchLikeResponse = {
		ok: response.status >= 200 && response.status < 300,
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
		data: response.data,
		json: async () => response.data,
		text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
	};

	return fetchLikeResponse;
}

/**
 * Build query parameters for Airtable API requests
 * @param {Record<string, string | number | boolean | string[] | undefined | null>} params - Query parameters
 * @returns {URLSearchParams}
 */
function buildQueryParams(params) {
	const searchParams = new URLSearchParams();
	
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				value.forEach(item => searchParams.append(`${key}[]`, String(item)));
			} else {
				searchParams.append(key, String(value));
			}
		}
	}
	
	return searchParams;
}

/**
 * Validate Airtable ID format
 * @param {string} id - ID to validate
 * @param {string} type - Type of ID (base, table, record, etc.)
 * @throws {Error} If ID format is invalid
 */
function validateAirtableId(id, type) {
	if (!id || typeof id !== 'string') {
		throw new Error(`${type} ID must be a non-empty string`);
	}
	
	// Basic ID format validation based on type
	/** @type {Record<string, RegExp>} */
	const patterns = {
		base: /^app[a-zA-Z0-9]{14}$/,
		table: /^tbl[a-zA-Z0-9]{14}$|^[a-zA-Z0-9\s\-_]+$/, // Table ID or name
		record: /^rec[a-zA-Z0-9]{14}$/,
		field: /^fld[a-zA-Z0-9]{14}$|^[a-zA-Z0-9\s\-_]+$/, // Field ID or name
		view: /^viw[a-zA-Z0-9]{14}$|^[a-zA-Z0-9\s\-_]+$/ // View ID or name
	};
	
	const pattern = patterns[type];
	if (pattern && !pattern.test(id)) {
			throw new Error(`Invalid ${type} ID format: ${id}`);
	}
}

/**
 * Sanitize input for API requests
 * @param {string | number | boolean | Object | null | undefined} input - Input to sanitize
 * @returns {string | number | boolean | Object | null | undefined} Sanitized input
 */
function sanitizeInput(input) {
	if (typeof input === 'string') {
		return input.trim();
	}
	return input;
}

/**
 * @typedef {Object} ApiResponseMeta
 * @property {string} operation - Operation type
 * @property {string} timestamp - ISO timestamp
 * @property {string} source - Source identifier
 */

/**
 * Format Airtable API response for consistency
 * @param {Object | string | number | boolean | null} data - Response data
 * @param {string} operation - Operation type
 * @returns {Object | string | number | boolean | null} Formatted response
 */
function formatApiResponse(data, operation) {
	// Add metadata about the operation
	if (data && typeof data === 'object') {
		return {
			...data,
			_meta: {
				operation,
				timestamp: new Date().toISOString(),
				source: 'airtable-api'
			}
		};
	}
	return data;
}

module.exports = {
	AIRTABLE_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest,
	buildQueryParams,
	validateAirtableId,
	sanitizeInput,
	formatApiResponse
};