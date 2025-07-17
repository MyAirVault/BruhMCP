/**
 * Discord API Integration
 * Core Discord API operations using OAuth Bearer tokens
 */

import {
	formatUserResponse,
	formatGuildResponse,
	formatChannelResponse,
	formatMessageResponse,
} from '../utils/discord-formatting.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Discord API Class for validation and API operations
 */
export class DiscordAPI {
	constructor(bearerToken) {
		if (!bearerToken) {
			throw new Error('bearerToken must be provided');
		}
		this.bearerToken = bearerToken;
	}

	/**
	 * Get current user information for validation
	 * @returns {Promise<Object>} User information with success status
	 */
	async getCurrentUser() {
		try {
			const result = await makeDiscordRequest('/users/@me', this.bearerToken);

			if (!result || typeof result !== 'object') {
				return {
					success: false,
					error: 'Invalid user data received from Discord API',
					statusCode: 500,
				};
			}

			return {
				success: true,
				data: result,
				statusCode: 200,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message || 'Failed to get current user',
				statusCode: error.statusCode || 500,
			};
		}
	}
}

/**
 * Make authenticated request to Discord API with timeout and rate limiting
 * @param {string} endpoint - API endpoint
 * @param {string} token - Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeDiscordRequest(endpoint, token, options = {}) {
	const url = `${DISCORD_API_BASE}${endpoint}`;

	// Default timeout: 30 seconds
	const timeout = options.timeout || 30000;

	// Create AbortController for timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const requestOptions = {
		method: options.method || 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'User-Agent': 'Discord MCP Server (https://github.com/minimcp, 1.0.0)',
			...options.headers,
		},
		signal: controller.signal,
		...options,
	};

	if (options.body && typeof options.body === 'object') {
		requestOptions.body = JSON.stringify(options.body);
	}

	console.log(`📡 Discord API Request: ${requestOptions.method} ${url}`);

	try {
		const response = await fetch(url, requestOptions);

		// Clear timeout if request completes
		clearTimeout(timeoutId);

		// Handle rate limiting
		if (response.status === 429) {
			const retryAfter = response.headers.get('Retry-After');
			const resetAfter = response.headers.get('X-RateLimit-Reset-After');
			const remaining = response.headers.get('X-RateLimit-Remaining');

			console.log(
				`🚦 Rate limited. Retry after: ${retryAfter}s, Reset after: ${resetAfter}s, Remaining: ${remaining}`
			);

			// Don't automatically retry, let the caller handle it
			throw new Error(`Discord API rate limited. Retry after ${retryAfter} seconds.`);
		}

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Discord API error: ${response.status} ${response.statusText}`;
			let errorCode = response.status;

			try {
				const errorData = JSON.parse(errorText);
				if (errorData && typeof errorData === 'object') {
					if (errorData.message) {
						errorMessage = `Discord API error: ${errorData.message}`;
					}
					if (errorData.code) {
						errorMessage += ` (Code: ${errorData.code})`;
					}
					if (errorData.errors) {
						// Handle validation errors
						const validationErrors = Object.entries(errorData.errors)
							.map(([field, errors]) => {
								return `${field}: ${JSON.stringify(errors)}`;
							})
							.join(', ');
						errorMessage += ` - Validation errors: ${validationErrors}`;
					}
				}
			} catch (parseError) {
				// Use the default error message if JSON parsing fails
				console.warn('Failed to parse Discord API error response:', parseError);
			}

			const error = new Error(errorMessage);
			error.statusCode = errorCode;
			throw error;
		}

		// Log rate limit info for monitoring
		const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
		const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
		const rateLimitReset = response.headers.get('X-RateLimit-Reset');

		if (rateLimitRemaining !== null) {
			console.log(
				`🔄 Rate limit: ${rateLimitRemaining}/${rateLimitLimit} remaining, resets at ${rateLimitReset}`
			);
		}

		let data;
		try {
			data = await response.json();
		} catch (jsonError) {
			console.warn('Failed to parse Discord API response as JSON:', jsonError);
			throw new Error('Invalid JSON response from Discord API');
		}

		if (data === null || data === undefined) {
			throw new Error('Received null or undefined response from Discord API');
		}

		console.log(`✅ Discord API Response: ${response.status}`);

		return data;
	} catch (error) {
		// Clear timeout if error occurs
		clearTimeout(timeoutId);

		if (error.name === 'AbortError') {
			throw new Error(`Discord API request timeout after ${timeout}ms`);
		}

		throw error;
	}
}

/**
 * Get current user information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User information
 */
export async function getCurrentUser(bearerToken) {
	if (!bearerToken || typeof bearerToken !== 'string') {
		throw new Error('Bearer token is required and must be a string');
	}

	const result = await makeDiscordRequest('/users/@me', bearerToken);

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid user data received from Discord API');
	}

	return formatUserResponse(result);
}

