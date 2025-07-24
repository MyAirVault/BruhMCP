/**
 * Slack user operations
 * Handles user info and listing operations
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatUserResponse } from '../../utils/slackFormatting.js';

/**
 * Get information about a user
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} User info result
 */
export async function getUserInfo(args, bearerToken) {
	const { user } = args;

	const params = new URLSearchParams({ user });
	const response = await makeSlackRequest(`/users.info?${params}`, bearerToken);

	return {
		...response,
		user: formatUserResponse(response.user),
		summary: `Retrieved info for user: ${response.user?.name || user}`,
	};
}

/**
 * List users in the workspace
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Users list result
 */
export async function listUsers(args, bearerToken) {
	const { limit = 100, cursor } = args;

	const params = new URLSearchParams({
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	const response = await makeSlackRequest(`/users.list?${params}`, bearerToken);

	return {
		...response,
		members: response.members?.map(formatUserResponse) || [],
		summary: `Retrieved ${response.members?.length || 0} users`,
	};
}