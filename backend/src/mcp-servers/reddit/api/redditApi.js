/**
 * Reddit API integration module
 * Handles all Reddit API interactions with proper error handling and rate limiting
 */

const { formatRedditResponse, formatRedditErrorMessage  } = require('../utils/redditFormatting');

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Request headers
 * @property {string|URLSearchParams} [body] - Request body
 */

/**
 * @typedef {Object} RedditUser
 * @property {string} id - User ID
 * @property {string} name - Username
 * @property {string} [icon_img] - User icon URL
 * @property {number} link_karma - Link karma
 * @property {number} comment_karma - Comment karma
 * @property {boolean} is_gold - Gold status
 * @property {boolean} is_mod - Moderator status
 * @property {boolean} verified - Verified status
 * @property {number} created_utc - Creation timestamp
 */

/**
 * @typedef {Object} RedditSubreddit
 * @property {string} id - Subreddit ID
 * @property {string} display_name - Subreddit name
 * @property {string} title - Subreddit title
 * @property {string} public_description - Public description
 * @property {string} description - Full description
 * @property {number} subscribers - Subscriber count
 * @property {boolean} over18 - NSFW flag
 * @property {string} icon_img - Icon URL
 * @property {string} banner_img - Banner URL
 * @property {number} created_utc - Creation timestamp
 */

/**
 * @typedef {Object} RedditPost
 * @property {string} id - Post ID
 * @property {string} title - Post title
 * @property {string} author - Author username
 * @property {string} subreddit - Subreddit name
 * @property {string} [selftext] - Self text content
 * @property {string} [url] - Post URL
 * @property {number} score - Post score
 * @property {number} ups - Upvotes
 * @property {number} downs - Downvotes
 * @property {number} num_comments - Comment count
 * @property {boolean} over_18 - NSFW flag
 * @property {boolean} spoiler - Spoiler flag
 * @property {number} created_utc - Creation timestamp
 * @property {string} permalink - Post permalink
 */

/**
 * @typedef {Object} RedditComment
 * @property {string} id - Comment ID
 * @property {string} author - Author username
 * @property {string} body - Comment body
 * @property {number} score - Comment score
 * @property {number} ups - Upvotes
 * @property {number} downs - Downvotes
 * @property {string} parent_id - Parent ID
 * @property {number} created_utc - Creation timestamp
 * @property {string} permalink - Comment permalink
 * @property {RedditComment[]} [replies] - Nested replies
 */

/**
 * @typedef {Object} RedditApiResponse
 * @property {Object} data - Response data
 * @property {Object} [json] - JSON response data
 */

/**
 * @typedef {Object} RedditListingResponse
 * @property {Object} data - Listing data
 * @property {Object[]} data.children - Child items
 * @property {string} [data.after] - After cursor
 * @property {string} [data.before] - Before cursor
 */

/**
 * @typedef {Object} RedditSubmissionResponse
 * @property {Object} json - JSON response
 * @property {Object} json.data - Response data
 * @property {string} json.data.id - Submission ID
 * @property {Array<string[]>} [json.errors] - Error array
 */

/**
 * @typedef {Object} RedditCommentResponse
 * @property {Object} json - JSON response
 * @property {Object} json.data - Response data
 * @property {Object[]} json.data.things - Comment things
 * @property {Array<string[]>} [json.errors] - Error array
 */

/**
 * @typedef {Object} RedditMessageResponse
 * @property {Object} json - JSON response
 * @property {Array<string[]>} [json.errors] - Error array
 */

/**
 * @typedef {Object} GetSubredditInfoArgs
 * @property {string} subreddit - Subreddit name
 */

/**
 * @typedef {Object} GetSubredditPostsArgs
 * @property {string} subreddit - Subreddit name
 * @property {string} [sort] - Sort type
 * @property {number} [limit] - Post limit
 * @property {string} [time] - Time frame
 */

/**
 * @typedef {Object} GetPostByIdArgs
 * @property {string} postId - Post ID
 */

/**
 * @typedef {Object} GetPostCommentsArgs
 * @property {string} postId - Post ID
 * @property {string} [sort] - Sort type
 * @property {number} [limit] - Comment limit
 */

/**
 * @typedef {Object} SubmitPostArgs
 * @property {string} subreddit - Subreddit name
 * @property {string} title - Post title
 * @property {string} [text] - Post text
 * @property {string} [url] - Post URL
 * @property {string} [kind] - Post kind
 * @property {boolean} [nsfw] - NSFW flag
 * @property {boolean} [spoiler] - Spoiler flag
 */

