/**
 * Notion API Search Operations
 * Operations for searching across Notion workspace
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Search for pages and databases
 * @param {{query?: string, filter?: {value: string, property: string}, sort?: {direction: 'ascending' | 'descending', timestamp: 'last_edited_time'}, page_size?: number, start_cursor?: string}} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Search results
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
		results: /** @type {(import('../../utils/notionFormatting.js').NotionPage|import('../../utils/notionFormatting.js').NotionDatabase)[]} */ (result.results || []),
		hasMore: /** @type {boolean} */ (result.has_more || false),
		next_cursor: /** @type {string|null} */ (result.next_cursor || null),
	});
}