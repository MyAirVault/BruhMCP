/**
 * Discord MCP JSON-RPC protocol handler using official SDK
 * Multi-token OAuth and Bot implementation with credential support
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
	getCurrentUser,
	getUserGuilds,
	getUserConnections,
	getGuild,
	getGuildMember,
	getGuildChannels,
	getChannel,
	getChannelMessages,
	sendMessage,
	editMessage,
	deleteMessage,
	addReaction,
	removeReaction,
	getInvite,
	createInvite,
} from '../api/discord-api.js';

// Role operations removed - require bot token permissions

import { formatEmbedForCreation } from '../utils/discord-formatting.js';
import {
	embedSchema,
	allowedMentionsSchema,
	channelIdSchema,
	guildIdSchema,
	messageIdSchema,
	userIdSchema,
	inviteCodeSchema,
	emojiSchema,
	validateToken,
} from '../utils/discord-schemas.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */

export class DiscordMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;

		// Validate bearer token if provided
		if (bearerToken) {
			try {
				validateToken(bearerToken);
				console.log(`✅ Bearer token validated for ${serviceConfig.displayName}`);
			} catch (error) {
				console.error('❌ Invalid bearer token provided:', error.message);
				throw new Error(`Bearer token validation failed: ${error.message}`);
			}
		}

		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;

		this.setupTools();
	}

	/**
	 * Setup MCP tools using Zod schemas
	 */
	setupTools() {
		// Tool 1: get_current_user
		this.server.tool('get_current_user', 'Get current user information', {}, async () => {
			console.log(`🔧 Tool call: get_current_user for ${this.serviceConfig.name}`);
			try {
				const result = await getCurrentUser(this.bearerToken);
				return {
					content: [
						{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) },
					],
				};
			} catch (error) {
				console.error(`❌ Error getting current user:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting current user: ${error.message}` }],
				};
			}
		});

		// Tool 2: get_user_guilds
		this.server.tool('get_user_guilds', "Get user's guilds (servers)", {}, async () => {
			console.log(`🔧 Tool call: get_user_guilds for ${this.serviceConfig.name}`);
			try {
				const result = await getUserGuilds(this.bearerToken);
				return {
					content: [
						{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) },
					],
				};
			} catch (error) {
				console.error(`❌ Error getting user guilds:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting user guilds: ${error.message}` }],
				};
			}
		});

		// Tool 3: get_user_connections
		this.server.tool('get_user_connections', "Get user's connections (linked accounts)", {}, async () => {
			console.log(`🔧 Tool call: get_user_connections for ${this.serviceConfig.name}`);
			try {
				const result = await getUserConnections(this.bearerToken);
				return {
					content: [
						{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) },
					],
				};
			} catch (error) {
				console.error(`❌ Error getting user connections:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting user connections: ${error.message}` }],
				};
			}
		});

		// Tool 4: get_guild
		this.server.tool(
			'get_guild',
			'Get detailed guild information',
			{
				guildId: guildIdSchema.describe('Guild ID to get information for'),
			},
			async ({ guildId }) => {
				console.log(`🔧 Tool call: get_guild for ${this.serviceConfig.name}`);
				try {
					const result = await getGuild(guildId, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting guild:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting guild: ${error.message}` }],
					};
				}
			}
		);

		// Tool 5: get_guild_member
		this.server.tool(
			'get_guild_member',
			'Get guild member information',
			{
				guildId: guildIdSchema.describe('Guild ID'),
				userId: userIdSchema.optional().default('@me').describe("User ID (use '@me' for current user)"),
			},
			async ({ guildId, userId }) => {
				console.log(`🔧 Tool call: get_guild_member for ${this.serviceConfig.name}`);
				try {
					const result = await getGuildMember(guildId, userId, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting guild member:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting guild member: ${error.message}` }],
					};
				}
			}
		);

		// Tool 6: get_guild_channels
		this.server.tool(
			'get_guild_channels',
			'Get all channels in a guild',
			{
				guildId: guildIdSchema.describe('Guild ID to get channels for'),
			},
			async ({ guildId }) => {
				console.log(`🔧 Tool call: get_guild_channels for ${this.serviceConfig.name}`);
				try {
					const result = await getGuildChannels(guildId, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting guild channels:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting guild channels: ${error.message}` }],
					};
				}
			}
		);

		// Tool 7: get_channel
		this.server.tool(
			'get_channel',
			'Get channel information',
			{
				channelId: channelIdSchema.describe('Channel ID to get information for'),
			},
			async ({ channelId }) => {
				console.log(`🔧 Tool call: get_channel for ${this.serviceConfig.name}`);
				try {
					const result = await getChannel(channelId, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting channel:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting channel: ${error.message}` }],
					};
				}
			}
		);

		// Tool 8: get_channel_messages
		this.server.tool(
			'get_channel_messages',
			'Get messages from a channel',
			{
				channelId: channelIdSchema.describe('Channel ID to get messages from'),
				limit: z
					.number()
					.min(1)
					.max(100)
					.optional()
					.default(50)
					.describe('Number of messages to fetch (max 100)'),
				before: messageIdSchema.optional().default('').describe('Get messages before this message ID'),
				after: messageIdSchema.optional().default('').describe('Get messages after this message ID'),
				around: messageIdSchema.optional().default('').describe('Get messages around this message ID'),
			},
			async ({ channelId, limit, before, after, around }) => {
				console.log(`🔧 Tool call: get_channel_messages for ${this.serviceConfig.name}`);
				try {
					const result = await getChannelMessages(
						channelId,
						{ limit, before, after, around },
						this.bearerToken
					);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting channel messages:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting channel messages: ${error.message}` }],
					};
				}
			}
		);

		// Tool 9: send_message
		this.server.tool(
			'send_message',
			'Send a message to a channel',
			{
				channelId: channelIdSchema.describe('Channel ID to send message to'),
				content: z.string().min(1).max(2000).describe('Message content (1-2000 characters)'),
				embeds: z.array(embedSchema).max(10).optional().default([]).describe('Message embeds (max 10)'),
				tts: z.boolean().optional().default(false).describe('Whether message should be TTS'),
				allowedMentions: allowedMentionsSchema
					.optional()
					.default({})
					.describe('Allowed mentions configuration'),
			},
			async ({ channelId, content, embeds, tts, allowedMentions }) => {
				console.log(`🔧 Tool call: send_message for ${this.serviceConfig.name}`);
				try {
					const formattedEmbeds = embeds.map(embed => formatEmbedForCreation(embed));
					const result = await sendMessage(
						channelId,
						{ content, embeds: formattedEmbeds, tts, allowedMentions },
						this.bearerToken
					);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error sending message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error sending message: ${error.message}` }],
					};
				}
			}
		);

		// Tool 10: edit_message
		this.server.tool(
			'edit_message',
			'Edit a message',
			{
				channelId: channelIdSchema.describe('Channel ID containing the message'),
				messageId: messageIdSchema.describe('Message ID to edit'),
				content: z.string().min(1).max(2000).describe('New message content (1-2000 characters)'),
				embeds: z.array(embedSchema).max(10).optional().default([]).describe('New message embeds (max 10)'),
			},
			async ({ channelId, messageId, content, embeds }) => {
				console.log(`🔧 Tool call: edit_message for ${this.serviceConfig.name}`);
				try {
					const result = await editMessage(channelId, messageId, { content, embeds }, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error editing message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error editing message: ${error.message}` }],
					};
				}
			}
		);

		// Tool 11: delete_message
		this.server.tool(
			'delete_message',
			'Delete a message',
			{
				channelId: channelIdSchema.describe('Channel ID containing the message'),
				messageId: messageIdSchema.describe('Message ID to delete'),
			},
			async ({ channelId, messageId }) => {
				console.log(`🔧 Tool call: delete_message for ${this.serviceConfig.name}`);
				try {
					const result = await deleteMessage(channelId, messageId, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error deleting message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting message: ${error.message}` }],
					};
				}
			}
		);

		// Tool 12: add_reaction
		this.server.tool(
			'add_reaction',
			'Add a reaction to a message',
			{
				channelId: channelIdSchema.describe('Channel ID containing the message'),
				messageId: messageIdSchema.describe('Message ID to react to'),
				emoji: emojiSchema.describe('Emoji to react with (unicode or custom emoji name:id)'),
			},
			async ({ channelId, messageId, emoji }) => {
				console.log(`🔧 Tool call: add_reaction for ${this.serviceConfig.name}`);
				try {
					const result = await addReaction(channelId, messageId, emoji, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error adding reaction:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error adding reaction: ${error.message}` }],
					};
				}
			}
		);

		// Tool 13: remove_reaction
		this.server.tool(
			'remove_reaction',
			'Remove a reaction from a message',
			{
				channelId: channelIdSchema.describe('Channel ID containing the message'),
				messageId: messageIdSchema.describe('Message ID to remove reaction from'),
				emoji: emojiSchema.describe('Emoji to remove (unicode or custom emoji name:id)'),
			},
			async ({ channelId, messageId, emoji }) => {
				console.log(`🔧 Tool call: remove_reaction for ${this.serviceConfig.name}`);
				try {
					const result = await removeReaction(channelId, messageId, emoji, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error removing reaction:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error removing reaction: ${error.message}` }],
					};
				}
			}
		);

		// Tool 14: get_invite
		this.server.tool(
			'get_invite',
			'Get invite information',
			{
				inviteCode: inviteCodeSchema.describe('Invite code to get information for'),
			},
			async ({ inviteCode }) => {
				console.log(`🔧 Tool call: get_invite for ${this.serviceConfig.name}`);
				try {
					const result = await getInvite(inviteCode, this.bearerToken);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error getting invite:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting invite: ${error.message}` }],
					};
				}
			}
		);

		// Tool 15: create_invite
		this.server.tool(
			'create_invite',
			'Create an invite for a channel',
			{
				channelId: channelIdSchema.describe('Channel ID to create invite for'),
				maxAge: z
					.number()
					.min(0)
					.max(604800)
					.int()
					.optional()
					.default(86400)
					.describe('Duration of invite in seconds (0 = never expires)'),
				maxUses: z
					.number()
					.min(0)
					.max(100)
					.int()
					.optional()
					.default(0)
					.describe('Maximum number of uses (0 = unlimited)'),
				temporary: z.boolean().optional().default(false).describe('Whether invite grants temporary membership'),
				unique: z.boolean().optional().default(false).describe('Whether invite should be unique'),
			},
			async ({ channelId, maxAge, maxUses, temporary, unique }) => {
				console.log(`🔧 Tool call: create_invite for ${this.serviceConfig.name}`);
				try {
					const result = await createInvite(
						channelId,
						{ maxAge, maxUses, temporary, unique },
						this.bearerToken
					);
					return {
						content: [
							{
								type: 'text',
								text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error(`❌ Error creating invite:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating invite: ${error.message}` }],
					};
				}
			}
		);

		// Role-related tools removed - require bot token permissions
	}

	/**
	 * Updates tokens for the handler
	 * @param {string} bearerToken - New bearer token
	 */
	updateTokens(bearerToken) {
		if (bearerToken) {
			try {
				validateToken(bearerToken);
				this.bearerToken = bearerToken;
				console.log('✅ Bearer token updated successfully');
			} catch (error) {
				console.error('❌ Invalid bearer token provided during update:', error.message);
				throw new Error(`Bearer token validation failed: ${error.message}`);
			}
		} else {
			console.warn('⚠️ No bearer token provided for update');
		}
	}

	/**
	 * Cleanup method for session management
	 */
	cleanup() {
		// Close all transports
		for (const [sessionId, transport] of Object.entries(this.transports)) {
			try {
				transport.close();
				console.log(`🧹 Cleaned up transport for session: ${sessionId}`);
			} catch (error) {
				console.error(`❌ Error cleaning up transport ${sessionId}:`, error);
			}
		}

		// Clear transports
		this.transports = {};
		this.initialized = false;

		console.log('✅ Handler cleanup completed');
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);

			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: newSessionId => {
						console.log(`✅ Discord MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});

				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};

				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: message?.id || null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
		} catch (/** @type {any} */ error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	}
}
