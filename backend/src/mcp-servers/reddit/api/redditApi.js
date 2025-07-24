/**
 * Reddit API integration module
 * Handles all Reddit API interactions with proper error handling and rate limiting
 */

import { formatRedditResponse, formatRedditErrorMessage } from '../utils/redditFormatting.js';

/**
 * Base configuration for Reddit API
 */
const REDDIT_API_BASE_URL = 'https://oauth.reddit.com';
const USER_AGENT = 'MCP-Reddit-Service/1.0';

/**
 * Make authenticated Reddit API request
 * @param {string} endpoint - API endpoint path
 * @param {string} bearerToken - OAuth bearer token
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function makeRedditRequest(endpoint, bearerToken, options = {}) {
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
    
    return await response.json();
  } catch (error) {
    console.error(`Reddit API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Get current user information
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<Object>} User information
 */
export async function getCurrentUser(bearerToken) {
  return await makeRedditRequest('/api/v1/me', bearerToken);
}

/**
 * Get subreddit information
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subreddit info
 */
export async function getSubredditInfo(args, bearerToken) {
  try {
    const response = await makeRedditRequest(`/r/${args.subreddit}/about`, bearerToken);
    const subredditData = response.data;
    
    return formatRedditResponse({
      action: 'get_subreddit_info',
      subreddit: args.subreddit,
      ...subredditData
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subreddit_info', error));
  }
}

/**
 * Get posts from a subreddit
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} args.sort - Sort type (hot, new, rising, top)
 * @param {number} args.limit - Number of posts to fetch
 * @param {string} args.time - Time frame for 'top' sort
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted posts data
 */
export async function getSubredditPosts(args, bearerToken) {
  try {
    const { subreddit, sort = 'hot', limit = 25, time = 'day' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/r/${subreddit}/${sort}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    const posts = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_subreddit_posts',
      subreddit,
      sort,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subreddit_posts', error));
  }
}

/**
 * Get post by ID
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted post data
 */
export async function getPostById(args, bearerToken) {
  try {
    const { postId } = args;
    const response = await makeRedditRequest(`/by_id/t3_${postId}`, bearerToken);
    
    if (!response.data.children || response.data.children.length === 0) {
      throw new Error('Post not found');
    }
    
    const post = response.data.children[0].data;
    
    return formatRedditResponse({
      action: 'get_post_by_id',
      post
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_post_by_id', error));
  }
}

/**
 * Get post comments
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID
 * @param {string} args.sort - Comment sorting method
 * @param {number} args.limit - Number of comments to retrieve
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comments data
 */
export async function getPostComments(args, bearerToken) {
  try {
    const { postId, sort = 'confidence', limit = 50 } = args;
    const params = new URLSearchParams();
    params.append('sort', sort);
    params.append('limit', limit.toString());
    
    const endpoint = `/comments/${postId}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    // Reddit returns an array with post data and comments
    const comments = response[1].data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_post_comments',
      postId,
      comments
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_post_comments', error));
  }
}

/**
 * Submit a new post
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit to submit to
 * @param {string} args.title - Post title
 * @param {string} args.text - Post text (for self posts)
 * @param {string} args.url - Post URL (for link posts)
 * @param {string} args.kind - Post kind ('self' or 'link')
 * @param {boolean} args.nsfw - Mark post as NSFW
 * @param {boolean} args.spoiler - Mark post as spoiler
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted submission response
 */
export async function submitPost(args, bearerToken) {
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
    
    const response = await makeRedditRequest('/api/submit', bearerToken, {
      method: 'POST',
      body: formData
    });
    
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
    throw new Error(formatRedditErrorMessage('submit_post', error));
  }
}

/**
 * Submit a comment
 * @param {Object} args - Arguments object
 * @param {string} args.parent - Parent post or comment ID
 * @param {string} args.text - Comment text
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comment response
 */
export async function submitComment(args, bearerToken) {
  try {
    const { parent, text } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('parent', parent);
    formData.append('text', text);
    
    const response = await makeRedditRequest('/api/comment', bearerToken, {
      method: 'POST',
      body: formData
    });
    
    if (response.json && response.json.errors && response.json.errors.length > 0) {
      // Reddit API errors are arrays of [field, message, error_type]
      const error = response.json.errors[0];
      const errorMessage = Array.isArray(error) ? error[1] || error[0] : error;
      throw new Error(errorMessage);
    }
    
    const commentId = response.json.data.things[0].data.id;
    
    return formatRedditResponse({
      action: 'submit_comment',
      commentId,
      parent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('submit_comment', error));
  }
}

/**
 * Vote on a post
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID to vote on
 * @param {number} args.direction - Vote direction (1, 0, -1)
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export async function voteOnPost(args, bearerToken) {
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
    throw new Error(formatRedditErrorMessage('vote_on_post', error));
  }
}

/**
 * Vote on a comment
 * @param {Object} args - Arguments object
 * @param {string} args.commentId - Comment ID to vote on
 * @param {number} args.direction - Vote direction (1, 0, -1)
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export async function voteOnComment(args, bearerToken) {
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
    throw new Error(formatRedditErrorMessage('vote_on_comment', error));
  }
}

/**
 * Get user information
 * @param {Object} args - Arguments object
 * @param {string} args.username - Username
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user info
 */
export async function getUserInfo(args, bearerToken) {
  try {
    const { username } = args;
    const response = await makeRedditRequest(`/user/${username}/about`, bearerToken);
    const user = response.data;
    
    return formatRedditResponse({
      action: 'get_user_info',
      user
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_info', error));
  }
}

/**
 * Get user's posts
 * @param {Object} args - Arguments object
 * @param {string} args.username - Username
 * @param {string} args.sort - Sort type
 * @param {number} args.limit - Number of posts
 * @param {string} args.time - Time frame
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user posts
 */
export async function getUserPosts(args, bearerToken) {
  try {
    const { username, sort = 'new', limit = 25, time = 'all' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/user/${username}/submitted/${sort}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    const posts = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_user_posts',
      username,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_posts', error));
  }
}

/**
 * Get user's comments
 * @param {Object} args - Arguments object
 * @param {string} args.username - Username
 * @param {string} args.sort - Sort type
 * @param {number} args.limit - Number of comments
 * @param {string} args.time - Time frame
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user comments
 */
export async function getUserComments(args, bearerToken) {
  try {
    const { username, sort = 'new', limit = 25, time = 'all' } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (sort === 'top') {
      params.append('t', time);
    }
    
    const endpoint = `/user/${username}/comments/${sort}?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    const comments = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_user_comments',
      username,
      comments
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_user_comments', error));
  }
}

/**
 * Search posts
 * @param {Object} args - Arguments object
 * @param {string} args.query - Search query
 * @param {string} args.subreddit - Subreddit to search (optional)
 * @param {string} args.sort - Sort type
 * @param {number} args.limit - Number of results
 * @param {string} args.time - Time frame
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
export async function searchPosts(args, bearerToken) {
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
    
    const response = await makeRedditRequest(endpoint, bearerToken);
    const posts = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'search_posts',
      query,
      posts
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('search_posts', error));
  }
}

/**
 * Search subreddits
 * @param {Object} args - Arguments object
 * @param {string} args.query - Search query
 * @param {number} args.limit - Number of results
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
export async function searchSubreddits(args, bearerToken) {
  try {
    const { query, limit = 25 } = args;
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    params.append('type', 'sr');
    
    const response = await makeRedditRequest(`/search?${params.toString()}`, bearerToken);
    const subreddits = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'search_subreddits',
      query,
      subreddits
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('search_subreddits', error));
  }
}


/**
 * Get user's inbox messages
 * @param {Object} args - Arguments object
 * @param {string} args.filter - Filter type for inbox messages
 * @param {number} args.limit - Number of messages
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted inbox messages
 */
export async function getInboxMessages(args, bearerToken) {
  try {
    const { filter = 'all', limit = 25 } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const endpoint = `/message/inbox?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    const messages = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_inbox_messages',
      messages
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_inbox_messages', error));
  }
}

/**
 * Send a private message
 * @param {Object} args - Arguments object
 * @param {string} args.to - Recipient username
 * @param {string} args.subject - Message subject
 * @param {string} args.text - Message text
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted message response
 */
export async function sendMessage(args, bearerToken) {
  try {
    const { to, subject, text } = args;
    const formData = new URLSearchParams();
    formData.append('api_type', 'json');
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    
    const response = await makeRedditRequest('/api/compose', bearerToken, {
      method: 'POST',
      body: formData
    });
    
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
    throw new Error(formatRedditErrorMessage('send_message', error));
  }
}

/**
 * Mark messages as read
 * @param {Object} args - Arguments object
 * @param {Array<string>} args.messageIds - Array of message IDs to mark as read
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted response
 */
export async function markAsRead(args, bearerToken) {
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
    throw new Error(formatRedditErrorMessage('mark_as_read', error));
  }
}

/**
 * Get user's subscribed subreddits
 * @param {Object} args - Arguments object
 * @param {number} args.limit - Number of subscriptions to return
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscriptions
 */
export async function getSubscriptions(args, bearerToken) {
  try {
    const { limit = 100 } = args;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    const endpoint = `/subreddits/mine/subscriber?${params.toString()}`;
    const response = await makeRedditRequest(endpoint, bearerToken);
    
    const subscriptions = response.data.children.map(child => child.data);
    
    return formatRedditResponse({
      action: 'get_subscriptions',
      subscriptions
    });
  } catch (error) {
    throw new Error(formatRedditErrorMessage('get_subscriptions', error));
  }
}

/**
 * Subscribe to a subreddit
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscription response
 */
export async function subscribeToSubreddit(args, bearerToken) {
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
    throw new Error(formatRedditErrorMessage('subscribe_to_subreddit', error));
  }
}

/**
 * Unsubscribe from a subreddit
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted unsubscription response
 */
export async function unsubscribeFromSubreddit(args, bearerToken) {
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
    throw new Error(formatRedditErrorMessage('unsubscribe_from_subreddit', error));
  }
}