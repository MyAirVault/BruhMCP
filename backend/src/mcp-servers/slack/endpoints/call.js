/**
 * Slack MCP Tool Call Handler
 * Executes Slack API operations using OAuth Bearer tokens
 */

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

const { validateToolArguments  } = require('../utils/validation');

/**
 * @typedef {import('../api/modules/messageOperations.js').SendMessageArgs} SendMessageArgs
 * @typedef {import('../api/modules/messageOperations.js').GetMessagesArgs} GetMessagesArgs
 * @typedef {import('../api/modules/messageOperations.js').GetThreadMessagesArgs} GetThreadMessagesArgs
 * @typedef {import('../api/modules/messageOperations.js').DeleteMessageArgs} DeleteMessageArgs
 * @typedef {import('../api/modules/messageOperations.js').UpdateMessageArgs} UpdateMessageArgs
 * @typedef {import('../api/modules/channelOperations.js').ListChannelsArgs} ListChannelsArgs
 * @typedef {import('../api/modules/channelOperations.js').ChannelInfoArgs} ChannelInfoArgs
 * @typedef {import('../api/modules/channelOperations.js').JoinChannelArgs} JoinChannelArgs
 * @typedef {import('../api/modules/channelOperations.js').LeaveChannelArgs} LeaveChannelArgs
 * @typedef {import('../api/modules/userOperations.js').UserInfoArgs} UserInfoArgs
 * @typedef {import('../api/modules/userOperations.js').ListUsersArgs} ListUsersArgs
 * @typedef {import('../api/modules/reactionOperations.js').ReactionArgs} ReactionArgs
 * @typedef {import('../api/modules/reactionOperations.js').GetReactionsArgs} GetReactionsArgs
 * @typedef {import('../api/modules/fileOperations.js').UploadFileArgs} UploadFileArgs
 * @typedef {import('../api/modules/fileOperations.js').FileInfoArgs} FileInfoArgs
 * @typedef {import('../api/modules/miscOperations.js').CreateReminderArgs} CreateReminderArgs
 */

/**
 * @typedef {Object} ToolExecutionResult
 * @property {Array<{type: string, text: string}>} content - MCP-compliant result content
 */

/**
 * Union type for all possible tool arguments
 * @typedef {SendMessageArgs|GetMessagesArgs|GetThreadMessagesArgs|DeleteMessageArgs|UpdateMessageArgs|ListChannelsArgs|ChannelInfoArgs|JoinChannelArgs|LeaveChannelArgs|UserInfoArgs|ListUsersArgs|ReactionArgs|GetReactionsArgs|UploadFileArgs|FileInfoArgs|CreateReminderArgs|Record<string, never>} ToolArguments
 */

/**
 * Execute a Slack tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {ToolArguments} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Slack API
 * @returns {Promise<ToolExecutionResult>} Tool execution result
 */
async function executeToolCall(toolName, args, bearerToken) {
  console.log(`🔧 Executing Slack tool: ${toolName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

  // Validate bearer token
  if (!bearerToken) {
    throw new Error('OAuth Bearer token is required for Slack API access');
  }

  // Validate tool arguments against schema
  try {
    validateToolArguments(toolName, args);
  } catch (validationError) {
    const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown validation error';
    throw new Error(`Invalid arguments for ${toolName}: ${errorMessage}`);
  }

  try {
    let result;

    switch (toolName) {
      case 'send_message':
        result = await sendMessage(/** @type {SendMessageArgs} */ (args), bearerToken);
        break;

      case 'get_messages':
        result = await getMessages(/** @type {GetMessagesArgs} */ (args), bearerToken);
        break;

      case 'get_thread_messages':
        result = await getThreadMessages(/** @type {GetThreadMessagesArgs} */ (args), bearerToken);
        break;

      case 'delete_message':
        result = await deleteMessage(/** @type {DeleteMessageArgs} */ (args), bearerToken);
        break;

      case 'update_message':
        result = await updateMessage(/** @type {UpdateMessageArgs} */ (args), bearerToken);
        break;

      case 'list_channels':
        result = await listChannels(/** @type {ListChannelsArgs} */ (args), bearerToken);
        break;

      case 'get_channel_info':
        result = await getChannelInfo(/** @type {ChannelInfoArgs} */ (args), bearerToken);
        break;

      case 'join_channel':
        result = await joinChannel(/** @type {JoinChannelArgs} */ (args), bearerToken);
        break;

      case 'leave_channel':
        result = await leaveChannel(/** @type {LeaveChannelArgs} */ (args), bearerToken);
        break;

      case 'get_user_info':
        result = await getUserInfo(/** @type {UserInfoArgs} */ (args), bearerToken);
        break;

      case 'list_users':
        result = await listUsers(/** @type {ListUsersArgs} */ (args), bearerToken);
        break;

      case 'add_reaction':
        result = await addReaction(/** @type {ReactionArgs} */ (args), bearerToken);
        break;

      case 'remove_reaction':
        result = await removeReaction(/** @type {ReactionArgs} */ (args), bearerToken);
        break;

      case 'get_reactions':
        result = await getReactions(/** @type {GetReactionsArgs} */ (args), bearerToken);
        break;

      case 'upload_file':
        result = await uploadFile(/** @type {UploadFileArgs} */ (args), bearerToken);
        break;

      case 'get_file_info':
        result = await getFileInfo(/** @type {FileInfoArgs} */ (args), bearerToken);
        break;

      case 'create_reminder':
        result = await createReminder(/** @type {CreateReminderArgs} */ (args), bearerToken);
        break;

      case 'get_team_info':
        result = await getTeamInfo(bearerToken);
        break;

      case 'test_auth':
        result = await testAuth(bearerToken);
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
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        }
      ]
    };

  } catch (error) {
    console.error(`❌ Tool ${toolName} execution failed:`, error);
    
    // Enhance error message with context
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const enhancedError = new Error(`Slack ${toolName} failed: ${errorMessage}`);
    
    // Preserve original error stack if available
    if (error instanceof Error && error.stack) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}
module.exports = {
  executeToolCall
};