/**
 * Get user's guilds (servers)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User's guilds
 */
export async function getUserGuilds(bearerToken) {
	if (!bearerToken || typeof bearerToken !== 'string') {
		throw new Error('Bearer token is required and must be a string');
	}

	const result = await makeDiscordRequest('/users/@me/guilds', bearerToken);

	if (!Array.isArray(result)) {
		throw new Error('Invalid guilds data received from Discord API');
	}

	return {
		action: 'list_guilds',
		count: result.length,
		guilds: result
			.map(guild => {
				if (!guild || typeof guild !== 'object') {
					console.warn('⚠️  Invalid guild object received, skipping');
					return null;
				}
				return formatGuildResponse(guild);
			})
			.filter(Boolean),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get user's connections (linked accounts)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} User's connections
 */
export async function getUserConnections(bearerToken) {
	const result = await makeDiscordRequest('/users/@me/connections', bearerToken);

	if (!Array.isArray(result)) {
		throw new Error('Invalid connections data received from Discord API');
	}

	return {
		action: 'list_connections',
		count: result.length,
		connections: result
			.map(connection => {
				if (!connection || typeof connection !== 'object') {
					console.warn('⚠️  Invalid connection object received, skipping');
					return null;
				}
				return {
					id: connection.id || '',
					name: connection.name || '',
					type: connection.type || '',
					verified: connection.verified || false,
					visibility: connection.visibility || 0,
					showActivity: connection.show_activity || false,
				};
			})
			.filter(Boolean),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get guild information
 * @param {string} guildId - Guild ID
 * @param {string} token - Bearer token
 * @returns {Object} Guild information
 */
export async function getGuild(guildId, token) {
	const result = await makeDiscordRequest(`/guilds/${guildId}`, token);

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid guild data received from Discord API');
	}

	return formatGuildResponse(result);
}

/**
 * Get guild member information
 * @param {string} guildId - Guild ID
 * @param {string} userId - User ID (use '@me' for current user)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Guild member information
 */
export async function getGuildMember(guildId, userId, bearerToken) {
	const result = await makeDiscordRequest(`/guilds/${guildId}/members/${userId}`, bearerToken);

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid guild member data received from Discord API');
	}

	return {
		action: 'get_guild_member',
		guildId,
		userId,
		member: {
			user: result.user ? formatUserResponse(result.user) : null,
			nick: result.nick || null,
			avatar: result.avatar || null,
			roles: Array.isArray(result.roles) ? result.roles : [],
			joinedAt: result.joined_at || null,
			premiumSince: result.premium_since || null,
			deaf: result.deaf || false,
			mute: result.mute || false,
			pending: result.pending || false,
			permissions: result.permissions || null,
		},
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get guild channels
 * @param {string} guildId - Guild ID
 * @param {string} token - Bearer token
 * @returns {Object} Guild channels
 */
export async function getGuildChannels(guildId, token) {
	const result = await makeDiscordRequest(`/guilds/${guildId}/channels`, token);

	if (!Array.isArray(result)) {
		throw new Error('Invalid guild channels data received from Discord API');
	}

	return {
		action: 'list_guild_channels',
		guildId,
		count: result.length,
		channels: result
			.map(channel => {
				if (!channel || typeof channel !== 'object') {
					console.warn('⚠️  Invalid channel object received, skipping');
					return null;
				}
				return formatChannelResponse(channel);
			})
			.filter(Boolean),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get channel information
 * @param {string} channelId - Channel ID
 * @param {string} token - Bearer token
 * @returns {Object} Channel information
 */
export async function getChannel(channelId, token) {
	const result = await makeDiscordRequest(`/channels/${channelId}`, token);

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid channel data received from Discord API');
	}

	return formatChannelResponse(result);
}

/**
 * Get channel messages
 * @param {string} channelId - Channel ID
 * @param {Object} args - Message fetch arguments
 * @param {string} token - Bearer token
 * @returns {Object} Channel messages
 */
export async function getChannelMessages(channelId, args, token) {
	const { limit = 50, before = '', after = '', around = '' } = args;

	let queryParams = new URLSearchParams({
		limit: Math.min(limit, 100).toString(),
	});

	if (before) queryParams.append('before', before);
	if (after) queryParams.append('after', after);
	if (around) queryParams.append('around', around);

	const result = await makeDiscordRequest(`/channels/${channelId}/messages?${queryParams}`, token);

	if (!Array.isArray(result)) {
		throw new Error('Invalid channel messages data received from Discord API');
	}

	return {
		action: 'get_channel_messages',
		channelId,
		count: result.length,
		messages: result
			.map(message => {
				if (!message || typeof message !== 'object') {
					console.warn('⚠️  Invalid message object received, skipping');
					return null;
				}
				return formatMessageResponse(message);
			})
			.filter(Boolean),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Send message to channel
 * @param {string} channelId - Channel ID
 * @param {Object} args - Message arguments
 * @param {string} token - Bearer token
 * @returns {Object} Sent message
 */
export async function sendMessage(channelId, args, token) {
	if (!channelId || typeof channelId !== 'string') {
		throw new Error('Channel ID is required and must be a string');
	}

	if (!args || typeof args !== 'object') {
		throw new Error('Message arguments are required and must be an object');
	}

	if (!token || typeof token !== 'string') {
		throw new Error('Bearer token is required and must be a string');
	}

	const { content, embeds = [], tts = false, allowedMentions = {} } = args;

	const messageData = {
		content,
		tts,
		allowed_mentions: allowedMentions,
	};

	if (embeds.length > 0) {
		messageData.embeds = embeds;
	}

	const result = await makeDiscordRequest(`/channels/${channelId}/messages`, token, {
		method: 'POST',
		body: messageData,
	});

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid message data received from Discord API');
	}

	return {
		action: 'send_message',
		channelId,
		message: formatMessageResponse(result),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Edit a message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {Object} args - Edit arguments
 * @param {string} token - Bearer token
 * @returns {Object} Edited message
 */
export async function editMessage(channelId, messageId, args, token) {
	const { content, embeds = [] } = args;

	const editData = {
		content,
	};

	if (embeds.length > 0) {
		editData.embeds = embeds;
	}

	const result = await makeDiscordRequest(`/channels/${channelId}/messages/${messageId}`, token, {
		method: 'PATCH',
		body: editData,
	});

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid message data received from Discord API');
	}

	return {
		action: 'edit_message',
		channelId,
		messageId,
		message: formatMessageResponse(result),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Delete a message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} token - Bearer token
 * @returns {Object} Delete result
 */
export async function deleteMessage(channelId, messageId, token) {
	await makeDiscordRequest(`/channels/${channelId}/messages/${messageId}`, token, {
		method: 'DELETE',
	});

	return {
		action: 'delete_message',
		channelId,
		messageId,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Add reaction to message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji to react with
 * @param {string} token - Bearer token
 * @returns {Object} Reaction result
 */
export async function addReaction(channelId, messageId, emoji, token) {
	await makeDiscordRequest(
		`/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
		token,
		{
			method: 'PUT',
		}
	);

	return {
		action: 'add_reaction',
		channelId,
		messageId,
		emoji,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Remove reaction from message
 * @param {string} channelId - Channel ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji to remove
 * @param {string} token - Bearer token
 * @returns {Object} Reaction result
 */
export async function removeReaction(channelId, messageId, emoji, token) {
	await makeDiscordRequest(
		`/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
		token,
		{
			method: 'DELETE',
		}
	);

	return {
		action: 'remove_reaction',
		channelId,
		messageId,
		emoji,
		timestamp: new Date().toISOString(),
	};
}

/**
 * Get invite information
 * @param {string} inviteCode - Invite code
 * @param {string} token - Bearer token
 * @returns {Object} Invite information
 */
export async function getInvite(inviteCode, token) {
	const result = await makeDiscordRequest(`/invites/${inviteCode}`, token);

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid invite data received from Discord API');
	}

	return {
		action: 'get_invite',
		inviteCode,
		invite: {
			code: result.code || null,
			type: result.type || null,
			expiresAt: result.expires_at || null,
			guild: result.guild ? formatGuildResponse(result.guild) : null,
			channel: result.channel ? formatChannelResponse(result.channel) : null,
			inviter: result.inviter ? formatUserResponse(result.inviter) : null,
			targetUser: result.target_user ? formatUserResponse(result.target_user) : null,
			approximatePresenceCount: result.approximate_presence_count || null,
			approximateMemberCount: result.approximate_member_count || null,
		},
		timestamp: new Date().toISOString(),
	};
}

/**
 * Create guild invite
 * @param {string} channelId - Channel ID to create invite for
 * @param {Object} args - Invite arguments
 * @param {string} token - Bearer token
 * @returns {Object} Created invite
 */
export async function createInvite(channelId, args, token) {
	const { maxAge = 86400, maxUses = 0, temporary = false, unique = false } = args;

	const inviteData = {
		max_age: maxAge,
		max_uses: maxUses,
		temporary,
		unique,
	};

	const result = await makeDiscordRequest(`/channels/${channelId}/invites`, token, {
		method: 'POST',
		body: inviteData,
	});

	if (!result || typeof result !== 'object') {
		throw new Error('Invalid invite data received from Discord API');
	}

	return {
		action: 'create_invite',
		channelId,
		invite: {
			code: result.code || null,
			url: result.code ? `https://discord.gg/${result.code}` : null,
			expiresAt: result.expires_at || null,
			maxAge: result.max_age || null,
			maxUses: result.max_uses || null,
			temporary: result.temporary || false,
			uses: result.uses || 0,
		},
		timestamp: new Date().toISOString(),
	};
}
