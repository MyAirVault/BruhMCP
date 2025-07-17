/**
 * Discord Tool Validation Utilities
 * Validates tool arguments and Discord-specific data
 * Based on Gmail MCP service architecture
 */

import { z } from 'zod';

// Discord-specific validation schemas
const discordSnowflakeSchema = z.string().regex(/^\d{17,19}$/, 'Must be a valid Discord snowflake ID');
const discordEmojiSchema = z.string().min(1, 'Emoji cannot be empty');
const discordInviteCodeSchema = z.string().min(1, 'Invite code cannot be empty');

// Tool argument schemas
const toolSchemas = {
	get_current_user: z.object({}),

	get_user_guilds: z.object({}),

	get_user_connections: z.object({}),

	get_guild: z.object({
		guildId: discordSnowflakeSchema,
	}),

	get_guild_member: z.object({
		guildId: discordSnowflakeSchema,
		userId: z.string().optional().default('@me'),
	}),

	get_guild_channels: z.object({
		guildId: discordSnowflakeSchema,
	}),

	get_channel: z.object({
		channelId: discordSnowflakeSchema,
	}),

	get_channel_messages: z.object({
		channelId: discordSnowflakeSchema,
		limit: z.number().min(1).max(100).optional().default(50),
		before: z.string().optional().default(''),
		after: z.string().optional().default(''),
		around: z.string().optional().default(''),
	}),

	send_message: z.object({
		channelId: discordSnowflakeSchema,
		content: z.string().min(1).max(2000),
		embeds: z
			.array(
				z.object({
					title: z.string().optional(),
					description: z.string().optional(),
					color: z.number().optional(),
					fields: z
						.array(
							z.object({
								name: z.string(),
								value: z.string(),
								inline: z.boolean().optional(),
							})
						)
						.optional(),
				})
			)
			.max(10)
			.optional()
			.default([]),
		tts: z.boolean().optional().default(false),
		allowedMentions: z
			.object({
				parse: z.array(z.enum(['roles', 'users', 'everyone'])).optional(),
				roles: z.array(z.string()).optional(),
				users: z.array(z.string()).optional(),
				repliedUser: z.boolean().optional(),
			})
			.optional()
			.default({}),
	}),

	edit_message: z.object({
		channelId: discordSnowflakeSchema,
		messageId: discordSnowflakeSchema,
		content: z.string().min(1).max(2000),
		embeds: z
			.array(
				z.object({
					title: z.string().optional(),
					description: z.string().optional(),
					color: z.number().optional(),
					fields: z
						.array(
							z.object({
								name: z.string(),
								value: z.string(),
								inline: z.boolean().optional(),
							})
						)
						.optional(),
				})
			)
			.max(10)
			.optional()
			.default([]),
	}),

	delete_message: z.object({
		channelId: discordSnowflakeSchema,
		messageId: discordSnowflakeSchema,
	}),

	add_reaction: z.object({
		channelId: discordSnowflakeSchema,
		messageId: discordSnowflakeSchema,
		emoji: discordEmojiSchema,
	}),

	remove_reaction: z.object({
		channelId: discordSnowflakeSchema,
		messageId: discordSnowflakeSchema,
		emoji: discordEmojiSchema,
	}),

	get_invite: z.object({
		inviteCode: discordInviteCodeSchema,
	}),

	create_invite: z.object({
		channelId: discordSnowflakeSchema,
		maxAge: z.number().min(0).max(604800).optional().default(86400),
		maxUses: z.number().min(0).max(100).optional().default(0),
		temporary: z.boolean().optional().default(false),
		unique: z.boolean().optional().default(false),
	}),
};

/**
 * Validates tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @returns {Object} Validated arguments
 * @throws {Error} If validation fails
 */
export function validateToolArguments(toolName, args) {
	const schema = toolSchemas[toolName];

	if (!schema) {
		throw new Error(`Unknown tool: ${toolName}`);
	}

	try {
		return schema.parse(args);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
			throw new Error(`Validation failed: ${errorMessages}`);
		}
		throw error;
	}
}

/**
 * Validates Discord snowflake ID
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid
 */
export function isValidSnowflake(id) {
	return typeof id === 'string' && /^\d{17,19}$/.test(id);
}

/**
 * Validates Discord message content
 * @param {string} content - Message content
 * @returns {boolean} True if valid
 */
export function isValidMessageContent(content) {
	return typeof content === 'string' && content.length >= 1 && content.length <= 2000;
}

/**
 * Validates Discord embed structure
 * @param {Object} embed - Embed object
 * @returns {boolean} True if valid
 */
export function isValidEmbed(embed) {
	if (!embed || typeof embed !== 'object') return false;

	// Check title length
	if (embed.title && embed.title.length > 256) return false;

	// Check description length
	if (embed.description && embed.description.length > 4096) return false;

	// Check fields
	if (embed.fields) {
		if (!Array.isArray(embed.fields) || embed.fields.length > 25) return false;

		for (const field of embed.fields) {
			if (!field.name || !field.value) return false;
			if (field.name.length > 256 || field.value.length > 1024) return false;
		}
	}

	return true;
}

/**
 * Validates Discord permission value
 * @param {string|number} permissions - Permission value
 * @returns {boolean} True if valid
 */
export function isValidPermissions(permissions) {
	if (typeof permissions === 'string') {
		return /^\d+$/.test(permissions);
	}
	return typeof permissions === 'number' && permissions >= 0;
}

/**
 * Validates Discord channel type
 * @param {number} type - Channel type
 * @returns {boolean} True if valid
 */
export function isValidChannelType(type) {
	const validTypes = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15];
	return validTypes.includes(type);
}

/**
 * Validates Discord message limit
 * @param {number} limit - Message limit
 * @returns {boolean} True if valid
 */
export function isValidMessageLimit(limit) {
	return typeof limit === 'number' && limit >= 1 && limit <= 100;
}

/**
 * Validates Discord invite configuration
 * @param {Object} config - Invite configuration
 * @returns {boolean} True if valid
 */
export function isValidInviteConfig(config) {
	if (!config || typeof config !== 'object') return false;

	// Check max age (0 = never expires, max 7 days)
	if (
		config.maxAge !== undefined &&
		(typeof config.maxAge !== 'number' || config.maxAge < 0 || config.maxAge > 604800)
	) {
		return false;
	}

	// Check max uses (0 = unlimited, max 100)
	if (
		config.maxUses !== undefined &&
		(typeof config.maxUses !== 'number' || config.maxUses < 0 || config.maxUses > 100)
	) {
		return false;
	}

	// Check boolean fields
	if (config.temporary !== undefined && typeof config.temporary !== 'boolean') return false;
	if (config.unique !== undefined && typeof config.unique !== 'boolean') return false;

	return true;
}

/**
 * Sanitizes Discord message content
 * @param {string} content - Message content
 * @returns {string} Sanitized content
 */
export function sanitizeMessageContent(content) {
	if (typeof content !== 'string') return '';

	// Remove null bytes and control characters except newlines and tabs
	return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validates Discord token format
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid format
 */
export function isValidTokenFormat(token) {
	return typeof token === 'string' && token.length >= 20 && !token.includes(' ');
}
