// @ts-check

/**
 * Gmail Draft Operations
 * Draft management functionality for Gmail API
 */

import { makeGmailRequest } from './requestHandler.js';
import { formatEmailResponse, formatDraftResponse } from '../../utils/gmailFormatting.js';

/**
 * @typedef {Object} GmailDraftResponse
 * @property {string} id - Draft ID
 * @property {GmailMessage} message - Draft message object
 */

/**
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string} snippet - Message snippet
 * @property {string} internalDate - Internal date timestamp
 */

/**
 * @typedef {Object} GmailDraftListResponse
 * @property {GmailDraft[]} [drafts] - Array of draft objects
 * @property {string} [nextPageToken] - Token for next page
 */

/**
 * @typedef {Object} GmailDraft
 * @property {string} id - Draft ID
 * @property {GmailMessage} message - Message object
 */

/**
 * @typedef {Object} GmailSendResponse
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 */

/**
 * @typedef {Object} CreateDraftArgs
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} body - Email body content
 * @property {string} [cc] - CC recipients
 * @property {string} [bcc] - BCC recipients
 * @property {string} [format] - Email format (text|html)
 */

/**
 * @typedef {Object} SendDraftArgs
 * @property {string} draftId - Draft ID to send
 */

/**
 * @typedef {Object} ListDraftsArgs
 * @property {number} [maxResults] - Maximum results to return
 * @property {string} [query] - Search query for drafts
 */

/**
 * Create an email draft
 * @param {CreateDraftArgs} args - Draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Draft creation result
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
		draftId: /** @type {any} */ (result).id,
		messageId: /** @type {any} */ (result).message.id,
		to,
		subject,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Send a draft email
 * @param {SendDraftArgs} args - Send draft arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Send result
 */
export async function sendDraft(args, bearerToken) {
	const { draftId } = args;

	const result = await makeGmailRequest(`/users/me/drafts/${draftId}/send`, bearerToken, {
		method: 'POST',
		body: {},
	});

	return formatEmailResponse({
		action: 'draft_sent',
		messageId: /** @type {any} */ (result).id,
		threadId: /** @type {any} */ (result).threadId,
		draftId,
		timestamp: new Date().toISOString(),
	});
}

/**
 * List email drafts
 * @param {ListDraftsArgs} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Drafts list
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

	if (!(/** @type {any} */ (result)).drafts || (/** @type {any} */ (result)).drafts.length === 0) {
		return formatDraftResponse({
			action: 'list',
			count: 0,
			drafts: [],
		});
	}

	const drafts = (/** @type {any} */ (result)).drafts.map(/** @param {GmailDraft} draft */ draft => ({
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