/**
 * Notion API User Operations
 * Operations for managing Notion users and workspace information
 */

const { makeNotionRequest  } = require('./requestHandler');
const { formatNotionResponse  } = require('../../utils/notionFormatting');

/**
 * Get current user
 * @param {Record<string, never>} _args - User arguments (empty object)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} User data
 */
async function getCurrentUser(_args, bearerToken) {
	const result = await makeNotionRequest('/users/me', bearerToken);

	return formatNotionResponse({
		action: 'get_current_user',
		user: /** @type {import('../../utils/notionFormatting.js').NotionUser} */ (result),
	});
}

/**
 * List users
 * @param {{start_cursor?: string, page_size?: number}} args - List users arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Users list
 */
async function listUsers(args, bearerToken) {
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
		users: /** @type {import('../../utils/notionFormatting.js').NotionUser[]} */ (result.results || []),
		hasMore: /** @type {boolean} */ (result.has_more || false),
		next_cursor: /** @type {string|undefined} */ (result.next_cursor || undefined),
	});
}
module.exports = {
  getCurrentUser,
  listUsers
};