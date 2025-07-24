/**
 * Slack reaction operations
 * Handles adding, removing, and getting reactions
 */

import { makeSlackRequest } from './requestHandler.js';

/**
 * Add a reaction to a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Add reaction result
 */
export async function addReaction(args, bearerToken) {
	const { channel, timestamp, name } = args;

	const response = await makeSlackRequest('/reactions.add', bearerToken, {
		method: 'POST',
		body: {
			channel,
			timestamp,
			name,
		},
	});

	return {
		...response,
		summary: `Added reaction :${name}: to message in ${channel}`,
	};
}

/**
 * Remove a reaction from a message
 * @param {Object} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Remove reaction result
 */
export async function removeReaction(args, bearerToken) {
	const { channel, timestamp, name } = args;

	const response = await makeSlackRequest('/reactions.remove', bearerToken, {
		method: 'POST',
		body: {
			channel,
			timestamp,
			name,
		},
	});

	return {
		...response,
		summary: `Removed reaction :${name}: from message in ${channel}`,
	};
}

/**
 * Get reactions for a message
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Reactions result
 */
export async function getReactions(args, bearerToken) {
	const { channel, timestamp } = args;

	const params = new URLSearchParams({
		channel,
		timestamp,
	});

	const response = await makeSlackRequest(`/reactions.get?${params}`, bearerToken);

	return {
		...response,
		summary: `Retrieved reactions for message in ${channel}`,
	};
}