/**
 * @typedef {Object} SubmitCommentArgs
 * @property {string} parent - Parent ID
 * @property {string} text - Comment text
 */

/**
 * @typedef {Object} VoteArgs
 * @property {string} postId - Post ID
 * @property {string} commentId - Comment ID
 * @property {number} direction - Vote direction
 */

/**
 * @typedef {Object} GetUserInfoArgs
 * @property {string} username - Username
 */

/**
 * @typedef {Object} GetUserPostsArgs
 * @property {string} username - Username
 * @property {string} [sort] - Sort type
 * @property {number} [limit] - Post limit
 * @property {string} [time] - Time frame
 */

/**
 * @typedef {Object} GetUserCommentsArgs
 * @property {string} username - Username
 * @property {string} [sort] - Sort type
 * @property {number} [limit] - Comment limit
 * @property {string} [time] - Time frame
 */

/**
 * @typedef {Object} SearchPostsArgs
 * @property {string} query - Search query
 * @property {string} [subreddit] - Subreddit name
 * @property {string} [sort] - Sort type
 * @property {number} [limit] - Result limit
 * @property {string} [time] - Time frame
 */

/**
 * @typedef {Object} SearchSubredditsArgs
 * @property {string} query - Search query
 * @property {number} [limit] - Result limit
 */

/**
 * @typedef {Object} GetInboxMessagesArgs
 * @property {string} [filter] - Message filter
 * @property {number} [limit] - Message limit
 */

/**
 * @typedef {Object} SendMessageArgs
 * @property {string} to - Recipient username
 * @property {string} subject - Message subject
 * @property {string} text - Message text
 */

/**
 * @typedef {Object} MarkAsReadArgs
 * @property {string[]} messageIds - Message IDs
 */

/**
 * @typedef {Object} GetSubscriptionsArgs
 * @property {number} [limit] - Subscription limit
 */

/**
 * @typedef {Object} SubscribeArgs
 * @property {string} subreddit - Subreddit name
 */

/**
 * @typedef {Object} RedditMessage
 * @property {string} id - Message ID
 * @property {string} author - Author username
 * @property {string} subject - Message subject
 * @property {string} body - Message body
 * @property {number} created_utc - Creation timestamp
 * @property {boolean} new - New message flag
 * @property {string} [parent_id] - Parent message ID
 */


/**
 * Base configuration for Reddit API
 */
const REDDIT_API_BASE_URL = 'https://oauth.reddit.com';
const USER_AGENT = 'MCP-Reddit-Service/1.0';

/**
 * Make authenticated Reddit API request
 * @param {string} endpoint - API endpoint path
 * @param {string} bearerToken - OAuth bearer token
 * @param {RequestOptions} [options] - Request options
 * @returns {Promise<RedditApiResponse|RedditListingResponse|RedditSubmissionResponse|RedditCommentResponse|RedditMessageResponse|[RedditListingResponse, RedditListingResponse]>} API response
 */
