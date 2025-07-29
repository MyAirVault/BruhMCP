// @ts-check

/**
 * Gmail MCP Tool Call Handler
 * Executes Gmail API operations using OAuth Bearer tokens
 */

const { 
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
} = require('../api/gmailApi.js');

const { 
  listLabels, 
  createLabel, 
  modifyLabels 
} = require('../api/labelOperations.js');

const { validateToolArguments } = require('../utils/validation.js');

/**
 * @typedef {import('../api/modules/messageOperations.js').SendEmailArgs} SendEmailArgs
 * @typedef {import('../api/modules/messageOperations.js').FetchEmailsArgs} FetchEmailsArgs
 * @typedef {import('../api/modules/messageOperations.js').FetchMessageByIdArgs} FetchMessageByIdArgs
 * @typedef {import('../api/modules/messageOperations.js').ReplyToEmailArgs} ReplyToEmailArgs
 * @typedef {import('../api/modules/messageOperations.js').MessageIdArgs} MessageIdArgs
 * @typedef {import('../api/modules/messageOperations.js').SearchEmailsArgs} SearchEmailsArgs
 * @typedef {import('../api/modules/threadOperations.js').GetThreadArgs} GetThreadArgs
 * @typedef {import('../api/modules/draftOperations.js').CreateDraftArgs} CreateDraftArgs
 * @typedef {import('../api/modules/draftOperations.js').SendDraftArgs} SendDraftArgs
 * @typedef {import('../api/modules/draftOperations.js').ListDraftsArgs} ListDraftsArgs
 * @typedef {import('../api/labelOperations.js').CreateLabelArgs} CreateLabelArgs
 * @typedef {import('../api/labelOperations.js').ModifyLabelsArgs} ModifyLabelsArgs
 */

/**
 * @typedef {Object} MarkAsReadArgs
 * @property {string[]} messageIds - Array of message IDs to mark as read
 */

/**
 * @typedef {Object} MarkAsUnreadArgs
 * @property {string[]} messageIds - Array of message IDs to mark as unread
 */

/**
 * Union type for all possible tool arguments
 * @typedef {SendEmailArgs | FetchEmailsArgs | FetchMessageByIdArgs | ReplyToEmailArgs | 
 *           MessageIdArgs | SearchEmailsArgs | GetThreadArgs | CreateDraftArgs | 
 *           SendDraftArgs | ListDraftsArgs | CreateLabelArgs | ModifyLabelsArgs | 
 *           MarkAsReadArgs | MarkAsUnreadArgs} ToolArgs
 */

/**
 * Execute a Gmail tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {ToolArgs} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Gmail API
 * @returns {Promise<Object>} Tool execution result
 */
async function executeToolCall(toolName, args, bearerToken) {
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
    throw new Error(`Invalid arguments for ${toolName}: ${validationError instanceof Error ? validationError.message : 'Validation failed'}`);
  }

  try {
    let result;

    switch (toolName) {
      case 'send_email':
        result = await sendEmail(/** @type {SendEmailArgs} */ (args), bearerToken);
        break;

      case 'fetch_emails':
        result = await fetchEmails(/** @type {FetchEmailsArgs} */ (args), bearerToken);
        break;

      case 'fetch_message_by_id':
        result = await fetchMessageById(/** @type {FetchMessageByIdArgs} */ (args), bearerToken);
        break;

      case 'reply_to_email':
        result = await replyToEmail(/** @type {ReplyToEmailArgs} */ (args), bearerToken);
        break;

      case 'create_draft':
        result = await createDraft(/** @type {CreateDraftArgs} */ (args), bearerToken);
        break;

      case 'send_draft':
        result = await sendDraft(/** @type {SendDraftArgs} */ (args), bearerToken);
        break;

      case 'list_drafts':
        result = await listDrafts(/** @type {ListDraftsArgs} */ (args), bearerToken);
        break;

      case 'delete_message':
        result = await deleteMessage(/** @type {MessageIdArgs} */ (args), bearerToken);
        break;

      case 'move_to_trash':
        result = await moveToTrash(/** @type {MessageIdArgs} */ (args), bearerToken);
        break;

      case 'list_labels':
        result = await listLabels(bearerToken);
        break;

      case 'create_label':
        result = await createLabel(/** @type {CreateLabelArgs} */ (args), bearerToken);
        break;

      case 'modify_labels':
        result = await modifyLabels(/** @type {ModifyLabelsArgs} */ (args), bearerToken);
        break;

      case 'search_emails':
        result = await searchEmails(/** @type {SearchEmailsArgs} */ (args), bearerToken);
        break;

      case 'get_thread':
        result = await getThread(/** @type {GetThreadArgs} */ (args), bearerToken);
        break;

      case 'mark_as_read':
        result = await markAsRead(/** @type {MarkAsReadArgs} */ (args), bearerToken);
        break;

      case 'mark_as_unread':
        result = await markAsUnread(/** @type {MarkAsUnreadArgs} */ (args), bearerToken);
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
    const enhancedError = new Error(`Gmail ${toolName} failed: ${errorMessage}`);
    
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