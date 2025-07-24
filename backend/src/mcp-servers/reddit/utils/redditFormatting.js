/**
 * Reddit response formatting utilities
 * Standardizes Reddit API responses for MCP protocol
 */

/**
 * @typedef {Object} RedditPost
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} subreddit
 * @property {number} score
 * @property {number} num_comments
 * @property {number} created_utc
 * @property {string} url
 * @property {string} selftext
 * @property {boolean} is_self
 * @property {boolean} over_18
 * @property {boolean} spoiler
 * @property {boolean} locked
 * @property {boolean} stickied
 * @property {number} upvote_ratio
 * @property {string} permalink
 * @property {string} domain
 * @property {string} thumbnail
 * @property {Object} preview
 */

/**
 * @typedef {Object} RedditComment
 * @property {string} id
 * @property {string} author
 * @property {string} body
 * @property {number} score
 * @property {number} created_utc
 * @property {string} subreddit
 * @property {string} parent_id
 * @property {string} link_id
 * @property {number} depth
 * @property {boolean} is_submitter
 * @property {boolean} stickied
 * @property {boolean} score_hidden
 * @property {string} permalink
 * @property {Object} replies
 */

/**
 * @typedef {Object} RedditUser
 * @property {string} name
 * @property {string} id
 * @property {number} created_utc
 * @property {number} comment_karma
 * @property {number} link_karma
 * @property {number} total_karma
 * @property {boolean} is_gold
 * @property {boolean} is_mod
 * @property {boolean} verified
 * @property {boolean} has_verified_email
 * @property {string} icon_img
 * @property {RedditSubreddit} subreddit
 */

/**
 * @typedef {Object} RedditSubreddit
 * @property {string} display_name
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} description
 * @property {string} public_description
 * @property {number} subscribers
 * @property {number} active_user_count
 * @property {number} created_utc
 * @property {boolean} over18
 * @property {string} lang
 * @property {string} subreddit_type
 * @property {string} url
 * @property {string} icon_img
 * @property {string} banner_img
 */

/**
 * @typedef {Object} RedditMessage
 * @property {string} id
 * @property {string} author
 * @property {string} subject
 * @property {string} body
 * @property {number} created_utc
 * @property {boolean} new
 */

/**
 * @typedef {Object} RedditFormattingData
 * @property {string} action
 * @property {string} [timestamp]
 * @property {string} [postId]
 * @property {string} [title]
 * @property {string} [subreddit]
 * @property {string} [kind]
 * @property {string} [commentId]
 * @property {string} [parent]
 * @property {number} [direction]
 * @property {string} [type]
 * @property {string} [itemId]
 * @property {string} [display_name]
 * @property {string} [public_description]
 * @property {number} [subscribers]
 * @property {number} [active_user_count]
 * @property {number} [created_utc]
 * @property {string} [subreddit_type]
 * @property {boolean} [over18]
 * @property {string} [lang]
 * @property {string} [description]
 * @property {RedditPost[]|undefined} [posts]
 * @property {string} [sort]
 * @property {RedditPost|undefined} [post]
 * @property {RedditComment[]|undefined} [comments]
 * @property {RedditUser|undefined} [user]
 * @property {string} [username]
 * @property {string} [query]
 * @property {RedditSubreddit[]|undefined} [subreddits]
 * @property {RedditSubreddit[]|undefined} [subscriptions]
 * @property {RedditMessage[]|undefined} [messages]
 * @property {string} [to]
 * @property {string} [subject]
 * @property {number} [count]
 * @property {string[]|undefined} [messageIds]
 */

/**
 * Format Reddit API response for MCP protocol
 * @param {RedditFormattingData} data - Reddit data to format
 * @returns {string} Formatted Reddit response
 */
