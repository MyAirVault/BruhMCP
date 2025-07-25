/**
 * Slack message operations
 * Handles message sending, retrieving, updating, and deleting
 */

import { makeSlackRequest } from './requestHandler.js';
import { formatMessageResponse } from '../../utils/slackFormatting.js';

/**
 * @typedef {import('../../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('../../middleware/types.js').SlackBlock} SlackBlock
 * @typedef {import('../../middleware/types.js').SlackAttachment} SlackAttachment
 * @typedef {import('../../utils/messageFormatting.js').FormattedMessage} FormattedMessage
 */

/**
 * @typedef {Object} SendMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} [text] - Message text
 * @property {SlackBlock[]} [blocks] - Message blocks
 * @property {SlackAttachment[]} [attachments] - Message attachments
 * @property {string} [thread_ts] - Thread timestamp
 * @property {boolean} [reply_broadcast] - Whether to broadcast reply
 */

/**
 * @typedef {Object} GetMessagesArgs
 * @property {string} channel - Channel ID
 * @property {number} [count] - Number of messages to retrieve
 * @property {string} [latest] - Latest timestamp
 * @property {string} [oldest] - Oldest timestamp
 * @property {boolean} [inclusive] - Include messages with exact timestamps
 */

/**
 * @typedef {Object} GetThreadMessagesArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Thread timestamp
 * @property {number} [limit] - Number of messages to retrieve
 * @property {string} [cursor] - Pagination cursor
 */

/**
 * @typedef {Object} DeleteMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Message timestamp
 */

/**
 * @typedef {Object} UpdateMessageArgs
 * @property {string} channel - Channel ID
 * @property {string} ts - Message timestamp
 * @property {string} [text] - New message text
 * @property {SlackBlock[]} [blocks] - New message blocks
 * @property {SlackAttachment[]} [attachments] - New message attachments
 */

/**
 * @typedef {Object} SlackApiResponse
 * @property {boolean} ok - Whether request was successful
 * @property {string} [error] - Error message if not ok
 * @property {SlackMessage} [message] - Message data
 * @property {SlackMessage[]} [messages] - Array of messages
 * @property {boolean} [has_more] - Whether more results available
 * @property {string} [response_metadata] - Response metadata
 */

/**
 * @typedef {Object} MessageOperationResult
 * @property {boolean} [ok] - Whether operation was successful
 * @property {string} [error] - Error message if not ok
 * @property {FormattedMessage|null} [message] - Formatted message data
 * @property {FormattedMessage[]} [messages] - Array of formatted messages
 * @property {string} summary - Operation summary
 * @property {boolean} [has_more] - Whether more results available
 * @property {string} [response_metadata] - Response metadata
 * @property {string} [channel] - Channel information
 * @property {string} [ts] - Timestamp information
 */

/**
 * Send a message to a channel
 * @param {SendMessageArgs} args - Message arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Send result
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
	Object.keys(body).forEach(key => {
		if (body[/** @type {keyof typeof body} */ (key)] === undefined) {
			delete body[/** @type {keyof typeof body} */ (key)];
		}
	});

	const response = /** @type {SlackApiResponse} */ (await makeSlackRequest('/chat.postMessage', bearerToken, {
		method: 'POST',
		body,
	}));

	return {
		...response,
		message: response.message ? formatMessageResponse(response.message) : null,
		summary: `Message sent to ${channel}${thread_ts ? ' (in thread)' : ''}`,
	};
}

/**
 * Get messages from a channel
 * @param {GetMessagesArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Messages result
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

	const response = /** @type {SlackApiResponse} */ (await makeSlackRequest(`/conversations.history?${params}`, bearerToken));

	return {
		...response,
		messages: response.messages?.map(msg => formatMessageResponse(msg)).filter(msg => msg !== null) || [],
		summary: `Retrieved ${response.messages?.length || 0} messages from ${channel}`,
	};
}

/**
 * Get messages from a thread
 * @param {GetThreadMessagesArgs} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Thread messages result
 */
export async function getThreadMessages(args, bearerToken) {
	const { channel, ts, limit = 200, cursor } = args;

	const params = new URLSearchParams({
		channel,
		ts,
		limit: limit.toString(),
	});

	if (cursor) params.append('cursor', cursor);

	const response = /** @type {SlackApiResponse} */ (await makeSlackRequest(`/conversations.replies?${params}`, bearerToken));

	return {
		...response,
		messages: response.messages?.map(msg => formatMessageResponse(msg)).filter(msg => msg !== null) || [],
		summary: `Retrieved ${response.messages?.length || 0} messages from thread`,
	};
}

/**
 * Delete a message
 * @param {DeleteMessageArgs} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Delete result
 */
export async function deleteMessage(args, bearerToken) {
	const { channel, ts } = args;

	const response = /** @type {SlackApiResponse} */ (await makeSlackRequest('/chat.delete', bearerToken, {
		method: 'POST',
		body: { channel, ts },
	}));

	return {
		...response,
		summary: `Message deleted from ${channel}`,
	};
}

/**
 * Update a message
 * @param {UpdateMessageArgs} args - Update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<MessageOperationResult>} Update result
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
	Object.keys(body).forEach(key => {
		if (body[/** @type {keyof typeof body} */ (key)] === undefined) {
			delete body[/** @type {keyof typeof body} */ (key)];
		}
	});

	const response = /** @type {SlackApiResponse} */ (await makeSlackRequest('/chat.update', bearerToken, {
		method: 'POST',
		body,
	}));

	return {
		...response,
		message: response.message ? formatMessageResponse(response.message) : null,
		summary: `Message updated in ${channel}`,
	};
}