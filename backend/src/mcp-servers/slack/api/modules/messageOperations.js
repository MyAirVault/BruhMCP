/**
 * Slack message operations
 * Handles message sending, retrieving, updating, and deleting
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatMessageResponse } from '../../utils/slackFormatting.js';

/**
 * Send a message to a channel
 * @param {Object} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Send result
 */
export async function sendMessage(args, bearerToken) {
	const { channel, text, blocks, attachments, thread_ts, reply_broadcast = false } = args;

	const body = {
		channel,
		text,
		blocks,
		attachments,
		thread_ts: thread_ts || undefined,
		reply_broadcast: reply_broadcast && thread_ts ? true : undefined,
	};

	// Remove undefined values
	Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

	const response = await makeSlackRequest('/chat.postMessage', bearerToken, {
		method: 'POST',
		body,
	});

	return {
		...response,
		message: formatMessageResponse(response.message),
		summary: `Message sent to ${channel}${thread_ts ? ' (in thread)' : ''}`,
	};
}

/**
 * Get messages from a channel
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Messages result
 */
export async function getMessages(args, bearerToken) {
	const { channel, count = 100, latest, oldest, inclusive = false } = args;

	const params = new URLSearchParams({
		channel,
		limit: count.toString(),
		inclusive: inclusive.toString(),
	});

	if (latest) params.append('latest', latest);
	if (oldest) params.append('oldest', oldest);

	const response = await makeSlackRequest(`/conversations.history?${params}`, bearerToken);

	return {
		...response,
		messages: response.messages?.map(formatMessageResponse) || [],
		summary: `Retrieved ${response.messages?.length || 0} messages from ${channel}`,
	};
}

/**
 * Get messages from a thread
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Thread messages result
 */
export async function getThreadMessages(args, bearerToken) {
	const { channel, ts, limit = 200, cursor } = args;

	const params = new URLSearchParams({
		channel,
		ts,
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	const response = await makeSlackRequest(`/conversations.replies?${params}`, bearerToken);

	return {
		...response,
		messages: response.messages?.map(formatMessageResponse) || [],
		summary: `Retrieved ${response.messages?.length || 0} messages from thread`,
	};
}

/**
 * Delete a message
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Delete result
 */
export async function deleteMessage(args, bearerToken) {
	const { channel, ts } = args;

	const response = await makeSlackRequest('/chat.delete', bearerToken, {
		method: 'POST',
		body: { channel, ts },
	});

	return {
		...response,
		summary: `Message deleted from ${channel}`,
	};
}

/**
 * Update a message
 * @param {Object} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Update result
 */
export async function updateMessage(args, bearerToken) {
	const { channel, ts, text, blocks, attachments } = args;

	const body = {
		channel,
		ts,
		text,
		blocks,
		attachments,
	};

	// Remove undefined values
	Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

	const response = await makeSlackRequest('/chat.update', bearerToken, {
		method: 'POST',
		body,
	});

	return {
		...response,
		message: formatMessageResponse(response.message),
		summary: `Message updated in ${channel}`,
	};
}