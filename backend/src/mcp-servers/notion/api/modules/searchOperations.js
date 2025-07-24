/**
 * Notion API Search Operations
 * Operations for searching across Notion workspace
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Search for pages and databases
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export async function searchNotion(args, bearerToken) {
	const { query, filter = {}, sort = {}, page_size = 100, start_cursor = null } = args;

	const requestBody = {
		query,
		filter,
		sort,
		page_size: Math.min(page_size, 100),
		...(start_cursor && { start_cursor }),
	};

	const result = await makeNotionRequest('/search', bearerToken, {
		method: 'POST',
		body: requestBody,
	});

	return formatNotionResponse({
		action: 'search',
		query,
		results: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}