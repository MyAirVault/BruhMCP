/**
 * Gmail Label Operations
 * Label management functionality for Gmail API
 */

import { makeGmailRequest } from './request-handler.js';
import { formatEmailResponse } from '../../utils/gmail-formatting.js';

/**
 * Mark messages as read
 * @param {Object} args - Mark read arguments
 * @param {string[]} args.messageIds - Array of message IDs to mark as read
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Mark read result
 */
export async function markAsRead(args, bearerToken) {
	const { messageIds } = args;

	const results = await Promise.all(
		messageIds.map(async messageId => {
			await makeGmailRequest(`/users/me/messages/${messageId}/modify`, bearerToken, {
				method: 'POST',
				body: {
					removeLabelIds: ['UNREAD'],
				},
			});
			return messageId;
		})
	);

	return formatEmailResponse({
		action: 'marked_as_read',
		messageIds: results,
		count: results.length,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Mark messages as unread
 * @param {Object} args - Mark unread arguments
 * @param {string[]} args.messageIds - Array of message IDs to mark as unread
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Mark unread result
 */
export async function markAsUnread(args, bearerToken) {
	const { messageIds } = args;

	const results = await Promise.all(
		messageIds.map(async messageId => {
			await makeGmailRequest(`/users/me/messages/${messageId}/modify`, bearerToken, {
				method: 'POST',
				body: {
					addLabelIds: ['UNREAD'],
				},
			});
			return messageId;
		})
	);

	return formatEmailResponse({
		action: 'marked_as_unread',
		messageIds: results,
		count: results.length,
		timestamp: new Date().toISOString(),
	});
}