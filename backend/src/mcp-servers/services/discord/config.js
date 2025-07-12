import fetch from 'node-fetch';

/**
 * Discord Service Configuration
 * Complete configuration for Discord API integration
 */
export default {
	// Basic service information
	name: 'Discord',
	displayName: 'Discord',
	description: 'Voice, video and text communication service for communities',
	category: 'communication',
	iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg',

	// API configuration
	api: {
		baseURL: 'https://discord.com/api/v10',
		version: 'v10',
		rateLimit: {
			requests: 50,
			period: 'second',
		},
		documentation: 'https://discord.com/developers/docs/intro',
	},

	// Authentication configuration
	auth: {
		type: 'bot_token',
		field: 'bot_token',
		header: 'Authorization',
		headerFormat: token => `Bot ${token}`,
		validation: {
			format: /^[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}$/,
			endpoint: '/users/@me',
		},
	},

	// Standard endpoints
	endpoints: {
		me: '/users/@me',
		guilds: '/users/@me/guilds',
		channels: '/users/@me/channels',
		guildChannels: guildId => `/guilds/${guildId}/channels`,
		channelMessages: channelId => `/channels/${channelId}/messages`,
		sendMessage: channelId => `/channels/${channelId}/messages`,
		guildMembers: guildId => `/guilds/${guildId}/members`,
		guildRoles: guildId => `/guilds/${guildId}/roles`,
		channelInfo: channelId => `/channels/${channelId}`,
		guildInfo: guildId => `/guilds/${guildId}`,
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Get bot info and accessible guilds
		botInfo: async (config, token) => {
			const results = {
				bot_info: null,
				guilds: [],
				total_guilds: 0,
				available_endpoints: [],
				errors: [],
			};

			// Get bot user info
			try {
				const botResponse = await fetch(`${config.api.baseURL}/users/@me`, {
					headers: { Authorization: `Bot ${token}` },
				});
				if (botResponse.ok) {
					results.bot_info = await botResponse.json();
					results.available_endpoints.push('/users/@me - ✅ Available');
				} else {
					results.available_endpoints.push(`/users/@me - ❌ ${botResponse.status}`);
				}
			} catch (error) {
				results.errors.push('Failed to get bot info: ' + error.message);
			}

			// Get guilds
			try {
				const guildsResponse = await fetch(`${config.api.baseURL}/users/@me/guilds`, {
					headers: { Authorization: `Bot ${token}` },
				});
				if (guildsResponse.ok) {
					const guildsData = await guildsResponse.json();
					results.guilds = guildsData.map(guild => ({
						id: guild.id,
						name: guild.name,
						icon: guild.icon,
						owner: guild.owner,
						permissions: guild.permissions,
						features: guild.features,
					}));
					results.total_guilds = results.guilds.length;
					results.available_endpoints.push('/users/@me/guilds - ✅ Available');
				} else {
					results.available_endpoints.push(`/users/@me/guilds - ❌ ${guildsResponse.status}`);
				}
			} catch (error) {
				results.errors.push('Failed to get guilds: ' + error.message);
			}

			return results;
		},

		// Get guild channels
		guildChannels: async (config, token, guildId) => {
			try {
				const response = await fetch(`${config.api.baseURL}/guilds/${guildId}/channels`, {
					headers: { Authorization: `Bot ${token}` },
				});

				if (response.ok) {
					const channels = await response.json();
					return {
						channels: channels.map(channel => ({
							id: channel.id,
							name: channel.name,
							type: channel.type,
							position: channel.position,
							parent_id: channel.parent_id,
							permission_overwrites: channel.permission_overwrites,
							topic: channel.topic,
							nsfw: channel.nsfw,
						})),
						total: channels.length,
						guild_id: guildId,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get guild channels: ${error.message}`);
			}
		},

		// Send message to channel
		sendMessage: async (config, token, channelId, content, options = {}) => {
			try {
				const payload = {
					content,
					...options,
				};

				const response = await fetch(`${config.api.baseURL}/channels/${channelId}/messages`, {
					method: 'POST',
					headers: {
						Authorization: `Bot ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to send message: ${error.message}`);
			}
		},

		// Get channel messages
		channelMessages: async (config, token, channelId, limit = 50) => {
			try {
				const response = await fetch(`${config.api.baseURL}/channels/${channelId}/messages?limit=${limit}`, {
					headers: { Authorization: `Bot ${token}` },
				});

				if (response.ok) {
					const messages = await response.json();
					return {
						messages: messages.map(msg => ({
							id: msg.id,
							content: msg.content,
							author: {
								id: msg.author.id,
								username: msg.author.username,
								discriminator: msg.author.discriminator,
								bot: msg.author.bot,
							},
							timestamp: msg.timestamp,
							edited_timestamp: msg.edited_timestamp,
							attachments: msg.attachments,
							embeds: msg.embeds,
							reactions: msg.reactions,
						})),
						total: messages.length,
						channel_id: channelId,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get channel messages: ${error.message}`);
			}
		},
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_bot_info',
			description: 'Get bot information and accessible guilds',
			handler: 'botInfo',
			parameters: {},
		},
		{
			name: 'get_guild_channels',
			description: 'Get channels in a specific guild',
			handler: 'guildChannels',
			parameters: {
				guildId: {
					type: 'string',
					description: 'Guild ID to get channels from',
					required: true,
				},
			},
		},
		{
			name: 'send_message',
			description: 'Send a message to a Discord channel',
			handler: 'sendMessage',
			parameters: {
				channelId: {
					type: 'string',
					description: 'Channel ID to send message to',
					required: true,
				},
				content: {
					type: 'string',
					description: 'Message content to send',
					required: true,
				},
				embeds: {
					type: 'array',
					description: 'Message embeds (optional)',
					required: false,
				},
			},
		},
		{
			name: 'get_channel_messages',
			description: 'Get recent messages from a channel',
			handler: 'channelMessages',
			parameters: {
				channelId: {
					type: 'string',
					description: 'Channel ID to get messages from',
					required: true,
				},
				limit: {
					type: 'integer',
					description: 'Number of messages to retrieve (max 100)',
					required: false,
					default: 50,
				},
			},
		},
	],

	// Available resources configuration
	resources: [
		{
			name: 'bot_info',
			uri: 'bot/info',
			description: 'Discord bot information and guild access',
			handler: 'botInfo',
		},
		{
			name: 'user_info',
			uri: 'user/info',
			description: 'Bot user information',
			endpoint: 'me',
		},
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			if (!credentials.bot_token) {
				throw new Error('Bot token is required');
			}

			if (!config.auth.validation.format.test(credentials.bot_token)) {
				throw new Error('Invalid Discord bot token format');
			}

			// Test the token
			try {
				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers: { Authorization: `Bot ${credentials.bot_token}` },
				});

				if (!response.ok) {
					throw new Error(`API validation failed: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				return {
					valid: true,
					bot: data,
				};
			} catch (error) {
				throw new Error(`Failed to validate token: ${error.message}`);
			}
		},
	},
};
