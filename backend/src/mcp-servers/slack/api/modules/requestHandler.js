/**
 * Slack API request handler
 * Core HTTP request functionality for Slack API
 */

const SLACK_API_BASE = 'https://slack.com/api';

/**
 * Make authenticated request to Slack API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function makeSlackRequest(endpoint, bearerToken, options = {}) {
	const url = `${SLACK_API_BASE}${endpoint}`;

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	// Handle form data for certain endpoints
	if (options.formData) {
		delete requestOptions.headers['Content-Type'];
		requestOptions.body = options.formData;
	} else if (options.body && typeof options.body === 'object') {
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
	if (data.ok === false) {
		throw new Error(`Slack API error: ${data.error}`);
	}

	return data;
}