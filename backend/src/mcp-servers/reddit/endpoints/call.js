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
 * @param {import('../api/redditApi.js').GetSubredditInfoArgs | import('../api/redditApi.js').GetSubredditPostsArgs | import('../api/redditApi.js').GetPostByIdArgs | import('../api/redditApi.js').GetPostCommentsArgs | import('../api/redditApi.js').SubmitPostArgs | import('../api/redditApi.js').SubmitCommentArgs | import('../api/redditApi.js').VoteArgs | import('../api/redditApi.js').GetUserInfoArgs | import('../api/redditApi.js').GetUserPostsArgs | import('../api/redditApi.js').GetUserCommentsArgs | import('../api/redditApi.js').GetInboxMessagesArgs | import('../api/redditApi.js').SendMessageArgs | import('../api/redditApi.js').MarkAsReadArgs | import('../api/redditApi.js').SearchSubredditsArgs | import('../api/redditApi.js').SearchPostsArgs | import('../api/redditApi.js').GetSubscriptionsArgs | import('../api/redditApi.js').SubscribeArgs} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Reddit API
 * @returns {Promise<{content: Array<{type: string, text: string}>}>} Tool execution result
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
    throw new Error(`Invalid arguments for ${toolName}: ${/** @type {Error} */ (validationError).message}`);
  }

  try {
    let result;

    switch (toolName) {
      case 'get_subreddit_info':
        result = await getSubredditInfo(/** @type {import('../api/redditApi.js').GetSubredditInfoArgs} */ (args), bearerToken);
        break;

      case 'get_subreddit_posts':
        result = await getSubredditPosts(/** @type {import('../api/redditApi.js').GetSubredditPostsArgs} */ (args), bearerToken);
        break;

      case 'get_post_by_id':
        result = await getPostById(/** @type {import('../api/redditApi.js').GetPostByIdArgs} */ (args), bearerToken);
        break;

      case 'get_post_comments':
        result = await getPostComments(/** @type {import('../api/redditApi.js').GetPostCommentsArgs} */ (args), bearerToken);
        break;

      case 'submit_post':
        result = await submitPost(/** @type {import('../api/redditApi.js').SubmitPostArgs} */ (args), bearerToken);
        break;

      case 'submit_comment':
        result = await submitComment(/** @type {import('../api/redditApi.js').SubmitCommentArgs} */ (args), bearerToken);
        break;

      case 'vote_on_post':
        result = await voteOnPost(/** @type {import('../api/redditApi.js').VoteArgs} */ (args), bearerToken);
        break;

      case 'vote_on_comment':
        result = await voteOnComment(/** @type {import('../api/redditApi.js').VoteArgs} */ (args), bearerToken);
        break;

      case 'get_user_info':
        result = await getUserInfo(/** @type {import('../api/redditApi.js').GetUserInfoArgs} */ (args), bearerToken);
        break;

      case 'get_user_posts':
        result = await getUserPosts(/** @type {import('../api/redditApi.js').GetUserPostsArgs} */ (args), bearerToken);
        break;

      case 'get_user_comments':
        result = await getUserComments(/** @type {import('../api/redditApi.js').GetUserCommentsArgs} */ (args), bearerToken);
        break;

      case 'get_inbox_messages':
        result = await getInboxMessages(/** @type {import('../api/redditApi.js').GetInboxMessagesArgs} */ (args), bearerToken);
        break;

      case 'send_message':
        result = await sendMessage(/** @type {import('../api/redditApi.js').SendMessageArgs} */ (args), bearerToken);
        break;

      case 'mark_as_read':
        result = await markAsRead(/** @type {import('../api/redditApi.js').MarkAsReadArgs} */ (args), bearerToken);
        break;

      case 'search_subreddits':
        result = await searchSubreddits(/** @type {import('../api/redditApi.js').SearchSubredditsArgs} */ (args), bearerToken);
        break;

      case 'search_posts':
        result = await searchPosts(/** @type {import('../api/redditApi.js').SearchPostsArgs} */ (args), bearerToken);
        break;

      case 'get_subscriptions':
        result = await getSubscriptions(/** @type {import('../api/redditApi.js').GetSubscriptionsArgs} */ (args), bearerToken);
        break;

      case 'subscribe_to_subreddit':
        result = await subscribeToSubreddit(/** @type {import('../api/redditApi.js').SubscribeArgs} */ (args), bearerToken);
        break;

      case 'unsubscribe_from_subreddit':
        result = await unsubscribeFromSubreddit(/** @type {import('../api/redditApi.js').SubscribeArgs} */ (args), bearerToken);
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
    const errorMessage = /** @type {Error} */ (error).message || 'Unknown error occurred';
    const enhancedError = new Error(`Reddit ${toolName} failed: ${errorMessage}`);
    
    // Preserve original error stack if available
    if (/** @type {Error} */ (error).stack) {
      enhancedError.stack = /** @type {Error} */ (error).stack;
    }
    
    throw enhancedError;
  }
}