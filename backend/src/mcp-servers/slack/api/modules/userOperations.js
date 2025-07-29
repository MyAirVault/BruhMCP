/**
 * Slack user operations
 * Handles user info and listing operations
 */

const { makeSlackRequest  } = require('./requestHandler');
const { formatUserResponse  } = require('../../utils/slackFormatting');

/**
 * @typedef {Object} UserInfoArgs
 * @property {string} user - User ID
 */

/**
 * @typedef {Object} ListUsersArgs
 * @property {number} [limit] - Number of users to return
 * @property {string} [cursor] - Pagination cursor
 */

/**
 * @typedef {import('../../middleware/types.js').SlackUser} SlackUser
 */

/**
 * @typedef {Object} SlackUserResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackUser} [user] - User object
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} SlackUsersResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackUser[]} [members] - Array of users
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} FormattedUser
 * @property {string} id - User ID
 * @property {string} name - Username
 * @property {string} real_name - Real name
 * @property {boolean} is_admin - Whether user is admin
 * @property {boolean} is_bot - Whether user is a bot
 * @property {boolean} deleted - Whether user is deleted
 */

/**
 * @typedef {Object} UserInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedUser|null} user - Formatted user object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Get information about a user
 * @param {UserInfoArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<UserInfoResult>} User info result
 */
async function getUserInfo(args, bearerToken) {
	const { user } = args;

	const params = new URLSearchParams({ user });
	/** @type {SlackUserResponse} */
	const response = /** @type {SlackUserResponse} */ (await makeSlackRequest(`/users.info?${params}`, bearerToken));

	return {
		...response,
		user: formatUserResponse(response.user || null),
		summary: `Retrieved info for user: ${response.user?.name || user}`,
	};
}

/**
 * @typedef {Object} UsersListResult
 * @property {boolean} ok - Success indicator
 * @property {(FormattedUser|null)[]} members - Array of formatted users
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * List users in the workspace
 * @param {ListUsersArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<UsersListResult>} Users list result
 */
async function listUsers(args, bearerToken) {
	const { limit = 100, cursor } = args;

	const params = new URLSearchParams({
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	/** @type {SlackUsersResponse} */
	const response = /** @type {SlackUsersResponse} */ (await makeSlackRequest(`/users.list?${params}`, bearerToken));

	return {
		...response,
		members: response.members?.map(formatUserResponse) || [],
		summary: `Retrieved ${response.members?.length || 0} users`,
	};
}
module.exports = {
  getUserInfo,
  listUsers
};