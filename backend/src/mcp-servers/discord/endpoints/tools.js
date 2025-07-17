/**
 * Discord MCP Tools Definition
 * Defines available tools for Discord MCP service
 * Based on Gmail MCP service architecture
 */

/**
 * Discord MCP Tools Configuration
 * Each tool includes name, description, and parameter schema
 */
export const DISCORD_TOOLS = [
	{
		name: 'get_current_user',
		description: 'Get current user information',
		parameters: {},
		examples: [
			{
				description: 'Get current user profile',
				parameters: {},
			},
		],
	},

	{
		name: 'get_user_guilds',
		description: "Get user's guilds (servers)",
		parameters: {},
		examples: [
			{
				description: 'List all servers the user is in',
				parameters: {},
			},
		],
	},

	{
		name: 'get_user_connections',
		description: "Get user's connections (linked accounts)",
		parameters: {},
		examples: [
			{
				description: 'List all linked accounts',
				parameters: {},
			},
		],
	},

	{
		name: 'get_guild',
		description: 'Get detailed guild information',
		parameters: {
			guildId: {
				type: 'string',
				description: 'Guild ID to get information for',
				required: true,
			},
		},
		examples: [
			{
				description: 'Get server details',
				parameters: {
					guildId: '123456789012345678',
				},
			},
		],
	},

	{
		name: 'get_guild_member',
		description: 'Get guild member information',
		parameters: {
			guildId: {
				type: 'string',
				description: 'Guild ID',
				required: true,
			},
			userId: {
				type: 'string',
				description: 'User ID (use "@me" for current user)',
				required: false,
				default: '@me',
			},
		},
		examples: [
			{
				description: "Get current user's member info in server",
				parameters: {
					guildId: '123456789012345678',
					userId: '@me',
				},
			},
		],
	},

	{
		name: 'get_guild_channels',
		description: 'Get all channels in a guild',
		parameters: {
			guildId: {
				type: 'string',
				description: 'Guild ID to get channels for',
				required: true,
			},
		},
		examples: [
			{
				description: 'List all channels in server',
				parameters: {
					guildId: '123456789012345678',
				},
			},
		],
	},

	{
		name: 'get_channel',
		description: 'Get channel information',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID to get information for',
				required: true,
			},
		},
		examples: [
			{
				description: 'Get channel details',
				parameters: {
					channelId: '123456789012345678',
				},
			},
		],
	},

	{
		name: 'get_channel_messages',
		description: 'Get messages from a channel',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID to get messages from',
				required: true,
			},
			limit: {
				type: 'number',
				description: 'Number of messages to fetch (max 100)',
				required: false,
				default: 50,
			},
			before: {
				type: 'string',
				description: 'Get messages before this message ID',
				required: false,
			},
			after: {
				type: 'string',
				description: 'Get messages after this message ID',
				required: false,
			},
			around: {
				type: 'string',
				description: 'Get messages around this message ID',
				required: false,
			},
		},
		examples: [
			{
				description: 'Get recent messages from channel',
				parameters: {
					channelId: '123456789012345678',
					limit: 10,
				},
			},
		],
	},

	{
		name: 'send_message',
		description: 'Send a message to a channel',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID to send message to',
				required: true,
			},
			content: {
				type: 'string',
				description: 'Message content (1-2000 characters)',
				required: true,
			},
			embeds: {
				type: 'array',
				description: 'Message embeds (max 10)',
				required: false,
				default: [],
			},
			tts: {
				type: 'boolean',
				description: 'Whether message should be TTS',
				required: false,
				default: false,
			},
			allowedMentions: {
				type: 'object',
				description: 'Allowed mentions configuration',
				required: false,
				default: {},
			},
		},
		examples: [
			{
				description: 'Send simple text message',
				parameters: {
					channelId: '123456789012345678',
					content: 'Hello, world!',
				},
			},
			{
				description: 'Send message with embed',
				parameters: {
					channelId: '123456789012345678',
					content: 'Check out this embed!',
					embeds: [
						{
							title: 'Example Embed',
							description: 'This is an example embed',
							color: 0x00ff00,
						},
					],
				},
			},
		],
	},

	{
		name: 'edit_message',
		description: 'Edit a message',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID containing the message',
				required: true,
			},
			messageId: {
				type: 'string',
				description: 'Message ID to edit',
				required: true,
			},
			content: {
				type: 'string',
				description: 'New message content (1-2000 characters)',
				required: true,
			},
			embeds: {
				type: 'array',
				description: 'New message embeds (max 10)',
				required: false,
				default: [],
			},
		},
		examples: [
			{
				description: 'Edit message content',
				parameters: {
					channelId: '123456789012345678',
					messageId: '123456789012345678',
					content: 'Updated message content',
				},
			},
		],
	},

	{
		name: 'delete_message',
		description: 'Delete a message',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID containing the message',
				required: true,
			},
			messageId: {
				type: 'string',
				description: 'Message ID to delete',
				required: true,
			},
		},
		examples: [
			{
				description: 'Delete a message',
				parameters: {
					channelId: '123456789012345678',
					messageId: '123456789012345678',
				},
			},
		],
	},

	{
		name: 'add_reaction',
		description: 'Add a reaction to a message',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID containing the message',
				required: true,
			},
			messageId: {
				type: 'string',
				description: 'Message ID to react to',
				required: true,
			},
			emoji: {
				type: 'string',
				description: 'Emoji to react with (unicode or custom emoji name:id)',
				required: true,
			},
		},
		examples: [
			{
				description: 'Add thumbs up reaction',
				parameters: {
					channelId: '123456789012345678',
					messageId: '123456789012345678',
					emoji: '👍',
				},
			},
		],
	},

	{
		name: 'remove_reaction',
		description: 'Remove a reaction from a message',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID containing the message',
				required: true,
			},
			messageId: {
				type: 'string',
				description: 'Message ID to remove reaction from',
				required: true,
			},
			emoji: {
				type: 'string',
				description: 'Emoji to remove (unicode or custom emoji name:id)',
				required: true,
			},
		},
		examples: [
			{
				description: 'Remove thumbs up reaction',
				parameters: {
					channelId: '123456789012345678',
					messageId: '123456789012345678',
					emoji: '👍',
				},
			},
		],
	},

	{
		name: 'get_invite',
		description: 'Get invite information',
		parameters: {
			inviteCode: {
				type: 'string',
				description: 'Invite code to get information for',
				required: true,
			},
		},
		examples: [
			{
				description: 'Get invite details',
				parameters: {
					inviteCode: 'discord',
				},
			},
		],
	},

	{
		name: 'create_invite',
		description: 'Create an invite for a channel',
		parameters: {
			channelId: {
				type: 'string',
				description: 'Channel ID to create invite for',
				required: true,
			},
			maxAge: {
				type: 'number',
				description: 'Duration of invite in seconds (0 = never expires)',
				required: false,
				default: 86400,
			},
			maxUses: {
				type: 'number',
				description: 'Maximum number of uses (0 = unlimited)',
				required: false,
				default: 0,
			},
			temporary: {
				type: 'boolean',
				description: 'Whether invite grants temporary membership',
				required: false,
				default: false,
			},
			unique: {
				type: 'boolean',
				description: 'Whether invite should be unique',
				required: false,
				default: false,
			},
		},
		examples: [
			{
				description: 'Create channel invite',
				parameters: {
					channelId: '123456789012345678',
					maxAge: 3600,
					maxUses: 10,
				},
			},
		],
	},
];

