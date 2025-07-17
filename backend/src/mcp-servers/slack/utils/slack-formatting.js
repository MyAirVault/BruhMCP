/**
 * Slack response formatting utilities
 * Formats Slack API responses for consistent output
 */

/**
 * Format a Slack message response
 * @param {Object} message - Raw Slack message object
 * @returns {Object} Formatted message
 */
export function formatMessageResponse(message) {
	if (!message) return null;

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
	if (message.attachments && message.attachments.length > 0) {
		formatted.attachments = message.attachments.map(formatAttachment);
	}

	// Add blocks if available
	if (message.blocks && message.blocks.length > 0) {
		formatted.blocks = message.blocks;
	}

	// Add reactions if available
	if (message.reactions && message.reactions.length > 0) {
		formatted.reactions = message.reactions.map(formatReaction);
	}

	// Add files if available
	if (message.files && message.files.length > 0) {
		formatted.files = message.files.map(formatFile);
	}

	// Add edited information if available
	if (message.edited) {
		formatted.edited = {
			user: message.edited.user,
			ts: message.edited.ts,
			timestamp: new Date(parseFloat(message.edited.ts) * 1000).toISOString()
		};
	}

	return formatted;
}

/**
 * Format a Slack channel response
 * @param {Object} channel - Raw Slack channel object
 * @returns {Object} Formatted channel
 */
export function formatChannelResponse(channel) {
	if (!channel) return null;

	const formatted = {
		id: channel.id,
		name: channel.name,
		is_channel: channel.is_channel,
		is_group: channel.is_group,
		is_im: channel.is_im,
		is_mpim: channel.is_mpim,
		is_private: channel.is_private,
		created: channel.created,
		creator: channel.creator,
		is_archived: channel.is_archived,
		is_general: channel.is_general,
		name_normalized: channel.name_normalized,
		is_shared: channel.is_shared,
		is_member: channel.is_member,
		num_members: channel.num_members
	};

	// Add topic if available
	if (channel.topic) {
		formatted.topic = {
			value: channel.topic.value,
			creator: channel.topic.creator,
			last_set: channel.topic.last_set
		};
	}

	// Add purpose if available
	if (channel.purpose) {
		formatted.purpose = {
			value: channel.purpose.value,
			creator: channel.purpose.creator,
			last_set: channel.purpose.last_set
		};
	}

	// Add latest message timestamp if available
	if (channel.latest) {
		formatted.latest_message = formatMessageResponse(channel.latest);
	}

	return formatted;
}

/**
 * Format a Slack user response
 * @param {Object} user - Raw Slack user object
 * @returns {Object} Formatted user
 */
export function formatUserResponse(user) {
	if (!user) return null;

	const formatted = {
		id: user.id,
		name: user.name,
		deleted: user.deleted,
		real_name: user.real_name,
		tz: user.tz,
		tz_label: user.tz_label,
		tz_offset: user.tz_offset,
		is_admin: user.is_admin,
		is_owner: user.is_owner,
		is_primary_owner: user.is_primary_owner,
		is_restricted: user.is_restricted,
		is_ultra_restricted: user.is_ultra_restricted,
		is_bot: user.is_bot,
		is_app_user: user.is_app_user,
		updated: user.updated,
		has_2fa: user.has_2fa
	};

	// Add profile information if available
	if (user.profile) {
		formatted.profile = {
			title: user.profile.title,
			phone: user.profile.phone,
			skype: user.profile.skype,
			real_name: user.profile.real_name,
			real_name_normalized: user.profile.real_name_normalized,
			display_name: user.profile.display_name,
			display_name_normalized: user.profile.display_name_normalized,
			status_text: user.profile.status_text,
			status_emoji: user.profile.status_emoji,
			status_expiration: user.profile.status_expiration,
			avatar_hash: user.profile.avatar_hash,
			email: user.profile.email,
			first_name: user.profile.first_name,
			last_name: user.profile.last_name,
			image_24: user.profile.image_24,
			image_32: user.profile.image_32,
			image_48: user.profile.image_48,
			image_72: user.profile.image_72,
			image_192: user.profile.image_192,
			image_512: user.profile.image_512,
			image_1024: user.profile.image_1024,
			image_original: user.profile.image_original,
			team: user.profile.team
		};
	}

	return formatted;
}

