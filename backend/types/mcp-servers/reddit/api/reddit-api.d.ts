/**
 * Make authenticated Reddit API request
 * @param {string} endpoint - API endpoint path
 * @param {string} bearerToken - OAuth bearer token
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export function makeRedditRequest(endpoint: string, bearerToken: string, options?: Object): Promise<Object>;
/**
 * Get current user information
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<Object>} User information
 */
export function getCurrentUser(bearerToken: string): Promise<Object>;
/**
 * Get subreddit information
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subreddit info
 */
export function getSubredditInfo(args: {
    subreddit: string;
}, bearerToken: string): Promise<string>;
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
export function getSubredditPosts(args: {
    subreddit: string;
    sort: string;
    limit: number;
    time: string;
}, bearerToken: string): Promise<string>;
/**
 * Get post by ID
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted post data
 */
export function getPostById(args: {
    postId: string;
}, bearerToken: string): Promise<string>;
/**
 * Get post comments
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID
 * @param {string} args.sort - Comment sorting method
 * @param {number} args.limit - Number of comments to retrieve
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comments data
 */
export function getPostComments(args: {
    postId: string;
    sort: string;
    limit: number;
}, bearerToken: string): Promise<string>;
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
export function submitPost(args: {
    subreddit: string;
    title: string;
    text: string;
    url: string;
    kind: string;
    nsfw: boolean;
    spoiler: boolean;
}, bearerToken: string): Promise<string>;
/**
 * Submit a comment
 * @param {Object} args - Arguments object
 * @param {string} args.parent - Parent post or comment ID
 * @param {string} args.text - Comment text
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comment response
 */
export function submitComment(args: {
    parent: string;
    text: string;
}, bearerToken: string): Promise<string>;
/**
 * Vote on a post
 * @param {Object} args - Arguments object
 * @param {string} args.postId - Post ID to vote on
 * @param {number} args.direction - Vote direction (1, 0, -1)
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export function voteOnPost(args: {
    postId: string;
    direction: number;
}, bearerToken: string): Promise<string>;
/**
 * Vote on a comment
 * @param {Object} args - Arguments object
 * @param {string} args.commentId - Comment ID to vote on
 * @param {number} args.direction - Vote direction (1, 0, -1)
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export function voteOnComment(args: {
    commentId: string;
    direction: number;
}, bearerToken: string): Promise<string>;
/**
 * Get user information
 * @param {Object} args - Arguments object
 * @param {string} args.username - Username
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user info
 */
export function getUserInfo(args: {
    username: string;
}, bearerToken: string): Promise<string>;
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
export function getUserPosts(args: {
    username: string;
    sort: string;
    limit: number;
    time: string;
}, bearerToken: string): Promise<string>;
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
export function getUserComments(args: {
    username: string;
    sort: string;
    limit: number;
    time: string;
}, bearerToken: string): Promise<string>;
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
export function searchPosts(args: {
    query: string;
    subreddit: string;
    sort: string;
    limit: number;
    time: string;
}, bearerToken: string): Promise<string>;
/**
 * Search subreddits
 * @param {Object} args - Arguments object
 * @param {string} args.query - Search query
 * @param {number} args.limit - Number of results
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
export function searchSubreddits(args: {
    query: string;
    limit: number;
}, bearerToken: string): Promise<string>;
/**
 * Get user's inbox messages
 * @param {Object} args - Arguments object
 * @param {string} args.filter - Filter type for inbox messages
 * @param {number} args.limit - Number of messages
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted inbox messages
 */
export function getInboxMessages(args: {
    filter: string;
    limit: number;
}, bearerToken: string): Promise<string>;
/**
 * Send a private message
 * @param {Object} args - Arguments object
 * @param {string} args.to - Recipient username
 * @param {string} args.subject - Message subject
 * @param {string} args.text - Message text
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted message response
 */
export function sendMessage(args: {
    to: string;
    subject: string;
    text: string;
}, bearerToken: string): Promise<string>;
/**
 * Mark messages as read
 * @param {Object} args - Arguments object
 * @param {Array<string>} args.messageIds - Array of message IDs to mark as read
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted response
 */
export function markAsRead(args: {
    messageIds: Array<string>;
}, bearerToken: string): Promise<string>;
/**
 * Get user's subscribed subreddits
 * @param {Object} args - Arguments object
 * @param {number} args.limit - Number of subscriptions to return
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscriptions
 */
export function getSubscriptions(args: {
    limit: number;
}, bearerToken: string): Promise<string>;
/**
 * Subscribe to a subreddit
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscription response
 */
export function subscribeToSubreddit(args: {
    subreddit: string;
}, bearerToken: string): Promise<string>;
/**
 * Unsubscribe from a subreddit
 * @param {Object} args - Arguments object
 * @param {string} args.subreddit - Subreddit name
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted unsubscription response
 */
export function unsubscribeFromSubreddit(args: {
    subreddit: string;
}, bearerToken: string): Promise<string>;
//# sourceMappingURL=reddit-api.d.ts.map