/**
 * Get tool definition by name
 * @param {string} toolName - Name of the tool
 * @returns {Object|null} Tool definition or null if not found
 */
export function getToolDefinition(toolName) {
	return DISCORD_TOOLS.find(tool => tool.name === toolName) || null;
}

/**
 * Get all tool names
 * @returns {string[]} Array of tool names
 */
export function getAllToolNames() {
	return DISCORD_TOOLS.map(tool => tool.name);
}

/**
 * Validate tool exists
 * @param {string} toolName - Name of the tool
 * @returns {boolean} True if tool exists
 */
export function isValidTool(toolName) {
	return DISCORD_TOOLS.some(tool => tool.name === toolName);
}

/**
 * Get tools by category
 * @param {string} category - Category name
 * @returns {Object[]} Array of tools in category
 */
export function getToolsByCategory(category) {
	switch (category) {
		case 'user':
			return DISCORD_TOOLS.filter(tool => tool.name.startsWith('get_user') || tool.name === 'get_current_user');
		case 'guild':
			return DISCORD_TOOLS.filter(tool => tool.name.includes('guild'));
		case 'channel':
			return DISCORD_TOOLS.filter(tool => tool.name.includes('channel'));
		case 'message':
			return DISCORD_TOOLS.filter(tool => tool.name.includes('message') || tool.name.includes('reaction'));
		case 'invite':
			return DISCORD_TOOLS.filter(tool => tool.name.includes('invite'));
		default:
			return [];
	}
}

