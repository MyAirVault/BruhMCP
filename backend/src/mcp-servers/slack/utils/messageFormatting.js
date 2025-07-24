/**
 * Message formatting utilities for Slack
 * Handles message, attachment, reaction, and file formatting
 */

import { debug } from './logger.js';

/**
 * @typedef {import('../middleware/types.js').SlackMessage} SlackMessage
 * @typedef {import('../middleware/types.js').SlackAttachment} SlackAttachment
 * @typedef {import('../middleware/types.js').SlackReaction} SlackReaction
 * @typedef {import('../middleware/types.js').SlackFile} SlackFile
 * @typedef {import('../middleware/types.js').SlackFileUploadResult} SlackFileUploadResult
 * @typedef {import('../middleware/types.js').SlackMessageEdit} SlackMessageEdit
 */

/**
 * Formatted message response object
 * @typedef {Object} FormattedMessage
 * @property {string} [ts] - Message timestamp
 * @property {string} [type] - Message type
 * @property {string} [text] - Message text
 * @property {string} [user] - User ID
 * @property {string} [channel] - Channel ID
 * @property {string|null} [timestamp] - ISO timestamp
 * @property {string} [thread_ts] - Thread timestamp
 * @property {number} [reply_count] - Reply count
 * @property {number} [reply_users_count] - Reply users count
 * @property {string} [latest_reply] - Latest reply timestamp
 * @property {string} [bot_id] - Bot ID
 * @property {string} [username] - Username
 * @property {FormattedAttachment[]} [attachments] - Attachments
 * @property {Object[]} [blocks] - Message blocks
 * @property {FormattedReaction[]} [reactions] - Reactions
 * @property {FormattedFile[]} [files] - Files
 * @property {FormattedMessageEdit} [edited] - Edit information
 */

/**
 * Formatted attachment object
 * @typedef {Object} FormattedAttachment
 * @property {string} [id] - Attachment ID
 * @property {string} [color] - Color
 * @property {string} [fallback] - Fallback text
 * @property {string} [title] - Title
 * @property {string} [title_link] - Title link
 * @property {string} [text] - Text
 * @property {string} [pretext] - Pretext
 * @property {string} [author_name] - Author name
 * @property {string} [author_link] - Author link
 * @property {string} [author_icon] - Author icon
 * @property {string} [image_url] - Image URL
 * @property {string} [thumb_url] - Thumbnail URL
 * @property {string} [footer] - Footer
 * @property {string} [footer_icon] - Footer icon
 * @property {number} [ts] - Timestamp
 * @property {Object[]} [fields] - Fields
 */

/**
 * Formatted reaction object
 * @typedef {Object} FormattedReaction
 * @property {string} [name] - Reaction name
 * @property {number} [count] - Count
 * @property {string[]} [users] - User IDs
 */

/**
 * Formatted file object
 * @typedef {Object} FormattedFile
 * @property {string} [id] - File ID
 * @property {string} [name] - Name
 * @property {string} [title] - Title
 * @property {string} [mimetype] - MIME type
 * @property {string} [filetype] - File type
 * @property {string} [pretty_type] - Pretty type
 * @property {string} [user] - User ID
 * @property {string} [mode] - Mode
 * @property {boolean} [editable] - Editable
 * @property {boolean} [is_external] - Is external
 * @property {string} [external_type] - External type
 * @property {number} [size] - Size
 * @property {string} [url_private] - Private URL
 * @property {string} [url_private_download] - Private download URL
 * @property {string} [thumb_64] - 64px thumbnail
 * @property {string} [thumb_80] - 80px thumbnail
 * @property {string} [thumb_160] - 160px thumbnail
 * @property {string} [thumb_360] - 360px thumbnail
 * @property {string} [thumb_480] - 480px thumbnail
 * @property {string} [thumb_720] - 720px thumbnail
 * @property {string} [thumb_800] - 800px thumbnail
 * @property {string} [thumb_960] - 960px thumbnail
 * @property {string} [thumb_1024] - 1024px thumbnail
 * @property {string} [permalink] - Permalink
 * @property {string} [permalink_public] - Public permalink
 * @property {number} [created] - Created timestamp
 * @property {number} [timestamp] - Timestamp
 */

/**
 * Formatted message edit object
 * @typedef {Object} FormattedMessageEdit
 * @property {string} [user] - User ID
 * @property {string} [ts] - Timestamp
 * @property {string} [timestamp] - ISO timestamp
 */

/**
 * Formatted file upload result object
 * @typedef {Object} FormattedFileUploadResult
 * @property {boolean} [ok] - Success status
 * @property {FormattedFile|null} [file] - File object
 * @property {string} [upload_time] - Upload time
 * @property {string} [warning] - Warning message
 */

