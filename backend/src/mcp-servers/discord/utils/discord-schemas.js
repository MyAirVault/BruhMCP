/**
 * Discord MCP Zod Schemas
 * Comprehensive validation schemas for Discord API objects
 */

import { z } from 'zod';

// Discord color validation (0 to 16777215)
export const discordColorSchema = z.number().min(0).max(16777215).int().optional();

// Discord snowflake ID validation
export const discordSnowflakeSchema = z.string().regex(/^\d{17,19}$/, 'Invalid Discord snowflake ID format');

// Discord URL validation
export const discordUrlSchema = z.string().url().optional();

// Embed field schema
export const embedFieldSchema = z.object({
	name: z.string().min(1, 'Field name cannot be empty').max(256, 'Field name cannot exceed 256 characters'),
	value: z.string().min(1, 'Field value cannot be empty').max(1024, 'Field value cannot exceed 1024 characters'),
	inline: z.boolean().optional().default(false),
});

// Embed footer schema
export const embedFooterSchema = z.object({
	text: z.string().min(1, 'Footer text cannot be empty').max(2048, 'Footer text cannot exceed 2048 characters'),
	iconUrl: z.string().url('Invalid footer icon URL').optional(),
});

// Embed image schema
export const embedImageSchema = z.object({
	url: z.string().url('Invalid image URL'),
});

// Embed thumbnail schema
export const embedThumbnailSchema = z.object({
	url: z.string().url('Invalid thumbnail URL'),
});

// Embed author schema
export const embedAuthorSchema = z.object({
	name: z.string().min(1, 'Author name cannot be empty').max(256, 'Author name cannot exceed 256 characters'),
	url: z.string().url('Invalid author URL').optional(),
	iconUrl: z.string().url('Invalid author icon URL').optional(),
});

// Complete embed schema
export const embedSchema = z
	.object({
		title: z.string().max(256, 'Embed title cannot exceed 256 characters').optional(),
		description: z.string().max(4096, 'Embed description cannot exceed 4096 characters').optional(),
		url: discordUrlSchema,
		timestamp: z.string().datetime().optional(),
		color: discordColorSchema,
		footer: embedFooterSchema.optional(),
		image: embedImageSchema.optional(),
		thumbnail: embedThumbnailSchema.optional(),
		author: embedAuthorSchema.optional(),
		fields: z.array(embedFieldSchema).max(25, 'Embed cannot have more than 25 fields').optional(),
	})
	.refine(
		embed => {
			// Total embed character limit validation
			const titleLength = embed.title?.length || 0;
			const descriptionLength = embed.description?.length || 0;
			const footerLength = embed.footer?.text?.length || 0;
			const authorLength = embed.author?.name?.length || 0;
			const fieldsLength =
				embed.fields?.reduce((sum, field) => sum + field.name.length + field.value.length, 0) || 0;

			const totalLength = titleLength + descriptionLength + footerLength + authorLength + fieldsLength;
			return totalLength <= 6000;
		},
		{
			message: 'Total embed character count cannot exceed 6000 characters',
		}
	);

// Allowed mentions schema
export const allowedMentionsSchema = z.object({
	parse: z.array(z.enum(['roles', 'users', 'everyone'])).optional(),
	roles: z.array(discordSnowflakeSchema).max(100, 'Cannot mention more than 100 roles').optional(),
	users: z.array(discordSnowflakeSchema).max(100, 'Cannot mention more than 100 users').optional(),
	repliedUser: z.boolean().optional().default(true),
});

// Message content schema
export const messageContentSchema = z.object({
	content: z
		.string()
		.min(1, 'Message content cannot be empty')
		.max(2000, 'Message content cannot exceed 2000 characters'),
	embeds: z.array(embedSchema).max(10, 'Message cannot have more than 10 embeds').optional().default([]),
	tts: z.boolean().optional().default(false),
	allowedMentions: allowedMentionsSchema.optional().default({}),
});

