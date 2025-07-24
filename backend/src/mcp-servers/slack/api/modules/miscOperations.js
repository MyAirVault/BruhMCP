/**
 * Slack miscellaneous operations
 * Handles reminders, team info, and authentication testing
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatTeamResponse } from '../../utils/slackFormatting.js';

/**
 * Create a reminder
 * @param {Object} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Reminder result
 */
export async function createReminder(args, bearerToken) {
	const { text, time, user } = args;

	const body = {
		text,
		time,
	};

	if (user) body.user = user;

	const response = await makeSlackRequest('/reminders.add', bearerToken, {
		method: 'POST',
		body,
	});

	return {
		...response,
		summary: `Created reminder: "${text}" for ${time}${user ? ` (user: ${user})` : ''}`,
	};
}

/**
 * Get team information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Team info result
 */
export async function getTeamInfo(bearerToken) {
	const response = await makeSlackRequest('/team.info', bearerToken);

	return {
		...response,
		team: formatTeamResponse(response.team),
		summary: `Retrieved team info: ${response.team?.name || 'Unknown'}`,
	};
}

/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Auth test result
 */
export async function testAuth(bearerToken) {
	const response = await makeSlackRequest('/auth.test', bearerToken);

	return {
		...response,
		summary: `Authentication test successful for user: ${response.user || 'Unknown'}`,
	};
}