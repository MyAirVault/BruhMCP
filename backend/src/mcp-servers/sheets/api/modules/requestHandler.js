// @ts-check

/**
 * Google Sheets API Request Handler
 * Core request handling functionality for Google Sheets API operations
 */

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {Object|string} [body] - Request body
 * @property {AbortSignal} [signal] - Abort signal for timeout
 */

/**
 * Make authenticated request to Google Sheets API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} [options={}] - Request options
 * @returns {Promise<Record<string, any>>} API response
 * @throws {Error} When API request fails
 */
export async function makeSheetsRequest(endpoint, bearerToken, options = {}) {
	const url = `${SHEETS_API_BASE}${endpoint}`;

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		signal: options.signal,
	};

	if (options.body) {
		if (typeof options.body === 'object') {
			requestOptions.body = JSON.stringify(options.body);
		} else {
			requestOptions.body = options.body;
		}
	}

	console.log(`📡 Sheets API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Sheets API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Sheets API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
			if (errorText) {
				errorMessage = `Sheets API error: ${errorText}`;
			}
		}

		throw new Error(errorMessage);
	}

	const data = /** @type {Record<string, any>} */ (await response.json());
	console.log(`✅ Sheets API Response: ${response.status}`);

	return data;
}

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} [options={}] - Request options
 * @returns {Promise<Record<string, any>>} API response
 * @throws {Error} When API request fails
 */
export async function makeDriveRequest(endpoint, bearerToken, options = {}) {
	const url = `${DRIVE_API_BASE}${endpoint}`;

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		signal: options.signal,
	};

	if (options.body) {
		if (typeof options.body === 'object') {
			requestOptions.body = JSON.stringify(options.body);
		} else {
			requestOptions.body = options.body;
		}
	}

	console.log(`📡 Drive API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Drive API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Drive API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
			if (errorText) {
				errorMessage = `Drive API error: ${errorText}`;
			}
		}

		throw new Error(errorMessage);
	}

	const data = /** @type {Record<string, any>} */ (await response.json());
	console.log(`✅ Drive API Response: ${response.status}`);

	return data;
}