// @ts-check

/**
 * Gmail Thread Operations
 * Thread management functionality for Gmail API
 */

import { makeGmailRequest } from './request-handler.js';
import { formatMessageResponse } from '../../utils/gmail-formatting.js';

/**
 * @typedef {Object} GmailMessagePayload
 * @property {string} [partId] - Part ID
 * @property {string} [mimeType] - MIME type
 * @property {string} [filename] - Filename
 * @property {Object} [headers] - Message headers
 * @property {Object} [body] - Message body
 * @property {GmailMessagePayload[]} [parts] - Message parts
 */

/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} snippet - Message snippet
 * @property {string} internalDate - Internal date timestamp
 * @property {GmailMessagePayload} payload - Message payload
 * @property {string[]} labelIds - Label IDs
 * @property {number} sizeEstimate - Size estimate
 */

/**
 * @typedef {Object} GmailThreadResponse
 * @property {string} id - Thread ID
 * @property {string} snippet - Thread snippet
 * @property {GmailMessage[]} messages - Array of messages in thread
 * @property {number} historyId - History ID
 */

/**
 * @typedef {Object} GetThreadArgs
 * @property {string} threadId - Thread ID to fetch
 * @property {string} [format] - Thread format
 */

/**
 * @typedef {Object} AttachmentInfo
 * @property {string} filename - Attachment filename
 * @property {string} mimeType - MIME type
 * @property {number} size - File size
 * @property {string} attachmentId - Attachment ID
 * @property {string} partId - Part ID
 */

/**
 * @typedef {Object} FormattedMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} subject - Message subject
 * @property {string} from - Sender
 * @property {string} to - Recipient
 * @property {string} date - Date
 * @property {string} snippet - Message snippet
 * @property {string} body - Message body
 * @property {string[]} labelIds - Label IDs
 * @property {string} messageId - Message ID header
 * @property {number} sizeEstimate - Size estimate
 * @property {string} raw - Raw message availability
 * @property {AttachmentInfo[]} attachments - Attachments
 * @property {boolean} hasAttachments - Has attachments flag
 */

/**
 * @typedef {Object} ThreadResult
 * @property {string} threadId - Thread ID
 * @property {number} messageCount - Number of messages in thread
 * @property {string} snippet - Thread snippet
 * @property {FormattedMessage[]} messages - Formatted messages
 */

/**
 * Get an email thread
 * @param {GetThreadArgs} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<ThreadResult>} Thread details
 */
export async function getThread(args, bearerToken) {
	const { threadId, format = 'full' } = args;

	const queryParams = new URLSearchParams({ format });
	const result = await makeGmailRequest(`/users/me/threads/${threadId}?${queryParams}`, bearerToken);

	// Type assertion to properly typed Gmail thread response
	const threadResponse = /** @type {GmailThreadResponse} */ (result);
	const messages = threadResponse.messages.map(/** @param {GmailMessage} msg */ msg => 
		/** @type {FormattedMessage} */ (formatMessageResponse(msg))
	);

	return {
		threadId: threadResponse.id,
		messageCount: messages.length,
		snippet: threadResponse.snippet || '',
		messages,
	};
}