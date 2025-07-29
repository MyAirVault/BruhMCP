/**
 * Slack API request handler
 * Core HTTP request functionality for Slack API
 */

const SLACK_API_BASE = 'https://slack.com/api';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Request headers
 * @property {FormData} [formData] - Form data for file uploads
 * @property {Object} [body] - Request body as object
 */

/**
 * @typedef {Object} SlackApiResponse
 * @property {boolean} ok - Success indicator
 * @property {string} [error] - Error message if request failed
 * @property {Object} [channel] - Channel data
 * @property {Object} [message] - Message data
 * @property {Object} [user] - User data
 * @property {Object} [team] - Team data
 * @property {Object[]} [channels] - Array of channels
 * @property {Object[]} [members] - Array of members
 * @property {Object[]} [messages] - Array of messages
 * @property {Object[]} [files] - Array of files
 * @property {string} [ts] - Message timestamp
 * @property {string} [response_metadata] - Response metadata
 */

/**
 * Make authenticated request to Slack API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} options - Request options
 * @returns {Promise<SlackApiResponse>} API response
 */
async function makeSlackRequest(endpoint, bearerToken, options = {}) {
	const url = `${SLACK_API_BASE}${endpoint}`;

	/** @type {RequestInit} */
	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
	};

	// Handle form data for certain endpoints
	if (options.formData) {
		if (requestOptions.headers && 'Content-Type' in requestOptions.headers) {
			delete requestOptions.headers['Content-Type'];
		}
		requestOptions.body = options.formData;
	} else if (options.body) {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Slack API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Slack API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error) {
				errorMessage = `Slack API error: ${errorData.error}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log(`✅ Slack API Response: ${response.status}`);

	// Check for Slack-specific error in response
	if (typeof data === 'object' && data !== null && 'ok' in data && data.ok === false) {
		const errorMsg = typeof data === 'object' && data !== null && 'error' in data ? String(data.error) : 'Unknown error';
		throw new Error(`Slack API error: ${errorMsg}`);
	}

	return /** @type {SlackApiResponse} */ (data);
}
module.exports = {
  makeSlackRequest
};