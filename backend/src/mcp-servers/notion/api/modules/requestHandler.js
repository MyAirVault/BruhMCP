/**
 * Notion API Request Handler
 * Core request handling functionality for Notion API operations
 */

const NOTION_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

/**
 * Make authenticated request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {{method?: string, headers?: Record<string, string>, body?: unknown}} options - Request options
 * @returns {Promise<Record<string, unknown>>} API response
 */
export async function makeNotionRequest(endpoint, bearerToken, options = {}) {
	const url = `${NOTION_BASE_URL}${endpoint}`;

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Notion-Version': NOTION_API_VERSION,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Notion API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, /** @type {RequestInit} */ (requestOptions));

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Notion API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.message) {
				errorMessage = `Notion API error: ${errorData.message}`;
			}
			if (errorData.code) {
				errorMessage += ` (${errorData.code})`;
			}
			console.error(`❌ Notion API Error Response:`, {
				status: response.status,
				statusText: response.statusText,
				errorData,
				endpoint,
				hasToken: !!bearerToken
			});
		} catch (parseError) {
			console.error(`❌ Notion API Error (non-JSON):`, {
				status: response.status,
				statusText: response.statusText,
				errorText,
				endpoint
			});
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log(`✅ Notion API Response: ${response.status}`);

	return data;
}