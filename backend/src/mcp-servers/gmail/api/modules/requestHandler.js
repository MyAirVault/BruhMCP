// @ts-check

/**
 * Gmail API Request Handler
 * Core request handling functionality for Gmail API operations
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {Object|string} [body] - Request body
 * @property {AbortSignal} [signal] - Abort signal for timeout
 */

/**
 * Make authenticated request to Gmail API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} [options={}] - Request options
 * @returns {Promise<Record<string, any>>} API response
 * @throws {Error} When API request fails
 */
async function makeGmailRequest(endpoint, bearerToken, options = {}) {
	const url = `${GMAIL_API_BASE}${endpoint}`;

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

	console.log(`📡 Gmail API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Gmail API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Gmail API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = /** @type {Record<string, any>} */ (await response.json());
	console.log(`✅ Gmail API Response: ${response.status}`);

	return data;
}

module.exports = {
	makeGmailRequest
};