export function formatRedditResponse(data) {
  const timestamp = data.timestamp || new Date().toISOString();
  
  switch (data.action) {
    case 'submit_post':
      return `✅ Post submitted successfully!

Post Details:
- Post ID: ${data.postId}
- Title: ${data.title}
- Subreddit: r/${data.subreddit}
- Type: ${data.kind === 'self' ? 'Text Post' : 'Link Post'}
- URL: https://reddit.com/${data.postId}
- Posted at: ${timestamp}

Your post has been submitted to r/${data.subreddit}.`;

    case 'submit_comment':
      return `✅ Comment submitted successfully!

Comment Details:
- Comment ID: ${data.commentId}
- Parent: ${data.parent}
- Posted at: ${timestamp}

Your comment has been posted.`;

    case 'vote':
      const voteType = data.direction === 1 ? 'upvoted' : data.direction === -1 ? 'downvoted' : 'vote removed';
      return `✅ ${data.type} ${voteType} successfully!

Vote Details:
- ${data.type} ID: ${data.itemId}
- Vote: ${voteType}
- Updated at: ${timestamp}

Your vote has been recorded.`;

    case 'get_subreddit_info':
      return `📋 Subreddit Information for r/${data.subreddit}

Name: ${data.display_name}
Description: ${data.public_description || '(No description)'}
Subscribers: ${data.subscribers?.toLocaleString() || 'Unknown'}
Active Users: ${data.active_user_count || 'Unknown'}
Created: ${data.created_utc ? new Date(data.created_utc * 1000).toDateString() : 'Unknown'}
Type: ${data.subreddit_type || 'Unknown'}
Over 18: ${data.over18 ? 'Yes' : 'No'}
Language: ${data.lang || 'Unknown'}
URL: https://reddit.com/r/${data.subreddit}

${data.description ? `Full Description:\n${data.description.substring(0, 500)}${data.description.length > 500 ? '...' : ''}` : ''}`;

    case 'get_subreddit_posts':
      if (!data.posts || data.posts.length === 0) {
        return `📝 No posts found in r/${data.subreddit}

The subreddit may be empty or private.`;
      }

      const postList = data.posts.map((/** @type {RedditPost} */ post, /** @type {number} */ index) => {
        const score = post.score !== undefined ? `👍 ${post.score}` : '';
        const comments = post.num_comments !== undefined ? `💬 ${post.num_comments}` : '';
        const author = post.author ? `👤 u/${post.author}` : '';
        const created = post.created_utc ? new Date(post.created_utc * 1000).toLocaleDateString() : '';
        const postType = post.is_self ? 'Text' : 'Link';
        const url = post.url && !post.is_self ? `\n   🔗 ${post.url}` : '';
        const text = post.selftext ? `\n   ${post.selftext.substring(0, 200)}${post.selftext.length > 200 ? '...' : ''}` : '';
        
        return `${index + 1}. ${post.title}
   ${author} • ${created} • ${postType} • ${score} • ${comments}
   ID: ${post.id}${url}${text}`;
      }).join('\n\n');

      return `📝 Posts from r/${data.subreddit} (${data.sort})

${postList}`;

    case 'get_post_by_id':
      const post = data.post;
      if (!post) {
        return `❌ Post not found

The requested post may not exist or may be private.`;
      }
      const postScore = post.score !== undefined ? `👍 ${post.score}` : '';
      const postComments = post.num_comments !== undefined ? `💬 ${post.num_comments}` : '';
      const postAuthor = post.author ? `👤 u/${post.author}` : '';
      const postCreated = post.created_utc ? new Date(post.created_utc * 1000).toDateString() : '';
      const postUrl = post.url && !post.is_self ? `\n🔗 URL: ${post.url}` : '';
      const postText = post.selftext ? `\n\n📝 Content:\n${post.selftext}` : '';
      
      return `📋 Post Details

Title: ${post.title}
Subreddit: r/${post.subreddit}
Author: ${postAuthor}
Created: ${postCreated}
Type: ${post.is_self ? 'Text Post' : 'Link Post'}
Score: ${postScore}
Comments: ${postComments}
ID: ${post.id}${postUrl}${postText}`;

    case 'get_post_comments':
      if (!data.comments || data.comments.length === 0) {
        return `💬 No comments found for this post

The post may not have any comments yet.`;
      }

      const commentList = data.comments.map((/** @type {RedditComment} */ comment, /** @type {number} */ index) => {
        const score = comment.score !== undefined ? `👍 ${comment.score}` : '';
        const author = comment.author ? `👤 u/${comment.author}` : '';
        const created = comment.created_utc ? new Date(comment.created_utc * 1000).toLocaleDateString() : '';
        const body = comment.body ? comment.body.substring(0, 300) + (comment.body.length > 300 ? '...' : '') : '';
        
        return `${index + 1}. ${author} • ${created} • ${score}
   ID: ${comment.id}
   ${body}`;
      }).join('\n\n');

      return `💬 Comments for Post ${data.postId}

${commentList}`;

    case 'get_user_info':
      const user = data.user;
      if (!user) {
        return `❌ User not found

The requested user may not exist or may be private.`;
      }
      return `👤 User Information for u/${user.name}

Name: ${user.name}
Created: ${user.created_utc ? new Date(user.created_utc * 1000).toDateString() : 'Unknown'}
Comment Karma: ${user.comment_karma?.toLocaleString() || 'Unknown'}
Link Karma: ${user.link_karma?.toLocaleString() || 'Unknown'}
Total Karma: ${user.total_karma?.toLocaleString() || 'Unknown'}
Is Gold: ${user.is_gold ? 'Yes' : 'No'}
Is Mod: ${user.is_mod ? 'Yes' : 'No'}
Verified: ${user.verified ? 'Yes' : 'No'}
Has Verified Email: ${user.has_verified_email ? 'Yes' : 'No'}

${user.subreddit?.public_description ? `Profile Description:\n${user.subreddit.public_description}` : ''}`;

    case 'get_user_posts':
      if (!data.posts || data.posts.length === 0) {
        return `📝 No posts found for u/${data.username}

This user may not have any posts or their posts may be private.`;
      }

      const userPostList = data.posts.map((/** @type {RedditPost} */ post, /** @type {number} */ index) => {
        const score = post.score !== undefined ? `👍 ${post.score}` : '';
        const comments = post.num_comments !== undefined ? `💬 ${post.num_comments}` : '';
        const subreddit = post.subreddit ? `r/${post.subreddit}` : '';
        const created = post.created_utc ? new Date(post.created_utc * 1000).toLocaleDateString() : '';
        
        return `${index + 1}. ${post.title}
   ${subreddit} • ${created} • ${score} • ${comments}
   ID: ${post.id}`;
      }).join('\n\n');

      return `📝 Posts by u/${data.username}

${userPostList}`;

    case 'get_user_comments':
      if (!data.comments || data.comments.length === 0) {
        return `💬 No comments found for u/${data.username}

This user may not have any comments or their comments may be private.`;
      }

      const userCommentList = data.comments.map((/** @type {RedditComment} */ comment, /** @type {number} */ index) => {
        const score = comment.score !== undefined ? `👍 ${comment.score}` : '';
        const subreddit = comment.subreddit ? `r/${comment.subreddit}` : '';
        const created = comment.created_utc ? new Date(comment.created_utc * 1000).toLocaleDateString() : '';
        const body = comment.body ? comment.body.substring(0, 200) + (comment.body.length > 200 ? '...' : '') : '';
        
        return `${index + 1}. ${subreddit} • ${created} • ${score}
   ID: ${comment.id}
   ${body}`;
      }).join('\n\n');

      return `💬 Comments by u/${data.username}

${userCommentList}`;

    case 'search_posts':
      if (!data.posts || data.posts.length === 0) {
        return `🔍 No posts found matching "${data.query}"

Try adjusting your search terms or searching in a different subreddit.`;
      }

      const searchResults = data.posts.map((/** @type {RedditPost} */ post, /** @type {number} */ index) => {
        const score = post.score !== undefined ? `👍 ${post.score}` : '';
        const comments = post.num_comments !== undefined ? `💬 ${post.num_comments}` : '';
        const subreddit = post.subreddit ? `r/${post.subreddit}` : '';
        const author = post.author ? `u/${post.author}` : '';
        const created = post.created_utc ? new Date(post.created_utc * 1000).toLocaleDateString() : '';
        
        return `${index + 1}. ${post.title}
   ${subreddit} • ${author} • ${created} • ${score} • ${comments}
   ID: ${post.id}`;
      }).join('\n\n');

      return `🔍 Search Results for "${data.query}"

${searchResults}`;

    case 'search_subreddits':
      if (!data.subreddits || data.subreddits.length === 0) {
        return `🔍 No subreddits found matching "${data.query}"

Try different search terms or check the spelling.`;
      }

      const subredditResults = data.subreddits.map((/** @type {RedditSubreddit} */ sub, /** @type {number} */ index) => {
        const subscribers = sub.subscribers ? `👥 ${sub.subscribers.toLocaleString()}` : '';
        const description = sub.public_description ? sub.public_description.substring(0, 150) + '...' : '';
        
        return `${index + 1}. r/${sub.display_name}
   ${subscribers} subscribers
   ${description}`;
      }).join('\n\n');

      return `🔍 Subreddit Search Results for "${data.query}"

${subredditResults}`;

    case 'get_subscriptions':
      if (!data.subscriptions || data.subscriptions.length === 0) {
        return `📋 No subscriptions found

You are not subscribed to any subreddits.`;
      }

      const subscriptionList = data.subscriptions.map((/** @type {RedditSubreddit} */ sub, /** @type {number} */ index) => {
        const subscribers = sub.subscribers ? `👥 ${sub.subscribers.toLocaleString()}` : '';
        const description = sub.public_description ? sub.public_description.substring(0, 100) + '...' : '';
        
        return `${index + 1}. r/${sub.display_name}
   ${subscribers} subscribers
   ${description}`;
      }).join('\n\n');

      return `📋 Your Subscriptions

${subscriptionList}`;

    case 'subscribe':
      return `✅ Successfully subscribed to r/${data.subreddit}!

You will now see posts from r/${data.subreddit} in your home feed.`;

    case 'unsubscribe':
      return `✅ Successfully unsubscribed from r/${data.subreddit}!

You will no longer see posts from r/${data.subreddit} in your home feed.`;

    case 'get_inbox_messages':
      if (!data.messages || data.messages.length === 0) {
        return `📬 No messages found in your inbox

Your inbox is empty.`;
      }

      const messageList = data.messages.map((/** @type {RedditMessage} */ msg, /** @type {number} */ index) => {
        const author = msg.author ? `👤 u/${msg.author}` : '';
        const created = msg.created_utc ? new Date(msg.created_utc * 1000).toLocaleDateString() : '';
        const subject = msg.subject || '(No subject)';
        const body = msg.body ? msg.body.substring(0, 200) + (msg.body.length > 200 ? '...' : '') : '';
        const unread = msg.new ? '🔵 ' : '';
        
        return `${index + 1}. ${unread}${subject}
   ${author} • ${created}
   ID: ${msg.id}
   ${body}`;
      }).join('\n\n');

      return `📬 Inbox Messages

${messageList}`;

    case 'send_message':
      return `✅ Message sent successfully!

Message Details:
- To: u/${data.to}
- Subject: ${data.subject}
- Sent at: ${timestamp}

Your message has been delivered.`;

    case 'mark_as_read':
      return `📖 Marked ${data.count} message(s) as read

- Message IDs: ${data.messageIds ? data.messageIds.join(', ') : 'N/A'}
- Updated at: ${timestamp}

The messages are now marked as read.`;

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Format Reddit error messages
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatRedditErrorMessage(operation, error) {
  const timestamp = new Date().toISOString();
  
  let errorType = 'Unknown error';
  let suggestion = 'Please try again or contact support.';
  
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    errorType = 'Authentication failed';
    suggestion = 'Please check your OAuth credentials and try again.';
  } else if (error.message.includes('403') || error.message.includes('forbidden')) {
    errorType = 'Permission denied';
    suggestion = 'Please ensure your OAuth credentials have the required Reddit scopes.';
  } else if (error.message.includes('404') || error.message.includes('not found')) {
    errorType = 'Resource not found';
    suggestion = 'The requested post, comment, or user may not exist or may be private.';
  } else if (error.message.includes('400') || error.message.includes('bad request')) {
    errorType = 'Invalid request';
    suggestion = 'Please check your input parameters and try again.';
  } else if (error.message.includes('429') || error.message.includes('rate limit')) {
    errorType = 'Rate limit exceeded';
    suggestion = 'Please wait a moment before trying again.';
  } else if (error.message.includes('500') || error.message.includes('internal server')) {
    errorType = 'Reddit server error';
    suggestion = 'Reddit is experiencing issues. Please try again later.';
  }

  return `❌ Reddit ${operation} failed

Error Type: ${errorType}
Error Message: ${error.message}
Timestamp: ${timestamp}

Suggestion: ${suggestion}`;
}

/**
 * Format Reddit post for display
 * @param {RedditPost} post - Reddit post object
 * @returns {RedditPost} Formatted post data
 */
export function formatPostData(post) {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    subreddit: post.subreddit,
    score: post.score,
    num_comments: post.num_comments,
    created_utc: post.created_utc,
    url: post.url,
    selftext: post.selftext,
    is_self: post.is_self,
    over_18: post.over_18,
    spoiler: post.spoiler,
    locked: post.locked,
    stickied: post.stickied,
    upvote_ratio: post.upvote_ratio,
    permalink: post.permalink,
    domain: post.domain,
    thumbnail: post.thumbnail,
    preview: post.preview
  };
}

