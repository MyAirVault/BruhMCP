/**
 * Reddit MCP Tool Call Handler
 * Executes Reddit API operations using OAuth Bearer tokens
 */

import { 
  getSubredditInfo,
  getSubredditPosts,
  getPostById,
  getPostComments,
  submitPost,
  submitComment,
  voteOnPost,
  voteOnComment,
  getUserInfo,
  getUserPosts,
  getUserComments,
  getInboxMessages,
  sendMessage,
  markAsRead,
  searchSubreddits,
  searchPosts,
  getSubscriptions,
  subscribeToSubreddit,
  unsubscribeFromSubreddit
} from '../api/redditApi.js';

import { validateToolArguments } from '../utils/validation.js';

/**
 * Execute a Reddit tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Reddit API
 * @returns {Object} Tool execution result
 */
export async function executeToolCall(toolName, args, bearerToken) {
  console.log(`🔧 Executing Reddit tool: ${toolName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

  // Validate bearer token
  if (!bearerToken) {
    throw new Error('OAuth Bearer token is required for Reddit API access');
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
      case 'get_subreddit_info':
        result = await getSubredditInfo(args, bearerToken);
        break;

      case 'get_subreddit_posts':
        result = await getSubredditPosts(args, bearerToken);
        break;

      case 'get_post_by_id':
        result = await getPostById(args, bearerToken);
        break;

      case 'get_post_comments':
        result = await getPostComments(args, bearerToken);
        break;

      case 'submit_post':
        result = await submitPost(args, bearerToken);
        break;

      case 'submit_comment':
        result = await submitComment(args, bearerToken);
        break;

      case 'vote_on_post':
        result = await voteOnPost(args, bearerToken);
        break;

      case 'vote_on_comment':
        result = await voteOnComment(args, bearerToken);
        break;

      case 'get_user_info':
        result = await getUserInfo(args, bearerToken);
        break;

      case 'get_user_posts':
        result = await getUserPosts(args, bearerToken);
        break;

      case 'get_user_comments':
        result = await getUserComments(args, bearerToken);
        break;

      case 'get_inbox_messages':
        result = await getInboxMessages(args, bearerToken);
        break;

      case 'send_message':
        result = await sendMessage(args, bearerToken);
        break;

      case 'mark_as_read':
        result = await markAsRead(args, bearerToken);
        break;

      case 'search_subreddits':
        result = await searchSubreddits(args, bearerToken);
        break;

      case 'search_posts':
        result = await searchPosts(args, bearerToken);
        break;

      case 'get_subscriptions':
        result = await getSubscriptions(args, bearerToken);
        break;

      case 'subscribe_to_subreddit':
        result = await subscribeToSubreddit(args, bearerToken);
        break;

      case 'unsubscribe_from_subreddit':
        result = await unsubscribeFromSubreddit(args, bearerToken);
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
    const enhancedError = new Error(`Reddit ${toolName} failed: ${errorMessage}`);
    
    // Preserve original error stack if available
    if (error.stack) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}