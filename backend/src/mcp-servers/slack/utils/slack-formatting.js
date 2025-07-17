/**
 * Slack response formatting utilities
 * Formats Slack API responses for consistent output
 * Enhanced with advanced formatting features similar to Gmail implementation
 */

import { debug } from './logger.js';

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
	debug('Formatting error response', { error: error.message });
	
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

/**
 * Format search results for better readability
 * @param {Object} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(results, query) {
	if (!results || !results.matches) return null;
	
	debug('Formatting search results', { query, matchCount: results.matches.length });
	
	return {
		query,
		total: results.matches.length,
		pagination: results.pagination,
		matches: results.matches.map(match => ({
			type: match.type,
			text: formatSlackText(match.text),
			user: match.user,
			username: match.username,
			channel: match.channel,
			timestamp: formatSlackTimestamp(match.ts),
			permalink: match.permalink
		}))
	};
}

/**
 * Format team information response
 * @param {Object} team - Team information from Slack API
 * @returns {Object} Formatted team information
 */
export function formatTeamResponse(team) {
	if (!team) return null;
	
	debug('Formatting team response', { teamId: team.id, teamName: team.name });
	
	return {
		id: team.id,
		name: team.name,
		domain: team.domain,
		email_domain: team.email_domain,
		icon: team.icon,
		enterprise_id: team.enterprise_id,
		enterprise_name: team.enterprise_name,
		avatar_base_url: team.avatar_base_url,
		is_verified: team.is_verified,
		discovery_setting: team.discovery_setting
	};
}

/**
 * Format conversation history with enhanced metadata
 * @param {Object} history - Conversation history from Slack API
 * @param {Array} users - User data for mention resolution
 * @param {Array} channels - Channel data for mention resolution
 * @returns {Object} Formatted conversation history
 */
export function formatConversationHistory(history, users = [], channels = []) {
	if (!history || !history.messages) return null;
	
	debug('Formatting conversation history', { messageCount: history.messages.length });
	
	return {
		ok: history.ok,
		messages: history.messages.map(message => ({
			...formatMessageResponse(message),
			formatted_text: formatSlackText(message.text, users, channels)
		})),
		has_more: history.has_more,
		pin_count: history.pin_count,
		response_metadata: history.response_metadata
	};
}

/**
 * Format bulk operation results
 * @param {Array} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {Object} Formatted bulk operation results
 */
export function formatBulkOperationResults(results, operation) {
	if (!results || !Array.isArray(results)) return null;
	
	const successCount = results.filter(r => r.success).length;
	const failureCount = results.filter(r => !r.success).length;
	
	debug('Formatting bulk operation results', { 
		operation, 
		total: results.length, 
		successes: successCount, 
		failures: failureCount 
	});
	
	return {
		operation,
		total: results.length,
		successes: successCount,
		failures: failureCount,
		success_rate: `${((successCount / results.length) * 100).toFixed(1)}%`,
		results: results.map(result => ({
			...result,
			timestamp: new Date().toISOString()
		}))
	};
}

/**
 * Format channel analytics data
 * @param {Object} analytics - Channel analytics data
 * @returns {Object} Formatted analytics
 */
export function formatChannelAnalytics(analytics) {
	if (!analytics) return null;
	
	debug('Formatting channel analytics', { channelId: analytics.channel?.id });
	
	return {
		channel: formatChannelResponse(analytics.channel),
		analytics: {
			member_count: analytics.memberCount,
			recent_activity: {
				message_count: analytics.recentActivity.messageCount,
				last_message: analytics.recentActivity.lastMessage ? 
					formatSlackTimestamp(analytics.recentActivity.lastMessage) : null
			}
		},
		generated_at: new Date().toISOString()
	};
}

/**
 * Format user activity summary
 * @param {Object} activity - User activity data
 * @returns {Object} Formatted activity summary
 */
export function formatUserActivity(activity) {
	if (!activity) return null;
	
	debug('Formatting user activity', { userId: activity.user?.id });
	
	return {
		user: formatUserResponse(activity.user),
		activity: {
			presence: activity.presence,
			last_activity: activity.lastActivity ? 
				formatSlackTimestamp(activity.lastActivity.toString()) : null,
			is_online: activity.presence === 'active'
		},
		generated_at: new Date().toISOString()
	};
}

/**
 * Format workspace statistics
 * @param {Object} stats - Workspace statistics
 * @returns {Object} Formatted workspace stats
 */
export function formatWorkspaceStats(stats) {
	if (!stats) return null;
	
	debug('Formatting workspace stats', { 
		totalChannels: stats.stats?.totalChannels, 
		totalUsers: stats.stats?.totalUsers 
	});
	
	return {
		team: formatTeamResponse(stats.team),
		statistics: {
			channels: {
				total: stats.stats.totalChannels,
				public: stats.stats.publicChannels || 0,
				private: stats.stats.privateChannels || 0
			},
			users: {
				total: stats.stats.totalUsers,
				active: stats.stats.activeUsers,
				bots: stats.stats.totalUsers - stats.stats.activeUsers
			}
		},
		generated_at: new Date().toISOString()
	};
}

/**
 * Format file upload progress
 * @param {Object} uploadResult - File upload result
 * @returns {Object} Formatted upload result
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

/**
 * Create a rich text response with formatting
 * @param {string} title - Response title
 * @param {string} content - Response content
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Rich MCP response object
 */
export function createRichTextResponse(title, content, metadata = {}) {
	debug('Creating rich text response', { title, hasMetadata: Object.keys(metadata).length > 0 });
	
	const response = {
		content: [
			{
				type: 'text',
				text: `# ${title}\n\n${content}`
			}
		]
	};
	
	if (Object.keys(metadata).length > 0) {
		response.content.push({
			type: 'text',
			text: `\n---\n**Metadata:**\n${JSON.stringify(metadata, null, 2)}`
		});
	}
	
	return response;
}

/**
 * Create a table response for structured data
 * @param {Array} headers - Table headers
 * @param {Array} rows - Table rows
 * @param {string} title - Table title
 * @returns {Object} Table MCP response object
 */
export function createTableResponse(headers, rows, title = '') {
	debug('Creating table response', { 
		title, 
		headerCount: headers.length, 
		rowCount: rows.length 
	});
	
	let tableText = title ? `# ${title}\n\n` : '';
	
	// Create markdown table
	tableText += `| ${headers.join(' | ')} |\n`;
	tableText += `| ${headers.map(() => '---').join(' | ')} |\n`;
	
	rows.forEach(row => {
		tableText += `| ${row.join(' | ')} |\n`;
	});
	
	return {
		content: [
			{
				type: 'text',
				text: tableText
			}
		]
	};
}

/**
 * Sanitize content for safe display
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
	if (!content || typeof content !== 'string') return content;
	
	// Remove potentially harmful characters and scripts
	return content
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/javascript:/gi, '')
		.replace(/on\w+\s*=/gi, '')
		.trim();
}

/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
	if (!text || text.length <= maxLength) return text;
	
	return text.substring(0, maxLength - 3) + '...';
}