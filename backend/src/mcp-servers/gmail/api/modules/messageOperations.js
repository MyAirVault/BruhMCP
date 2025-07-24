/**
 * Gmail Message Operations
 * Core message handling functionality for Gmail API
 */

import { makeGmailRequest } from './requestHandler.js';
import { formatEmailResponse, formatMessageResponse } from '../../utils/gmailFormatting.js';

/**
 * @typedef {Object} SendEmailArgs
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} body - Email body content
 * @property {string} [cc] - CC recipients
 * @property {string} [bcc] - BCC recipients
 * @property {string} [format] - Email format (text|html)
 */

/**
 * @typedef {Object} FetchEmailsArgs
 * @property {string} [query] - Search query
 * @property {number} [maxResults] - Maximum results to return
 * @property {string[]} [labelIds] - Label IDs to filter by
 * @property {boolean} [includeSpamTrash] - Include spam/trash messages
 */

/**
 * @typedef {Object} FetchMessageByIdArgs
 * @property {string} messageId - Message ID to fetch
 * @property {string} [format] - Message format
 */

/**
 * @typedef {Object} ReplyToEmailArgs
 * @property {string} threadId - Thread ID to reply to
 * @property {string} body - Reply body content
 * @property {string} [subject] - Reply subject (auto-generated if empty)
 * @property {string} [format] - Email format (text|html)
 */

/**
 * @typedef {Object} MessageIdArgs
 * @property {string} messageId - Message ID
 */

/**
 * @typedef {Object} SearchEmailsArgs
 * @property {string} query - Search query string
 * @property {number} [maxResults] - Maximum results to return
 * @property {string} [newerThan] - Filter emails newer than date
 * @property {string} [olderThan] - Filter emails older than date
 */

/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {Object} payload - Message payload
 * @property {Array<{name: string, value: string}>} payload.headers - Message headers
 */

/**
 * @typedef {Object} GmailThread
 * @property {GmailMessage[]} messages - Messages in thread
 */

/**
 * @typedef {Object} GmailListResponse
 * @property {Array<{id: string, threadId: string}>} [messages] - Message list
 * @property {number} [resultSizeEstimate] - Estimated result count
 */

/**
 * @typedef {Object} GmailSendResponse
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 */

/**
 * @typedef {Object} FormattedMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} subject - Subject
 * @property {string} from - From address
 * @property {string} to - To address
 * @property {string} date - Date
 * @property {string} snippet - Message snippet
 * @property {string} body - Message body
 * @property {string[]} labelIds - Label IDs
 * @property {string} messageId - Message ID header
 * @property {number} sizeEstimate - Size estimate
 * @property {string} raw - Raw availability
 * @property {Array<Object>} attachments - Attachments
 * @property {boolean} hasAttachments - Has attachments flag
 */

/**
 * @typedef {Object} EmailResponse
 * @property {string} action - Action performed
 * @property {string} [messageId] - Message ID
 * @property {string} [threadId] - Thread ID
 * @property {string} [to] - Recipient
 * @property {string} [subject] - Subject
 * @property {string} timestamp - Timestamp
 * @property {number} [count] - Count of messages
 * @property {number} [totalEstimate] - Total estimate
 * @property {FormattedMessage[]} [messages] - Array of messages
 * @property {string} [query] - Search query
 */

/**
 * Send an email
 * @param {SendEmailArgs} args - Email arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Send result
 */
