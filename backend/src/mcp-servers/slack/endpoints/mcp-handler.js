/**
 * Slack MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { 
  sendMessage, 
  getMessages, 
  getThreadMessages,
  deleteMessage,
  updateMessage,
  listChannels,
  getChannelInfo,
  joinChannel,
  leaveChannel,
  getUserInfo,
  listUsers,
  addReaction,
  removeReaction,
  getReactions,
  uploadFile,
  getFileInfo,
  createReminder,
  getTeamInfo,
  testAuth
} from '../api/slack-api.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class SlackMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
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
		// Tool 1: send_message
		this.server.tool(
			"send_message",
			"Send a message to a Slack channel or user",
			{
				channel: z.string().describe("Channel ID or user ID to send message to"),
				text: z.string().describe("Message text content"),
				thread_ts: z.string().optional().default("").describe("Timestamp of parent message to reply in thread (optional)"),
				reply_broadcast: z.boolean().optional().default(false).describe("Whether to broadcast thread reply to channel")
			},
			async ({ channel, text, thread_ts, reply_broadcast }) => {
				console.log(`🔧 Tool call: send_message for ${this.serviceConfig.name}`);
				try {
					const result = await sendMessage({ channel, text, thread_ts, reply_broadcast }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error sending message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error sending message: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: get_messages
		this.server.tool(
			"get_messages",
			"Get messages from a Slack channel",
			{
				channel: z.string().describe("Channel ID to get messages from"),
				count: z.number().min(1).max(1000).optional().default(100).describe("Number of messages to return"),
				latest: z.string().optional().default("").describe("Latest message timestamp to include (optional)"),
				oldest: z.string().optional().default("").describe("Oldest message timestamp to include (optional)"),
				inclusive: z.boolean().optional().default(false).describe("Include messages with latest and oldest timestamps")
			},
			async ({ channel, count, latest, oldest, inclusive }) => {
				console.log(`🔧 Tool call: get_messages for ${this.serviceConfig.name}`);
				try {
					const result = await getMessages({ channel, count, latest, oldest, inclusive }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting messages:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting messages: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: get_thread_messages
		this.server.tool(
			"get_thread_messages",
			"Get messages from a Slack thread",
			{
				channel: z.string().describe("Channel ID where the thread is located"),
				ts: z.string().describe("Timestamp of the parent message"),
				limit: z.number().min(1).max(1000).optional().default(200).describe("Maximum number of messages to return"),
				cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
			},
			async ({ channel, ts, limit, cursor }) => {
				console.log(`🔧 Tool call: get_thread_messages for ${this.serviceConfig.name}`);
				try {
					const result = await getThreadMessages({ channel, ts, limit, cursor }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting thread messages:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting thread messages: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: delete_message
		this.server.tool(
			"delete_message",
			"Delete a Slack message",
			{
				channel: z.string().describe("Channel ID where the message is located"),
				ts: z.string().describe("Timestamp of the message to delete")
			},
			async ({ channel, ts }) => {
				console.log(`🔧 Tool call: delete_message for ${this.serviceConfig.name}`);
				try {
					const result = await deleteMessage({ channel, ts }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error deleting message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting message: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: update_message
		this.server.tool(
			"update_message",
			"Update a Slack message",
			{
				channel: z.string().describe("Channel ID where the message is located"),
				ts: z.string().describe("Timestamp of the message to update"),
				text: z.string().describe("New message text content")
			},
			async ({ channel, ts, text }) => {
				console.log(`🔧 Tool call: update_message for ${this.serviceConfig.name}`);
				try {
					const result = await updateMessage({ channel, ts, text }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating message: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: list_channels
		this.server.tool(
			"list_channels",
			"List Slack channels",
			{
				types: z.string().optional().default("public_channel,private_channel").describe("Channel types to include (comma separated)"),
				limit: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of channels to return"),
				cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
			},
			async ({ types, limit, cursor }) => {
				console.log(`🔧 Tool call: list_channels for ${this.serviceConfig.name}`);
				try {
					const result = await listChannels({ types, limit, cursor }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing channels:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing channels: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: get_channel_info
		this.server.tool(
			"get_channel_info",
			"Get information about a Slack channel",
			{
				channel: z.string().describe("Channel ID to get information about")
			},
			async ({ channel }) => {
				console.log(`🔧 Tool call: get_channel_info for ${this.serviceConfig.name}`);
				try {
					const result = await getChannelInfo({ channel }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting channel info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting channel info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: join_channel
		this.server.tool(
			"join_channel",
			"Join a Slack channel",
			{
				channel: z.string().describe("Channel ID or name to join")
			},
			async ({ channel }) => {
				console.log(`🔧 Tool call: join_channel for ${this.serviceConfig.name}`);
				try {
					const result = await joinChannel({ channel }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error joining channel:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error joining channel: ${error.message}` }]
					};
				}
			}
		);

		// Tool 9: leave_channel
		this.server.tool(
			"leave_channel",
			"Leave a Slack channel",
			{
				channel: z.string().describe("Channel ID to leave")
			},
			async ({ channel }) => {
				console.log(`🔧 Tool call: leave_channel for ${this.serviceConfig.name}`);
				try {
					const result = await leaveChannel({ channel }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error leaving channel:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error leaving channel: ${error.message}` }]
					};
				}
			}
		);

		// Tool 10: get_user_info
		this.server.tool(
			"get_user_info",
			"Get information about a Slack user",
			{
				user: z.string().describe("User ID to get information about")
			},
			async ({ user }) => {
				console.log(`🔧 Tool call: get_user_info for ${this.serviceConfig.name}`);
				try {
					const result = await getUserInfo({ user }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting user info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting user info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: list_users
		this.server.tool(
			"list_users",
			"List Slack users in the workspace",
			{
				limit: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of users to return"),
				cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
			},
			async ({ limit, cursor }) => {
				console.log(`🔧 Tool call: list_users for ${this.serviceConfig.name}`);
				try {
					const result = await listUsers({ limit, cursor }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing users:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing users: ${error.message}` }]
					};
				}
			}
		);

		// Tool 12: add_reaction
		this.server.tool(
			"add_reaction",
			"Add a reaction to a Slack message",
			{
				channel: z.string().describe("Channel ID where the message is located"),
				timestamp: z.string().describe("Timestamp of the message to react to"),
				name: z.string().describe("Emoji name (without colons)")
			},
			async ({ channel, timestamp, name }) => {
				console.log(`🔧 Tool call: add_reaction for ${this.serviceConfig.name}`);
				try {
					const result = await addReaction({ channel, timestamp, name }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error adding reaction:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error adding reaction: ${error.message}` }]
					};
				}
			}
		);

		// Tool 13: remove_reaction
		this.server.tool(
			"remove_reaction",
			"Remove a reaction from a Slack message",
			{
				channel: z.string().describe("Channel ID where the message is located"),
				timestamp: z.string().describe("Timestamp of the message to remove reaction from"),
				name: z.string().describe("Emoji name (without colons)")
			},
			async ({ channel, timestamp, name }) => {
				console.log(`🔧 Tool call: remove_reaction for ${this.serviceConfig.name}`);
				try {
					const result = await removeReaction({ channel, timestamp, name }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error removing reaction:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error removing reaction: ${error.message}` }]
					};
				}
			}
		);

		// Tool 14: get_reactions
		this.server.tool(
			"get_reactions",
			"Get reactions for a Slack message",
			{
				channel: z.string().describe("Channel ID where the message is located"),
				timestamp: z.string().describe("Timestamp of the message to get reactions for")
			},
			async ({ channel, timestamp }) => {
				console.log(`🔧 Tool call: get_reactions for ${this.serviceConfig.name}`);
				try {
					const result = await getReactions({ channel, timestamp }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting reactions:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting reactions: ${error.message}` }]
					};
				}
			}
		);

		// Tool 15: upload_file
		this.server.tool(
			"upload_file",
			"Upload a file to Slack",
			{
				channels: z.string().describe("Channel ID to upload file to"),
				content: z.string().describe("File content as a string"),
				filename: z.string().describe("Name of the file"),
				title: z.string().optional().default("").describe("Title for the file (optional)"),
				filetype: z.string().optional().default("").describe("File type (e.g., \"text\", \"javascript\") (optional)"),
				initial_comment: z.string().optional().default("").describe("Initial comment to add with the file (optional)")
			},
			async ({ channels, content, filename, title, filetype, initial_comment }) => {
				console.log(`🔧 Tool call: upload_file for ${this.serviceConfig.name}`);
				try {
					const result = await uploadFile({ channels, content, filename, title, filetype, initial_comment }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error uploading file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error uploading file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 16: get_file_info
		this.server.tool(
			"get_file_info",
			"Get information about a Slack file",
			{
				file: z.string().describe("File ID to get information about")
			},
			async ({ file }) => {
				console.log(`🔧 Tool call: get_file_info for ${this.serviceConfig.name}`);
				try {
					const result = await getFileInfo({ file }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting file info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting file info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 17: create_reminder
		this.server.tool(
			"create_reminder",
			"Create a reminder in Slack",
			{
				text: z.string().describe("Reminder text"),
				time: z.string().describe("When to remind (e.g., \"in 20 minutes\", \"tomorrow at 9am\")"),
				user: z.string().optional().default("").describe("User ID to remind (optional, defaults to current user)")
			},
			async ({ text, time, user }) => {
				console.log(`🔧 Tool call: create_reminder for ${this.serviceConfig.name}`);
				try {
					const result = await createReminder({ text, time, user }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating reminder:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating reminder: ${error.message}` }]
					};
				}
			}
		);

		// Tool 18: get_team_info
		this.server.tool(
			"get_team_info",
			"Get information about the Slack workspace/team",
			{},
			async () => {
				console.log(`🔧 Tool call: get_team_info for ${this.serviceConfig.name}`);
				try {
					const result = await getTeamInfo(this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting team info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting team info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 19: test_auth
		this.server.tool(
			"test_auth",
			"Test Slack authentication and get user/team info",
			{},
			async () => {
				console.log(`🔧 Tool call: test_auth for ${this.serviceConfig.name}`);
				try {
					const result = await testAuth(this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error testing auth:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error testing auth: ${error.message}` }]
					};
				}
			}
		);
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
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Slack MCP session initialized: ${newSessionId}`);
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