/**
 * Format a Slack attachment
 * @param {Object} attachment - Raw Slack attachment object
 * @returns {Object} Formatted attachment
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
		fields: attachment.fields || []
	};
}

/**
 * Format a Slack reaction
 * @param {Object} reaction - Raw Slack reaction object
 * @returns {Object} Formatted reaction
 */
export function formatReaction(reaction) {
	if (!reaction) return null;

	return {
		name: reaction.name,
		count: reaction.count,
		users: reaction.users || []
	};
}

/**
 * Format a Slack file
 * @param {Object} file - Raw Slack file object
 * @returns {Object} Formatted file
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
 * Format a generic Slack API response
 * @param {Object} response - Raw Slack API response
 * @returns {Object} Formatted response
 */
export function formatSlackResponse(response) {
	if (!response) return null;

	const formatted = {
		ok: response.ok,
		timestamp: new Date().toISOString()
	};

	// Add error information if present
	if (!response.ok && response.error) {
		formatted.error = response.error;
		formatted.warning = response.warning;
	}

	// Add response metadata if present
	if (response.response_metadata) {
		formatted.response_metadata = {
			next_cursor: response.response_metadata.next_cursor,
			scopes: response.response_metadata.scopes,
			acceptedScopes: response.response_metadata.acceptedScopes
		};
	}

	return formatted;
}

/**
 * Format Slack timestamp to human readable format
 * @param {string} ts - Slack timestamp
 * @returns {string} Human readable timestamp
 */
export function formatSlackTimestamp(ts) {
	if (!ts) return null;
	
	const date = new Date(parseFloat(ts) * 1000);
	return date.toISOString();
}

/**
 * Format Slack message text with user/channel mentions
 * @param {string} text - Raw message text
 * @param {Array} users - Array of user objects for mention resolution
 * @param {Array} channels - Array of channel objects for mention resolution
 * @returns {string} Formatted text with resolved mentions
 */
export function formatSlackText(text, users = [], channels = []) {
	if (!text) return text;

	let formattedText = text;

	// Replace user mentions
	const userMentions = text.match(/<@(U[A-Z0-9]+)>/g);
	if (userMentions) {
		userMentions.forEach(mention => {
			const userId = mention.match(/<@(U[A-Z0-9]+)>/)[1];
			const user = users.find(u => u.id === userId);
			if (user) {
				formattedText = formattedText.replace(mention, `@${user.name}`);
			}
		});
	}

	// Replace channel mentions
	const channelMentions = text.match(/<#(C[A-Z0-9]+)\|([^>]+)>/g);
	if (channelMentions) {
		channelMentions.forEach(mention => {
			const channelName = mention.match(/<#(C[A-Z0-9]+)\|([^>]+)>/)[2];
			formattedText = formattedText.replace(mention, `#${channelName}`);
		});
	}

	// Replace special mentions
	formattedText = formattedText.replace(/<!channel>/g, '@channel');
	formattedText = formattedText.replace(/<!here>/g, '@here');
	formattedText = formattedText.replace(/<!everyone>/g, '@everyone');

	// Replace links
	const linkMatches = text.match(/<(https?:\/\/[^|>]+)(\|([^>]+))?>/g);
	if (linkMatches) {
		linkMatches.forEach(match => {
			const parts = match.match(/<(https?:\/\/[^|>]+)(\|([^>]+))?>/);
			const url = parts[1];
			const linkText = parts[3] || url;
			formattedText = formattedText.replace(match, `[${linkText}](${url})`);
		});
	}

	return formattedText;
}

/**
 * Create a simple text response for MCP
 * @param {string} text - Response text
 * @returns {Object} MCP response object
 */
export function createTextResponse(text) {
	return {
		content: [
			{
				type: 'text',
				text: text
			}
		]
	};
}

/**
 * Create a formatted response with multiple content blocks
 * @param {Array} blocks - Array of content blocks
 * @returns {Object} MCP response object
 */
export function createFormattedResponse(blocks) {
	return {
		content: blocks
	};
}

/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {Object} MCP error response
 */
export function formatErrorResponse(error) {
	return {
		content: [
			{
				type: 'text',
				text: `Error: ${error.message}`
			}
		],
		isError: true
	};
}