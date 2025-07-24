/**
 * Slack channel operations
 * Handles channel listing, info, joining, and leaving
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatChannelResponse } from '../../utils/slackFormatting.js';

/**
 * List channels in the workspace
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Channels list result
 */
export async function listChannels(args, bearerToken) {
	const { types = 'public_channel,private_channel', limit = 100, cursor } = args;

	const params = new URLSearchParams({
		types,
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	const response = await makeSlackRequest(`/conversations.list?${params}`, bearerToken);

	return {
		...response,
		channels: response.channels?.map(formatChannelResponse) || [],
		summary: `Retrieved ${response.channels?.length || 0} channels`,
	};
}

/**
 * Get information about a channel
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Channel info result
 */
export async function getChannelInfo(args, bearerToken) {
	const { channel } = args;

	const params = new URLSearchParams({ channel });
	const response = await makeSlackRequest(`/conversations.info?${params}`, bearerToken);

	return {
		...response,
		channel: formatChannelResponse(response.channel),
		summary: `Retrieved info for channel: ${response.channel?.name || channel}`,
	};
}

/**
 * Join a channel
 * @param {Object} args - Join arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Join result
 */
export async function joinChannel(args, bearerToken) {
	const { channel } = args;

	const response = await makeSlackRequest('/conversations.join', bearerToken, {
		method: 'POST',
		body: { channel },
	});

	return {
		...response,
		channel: formatChannelResponse(response.channel),
		summary: `Joined channel: ${response.channel?.name || channel}`,
	};
}

/**
 * Leave a channel
 * @param {Object} args - Leave arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Leave result
 */
export async function leaveChannel(args, bearerToken) {
	const { channel } = args;

	const response = await makeSlackRequest('/conversations.leave', bearerToken, {
		method: 'POST',
		body: { channel },
	});

	return {
		...response,
		summary: `Left channel: ${channel}`,
	};
}