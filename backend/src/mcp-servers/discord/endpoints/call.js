/**
 * Discord MCP Tool Call Handler
 * Executes Discord API operations using OAuth Bearer tokens
 * Based on Gmail MCP service architecture
 */

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

import { validateToolArguments } from '../utils/validation.js';

/**
 * Execute a Discord tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Discord API
 * @returns {Object} Tool execution result
 */
export async function executeToolCall(toolName, args, bearerToken) {
	console.log(`🔧 Executing Discord tool: ${toolName}`);
	console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

	// Validate bearer token
	if (!bearerToken) {
		throw new Error('OAuth Bearer token is required for Discord API access');
	}

	// Validate tool arguments against schema
	try {
		validateToolArguments(toolName, args);
	} catch (validationError) {
		throw new Error(`Invalid arguments for ${toolName}: ${validationError.message}`);
	}

	try {
		let result;

		switch (toolName) {
			case 'get_current_user':
				result = await getCurrentUser(bearerToken);
				break;

			case 'get_user_guilds':
				result = await getUserGuilds(bearerToken);
				break;

			case 'get_user_connections':
				result = await getUserConnections(bearerToken);
				break;

			case 'get_guild':
				result = await getGuild(args.guildId, bearerToken);
				break;

			case 'get_guild_member':
				result = await getGuildMember(args.guildId, args.userId || '@me', bearerToken);
				break;

			case 'get_guild_channels':
				result = await getGuildChannels(args.guildId, bearerToken);
				break;

			case 'get_channel':
				result = await getChannel(args.channelId, bearerToken);
				break;

			case 'get_channel_messages':
				result = await getChannelMessages(args.channelId, args, bearerToken);
				break;

			case 'send_message':
				result = await sendMessage(args.channelId, args, bearerToken);
				break;

			case 'edit_message':
				result = await editMessage(args.channelId, args.messageId, args, bearerToken);
				break;

			case 'delete_message':
				result = await deleteMessage(args.channelId, args.messageId, bearerToken);
				break;

			case 'add_reaction':
				result = await addReaction(args.channelId, args.messageId, args.emoji, bearerToken);
				break;

			case 'remove_reaction':
				result = await removeReaction(args.channelId, args.messageId, args.emoji, bearerToken);
				break;

			case 'get_invite':
				result = await getInvite(args.inviteCode, bearerToken);
				break;

			case 'create_invite':
				result = await createInvite(args.channelId, args, bearerToken);
				break;

			default:
				throw new Error(`Unknown tool: ${toolName}`);
		}

		console.log(`✅ Tool ${toolName} executed successfully`);

		// Return MCP-compliant result format
		return {
			content: [
				{
					type: 'text',
					text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
				},
			],
		};
	} catch (error) {
		console.error(`❌ Tool ${toolName} execution failed:`, error);

		// Enhance error message with context
		const errorMessage = error.message || 'Unknown error occurred';
		const enhancedError = new Error(`Discord ${toolName} failed: ${errorMessage}`);

		// Preserve original error stack if available
		if (error.stack) {
			enhancedError.stack = error.stack;
		}

		throw enhancedError;
	}
}
