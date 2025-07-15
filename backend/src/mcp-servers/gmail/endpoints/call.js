/**
 * Gmail MCP Tool Call Handler
 * Executes Gmail API operations using OAuth Bearer tokens
 */

import { 
  sendEmail, 
  fetchEmails, 
  fetchMessageById, 
  replyToEmail, 
  createDraft, 
  sendDraft,
  listDrafts,
  deleteMessage,
  moveToTrash,
  searchEmails,
  getThread,
  markAsRead,
  markAsUnread
} from '../api/gmail-api.js';

import { 
  listLabels, 
  createLabel, 
  modifyLabels 
} from '../api/label-operations.js';

import { validateToolArguments } from '../utils/validation.js';

/**
 * Execute a Gmail tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Gmail API
 * @returns {Object} Tool execution result
 */
export async function executeToolCall(toolName, args, bearerToken) {
  console.log(`🔧 Executing Gmail tool: ${toolName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

  // Validate bearer token
  if (!bearerToken) {
    throw new Error('OAuth Bearer token is required for Gmail API access');
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
      case 'send_email':
        result = await sendEmail(args, bearerToken);
        break;

      case 'fetch_emails':
        result = await fetchEmails(args, bearerToken);
        break;

      case 'fetch_message_by_id':
        result = await fetchMessageById(args, bearerToken);
        break;

      case 'reply_to_email':
        result = await replyToEmail(args, bearerToken);
        break;

      case 'create_draft':
        result = await createDraft(args, bearerToken);
        break;

      case 'send_draft':
        result = await sendDraft(args, bearerToken);
        break;

      case 'list_drafts':
        result = await listDrafts(args, bearerToken);
        break;

      case 'delete_message':
        result = await deleteMessage(args, bearerToken);
        break;

      case 'move_to_trash':
        result = await moveToTrash(args, bearerToken);
        break;

      case 'list_labels':
        result = await listLabels(bearerToken);
        break;

      case 'create_label':
        result = await createLabel(args, bearerToken);
        break;

      case 'modify_labels':
        result = await modifyLabels(args, bearerToken);
        break;

      case 'search_emails':
        result = await searchEmails(args, bearerToken);
        break;

      case 'get_thread':
        result = await getThread(args, bearerToken);
        break;

      case 'mark_as_read':
        result = await markAsRead(args, bearerToken);
        break;

      case 'mark_as_unread':
        result = await markAsUnread(args, bearerToken);
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
    const enhancedError = new Error(`Gmail ${toolName} failed: ${errorMessage}`);
    
    // Preserve original error stack if available
    if (error.stack) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}