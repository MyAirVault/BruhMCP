/**
 * Gmail API Integration
 * Core Gmail API operations using OAuth Bearer tokens
 */

import { formatEmailResponse, formatMessageResponse, formatDraftResponse } from '../utils/gmail-formatting.js';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * Make authenticated request to Gmail API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeGmailRequest(endpoint, bearerToken, options = {}) {
	const url = `${GMAIL_API_BASE}${endpoint}`;

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${bearerToken}`,
			'Content-Type': 'application/json',
			...options.headers,
		},
		...options,
	};

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Gmail API Request: ${requestOptions.method} ${url}`);

	const response = await fetch(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		let errorMessage = `Gmail API error: ${response.status} ${response.statusText}`;

		try {
			const errorData = JSON.parse(errorText);
			if (errorData.error && errorData.error.message) {
				errorMessage = `Gmail API error: ${errorData.error.message}`;
			}
		} catch (parseError) {
			// Use the default error message if JSON parsing fails
		}

		throw new Error(errorMessage);
	}

	const data = await response.json();
	console.log(`✅ Gmail API Response: ${response.status}`);

	return data;
}

/**
 * Send an email
 * @param {Object} args - Email arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
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

	const result = await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
		},
	});

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
 * @param {Object} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Fetched emails
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

	const result = await makeGmailRequest(`/users/me/messages?${queryParams}`, bearerToken);

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
		result.messages.slice(0, maxResults).map(async msg => {
			const fullMessage = await makeGmailRequest(`/users/me/messages/${msg.id}`, bearerToken);
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
 * @param {Object} args - Fetch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Message details
 */
export async function fetchMessageById(args, bearerToken) {
	const { messageId, format = 'full' } = args;

	const queryParams = new URLSearchParams({ format });
	const result = await makeGmailRequest(`/users/me/messages/${messageId}?${queryParams}`, bearerToken);

	return formatMessageResponse(result);
}

/**
 * Reply to an email thread
 * @param {Object} args - Reply arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Reply result
 */
export async function replyToEmail(args, bearerToken) {
	const { threadId, body, subject = '', format = 'text' } = args;

	// Get the original thread to extract reply information
	const thread = await makeGmailRequest(`/users/me/threads/${threadId}`, bearerToken);
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

	const result = await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
			threadId: threadId,
		},
	});

	return formatEmailResponse({
		action: 'replied',
		messageId: result.id,
		threadId: result.threadId,
		subject: replySubject,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Create an email draft
 * @param {Object} args - Draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Draft creation result
 */
export async function createDraft(args, bearerToken) {
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

	const result = await makeGmailRequest('/users/me/drafts', bearerToken, {
		method: 'POST',
		body: {
			message: {
				raw: encodedMessage,
			},
		},
	});

	return formatDraftResponse({
		action: 'created',
		draftId: result.id,
		messageId: result.message.id,
		to,
		subject,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Send a draft email
 * @param {Object} args - Send draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export async function sendDraft(args, bearerToken) {
	const { draftId } = args;

	const result = await makeGmailRequest(`/users/me/drafts/${draftId}/send`, bearerToken, {
		method: 'POST',
		body: {},
	});

	return formatEmailResponse({
		action: 'draft_sent',
		messageId: result.id,
		threadId: result.threadId,
		draftId,
		timestamp: new Date().toISOString(),
	});
}

/**
 * List email drafts
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Drafts list
 */
export async function listDrafts(args, bearerToken) {
	const { maxResults = 100, query = '' } = args;

	let queryParams = new URLSearchParams({
		maxResults: Math.min(maxResults, 500).toString(),
	});

	if (query) {
		queryParams.append('q', query);
	}

	const result = await makeGmailRequest(`/users/me/drafts?${queryParams}`, bearerToken);

	if (!result.drafts || result.drafts.length === 0) {
		return formatDraftResponse({
			action: 'list',
			count: 0,
			drafts: [],
		});
	}

	const drafts = result.drafts.map(draft => ({
		draftId: draft.id,
		messageId: draft.message.id,
		snippet: draft.message.snippet || '',
		timestamp: new Date(parseInt(draft.message.internalDate)).toISOString(),
	}));

	return formatDraftResponse({
		action: 'list',
		count: drafts.length,
		drafts,
	});
}

/**
 * Delete a message permanently
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
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
 * @param {Object} args - Trash arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Trash result
 */
export async function moveToTrash(args, bearerToken) {
	const { messageId } = args;

	const result = await makeGmailRequest(`/users/me/messages/${messageId}/trash`, bearerToken, {
		method: 'POST',
	});

	return formatEmailResponse({
		action: 'moved_to_trash',
		messageId: result.id,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Search emails with advanced query
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
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

/**
 * Get an email thread
 * @param {Object} args - Thread arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Thread details
 */
export async function getThread(args, bearerToken) {
	const { threadId, format = 'full' } = args;

	const queryParams = new URLSearchParams({ format });
	const result = await makeGmailRequest(`/users/me/threads/${threadId}?${queryParams}`, bearerToken);

	const messages = result.messages.map(msg => formatMessageResponse(msg));

	return {
		threadId: result.id,
		messageCount: messages.length,
		snippet: result.snippet || '',
		messages,
	};
}

/**
 * Mark messages as read
 * @param {Object} args - Mark read arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Mark read result
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
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Mark unread result
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

/**
 * Download an attachment from a Gmail message
 * @param {Object} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Attachment data
 */
export async function downloadAttachment(args, bearerToken) {
	const { messageId, attachmentId } = args;

	const result = await makeGmailRequest(`/users/me/messages/${messageId}/attachments/${attachmentId}`, bearerToken);

	// Decode the base64url encoded attachment data
	const decodedData = Buffer.from(result.data, 'base64url');

	return {
		action: 'download_attachment',
		messageId,
		attachmentId,
		size: result.size,
		data: decodedData.toString('base64'),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Send an email with attachments
 * @param {Object} args - Email with attachments arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Send result
 */
export async function sendEmailWithAttachments(args, bearerToken) {
	const { to, subject, body, cc = '', bcc = '', format = 'text', attachments = [] } = args;

	// Create multipart message boundary
	const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;

	// Create email headers
	let message = `To: ${to}\r\n`;
	message += `Subject: ${subject}\r\n`;

	if (cc) {
		message += `Cc: ${cc}\r\n`;
	}

	if (bcc) {
		message += `Bcc: ${bcc}\r\n`;
	}

	message += `MIME-Version: 1.0\r\n`;
	message += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

	// Add text/html body part
	message += `--${boundary}\r\n`;
	if (format === 'html') {
		message += `Content-Type: text/html; charset=UTF-8\r\n`;
	} else {
		message += `Content-Type: text/plain; charset=UTF-8\r\n`;
	}
	message += `\r\n${body}\r\n\r\n`;

	// Add attachments
	for (const attachment of attachments) {
		const { filename, mimeType, data } = attachment;

		message += `--${boundary}\r\n`;
		message += `Content-Type: ${mimeType}\r\n`;
		message += `Content-Disposition: attachment; filename="${filename}"\r\n`;
		message += `Content-Transfer-Encoding: base64\r\n`;
		message += `\r\n${data}\r\n\r\n`;
	}

	// Close multipart message
	message += `--${boundary}--\r\n`;

	// Encode message in base64url format
	const encodedMessage = Buffer.from(message)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

	const result = await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
		},
	});

	return formatEmailResponse({
		action: 'sent_with_attachments',
		messageId: result.id,
		threadId: result.threadId,
		to,
		subject,
		attachmentCount: attachments.length,
		timestamp: new Date().toISOString(),
	});
}