/**
 * Get tool statistics
 * @returns {Object} Tool statistics
 */
export function getToolStatistics() {
	const categories = ['user', 'guild', 'channel', 'message', 'invite'];
	const stats = {
		total: DISCORD_TOOLS.length,
		categories: {},
	};

	categories.forEach(category => {
		stats.categories[category] = getToolsByCategory(category).length;
	});

	return stats;
}

/**
 * Get available Discord tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools() {
	return {
		tools: [
			{
				name: 'get_current_user',
				description: 'Get current user information',
				inputSchema: {
					type: 'object',
					properties: {},
					required: [],
				},
			},
			{
				name: 'get_user_guilds',
				description: "Get user's guilds (servers)",
				inputSchema: {
					type: 'object',
					properties: {},
					required: [],
				},
			},
			{
				name: 'get_user_connections',
				description: "Get user's connections (linked accounts)",
				inputSchema: {
					type: 'object',
					properties: {},
					required: [],
				},
			},
			{
				name: 'get_guild',
				description: 'Get detailed guild information',
				inputSchema: {
					type: 'object',
					properties: {
						guildId: {
							type: 'string',
							description: 'Guild ID to get information for',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['guildId'],
				},
			},
			{
				name: 'get_guild_member',
				description: 'Get guild member information',
				inputSchema: {
					type: 'object',
					properties: {
						guildId: {
							type: 'string',
							description: 'Guild ID',
						},
						userId: {
							type: 'string',
							description: 'User ID (use "@me" for current user)',
							default: '@me',
						},
					},
					required: ['guildId'],
				},
			},
			{
				name: 'get_guild_channels',
				description: 'Get all channels in a guild',
				inputSchema: {
					type: 'object',
					properties: {
						guildId: {
							type: 'string',
							description: 'Guild ID to get channels for',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['guildId'],
				},
			},
			{
				name: 'get_channel',
				description: 'Get channel information',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID to get information for',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId'],
				},
			},
			{
				name: 'get_channel_messages',
				description: 'Get messages from a channel',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID to get messages from',
						},
						limit: {
							type: 'number',
							description: 'Number of messages to fetch (max 100)',
							minimum: 1,
							maximum: 100,
							default: 50,
						},
						before: {
							type: 'string',
							description: 'Get messages before this message ID',
							default: '',
						},
						after: {
							type: 'string',
							description: 'Get messages after this message ID',
							default: '',
						},
						around: {
							type: 'string',
							description: 'Get messages around this message ID',
							default: '',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId'],
				},
			},
			{
				name: 'send_message',
				description: 'Send a message to a channel',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID to send message to',
						},
						content: {
							type: 'string',
							description: 'Message content',
						},
						embeds: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									title: {
										type: 'string',
										description: 'Embed title',
									},
									description: {
										type: 'string',
										description: 'Embed description',
									},
									url: {
										type: 'string',
										description: 'Embed URL',
									},
									color: {
										type: 'number',
										description: 'Embed color (decimal)',
									},
									footer: {
										type: 'object',
										properties: {
											text: {
												type: 'string',
												description: 'Footer text',
											},
											iconUrl: {
												type: 'string',
												description: 'Footer icon URL',
											},
										},
									},
									image: {
										type: 'object',
										properties: {
											url: {
												type: 'string',
												description: 'Image URL',
											},
										},
									},
									thumbnail: {
										type: 'object',
										properties: {
											url: {
												type: 'string',
												description: 'Thumbnail URL',
											},
										},
									},
									author: {
										type: 'object',
										properties: {
											name: {
												type: 'string',
												description: 'Author name',
											},
											url: {
												type: 'string',
												description: 'Author URL',
											},
											iconUrl: {
												type: 'string',
												description: 'Author icon URL',
											},
										},
									},
									fields: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												name: {
													type: 'string',
													description: 'Field name',
												},
												value: {
													type: 'string',
													description: 'Field value',
												},
												inline: {
													type: 'boolean',
													description: 'Whether field is inline',
													default: false,
												},
											},
											required: ['name', 'value'],
										},
									},
								},
							},
							description: 'Message embeds',
							default: [],
						},
						tts: {
							type: 'boolean',
							description: 'Whether message should be TTS',
							default: false,
						},
						allowedMentions: {
							type: 'object',
							properties: {
								parse: {
									type: 'array',
									items: {
										type: 'string',
										enum: ['roles', 'users', 'everyone'],
									},
									description: 'Types of mentions to parse',
								},
								roles: {
									type: 'array',
									items: {
										type: 'string',
									},
									description: 'Array of role IDs to mention',
								},
								users: {
									type: 'array',
									items: {
										type: 'string',
									},
									description: 'Array of user IDs to mention',
								},
								repliedUser: {
									type: 'boolean',
									description: 'Whether to mention the user being replied to',
									default: true,
								},
							},
							description: 'Allowed mentions configuration',
							default: {},
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId', 'content'],
				},
			},
			{
				name: 'edit_message',
				description: 'Edit a message',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID containing the message',
						},
						messageId: {
							type: 'string',
							description: 'Message ID to edit',
						},
						content: {
							type: 'string',
							description: 'New message content',
						},
						embeds: {
							type: 'array',
							items: {
								type: 'object',
							},
							description: 'New message embeds',
							default: [],
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId', 'messageId', 'content'],
				},
			},
			{
				name: 'delete_message',
				description: 'Delete a message',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID containing the message',
						},
						messageId: {
							type: 'string',
							description: 'Message ID to delete',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId', 'messageId'],
				},
			},
			{
				name: 'add_reaction',
				description: 'Add a reaction to a message',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID containing the message',
						},
						messageId: {
							type: 'string',
							description: 'Message ID to react to',
						},
						emoji: {
							type: 'string',
							description: 'Emoji to react with (unicode or custom emoji name:id)',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId', 'messageId', 'emoji'],
				},
			},
			{
				name: 'remove_reaction',
				description: 'Remove a reaction from a message',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID containing the message',
						},
						messageId: {
							type: 'string',
							description: 'Message ID to remove reaction from',
						},
						emoji: {
							type: 'string',
							description: 'Emoji to remove (unicode or custom emoji name:id)',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId', 'messageId', 'emoji'],
				},
			},
			{
				name: 'get_invite',
				description: 'Get invite information',
				inputSchema: {
					type: 'object',
					properties: {
						inviteCode: {
							type: 'string',
							description: 'Invite code to get information for',
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['inviteCode'],
				},
			},
			{
				name: 'create_invite',
				description: 'Create an invite for a channel',
				inputSchema: {
					type: 'object',
					properties: {
						channelId: {
							type: 'string',
							description: 'Channel ID to create invite for',
						},
						maxAge: {
							type: 'number',
							description: 'Duration of invite in seconds (0 = never expires)',
							minimum: 0,
							maximum: 604800,
							default: 86400,
						},
						maxUses: {
							type: 'number',
							description: 'Maximum number of uses (0 = unlimited)',
							minimum: 0,
							maximum: 100,
							default: 0,
						},
						temporary: {
							type: 'boolean',
							description: 'Whether invite grants temporary membership',
							default: false,
						},
						unique: {
							type: 'boolean',
							description: 'Whether invite should be unique',
							default: false,
						},
						useBotToken: {
							type: 'boolean',
							description: 'Whether to use bot token for this request',
							default: false,
						},
					},
					required: ['channelId'],
				},
			},
		],
	};
}