// Token validation schemas
export const bearerTokenSchema = z
	.string()
	.min(1, 'Bearer token cannot be empty')
	.refine(token => {
		// Basic OAuth2 token format validation
		return /^[A-Za-z0-9._-]+$/.test(token);
	}, 'Invalid bearer token format');

// Bot token schema removed - only supporting Bearer tokens for user operations

// Channel ID validation
export const channelIdSchema = discordSnowflakeSchema;

// Guild ID validation
export const guildIdSchema = discordSnowflakeSchema;

// Message ID validation
export const messageIdSchema = discordSnowflakeSchema;

// User ID validation
export const userIdSchema = z.union([discordSnowflakeSchema, z.literal('@me')]);

// Invite code validation
export const inviteCodeSchema = z
	.string()
	.min(1, 'Invite code cannot be empty')
	.max(32, 'Invite code cannot exceed 32 characters')
	.regex(/^[A-Za-z0-9]+$/, 'Invalid invite code format');

// Message fetch parameters schema
export const messageFetchParamsSchema = z
	.object({
		limit: z
			.number()
			.min(1, 'Limit must be at least 1')
			.max(100, 'Limit cannot exceed 100')
			.int()
			.optional()
			.default(50),
		before: messageIdSchema.optional().default(''),
		after: messageIdSchema.optional().default(''),
		around: messageIdSchema.optional().default(''),
	})
	.refine(
		params => {
			// Only one of before, after, or around should be provided
			const provided = [params.before, params.after, params.around].filter(Boolean).length;
			return provided <= 1;
		},
		{
			message: "Only one of 'before', 'after', or 'around' parameters can be provided",
		}
	);

// Emoji validation (unicode or custom)
export const emojiSchema = z
	.string()
	.min(1, 'Emoji cannot be empty')
	.refine(emoji => {
		// Unicode emoji or custom emoji format (name:id)
		return (
			/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u.test(
				emoji
			) || /^[a-zA-Z0-9_]+:\d{17,19}$/.test(emoji)
		);
	}, 'Invalid emoji format');

// Invite creation parameters schema
export const inviteCreateParamsSchema = z.object({
	maxAge: z
		.number()
		.min(0, 'Max age must be 0 or greater')
		.max(604800, 'Max age cannot exceed 7 days (604800 seconds)')
		.int()
		.optional()
		.default(86400),
	maxUses: z
		.number()
		.min(0, 'Max uses must be 0 or greater')
		.max(100, 'Max uses cannot exceed 100')
		.int()
		.optional()
		.default(0),
	temporary: z.boolean().optional().default(false),
	unique: z.boolean().optional().default(false),
});

// Rate limit information schema
export const rateLimitSchema = z.object({
	limit: z.number(),
	remaining: z.number(),
	reset: z.number(),
	resetAfter: z.number(),
	bucket: z.string().optional(),
	global: z.boolean().optional().default(false),
});

// API response wrapper schema
export const apiResponseSchema = z.object({
	data: z.any(),
	rateLimit: rateLimitSchema.optional(),
	timestamp: z.string().datetime(),
	requestId: z.string().optional(),
});

// Validation helper functions
export function validateToken(token) {
	try {
		return bearerTokenSchema.parse(token);
	} catch (error) {
		throw new Error(`Token validation failed: ${error.message}`);
	}
}

export function validateMessageContent(content) {
	try {
		return messageContentSchema.parse(content);
	} catch (error) {
		throw new Error(`Message content validation failed: ${error.message}`);
	}
}

export function validateEmbed(embed) {
	try {
		return embedSchema.parse(embed);
	} catch (error) {
		throw new Error(`Embed validation failed: ${error.message}`);
	}
}

export function validateDiscordId(id, type = 'ID') {
	try {
		return discordSnowflakeSchema.parse(id);
	} catch (error) {
		throw new Error(`${type} validation failed: ${error.message}`);
	}
}
