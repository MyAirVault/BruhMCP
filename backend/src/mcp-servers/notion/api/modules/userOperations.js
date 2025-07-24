/**
 * Notion API User Operations
 * Operations for managing Notion users and workspace information
 */

import { makeNotionRequest } from './requestHandler.js';
import { formatNotionResponse } from '../../utils/notionFormatting.js';

/**
 * Get current user
 * @param {Object} args - User arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User data
 */
export async function getCurrentUser(args, bearerToken) {
	const result = await makeNotionRequest('/users/me', bearerToken);

	return formatNotionResponse({
		action: 'get_current_user',
		user: result,
	});
}

/**
 * List users
 * @param {Object} args - List users arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Users list
 */
export async function listUsers(args, bearerToken) {
	const { start_cursor = null, page_size = 100 } = args;

	let endpoint = '/users';
	const params = new URLSearchParams({
		page_size: Math.min(page_size, 100).toString(),
	});

	if (start_cursor) {
		params.append('start_cursor', start_cursor);
	}

	const result = await makeNotionRequest(`${endpoint}?${params}`, bearerToken);

	return formatNotionResponse({
		action: 'list_users',
		users: result.results || [],
		hasMore: result.has_more || false,
		nextCursor: result.next_cursor || null,
	});
}