export async function sendEmail(args, bearerToken) {
	const { to, subject, body, cc = '', bcc = '', format = 'text' } = args;

	// Create email message in RFC 2822 format
	let message = `To: ${to}\r\n`;
	message += `Subject: ${subject}\r\n`;

	if (cc) {
		message += `Cc: ${cc}\r\n`;
	}

	if (bcc) {
		message += `Bcc: ${bcc}\r\n`;
	}

	if (format === 'html') {
		message += `Content-Type: text/html; charset=UTF-8\r\n`;
	} else {
		message += `Content-Type: text/plain; charset=UTF-8\r\n`;
	}

	message += `\r\n${body}`;

	// Encode message in base64url format
	const encodedMessage = Buffer.from(message)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	/** @type {GmailSendResponse} */
	const result = /** @type {GmailSendResponse} */ (await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
		},
	}));

	return formatEmailResponse({
		action: 'sent',
		messageId: result.id,
		threadId: result.threadId,
		to,
		subject,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Fetch emails from Gmail
 * @param {FetchEmailsArgs} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Fetched emails
 */
export async function fetchEmails(args, bearerToken) {
	const { query = '', maxResults = 10, labelIds = [], includeSpamTrash = false } = args;

	let queryParams = new URLSearchParams({
		maxResults: Math.min(maxResults, 500).toString(),
		includeSpamTrash: includeSpamTrash.toString(),
	});

	if (query) {
		queryParams.append('q', query);
	}

	if (labelIds.length > 0) {
		labelIds.forEach(labelId => queryParams.append('labelIds', labelId));
	}

	/** @type {GmailListResponse} */
	const result = /** @type {GmailListResponse} */ (await makeGmailRequest(`/users/me/messages?${queryParams}`, bearerToken));

	if (!result.messages || result.messages.length === 0) {
		return formatEmailResponse({
			action: 'fetch',
			count: 0,
			messages: [],
			query: query || 'all emails',
		});
	}

	// Fetch full details for each message
	const messages = await Promise.all(
		(result.messages || []).slice(0, maxResults).map(async (/** @type {{id: string, threadId: string}} */ msg) => {
			/** @type {GmailMessage} */
			const fullMessage = /** @type {GmailMessage} */ (await makeGmailRequest(`/users/me/messages/${msg.id}`, bearerToken));
			return formatMessageResponse(fullMessage);
		})
	);

	return formatEmailResponse({
		action: 'fetch',
		count: messages.length,
		totalEstimate: result.resultSizeEstimate || messages.length,
		messages,
		query: query || 'all emails',
	});
}

/**
 * Fetch a specific message by ID
 * @param {FetchMessageByIdArgs} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<FormattedMessage>} Message details
 */
export async function fetchMessageById(args, bearerToken) {
	const { messageId, format = 'full' } = args;

	const queryParams = new URLSearchParams({ format });
	/** @type {GmailMessage} */
	const result = /** @type {GmailMessage} */ (await makeGmailRequest(`/users/me/messages/${messageId}?${queryParams}`, bearerToken));

	return /** @type {FormattedMessage} */ (formatMessageResponse(result));
}

/**
 * Reply to an email thread
 * @param {ReplyToEmailArgs} args - Reply arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Reply result
 */
export async function replyToEmail(args, bearerToken) {
	const { threadId, body, subject = '', format = 'text' } = args;

	// Get the original thread to extract reply information
	/** @type {GmailThread} */
	const thread = /** @type {GmailThread} */ (await makeGmailRequest(`/users/me/threads/${threadId}`, bearerToken));
	const originalMessage = thread.messages[thread.messages.length - 1];

	// Extract original sender for reply
	const originalFrom = originalMessage.payload.headers.find(h => h.name === 'From')?.value || '';
	const originalSubject = originalMessage.payload.headers.find(h => h.name === 'Subject')?.value || '';

	const replySubject = subject || (originalSubject.startsWith('Re: ') ? originalSubject : `Re: ${originalSubject}`);

	// Create reply message
	let message = `To: ${originalFrom}\r\n`;
	message += `Subject: ${replySubject}\r\n`;
	message += `In-Reply-To: ${originalMessage.id}\r\n`;
	message += `References: ${originalMessage.id}\r\n`;

	if (format === 'html') {
		message += `Content-Type: text/html; charset=UTF-8\r\n`;
	} else {
		message += `Content-Type: text/plain; charset=UTF-8\r\n`;
	}

	message += `\r\n${body}`;

	// Encode message in base64url format
	const encodedMessage = Buffer.from(message)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	/** @type {GmailSendResponse} */
	const result = /** @type {GmailSendResponse} */ (await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
			threadId: threadId,
		},
	}));

	return formatEmailResponse({
		action: 'replied',
		messageId: result.id,
		threadId: result.threadId,
		subject: replySubject,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Delete a message permanently
 * @param {MessageIdArgs} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Delete result
 */
export async function deleteMessage(args, bearerToken) {
	const { messageId } = args;

	await makeGmailRequest(`/users/me/messages/${messageId}`, bearerToken, {
		method: 'DELETE',
	});

	return formatEmailResponse({
		action: 'deleted',
		messageId,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Move message to trash
 * @param {MessageIdArgs} args - Trash arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Trash result
 */
export async function moveToTrash(args, bearerToken) {
	const { messageId } = args;

	/** @type {GmailSendResponse} */
	const result = /** @type {GmailSendResponse} */ (await makeGmailRequest(`/users/me/messages/${messageId}/trash`, bearerToken, {
		method: 'POST',
	}));

	return formatEmailResponse({
		action: 'moved_to_trash',
		messageId: result.id,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Search emails with advanced query
 * @param {SearchEmailsArgs} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Search results
 */
export async function searchEmails(args, bearerToken) {
	const { query, maxResults = 50, newerThan = '', olderThan = '' } = args;

	let searchQuery = query;

	if (newerThan) {
		searchQuery += ` after:${newerThan}`;
	}

	if (olderThan) {
		searchQuery += ` before:${olderThan}`;
	}

	return await fetchEmails(
		{
			query: searchQuery,
			maxResults,
			labelIds: [],
			includeSpamTrash: false,
		},
		bearerToken
	);
}