async function makeRedditRequest(endpoint, bearerToken, options = {}) {
  const url = `${REDDIT_API_BASE_URL}${endpoint}`;
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add content type for POST requests
  if (options.method === 'POST' && options.body) {
    requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reddit API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return /** @type {RedditApiResponse|RedditListingResponse|RedditSubmissionResponse|RedditCommentResponse|RedditMessageResponse|[RedditListingResponse, RedditListingResponse]} */ (await response.json());
  } catch (error) {
    console.error(`Reddit API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Get current user information
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<RedditUser>} User information
 */
async function getCurrentUser(bearerToken) {
  const response = await makeRedditRequest('/api/v1/me', bearerToken);
  return /** @type {RedditUser} */ (/** @type {RedditApiResponse} */ (response).data);
}

/**
 * Get subreddit information
 * @param {GetSubredditInfoArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subreddit info
 */
async function getSubredditInfo(args, bearerToken) {
  try {
    const response = /** @type {RedditApiResponse} */ (await makeRedditRequest(`/r/${args.subreddit}/about`, bearerToken));
    const subredditData = response.data;
    
    return formatRedditResponse({
      action: 'get_subreddit_info',
      subreddit: args.subreddit,
      ...subredditData
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subreddit_info', /** @type {Error} */ (error)));
  }
}

/**
 * Get posts from a subreddit
 * @param {GetSubredditPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted posts data
 */
async function getSubredditPosts(args, bearerToken) {
  try {
    const { subreddit, sort = 'hot', limit = 25, time = 'day' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/r/${subreddit}/${sort}?${params.toString()}`;
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(endpoint, bearerToken));
    
    const posts = /** @type {Array<{data: import('../utils/redditFormatting.js').RedditPost}>} */ (response.data.children).map(child => /** @type {import('../utils/redditFormatting.js').RedditPost} */ (child.data));
    
    return formatRedditResponse({
      action: 'get_subreddit_posts',
      subreddit,
      sort,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subreddit_posts', /** @type {Error} */ (error)));
  }
}

/**
 * Get post by ID
 * @param {GetPostByIdArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted post data
 */
async function getPostById(args, bearerToken) {
  try {
    const { postId } = args;
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(`/by_id/t3_${postId}`, bearerToken));
    
    if (!response.data.children || response.data.children.length === 0) {
      throw new Error('Post not found');
    }
    
    const post = /** @type {import('../utils/redditFormatting.js').RedditPost} */ (/** @type {Array<{data: import('../utils/redditFormatting.js').RedditPost}>} */ (response.data.children)[0].data);
    
    return formatRedditResponse({
      action: 'get_post_by_id',
      post
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_post_by_id', /** @type {Error} */ (error)));
  }
}

/**
 * Get post comments
 * @param {GetPostCommentsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comments data
 */
async function getPostComments(args, bearerToken) {
  try {
    const { postId, sort = 'confidence', limit = 50 } = args;
    const params = new URLSearchParams();
    params.append('sort', sort);
    params.append('limit', limit.toString());
    
    const endpoint = `/comments/${postId}?${params.toString()}`;
    const response = /** @type {[RedditListingResponse, RedditListingResponse]} */ (await makeRedditRequest(endpoint, bearerToken));
    
    // Reddit returns an array with post data and comments
    const commentsResponse = response[1];
    const comments = /** @type {Array<{data: import('../utils/redditFormatting.js').RedditComment}>} */ (commentsResponse.data.children).map(child => /** @type {import('../utils/redditFormatting.js').RedditComment} */ (child.data));
    
    return formatRedditResponse({
      action: 'get_post_comments',
      postId,
      comments
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_post_comments', /** @type {Error} */ (error)));
  }
}

/**
 * Submit a new post
 * @param {SubmitPostArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted submission response
 */
async function submitPost(args, bearerToken) {
  try {
    const { subreddit, title, text, url, kind = 'self', nsfw = false, spoiler = false } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('kind', kind);
    formData.append('sr', subreddit);
    formData.append('title', title);
    
    if (kind === 'self' && text) {
      formData.append('text', text);
    } else if (kind === 'link' && url) {
      formData.append('url', url);
    }
    
    if (nsfw) {
      formData.append('nsfw', 'true');
    }
    
    if (spoiler) {
      formData.append('spoiler', 'true');
    }
    
    const response = /** @type {RedditSubmissionResponse} */ (await makeRedditRequest('/api/submit', bearerToken, {
      method: 'POST',
      body: formData
    }));
    
    if (response.json && response.json.errors && response.json.errors.length > 0) {
      // Reddit API errors are arrays of [field, message, error_type]
      const error = response.json.errors[0];
      const errorMessage = Array.isArray(error) ? error[1] || error[0] : error;
      throw new Error(errorMessage);
    }
    
    const postId = response.json.data.id;
    
    return formatRedditResponse({
      action: 'submit_post',
      postId,
      title,
      subreddit,
      kind,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('submit_post', /** @type {Error} */ (error)));
  }
}

/**
 * Submit a comment
 * @param {SubmitCommentArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comment response
 */
async function submitComment(args, bearerToken) {
  try {
    const { parent, text } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('parent', parent);
    formData.append('text', text);
    
    const response = /** @type {RedditCommentResponse} */ (await makeRedditRequest('/api/comment', bearerToken, {
      method: 'POST',
      body: formData
    }));
    
    if (response.json && response.json.errors && response.json.errors.length > 0) {
      // Reddit API errors are arrays of [field, message, error_type]
      const error = response.json.errors[0];
      const errorMessage = Array.isArray(error) ? error[1] || error[0] : error;
      throw new Error(errorMessage);
    }
    
    const commentId = /** @type {{data: {id: string}}} */ (response.json.data.things[0]).data.id;
    
    return formatRedditResponse({
      action: 'submit_comment',
      commentId,
      parent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('submit_comment', /** @type {Error} */ (error)));
  }
}

/**
 * Vote on a post
 * @param {VoteArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
async function voteOnPost(args, bearerToken) {
  try {
    const { postId, direction } = args;
    const formData = new URLSearchParams();
    formData.append('dir', direction.toString());
    formData.append('id', `t3_${postId}`);
    
    await makeRedditRequest('/api/vote', bearerToken, {
      method: 'POST',
      body: formData
    });
    
    return formatRedditResponse({
      action: 'vote',
      type: 'post',
      itemId: postId,
      direction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('vote_on_post', /** @type {Error} */ (error)));
  }
}

/**
 * Vote on a comment
 * @param {VoteArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
async function voteOnComment(args, bearerToken) {
  try {
    const { commentId, direction } = args;
    const formData = new URLSearchParams();
    formData.append('dir', direction.toString());
    formData.append('id', `t1_${commentId}`);
    
    await makeRedditRequest('/api/vote', bearerToken, {
      method: 'POST',
      body: formData
    });
    
    return formatRedditResponse({
      action: 'vote',
      type: 'comment',
      itemId: commentId,
      direction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('vote_on_comment', /** @type {Error} */ (error)));
  }
}

