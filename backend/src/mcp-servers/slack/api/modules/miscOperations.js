/**
 * Slack miscellaneous operations
 * Handles reminders, team info, and authentication testing
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatTeamResponse } from '../../utils/slackFormatting.js';

/**
 * @typedef {Object} CreateReminderArgs
 * @property {string} text - Reminder text
 * @property {string} time - Reminder time
 * @property {string} [user] - User ID to remind
 */

/**
 * @typedef {import('../../middleware/types.js').SlackTeam} SlackTeam
 */

/**
 * @typedef {Object} SlackTeamResponse
 * @property {boolean} ok - Success indicator
 * @property {SlackTeam} [team] - Team object
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} ReminderResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Create a reminder
 * @param {CreateReminderArgs} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReminderResult>} Reminder result
 */
export async function createReminder(args, bearerToken) {
	const { text, time, user } = args;

	/** @type {{text: string, time: string, user?: string}} */
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
 * @typedef {Object} FormattedTeam
 * @property {string} id - Team ID
 * @property {string} name - Team name
 */

/**
 * @typedef {Object} TeamInfoResult
 * @property {boolean} ok - Success indicator
 * @property {FormattedTeam|null} team - Formatted team object
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Get team information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<TeamInfoResult>} Team info result
 */
export async function getTeamInfo(bearerToken) {
	/** @type {SlackTeamResponse} */
	const response = await makeSlackRequest('/team.info', bearerToken);

	return {
		...response,
		team: formatTeamResponse(response.team || null),
		summary: `Retrieved team info: ${response.team?.name || 'Unknown'}`,
	};
}

/**
 * @typedef {Object} AuthTestResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [user] - User ID
 * @property {string} [error] - Error message
 */

/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<AuthTestResult>} Auth test result
 */
export async function testAuth(bearerToken) {
	const response = await makeSlackRequest('/auth.test', bearerToken);
	const authResponse = /** @type {{user?: string}} */ (response);

	return {
		...response,
		user: authResponse.user || 'Unknown',
		summary: `Authentication test successful for user: ${authResponse.user || 'Unknown'}`,
	};
}