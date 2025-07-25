/**
 * Notion API Utility Operations
 * General utility operations for Notion API
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Make raw API call to Notion
 * @param {{endpoint: string, method?: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>}} args - Raw API call arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} API response
 */
export async function makeRawApiCall(args, bearerToken) {
	const { endpoint, method = 'GET', body = {} } = args;

	const options = /** @type {{method: string, body?: Record<string, unknown>}} */ ({
		method: method.toUpperCase(),
	});

	let finalEndpoint = endpoint;

	if (method.toUpperCase() === 'GET') {
		// For GET requests, add body as query parameters
		if (Object.keys(body).length > 0) {
			const queryString = new URLSearchParams(/** @type {Record<string, string>} */ (body)).toString();
			finalEndpoint += `?${queryString}`;
		}
	} else {
		// For other methods, add body as request body
		options.body = body;
	}

	const result = await makeNotionRequest(finalEndpoint, bearerToken, options);

	return formatNotionResponse({
		action: 'raw_api_call',
		method,
		path: finalEndpoint,
		result,
	});
}