/**
 * Format a Slack message response
 * @param {SlackMessage|Object|null} message - Raw Slack message object
 * @returns {FormattedMessage|null} Formatted message
 */
export function formatMessageResponse(message) {
	if (!message) return null;

	/** @type {FormattedMessage} */
	const formatted = {
		ts: message.ts,
		type: message.type,
		text: message.text,
		user: message.user,
		channel: message.channel,
		timestamp: message.ts ? new Date(parseFloat(message.ts) * 1000).toISOString() : null
	};

	// Add thread information if available
	if (message.thread_ts) {
		formatted.thread_ts = message.thread_ts;
		formatted.reply_count = message.reply_count;
		formatted.reply_users_count = message.reply_users_count;
		formatted.latest_reply = message.latest_reply;
	}

	// Add bot information if available
	if (message.bot_id) {
		formatted.bot_id = message.bot_id;
		formatted.username = message.username;
	}

	// Add attachments if available
	if (message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0) {
		formatted.attachments = message.attachments.map(formatAttachment).filter((/** @type {FormattedAttachment | null} */ attachment) => attachment !== null);
	}

	// Add blocks if available
	if (message.blocks && Array.isArray(message.blocks) && message.blocks.length > 0) {
		formatted.blocks = message.blocks;
	}

	// Add reactions if available
	if (message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0) {
		formatted.reactions = message.reactions.map(formatReaction).filter((/** @type {FormattedReaction | null} */ reaction) => reaction !== null);
	}

	// Add files if available
	if (message.files && Array.isArray(message.files) && message.files.length > 0) {
		formatted.files = message.files.map(formatFile).filter((/** @type {FormattedFile | null} */ file) => file !== null);
	}

	// Add edited information if available
	if (message.edited && message.edited.user && message.edited.ts) {
		formatted.edited = {
			user: message.edited.user,
			ts: message.edited.ts,
			timestamp: new Date(parseFloat(message.edited.ts) * 1000).toISOString()
		};
	}

	return formatted;
}

/**
 * Format a Slack attachment
 * @param {SlackAttachment} attachment - Raw Slack attachment object
 * @returns {FormattedAttachment|null} Formatted attachment
 */
export function formatAttachment(attachment) {
	if (!attachment) return null;

	return {
		id: attachment.id,
		color: attachment.color,
		fallback: attachment.fallback,
		title: attachment.title,
		title_link: attachment.title_link,
		text: attachment.text,
		pretext: attachment.pretext,
		author_name: attachment.author_name,
		author_link: attachment.author_link,
		author_icon: attachment.author_icon,
		image_url: attachment.image_url,
		thumb_url: attachment.thumb_url,
		footer: attachment.footer,
		footer_icon: attachment.footer_icon,
		ts: attachment.ts,
		fields: Array.isArray(attachment.fields) ? attachment.fields : []
	};
}

/**
 * Format a Slack reaction
 * @param {SlackReaction} reaction - Raw Slack reaction object
 * @returns {FormattedReaction|null} Formatted reaction
 */
export function formatReaction(reaction) {
	if (!reaction) return null;

	return {
		name: reaction.name,
		count: reaction.count,
		users: Array.isArray(reaction.users) ? reaction.users : []
	};
}

/**
 * Format a Slack file
 * @param {SlackFile} file - Raw Slack file object
 * @returns {FormattedFile|null} Formatted file
 */
export function formatFile(file) {
	if (!file) return null;

	return {
		id: file.id,
		name: file.name,
		title: file.title,
		mimetype: file.mimetype,
		filetype: file.filetype,
		pretty_type: file.pretty_type,
		user: file.user,
		mode: file.mode,
		editable: file.editable,
		is_external: file.is_external,
		external_type: file.external_type,
		size: file.size,
		url_private: file.url_private,
		url_private_download: file.url_private_download,
		thumb_64: file.thumb_64,
		thumb_80: file.thumb_80,
		thumb_160: file.thumb_160,
		thumb_360: file.thumb_360,
		thumb_480: file.thumb_480,
		thumb_720: file.thumb_720,
		thumb_800: file.thumb_800,
		thumb_960: file.thumb_960,
		thumb_1024: file.thumb_1024,
		permalink: file.permalink,
		permalink_public: file.permalink_public,
		created: file.created,
		timestamp: file.timestamp
	};
}

/**
 * Format file upload progress
 * @param {SlackFileUploadResult} uploadResult - File upload result
 * @returns {FormattedFileUploadResult|null} Formatted upload result
 */
export function formatFileUploadResult(uploadResult) {
	if (!uploadResult) return null;
	
	debug('Formatting file upload result', { fileId: uploadResult.file?.id });
	
	return {
		ok: uploadResult.ok,
		file: uploadResult.file ? formatFile(uploadResult.file) : null,
		upload_time: new Date().toISOString(),
		warning: uploadResult.warning
	};
}