/**
 * Format Reddit comment for display
 * @param {RedditComment} comment - Reddit comment object
 * @returns {RedditComment} Formatted comment data
 */
export function formatCommentData(comment) {
  return {
    id: comment.id,
    author: comment.author,
    body: comment.body,
    score: comment.score,
    created_utc: comment.created_utc,
    subreddit: comment.subreddit,
    parent_id: comment.parent_id,
    link_id: comment.link_id,
    depth: comment.depth,
    is_submitter: comment.is_submitter,
    stickied: comment.stickied,
    score_hidden: comment.score_hidden,
    permalink: comment.permalink,
    replies: comment.replies
  };
}

/**
 * Format Reddit user for display
 * @param {RedditUser} user - Reddit user object
 * @returns {RedditUser} Formatted user data
 */
export function formatUserData(user) {
  return {
    name: user.name,
    id: user.id,
    created_utc: user.created_utc,
    comment_karma: user.comment_karma,
    link_karma: user.link_karma,
    total_karma: user.total_karma,
    is_gold: user.is_gold,
    is_mod: user.is_mod,
    verified: user.verified,
    has_verified_email: user.has_verified_email,
    icon_img: user.icon_img,
    subreddit: user.subreddit
  };
}

/**
 * Format Reddit subreddit for display
 * @param {RedditSubreddit} subreddit - Reddit subreddit object
 * @returns {RedditSubreddit} Formatted subreddit data
 */
export function formatSubredditData(subreddit) {
  return {
    display_name: subreddit.display_name,
    id: subreddit.id,
    name: subreddit.name,
    title: subreddit.title,
    description: subreddit.description,
    public_description: subreddit.public_description,
    subscribers: subreddit.subscribers,
    active_user_count: subreddit.active_user_count,
    created_utc: subreddit.created_utc,
    over18: subreddit.over18,
    lang: subreddit.lang,
    subreddit_type: subreddit.subreddit_type,
    url: subreddit.url,
    icon_img: subreddit.icon_img,
    banner_img: subreddit.banner_img
  };
}