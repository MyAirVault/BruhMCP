/**
 * Discord Response Formatting Utilities
 * Helper functions to format Discord API responses for consistent MCP output
 */

/**
 * Format Discord user object
 * @param {Object} user - Discord user object
 * @returns {Object} Formatted user object
 */
export function formatUserResponse(user) {
	return {
		id: user.id,
		username: user.username,
		discriminator: user.discriminator,
		globalName: user.global_name || null,
		avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
		bot: user.bot || false,
		system: user.system || false,
		mfaEnabled: user.mfa_enabled || false,
		banner: user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png` : null,
		accentColor: user.accent_color || null,
		locale: user.locale || null,
		verified: user.verified || false,
		email: user.email || null,
		flags: user.flags || 0,
		premiumType: user.premium_type || 0,
		publicFlags: user.public_flags || 0,
	};
}

/**
 * Format Discord guild object
 * @param {Object} guild - Discord guild object
 * @returns {Object} Formatted guild object
 */
export function formatGuildResponse(guild) {
	return {
		id: guild.id,
		name: guild.name,
		icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
		iconHash: guild.icon_hash || null,
		splash: guild.splash ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png` : null,
		discoverySplash: guild.discovery_splash
			? `https://cdn.discordapp.com/discovery-splashes/${guild.id}/${guild.discovery_splash}.png`
			: null,
		owner: guild.owner || false,
		ownerId: guild.owner_id || null,
		permissions: guild.permissions || null,
		region: guild.region || null,
		afkChannelId: guild.afk_channel_id || null,
		afkTimeout: guild.afk_timeout || 0,
		widgetEnabled: guild.widget_enabled || false,
		widgetChannelId: guild.widget_channel_id || null,
		verificationLevel: guild.verification_level || 0,
		defaultMessageNotifications: guild.default_message_notifications || 0,
		explicitContentFilter: guild.explicit_content_filter || 0,
		roles: guild.roles || [],
		emojis: guild.emojis || [],
		features: guild.features || [],
		mfaLevel: guild.mfa_level || 0,
		applicationId: guild.application_id || null,
		systemChannelId: guild.system_channel_id || null,
		systemChannelFlags: guild.system_channel_flags || 0,
		rulesChannelId: guild.rules_channel_id || null,
		maxPresences: guild.max_presences || null,
		maxMembers: guild.max_members || null,
		vanityUrlCode: guild.vanity_url_code || null,
		description: guild.description || null,
		banner: guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png` : null,
		premiumTier: guild.premium_tier || 0,
		premiumSubscriptionCount: guild.premium_subscription_count || 0,
		preferredLocale: guild.preferred_locale || 'en-US',
		publicUpdatesChannelId: guild.public_updates_channel_id || null,
		maxVideoChannelUsers: guild.max_video_channel_users || null,
		approximateMemberCount: guild.approximate_member_count || null,
		approximatePresenceCount: guild.approximate_presence_count || null,
		welcomeScreen: guild.welcome_screen || null,
		nsfwLevel: guild.nsfw_level || 0,
		stickers: guild.stickers || [],
		premiumProgressBarEnabled: guild.premium_progress_bar_enabled || false,
	};
}

/**
 * Format Discord channel object
 * @param {Object} channel - Discord channel object
 * @returns {Object} Formatted channel object
 */
export function formatChannelResponse(channel) {
	return {
		id: channel.id,
		type: channel.type,
		guildId: channel.guild_id || null,
		position: channel.position || 0,
		permissionOverwrites: channel.permission_overwrites || [],
		name: channel.name || null,
		topic: channel.topic || null,
		nsfw: channel.nsfw || false,
		lastMessageId: channel.last_message_id || null,
		bitrate: channel.bitrate || null,
		userLimit: channel.user_limit || null,
		rateLimitPerUser: channel.rate_limit_per_user || 0,
		recipients: channel.recipients || [],
		icon: channel.icon || null,
		ownerId: channel.owner_id || null,
		applicationId: channel.application_id || null,
		parentId: channel.parent_id || null,
		lastPinTimestamp: channel.last_pin_timestamp || null,
		rtcRegion: channel.rtc_region || null,
		videoQualityMode: channel.video_quality_mode || null,
		messageCount: channel.message_count || null,
		memberCount: channel.member_count || null,
		threadMetadata: channel.thread_metadata || null,
		member: channel.member || null,
		defaultAutoArchiveDuration: channel.default_auto_archive_duration || null,
		permissions: channel.permissions || null,
		flags: channel.flags || 0,
		totalMessageSent: channel.total_message_sent || null,
	};
}

/**
 * Format Discord message object
 * @param {Object} message - Discord message object
 * @returns {Object} Formatted message object
 */
export function formatMessageResponse(message) {
	return {
		id: message.id,
		channelId: message.channel_id,
		guildId: message.guild_id || null,
		author: formatUserResponse(message.author),
		member: message.member || null,
		content: message.content,
		timestamp: message.timestamp,
		editedTimestamp: message.edited_timestamp || null,
		tts: message.tts || false,
		mentionEveryone: message.mention_everyone || false,
		mentions: message.mentions ? message.mentions.map(user => formatUserResponse(user)) : [],
		mentionRoles: message.mention_roles || [],
		mentionChannels: message.mention_channels || [],
		attachments: message.attachments ? message.attachments.map(formatAttachmentResponse) : [],
		embeds: message.embeds || [],
		reactions: message.reactions ? message.reactions.map(formatReactionResponse) : [],
		nonce: message.nonce || null,
		pinned: message.pinned || false,
		webhookId: message.webhook_id || null,
		type: message.type,
		activity: message.activity || null,
		application: message.application || null,
		applicationId: message.application_id || null,
		messageReference: message.message_reference || null,
		flags: message.flags || 0,
		referencedMessage: message.referenced_message ? formatMessageResponse(message.referenced_message) : null,
		interaction: message.interaction || null,
		thread: message.thread ? formatChannelResponse(message.thread) : null,
		components: message.components || [],
		stickerItems: message.sticker_items || [],
		stickers: message.stickers || [],
		position: message.position || null,
	};
}

/**
 * Format Discord attachment object
 * @param {Object} attachment - Discord attachment object
 * @returns {Object} Formatted attachment object
 */
export function formatAttachmentResponse(attachment) {
	return {
		id: attachment.id,
		filename: attachment.filename,
		description: attachment.description || null,
		contentType: attachment.content_type || null,
		size: attachment.size,
		url: attachment.url,
		proxyUrl: attachment.proxy_url,
		height: attachment.height || null,
		width: attachment.width || null,
		ephemeral: attachment.ephemeral || false,
	};
}

/**
 * Format Discord reaction object
 * @param {Object} reaction - Discord reaction object
 * @returns {Object} Formatted reaction object
 */
export function formatReactionResponse(reaction) {
	return {
		count: reaction.count,
		me: reaction.me || false,
		emoji: {
			id: reaction.emoji.id,
			name: reaction.emoji.name,
			roles: reaction.emoji.roles || [],
			user: reaction.emoji.user ? formatUserResponse(reaction.emoji.user) : null,
			requireColons: reaction.emoji.require_colons || false,
			managed: reaction.emoji.managed || false,
			animated: reaction.emoji.animated || false,
			available: reaction.emoji.available !== false,
		},
	};
}

/**
 * Format Discord embed object for creation
 * @param {Object} embed - Embed data
 * @returns {Object} Formatted embed object
 */
export function formatEmbedForCreation(embed) {
	const formatted = {};

	if (embed.title) formatted.title = embed.title;
	if (embed.description) formatted.description = embed.description;
	if (embed.url) formatted.url = embed.url;
	if (embed.timestamp) formatted.timestamp = embed.timestamp;
	if (embed.color) formatted.color = embed.color;

	if (embed.footer) {
		formatted.footer = {
			text: embed.footer.text,
		};
		if (embed.footer.iconUrl) formatted.footer.icon_url = embed.footer.iconUrl;
	}

	if (embed.image) {
		formatted.image = {
			url: embed.image.url,
		};
	}

	if (embed.thumbnail) {
		formatted.thumbnail = {
			url: embed.thumbnail.url,
		};
	}

	if (embed.author) {
		formatted.author = {
			name: embed.author.name,
		};
		if (embed.author.url) formatted.author.url = embed.author.url;
		if (embed.author.iconUrl) formatted.author.icon_url = embed.author.iconUrl;
	}

	if (embed.fields && embed.fields.length > 0) {
		formatted.fields = embed.fields.map(field => ({
			name: field.name,
			value: field.value,
			inline: field.inline || false,
		}));
	}

	return formatted;
}

/**
 * Format error response for Discord operations
 * @param {string} action - Action that failed
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(action, error, context = {}) {
	return {
		action,
		error: true,
		message: error.message,
		code: error.code || 'UNKNOWN_ERROR',
		context,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Format success response for Discord operations
 * @param {string} action - Action that succeeded
 * @param {Object} data - Response data
 * @param {Object} context - Additional context
 * @returns {Object} Formatted success response
 */
export function formatSuccessResponse(action, data, context = {}) {
	return {
		action,
		success: true,
		data,
		context,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format Discord timestamp
 * @param {string} timestamp - Discord timestamp
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp) {
	return new Date(timestamp).toISOString();
}

/**
 * Get channel type name
 * @param {number} type - Channel type number
 * @returns {string} Channel type name
 */
export function getChannelTypeName(type) {
	const types = {
		0: 'GUILD_TEXT',
		1: 'DM',
		2: 'GUILD_VOICE',
		3: 'GROUP_DM',
		4: 'GUILD_CATEGORY',
		5: 'GUILD_NEWS',
		10: 'GUILD_NEWS_THREAD',
		11: 'GUILD_PUBLIC_THREAD',
		12: 'GUILD_PRIVATE_THREAD',
		13: 'GUILD_STAGE_VOICE',
		14: 'GUILD_DIRECTORY',
		15: 'GUILD_FORUM',
	};
	return types[type] || 'UNKNOWN';
}

/**
 * Get message type name
 * @param {number} type - Message type number
 * @returns {string} Message type name
 */
export function getMessageTypeName(type) {
	const types = {
		0: 'DEFAULT',
		1: 'RECIPIENT_ADD',
		2: 'RECIPIENT_REMOVE',
		3: 'CALL',
		4: 'CHANNEL_NAME_CHANGE',
		5: 'CHANNEL_ICON_CHANGE',
		6: 'CHANNEL_PINNED_MESSAGE',
		7: 'GUILD_MEMBER_JOIN',
		8: 'USER_PREMIUM_GUILD_SUBSCRIPTION',
		9: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1',
		10: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2',
		11: 'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3',
		12: 'CHANNEL_FOLLOW_ADD',
		14: 'GUILD_DISCOVERY_DISQUALIFIED',
		15: 'GUILD_DISCOVERY_REQUALIFIED',
		16: 'GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING',
		17: 'GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING',
		18: 'THREAD_CREATED',
		19: 'REPLY',
		20: 'CHAT_INPUT_COMMAND',
		21: 'THREAD_STARTER_MESSAGE',
		22: 'GUILD_INVITE_REMINDER',
		23: 'CONTEXT_MENU_COMMAND',
		24: 'AUTO_MODERATION_ACTION',
	};
	return types[type] || 'UNKNOWN';
}