/**
 * Get user information
 * @param {GetUserInfoArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user info
 */
async function getUserInfo(args, bearerToken) {
  try {
    const { username } = args;
    const response = /** @type {RedditApiResponse} */ (await makeRedditRequest(`/user/${username}/about`, bearerToken));
    const user = /** @type {import('../utils/redditFormatting.js').RedditUser} */ (response.data);
    
    return formatRedditResponse({
      action: 'get_user_info',
      user
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_info', /** @type {Error} */ (error)));
  }
}

/**
 * Get user's posts
 * @param {GetUserPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user posts
 */
async function getUserPosts(args, bearerToken) {
  try {
    const { username, sort = 'new', limit = 25, time = 'all' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/user/${username}/submitted/${sort}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    const responseData = /** @type {{data?: {children?: Record<string, unknown>[]}} & Record<string, unknown>} */ (response);
    const children = /** @type {Record<string, unknown>[]} */ (responseData.data?.children || []);
    const posts = /** @type {import('../utils/redditFormatting.js').RedditPost[]} */ (children.map(/** @param {Record<string, unknown>} child */ child => child.data));
    
    return formatRedditResponse({
      action: 'get_user_posts',
      username,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_posts', /** @type {Error} */ (error)));
  }
}

/**
 * Get user's comments
 * @param {GetUserCommentsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user comments
 */
async function getUserComments(args, bearerToken) {
  try {
    const { username, sort = 'new', limit = 25, time = 'all' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/user/${username}/comments/${sort}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    const responseData = /** @type {{data?: {children?: Record<string, unknown>[]}} & Record<string, unknown>} */ (response);
    const children = /** @type {Record<string, unknown>[]} */ (responseData.data?.children || []);
    const comments = /** @type {import('../utils/redditFormatting.js').RedditComment[]} */ (children.map(/** @param {Record<string, unknown>} child */ child => child.data));
    
    return formatRedditResponse({
      action: 'get_user_comments',
      username,
      comments
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_comments', /** @type {Error} */ (error)));
  }
}

/**
 * Search posts
 * @param {SearchPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
async function searchPosts(args, bearerToken) {
  try {
    const { query, subreddit, sort = 'relevance', limit = 25, time = 'all' } = args;
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('sort', sort);
    params.append('limit', limit.toString());
    params.append('t', time);
    params.append('type', 'link');
    
    if (subreddit) {
      params.append('restrict_sr', 'true');
    }
    
    const endpoint = subreddit ? 
      `/r/${subreddit}/search?${params.toString()}` : 
      `/search?${params.toString()}`;
    
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(endpoint, bearerToken));
    const posts = /** @type {Array<{data: import('../utils/redditFormatting.js').RedditPost}>} */ (response.data.children).map(child => /** @type {import('../utils/redditFormatting.js').RedditPost} */ (child.data));
    
    return formatRedditResponse({
      action: 'search_posts',
      query,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('search_posts', /** @type {Error} */ (error)));
  }
}

/**
 * Search subreddits
 * @param {SearchSubredditsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
async function searchSubreddits(args, bearerToken) {
  try {
    const { query, limit = 25 } = args;
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    params.append('type', 'sr');
    
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(`/search?${params.toString()}`, bearerToken));
    const subreddits = /** @type {Array<{data: import('../utils/redditFormatting.js').RedditSubreddit}>} */ (response.data.children).map(child => /** @type {import('../utils/redditFormatting.js').RedditSubreddit} */ (child.data));
    
    return formatRedditResponse({
      action: 'search_subreddits',
      query,
      subreddits
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('search_subreddits', /** @type {Error} */ (error)));
  }
}


/**
 * Get user's inbox messages
 * @param {GetInboxMessagesArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted inbox messages
 */
async function getInboxMessages(args, bearerToken) {
  try {
    const { limit = 25 } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const endpoint = `/message/inbox?${params.toString()}`;
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(endpoint, bearerToken));
    
    const messages = /** @type {Array<{data: RedditMessage}>} */ (response.data.children).map(child => /** @type {RedditMessage} */ (child.data));
    
    return formatRedditResponse({
      action: 'get_inbox_messages',
      messages
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_inbox_messages', /** @type {Error} */ (error)));
  }
}

/**
 * Send a private message
 * @param {SendMessageArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted message response
 */
async function sendMessage(args, bearerToken) {
  try {
    const { to, subject, text } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    
    const response = /** @type {RedditMessageResponse} */ (await makeRedditRequest('/api/compose', bearerToken, {
      method: 'POST',
      body: formData
    }));
    
    if (response.json && response.json.errors && response.json.errors.length > 0) {
      // Reddit API errors are arrays of [field, message, error_type]
      const error = response.json.errors[0];
      const errorMessage = Array.isArray(error) ? error[1] || error[0] : error;
      throw new Error(errorMessage);
    }
    
    return formatRedditResponse({
      action: 'send_message',
      to,
      subject,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('send_message', /** @type {Error} */ (error)));
  }
}

/**
 * Mark messages as read
 * @param {MarkAsReadArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted response
 */
async function markAsRead(args, bearerToken) {
  try {
    const { messageIds } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    
    // Mark each message as read
    const promises = messageIds.map(id => {
      const messageFormData = new URLSearchParams();
      messageFormData.append('id', id);
      
      return makeRedditRequest('/api/read_message', bearerToken, {
        method: 'POST',
        body: messageFormData
      });
    });
    
    await Promise.all(promises);
    
    return formatRedditResponse({
      action: 'mark_as_read',
      messageIds,
      count: messageIds.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('mark_as_read', /** @type {Error} */ (error)));
  }
}

/**
 * Get user's subscribed subreddits
 * @param {GetSubscriptionsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscriptions
 */
async function getSubscriptions(args, bearerToken) {
  try {
    const { limit = 100 } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const endpoint = `/subreddits/mine/subscriber?${params.toString()}`;
    const response = /** @type {RedditListingResponse} */ (await makeRedditRequest(endpoint, bearerToken));
    
    const subscriptions = /** @type {Array<{data: import('../utils/redditFormatting.js').RedditSubreddit}>} */ (response.data.children).map(child => /** @type {import('../utils/redditFormatting.js').RedditSubreddit} */ (child.data));
    
    return formatRedditResponse({
      action: 'get_subscriptions',
      subscriptions
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subscriptions', /** @type {Error} */ (error)));
  }
}

/**
 * Subscribe to a subreddit
 * @param {SubscribeArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscription response
 */
async function subscribeToSubreddit(args, bearerToken) {
  try {
    const { subreddit } = args;
    const formData = new URLSearchParams();
    formData.append('action', 'sub');
    formData.append('sr_name', subreddit);
    
    await makeRedditRequest('/api/subscribe', bearerToken, {
      method: 'POST',
      body: formData
    });
    
    return formatRedditResponse({
      action: 'subscribe',
      subreddit
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('subscribe_to_subreddit', /** @type {Error} */ (error)));
  }
}

/**
 * Unsubscribe from a subreddit
 * @param {SubscribeArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted unsubscription response
 */
async function unsubscribeFromSubreddit(args, bearerToken) {
  try {
    const { subreddit } = args;
    const formData = new URLSearchParams();
    formData.append('action', 'unsub');
    formData.append('sr_name', subreddit);
    
    await makeRedditRequest('/api/subscribe', bearerToken, {
      method: 'POST',
      body: formData
    });
    
    return formatRedditResponse({
      action: 'unsubscribe',
      subreddit
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('unsubscribe_from_subreddit', /** @type {Error} */ (error)));
  }
}
module.exports = {
  makeRedditRequest,
  getCurrentUser,
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
  searchPosts,
  searchSubreddits,
  getInboxMessages,
  sendMessage,
  markAsRead,
  getSubscriptions,
  subscribeToSubreddit,
  unsubscribeFromSubreddit
};