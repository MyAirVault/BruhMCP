/**
 * Notion API Utility Operations
 * General utility operations for Notion API
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Make raw API call to Notion
 * @param {Object} args - Raw API call arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} API response
 */
export async function makeRawApiCall(args, bearerToken) {
	const { method, path, params = {} } = args;

	const options = {
		method: method.toUpperCase(),
	};

	if (method.toUpperCase() === 'GET') {
		// For GET requests, add params as query parameters
		if (Object.keys(params).length > 0) {
			const queryString = new URLSearchParams(params).toString();
			path += `?${queryString}`;
		}
	} else {
		// For other methods, add params as request body
		options.body = params;
	}

	const result = await makeNotionRequest(path, bearerToken, options);

	return formatNotionResponse({
		action: 'raw_api_call',
		method,
		path,
		result,
	});
}