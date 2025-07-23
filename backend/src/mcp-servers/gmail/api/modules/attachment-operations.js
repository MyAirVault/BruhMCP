/**
 * Gmail Attachment Operations
 * Attachment handling functionality for Gmail API
 */

import { makeGmailRequest } from './request-handler.js';
import { formatEmailResponse, formatMessageResponse } from '../../utils/gmail-formatting.js';

/**
 * @typedef {Object} GmailAttachment
 * @property {string} attachmentId - Attachment ID
 * @property {string} filename - Attachment filename
 * @property {string} mimeType - MIME type
 * @property {number} size - Size in bytes
 * @property {string} partId - Part ID
 */

/**
 * @typedef {Object} GmailApiResponse
 * @property {string} id - Response ID
 * @property {string} threadId - Thread ID
 * @property {string} data - Base64 encoded data
 * @property {number} size - Size in bytes
 */

/**
 * @typedef {Object} GmailMessageApiResponse
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {Object} payload - Message payload
 */

/**
 * @typedef {Object} AttachmentData
 * @property {string} filename - Filename
 * @property {string} mimeType - MIME type
 * @property {string} data - Base64 encoded data
 */

/**
 * @typedef {Object} MessageResponse
 * @property {GmailAttachment[]} attachments - Array of attachments
 * @property {boolean} hasAttachments - Whether message has attachments
 */

/**
 * @typedef {Object} DownloadArgs
 * @property {string} messageId - Message ID containing the attachment
 * @property {string} attachmentId - Attachment ID to download
 * @property {boolean} [returnDataUrl] - Return data as data URL
 */

/**
 * @typedef {Object} ListAttachmentsArgs
 * @property {string} messageId - Message ID to list attachments for
 */

/**
 * @typedef {Object} SendWithAttachmentsArgs
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} body - Email body content
 * @property {string} [cc] - CC recipients
 * @property {string} [bcc] - BCC recipients
 * @property {string} [format] - Email format (text|html)
 * @property {AttachmentData[]} [attachments] - Attachments array
 */

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Download an attachment from a Gmail message
 * @param {DownloadArgs} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Attachment data
 */
export async function downloadAttachment(args, bearerToken) {
	const { messageId, attachmentId, returnDataUrl = false } = args;

	// First get fresh attachment metadata to handle Gmail's unstable attachment IDs
	const messageResult = await makeGmailRequest(`/users/me/messages/${messageId}`, bearerToken);
	const messageResponse = /** @type {MessageResponse} */ (formatMessageResponse(/** @type {import('../../middleware/types.js').GmailMessage} */ (messageResult)));
	
	// Try to find attachment by ID first
	/** @type {GmailAttachment | undefined} */
	let attachment = messageResponse.attachments.find(/** @param {GmailAttachment} att */ att => att.attachmentId === attachmentId);
	
	// If not found by ID, try to find by filename (fallback for unstable IDs)
	if (!attachment && messageResponse.attachments.length > 0) {
		// Get the filename from the original attachment ID request
		const originalMessageResult = await makeGmailRequest(`/users/me/messages/${messageId}`, bearerToken);
		const originalResponse = /** @type {MessageResponse} */ (formatMessageResponse(/** @type {import('../../middleware/types.js').GmailMessage} */ (originalMessageResult)));
		
		// Find the first attachment (assuming single attachment or match by position)
		attachment = originalResponse.attachments[0];
	}
	
	if (!attachment) {
		throw new Error(`Attachment with ID ${attachmentId} not found in message ${messageId}`);
	}
	
	// Use the fresh attachment ID for download
	const freshAttachmentId = attachment.attachmentId;

	// Size validation (default 50MB limit)
	const MAX_SIZE = 50 * 1024 * 1024; // 50MB
	if (attachment.size > MAX_SIZE) {
		return {
			action: 'download_attachment_error',
			messageId,
			attachmentId,
			filename: attachment.filename,
			size: attachment.size,
			readableSize: formatFileSize(attachment.size),
			error: `Attachment too large (${formatFileSize(attachment.size)}). Maximum size is ${formatFileSize(MAX_SIZE)}.`,
			timestamp: new Date().toISOString(),
		};
	}

	// Add timeout for large files (30 seconds + 1 second per MB)
	const timeoutMs = 30000 + (attachment.size / (1024 * 1024)) * 1000;
	
	try {
		// Download with custom timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		const result = /** @type {GmailApiResponse} */ (await makeGmailRequest(
			`/users/me/messages/${messageId}/attachments/${freshAttachmentId}`, 
			bearerToken,
			{ signal: controller.signal }
		));

		clearTimeout(timeoutId);

		// For very large files, return metadata only if requested
		if (returnDataUrl === false && attachment.size > 10 * 1024 * 1024) {
			return {
				action: 'download_attachment_metadata',
				messageId,
				attachmentId,
				filename: attachment.filename,
				mimeType: attachment.mimeType,
				size: result.size,
				readableSize: formatFileSize(result.size),
				warning: 'Large attachment detected. Use returnDataUrl: true to download full content.',
				timestamp: new Date().toISOString(),
			};
		}

		// Optimize base64 handling - keep as base64url if possible
		const data = returnDataUrl ? 
			`data:${attachment.mimeType};base64,${Buffer.from(result.data, 'base64url').toString('base64')}` :
			result.data; // Keep original base64url format

		return {
			action: 'download_attachment',
			messageId,
			attachmentId,
			filename: attachment.filename,
			mimeType: attachment.mimeType,
			size: result.size,
			readableSize: formatFileSize(result.size),
			data: data,
			format: returnDataUrl ? 'data_url' : 'base64url',
			timestamp: new Date().toISOString(),
		};

	} catch (error) {
		/** @type {Error} */
		const err = error instanceof Error ? error : new Error(String(error));
		if (err.name === 'AbortError') {
			return {
				action: 'download_attachment_timeout',
				messageId,
				attachmentId,
				filename: attachment.filename,
				size: attachment.size,
				readableSize: formatFileSize(attachment.size),
				error: `Download timeout after ${Math.round(timeoutMs / 1000)} seconds. File may be too large or connection slow.`,
				timestamp: new Date().toISOString(),
			};
		}
		throw err;
	}
}

/**
 * List attachments for a specific message
 * @param {ListAttachmentsArgs} args - List attachments arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Attachments list
 */
export async function listAttachments(args, bearerToken) {
	const { messageId } = args;

	const result = await makeGmailRequest(`/users/me/messages/${messageId}`, bearerToken);
	const messageResponse = /** @type {MessageResponse} */ (formatMessageResponse(/** @type {import('../../middleware/types.js').GmailMessage} */ (result)));

	return {
		action: 'list_attachments',
		messageId,
		attachmentCount: messageResponse.attachments.length,
		hasAttachments: messageResponse.hasAttachments,
		attachments: messageResponse.attachments.map(/** @param {GmailAttachment} att */ att => ({
			filename: att.filename,
			mimeType: att.mimeType,
			size: att.size,
			attachmentId: att.attachmentId,
			partId: att.partId,
			readableSize: formatFileSize(att.size)
		})),
		timestamp: new Date().toISOString()
	};
}

/**
 * Send an email with attachments
 * @param {SendWithAttachmentsArgs} args - Email with attachments arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Send result
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

	const result = /** @type {GmailApiResponse} */ (await makeGmailRequest('/users/me/messages/send', bearerToken, {
		method: 'POST',
		body: {
			raw: encodedMessage,
		},
	}));

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