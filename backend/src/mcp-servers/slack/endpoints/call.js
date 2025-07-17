/**
 * Slack MCP Tool Call Handler
 * Executes Slack API operations using OAuth Bearer tokens
 */

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

import { validateToolArguments } from '../utils/validation.js';

/**
 * Execute a Slack tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Slack API
 * @returns {Object} Tool execution result
 */
export async function executeToolCall(toolName, args, bearerToken) {
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
    throw new Error(`Invalid arguments for ${toolName}: ${validationError.message}`);
  }

  try {
    let result;

    switch (toolName) {
      case 'send_message':
        result = await sendMessage(args, bearerToken);
        break;

      case 'get_messages':
        result = await getMessages(args, bearerToken);
        break;

      case 'get_thread_messages':
        result = await getThreadMessages(args, bearerToken);
        break;

      case 'delete_message':
        result = await deleteMessage(args, bearerToken);
        break;

      case 'update_message':
        result = await updateMessage(args, bearerToken);
        break;

      case 'list_channels':
        result = await listChannels(args, bearerToken);
        break;

      case 'get_channel_info':
        result = await getChannelInfo(args, bearerToken);
        break;

      case 'join_channel':
        result = await joinChannel(args, bearerToken);
        break;

      case 'leave_channel':
        result = await leaveChannel(args, bearerToken);
        break;

      case 'get_user_info':
        result = await getUserInfo(args, bearerToken);
        break;

      case 'list_users':
        result = await listUsers(args, bearerToken);
        break;

      case 'add_reaction':
        result = await addReaction(args, bearerToken);
        break;

      case 'remove_reaction':
        result = await removeReaction(args, bearerToken);
        break;

      case 'get_reactions':
        result = await getReactions(args, bearerToken);
        break;

      case 'upload_file':
        result = await uploadFile(args, bearerToken);
        break;

      case 'get_file_info':
        result = await getFileInfo(args, bearerToken);
        break;

      case 'create_reminder':
        result = await createReminder(args, bearerToken);
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
    const errorMessage = error.message || 'Unknown error occurred';
    const enhancedError = new Error(`Slack ${toolName} failed: ${errorMessage}`);
    
    // Preserve original error stack if available
    if (error.stack) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}