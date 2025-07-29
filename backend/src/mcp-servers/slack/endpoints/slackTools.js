/**
 * Slack MCP Tool Definitions
 * All tool configurations and handlers for Slack MCP server
 */

const { z  } = require('zod');
const { sendMessage,
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
 } = require('../api/slackApi');

/**
 * Create a standardized MCP response
 * @param {string|Object} result - API result
 * @returns {Object} MCP response object
 */
function createMCPResponse(result) {
	return {
		content: [{ 
			type: 'text', 
			text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) 
		}]
	};
}

/**
 * Create a standardized MCP error response
 * @param {Error} error - Error object
 * @param {string} operation - Operation name
 * @returns {Object} MCP error response
 */
function createMCPErrorResponse(error, operation) {
	return {
		content: [{ 
			type: 'text', 
			text: `Error ${operation}: ${error.message}` 
		}]
	};
}

/**
 * Register all Slack tools with the MCP server
 * @param {any} server - MCP Server instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
function registerSlackTools(server, bearerToken, serviceName) {
	// Message operations
	server.tool(
		"send_message",
		"Send a message to a Slack channel or user",
		{
			channel: z.string().describe("Channel ID or user ID to send message to"),
			text: z.string().describe("Message text content"),
			thread_ts: z.string().optional().default("").describe("Timestamp of parent message to reply in thread (optional)"),
			reply_broadcast: z.boolean().optional().default(false).describe("Whether to broadcast thread reply to channel")
		},
		/**
		 * @param {{ channel: string, text: string, thread_ts?: string, reply_broadcast?: boolean }} params
		 */
		async ({ channel, text, thread_ts, reply_broadcast }) => {
			console.log(`🔧 Tool call: send_message for ${serviceName}`);
			try {
				const result = await sendMessage({ channel, text, thread_ts, reply_broadcast }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error sending message:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'sending message');
			}
		}
	);

	server.tool(
		"get_messages",
		"Get messages from a Slack channel",
		{
			channel: z.string().describe("Channel ID to get messages from"),
			count: z.number().min(1).max(1000).optional().default(100).describe("Number of messages to return"),
			latest: z.string().optional().default("").describe("Latest message timestamp to include (optional)"),
			oldest: z.string().optional().default("").describe("Oldest message timestamp to include (optional)"),
			inclusive: z.boolean().optional().default(false).describe("Include messages with latest and oldest timestamps")
		},
		/**
		 * @param {{ channel: string, count?: number, latest?: string, oldest?: string, inclusive?: boolean }} params
		 */
		async ({ channel, count, latest, oldest, inclusive }) => {
			console.log(`🔧 Tool call: get_messages for ${serviceName}`);
			try {
				const result = await getMessages({ channel, count, latest, oldest, inclusive }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting messages:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting messages');
			}
		}
	);

	server.tool(
		"get_thread_messages",
		"Get messages from a Slack thread",
		{
			channel: z.string().describe("Channel ID where the thread is located"),
			ts: z.string().describe("Timestamp of the parent message"),
			limit: z.number().min(1).max(1000).optional().default(200).describe("Maximum number of messages to return"),
			cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
		},
		/**
		 * @param {{ channel: string, ts: string, limit?: number, cursor?: string }} params
		 */
		async ({ channel, ts, limit, cursor }) => {
			console.log(`🔧 Tool call: get_thread_messages for ${serviceName}`);
			try {
				const result = await getThreadMessages({ channel, ts, limit, cursor }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting thread messages:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting thread messages');
			}
		}
	);

	server.tool(
		"delete_message",
		"Delete a Slack message",
		{
			channel: z.string().describe("Channel ID where the message is located"),
			ts: z.string().describe("Timestamp of the message to delete")
		},
		/**
		 * @param {{ channel: string, ts: string }} params
		 */
		async ({ channel, ts }) => {
			console.log(`🔧 Tool call: delete_message for ${serviceName}`);
			try {
				const result = await deleteMessage({ channel, ts }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error deleting message:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'deleting message');
			}
		}
	);

	server.tool(
		"update_message",
		"Update a Slack message",
		{
			channel: z.string().describe("Channel ID where the message is located"),
			ts: z.string().describe("Timestamp of the message to update"),
			text: z.string().describe("New message text content")
		},
		/**
		 * @param {{ channel: string, ts: string, text: string }} params
		 */
		async ({ channel, ts, text }) => {
			console.log(`🔧 Tool call: update_message for ${serviceName}`);
			try {
				const result = await updateMessage({ channel, ts, text }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error updating message:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'updating message');
			}
		}
	);

	// Channel operations
	server.tool(
		"list_channels",
		"List Slack channels",
		{
			types: z.string().optional().default("public_channel,private_channel").describe("Channel types to include (comma separated)"),
			limit: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of channels to return"),
			cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
		},
		/**
		 * @param {{ types?: string, limit?: number, cursor?: string }} params
		 */
		async ({ types, limit, cursor }) => {
			console.log(`🔧 Tool call: list_channels for ${serviceName}`);
			try {
				const result = await listChannels({ types, limit, cursor }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error listing channels:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'listing channels');
			}
		}
	);

	server.tool(
		"get_channel_info",
		"Get information about a Slack channel",
		{
			channel: z.string().describe("Channel ID to get information about")
		},
		/**
		 * @param {{ channel: string }} params
		 */
		async ({ channel }) => {
			console.log(`🔧 Tool call: get_channel_info for ${serviceName}`);
			try {
				const result = await getChannelInfo({ channel }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting channel info:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting channel info');
			}
		}
	);

	server.tool(
		"join_channel",
		"Join a Slack channel",
		{
			channel: z.string().describe("Channel ID or name to join")
		},
		/**
		 * @param {{ channel: string }} params
		 */
		async ({ channel }) => {
			console.log(`🔧 Tool call: join_channel for ${serviceName}`);
			try {
				const result = await joinChannel({ channel }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error joining channel:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'joining channel');
			}
		}
	);

	server.tool(
		"leave_channel",
		"Leave a Slack channel",
		{
			channel: z.string().describe("Channel ID to leave")
		},
		/**
		 * @param {{ channel: string }} params
		 */
		async ({ channel }) => {
			console.log(`🔧 Tool call: leave_channel for ${serviceName}`);
			try {
				const result = await leaveChannel({ channel }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error leaving channel:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'leaving channel');
			}
		}
	);

	// User operations
	server.tool(
		"get_user_info",
		"Get information about a Slack user",
		{
			user: z.string().describe("User ID to get information about")
		},
		/**
		 * @param {{ user: string }} params
		 */
		async ({ user }) => {
			console.log(`🔧 Tool call: get_user_info for ${serviceName}`);
			try {
				const result = await getUserInfo({ user }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting user info:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting user info');
			}
		}
	);

	server.tool(
		"list_users",
		"List Slack users in the workspace",
		{
			limit: z.number().min(1).max(1000).optional().default(100).describe("Maximum number of users to return"),
			cursor: z.string().optional().default("").describe("Cursor for pagination (optional)")
		},
		/**
		 * @param {{ limit?: number, cursor?: string }} params
		 */
		async ({ limit, cursor }) => {
			console.log(`🔧 Tool call: list_users for ${serviceName}`);
			try {
				const result = await listUsers({ limit, cursor }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error listing users:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'listing users');
			}
		}
	);

	// Reaction operations
	server.tool(
		"add_reaction",
		"Add a reaction to a Slack message",
		{
			channel: z.string().describe("Channel ID where the message is located"),
			timestamp: z.string().describe("Timestamp of the message to react to"),
			name: z.string().describe("Emoji name (without colons)")
		},
		/**
		 * @param {{ channel: string, timestamp: string, name: string }} params
		 */
		async ({ channel, timestamp, name }) => {
			console.log(`🔧 Tool call: add_reaction for ${serviceName}`);
			try {
				const result = await addReaction({ channel, timestamp, name }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error adding reaction:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'adding reaction');
			}
		}
	);

	server.tool(
		"remove_reaction",
		"Remove a reaction from a Slack message",
		{
			channel: z.string().describe("Channel ID where the message is located"),
			timestamp: z.string().describe("Timestamp of the message to remove reaction from"),
			name: z.string().describe("Emoji name (without colons)")
		},
		/**
		 * @param {{ channel: string, timestamp: string, name: string }} params
		 */
		async ({ channel, timestamp, name }) => {
			console.log(`🔧 Tool call: remove_reaction for ${serviceName}`);
			try {
				const result = await removeReaction({ channel, timestamp, name }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error removing reaction:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'removing reaction');
			}
		}
	);

	server.tool(
		"get_reactions",
		"Get reactions for a Slack message",
		{
			channel: z.string().describe("Channel ID where the message is located"),
			timestamp: z.string().describe("Timestamp of the message to get reactions for")
		},
		/**
		 * @param {{ channel: string, timestamp: string }} params
		 */
		async ({ channel, timestamp }) => {
			console.log(`🔧 Tool call: get_reactions for ${serviceName}`);
			try {
				const result = await getReactions({ channel, timestamp }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting reactions:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting reactions');
			}
		}
	);

	// File operations
	server.tool(
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
		/**
		 * @param {{ channels: string, content: string, filename: string, title?: string, filetype?: string, initial_comment?: string }} params
		 */
		async ({ channels, content, filename, title, filetype, initial_comment }) => {
			console.log(`🔧 Tool call: upload_file for ${serviceName}`);
			try {
				const result = await uploadFile({ channels, content, filename, title, filetype, initial_comment }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error uploading file:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'uploading file');
			}
		}
	);

	server.tool(
		"get_file_info",
		"Get information about a Slack file",
		{
			file: z.string().describe("File ID to get information about")
		},
		/**
		 * @param {{ file: string }} params
		 */
		async ({ file }) => {
			console.log(`🔧 Tool call: get_file_info for ${serviceName}`);
			try {
				const result = await getFileInfo({ file }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting file info:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting file info');
			}
		}
	);

	// Reminder operations
	server.tool(
		"create_reminder",
		"Create a reminder in Slack",
		{
			text: z.string().describe("Reminder text"),
			time: z.string().describe("When to remind (e.g., \"in 20 minutes\", \"tomorrow at 9am\")"),
			user: z.string().optional().default("").describe("User ID to remind (optional, defaults to current user)")
		},
		/**
		 * @param {{ text: string, time: string, user?: string }} params
		 */
		async ({ text, time, user }) => {
			console.log(`🔧 Tool call: create_reminder for ${serviceName}`);
			try {
				const result = await createReminder({ text, time, user }, bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error creating reminder:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'creating reminder');
			}
		}
	);

	// Team/workspace operations
	server.tool(
		"get_team_info",
		"Get information about the Slack workspace/team",
		{},
		/**
		 * @returns {Promise<Object>}
		 */
		async () => {
			console.log(`🔧 Tool call: get_team_info for ${serviceName}`);
			try {
				const result = await getTeamInfo(bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error getting team info:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'getting team info');
			}
		}
	);

	server.tool(
		"test_auth",
		"Test Slack authentication and get user/team info",
		{},
		/**
		 * @returns {Promise<Object>}
		 */
		async () => {
			console.log(`🔧 Tool call: test_auth for ${serviceName}`);
			try {
				const result = await testAuth(bearerToken);
				return createMCPResponse(result);
			} catch (error) {
				console.error(`❌ Error testing auth:`, error);
				return createMCPErrorResponse(/** @type {Error} */ (error), 'testing auth');
			}
		}
	);
}

module.exports = {
	registerSlackTools
};