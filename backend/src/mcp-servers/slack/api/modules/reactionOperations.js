/**
 * Slack reaction operations
 * Handles adding, removing, and getting reactions
 */

import { makeSlackRequest } from './requestHandler.js';

/**
 * @typedef {Object} ReactionArgs
 * @property {string} channel - Channel ID
 * @property {string} timestamp - Message timestamp
 * @property {string} name - Reaction name (emoji)
 */

/**
 * @typedef {Object} GetReactionsArgs
 * @property {string} channel - Channel ID
 * @property {string} timestamp - Message timestamp
 */

/**
 * @typedef {Object} SlackReactionResponse
 * @property {boolean} ok - Success indicator
 * @property {string} [error] - Error message
 */

/**
 * @typedef {Object} ReactionResult
 * @property {boolean} ok - Success indicator
 * @property {string} summary - Summary message
 * @property {string} [error] - Error message
 */

/**
 * Add a reaction to a message
 * @param {ReactionArgs} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Add reaction result
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
 * @param {ReactionArgs} args - Reaction arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Remove reaction result
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
 * @param {GetReactionsArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ReactionResult>} Reactions result
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