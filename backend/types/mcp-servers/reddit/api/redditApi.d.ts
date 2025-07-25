/**
 * Make authenticated Reddit API request
 * @param {string} endpoint - API endpoint path
 * @param {string} bearerToken - OAuth bearer token
 * @param {RequestOptions} [options] - Request options
 * @returns {Promise<RedditApiResponse|RedditListingResponse|RedditSubmissionResponse|RedditCommentResponse|RedditMessageResponse|[RedditListingResponse, RedditListingResponse]>} API response
 */
export function makeRedditRequest(endpoint: string, bearerToken: string, options?: RequestOptions): Promise<RedditApiResponse | RedditListingResponse | RedditSubmissionResponse | RedditCommentResponse | RedditMessageResponse | [RedditListingResponse, RedditListingResponse]>;
/**
 * Get current user information
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<RedditUser>} User information
 */
export function getCurrentUser(bearerToken: string): Promise<RedditUser>;
/**
 * Get subreddit information
 * @param {GetSubredditInfoArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subreddit info
 */
export function getSubredditInfo(args: GetSubredditInfoArgs, bearerToken: string): Promise<string>;
/**
 * Get posts from a subreddit
 * @param {GetSubredditPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted posts data
 */
export function getSubredditPosts(args: GetSubredditPostsArgs, bearerToken: string): Promise<string>;
/**
 * Get post by ID
 * @param {GetPostByIdArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted post data
 */
export function getPostById(args: GetPostByIdArgs, bearerToken: string): Promise<string>;
/**
 * Get post comments
 * @param {GetPostCommentsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comments data
 */
export function getPostComments(args: GetPostCommentsArgs, bearerToken: string): Promise<string>;
/**
 * Submit a new post
 * @param {SubmitPostArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted submission response
 */
export function submitPost(args: SubmitPostArgs, bearerToken: string): Promise<string>;
/**
 * Submit a comment
 * @param {SubmitCommentArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted comment response
 */
export function submitComment(args: SubmitCommentArgs, bearerToken: string): Promise<string>;
/**
 * Vote on a post
 * @param {VoteArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export function voteOnPost(args: VoteArgs, bearerToken: string): Promise<string>;
/**
 * Vote on a comment
 * @param {VoteArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted vote response
 */
export function voteOnComment(args: VoteArgs, bearerToken: string): Promise<string>;
/**
 * Get user information
 * @param {GetUserInfoArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user info
 */
export function getUserInfo(args: GetUserInfoArgs, bearerToken: string): Promise<string>;
/**
 * Get user's posts
 * @param {GetUserPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user posts
 */
export function getUserPosts(args: GetUserPostsArgs, bearerToken: string): Promise<string>;
/**
 * Get user's comments
 * @param {GetUserCommentsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted user comments
 */
export function getUserComments(args: GetUserCommentsArgs, bearerToken: string): Promise<string>;
/**
 * Search posts
 * @param {SearchPostsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
export function searchPosts(args: SearchPostsArgs, bearerToken: string): Promise<string>;
/**
 * Search subreddits
 * @param {SearchSubredditsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted search results
 */
export function searchSubreddits(args: SearchSubredditsArgs, bearerToken: string): Promise<string>;
/**
 * Get user's inbox messages
 * @param {GetInboxMessagesArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted inbox messages
 */
export function getInboxMessages(args: GetInboxMessagesArgs, bearerToken: string): Promise<string>;
/**
 * Send a private message
 * @param {SendMessageArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted message response
 */
export function sendMessage(args: SendMessageArgs, bearerToken: string): Promise<string>;
/**
 * Mark messages as read
 * @param {MarkAsReadArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted response
 */
export function markAsRead(args: MarkAsReadArgs, bearerToken: string): Promise<string>;
/**
 * Get user's subscribed subreddits
 * @param {GetSubscriptionsArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscriptions
 */
export function getSubscriptions(args: GetSubscriptionsArgs, bearerToken: string): Promise<string>;
/**
 * Subscribe to a subreddit
 * @param {SubscribeArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted subscription response
 */
export function subscribeToSubreddit(args: SubscribeArgs, bearerToken: string): Promise<string>;
/**
 * Unsubscribe from a subreddit
 * @param {SubscribeArgs} args - Arguments object
 * @param {string} bearerToken - OAuth bearer token
 * @returns {Promise<string>} Formatted unsubscription response
 */
export function unsubscribeFromSubreddit(args: SubscribeArgs, bearerToken: string): Promise<string>;
export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Request body
     */
    body?: string | URLSearchParams | undefined;
};
export type RedditUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - Username
     */
    name: string;
    /**
     * - User icon URL
     */
    icon_img?: string | undefined;
    /**
     * - Link karma
     */
    link_karma: number;
    /**
     * - Comment karma
     */
    comment_karma: number;
    /**
     * - Gold status
     */
    is_gold: boolean;
    /**
     * - Moderator status
     */
    is_mod: boolean;
    /**
     * - Verified status
     */
    verified: boolean;
    /**
     * - Creation timestamp
     */
    created_utc: number;
};
export type RedditSubreddit = {
    /**
     * - Subreddit ID
     */
    id: string;
    /**
     * - Subreddit name
     */
    display_name: string;
    /**
     * - Subreddit title
     */
    title: string;
    /**
     * - Public description
     */
    public_description: string;
    /**
     * - Full description
     */
    description: string;
    /**
     * - Subscriber count
     */
    subscribers: number;
    /**
     * - NSFW flag
     */
    over18: boolean;
    /**
     * - Icon URL
     */
    icon_img: string;
    /**
     * - Banner URL
     */
    banner_img: string;
    /**
     * - Creation timestamp
     */
    created_utc: number;
};
export type RedditPost = {
    /**
     * - Post ID
     */
    id: string;
    /**
     * - Post title
     */
    title: string;
    /**
     * - Author username
     */
    author: string;
    /**
     * - Subreddit name
     */
    subreddit: string;
    /**
     * - Self text content
     */
    selftext?: string | undefined;
    /**
     * - Post URL
     */
    url?: string | undefined;
    /**
     * - Post score
     */
    score: number;
    /**
     * - Upvotes
     */
    ups: number;
    /**
     * - Downvotes
     */
    downs: number;
    /**
     * - Comment count
     */
    num_comments: number;
    /**
     * - NSFW flag
     */
    over_18: boolean;
    /**
     * - Spoiler flag
     */
    spoiler: boolean;
    /**
     * - Creation timestamp
     */
    created_utc: number;
    /**
     * - Post permalink
     */
    permalink: string;
};
export type RedditComment = {
    /**
     * - Comment ID
     */
    id: string;
    /**
     * - Author username
     */
    author: string;
    /**
     * - Comment body
     */
    body: string;
    /**
     * - Comment score
     */
    score: number;
    /**
     * - Upvotes
     */
    ups: number;
    /**
     * - Downvotes
     */
    downs: number;
    /**
     * - Parent ID
     */
    parent_id: string;
    /**
     * - Creation timestamp
     */
    created_utc: number;
    /**
     * - Comment permalink
     */
    permalink: string;
    /**
     * - Nested replies
     */
    replies?: RedditComment[] | undefined;
};
export type RedditApiResponse = {
    /**
     * - Response data
     */
    data: Object;
    /**
     * - JSON response data
     */
    json?: Object | undefined;
};
export type RedditListingResponse = {
    /**
     * - Listing data
     */
    data: {
        children: Object[];
        after?: string | undefined;
        before?: string | undefined;
    };
};
export type RedditSubmissionResponse = {
    /**
     * - JSON response
     */
    json: {
        data: {
            id: string;
        };
        errors?: string[][] | undefined;
    };
};
export type RedditCommentResponse = {
    /**
     * - JSON response
     */
    json: {
        data: {
            things: Object[];
        };
        errors?: string[][] | undefined;
    };
};
export type RedditMessageResponse = {
    /**
     * - JSON response
     */
    json: {
        errors?: string[][] | undefined;
    };
};
export type GetSubredditInfoArgs = {
    /**
     * - Subreddit name
     */
    subreddit: string;
};
export type GetSubredditPostsArgs = {
    /**
     * - Subreddit name
     */
    subreddit: string;
    /**
     * - Sort type
     */
    sort?: string | undefined;
    /**
     * - Post limit
     */
    limit?: number | undefined;
    /**
     * - Time frame
     */
    time?: string | undefined;
};
export type GetPostByIdArgs = {
    /**
     * - Post ID
     */
    postId: string;
};
export type GetPostCommentsArgs = {
    /**
     * - Post ID
     */
    postId: string;
    /**
     * - Sort type
     */
    sort?: string | undefined;
    /**
     * - Comment limit
     */
    limit?: number | undefined;
};
export type SubmitPostArgs = {
    /**
     * - Subreddit name
     */
    subreddit: string;
    /**
     * - Post title
     */
    title: string;
    /**
     * - Post text
     */
    text?: string | undefined;
    /**
     * - Post URL
     */
    url?: string | undefined;
    /**
     * - Post kind
     */
    kind?: string | undefined;
    /**
     * - NSFW flag
     */
    nsfw?: boolean | undefined;
    /**
     * - Spoiler flag
     */
    spoiler?: boolean | undefined;
};
export type SubmitCommentArgs = {
    /**
     * - Parent ID
     */
    parent: string;
    /**
     * - Comment text
     */
    text: string;
};
export type VoteArgs = {
    /**
     * - Post ID
     */
    postId: string;
    /**
     * - Comment ID
     */
    commentId: string;
    /**
     * - Vote direction
     */
    direction: number;
};
export type GetUserInfoArgs = {
    /**
     * - Username
     */
    username: string;
};
export type GetUserPostsArgs = {
    /**
     * - Username
     */
    username: string;
    /**
     * - Sort type
     */
    sort?: string | undefined;
    /**
     * - Post limit
     */
    limit?: number | undefined;
    /**
     * - Time frame
     */
    time?: string | undefined;
};
export type GetUserCommentsArgs = {
    /**
     * - Username
     */
    username: string;
    /**
     * - Sort type
     */
    sort?: string | undefined;
    /**
     * - Comment limit
     */
    limit?: number | undefined;
    /**
     * - Time frame
     */
    time?: string | undefined;
};
export type SearchPostsArgs = {
    /**
     * - Search query
     */
    query: string;
    /**
     * - Subreddit name
     */
    subreddit?: string | undefined;
    /**
     * - Sort type
     */
    sort?: string | undefined;
    /**
     * - Result limit
     */
    limit?: number | undefined;
    /**
     * - Time frame
     */
    time?: string | undefined;
};
export type SearchSubredditsArgs = {
    /**
     * - Search query
     */
    query: string;
    /**
     * - Result limit
     */
    limit?: number | undefined;
};
export type GetInboxMessagesArgs = {
    /**
     * - Message filter
     */
    filter?: string | undefined;
    /**
     * - Message limit
     */
    limit?: number | undefined;
};
export type SendMessageArgs = {
    /**
     * - Recipient username
     */
    to: string;
    /**
     * - Message subject
     */
    subject: string;
    /**
     * - Message text
     */
    text: string;
};
export type MarkAsReadArgs = {
    /**
     * - Message IDs
     */
    messageIds: string[];
};
export type GetSubscriptionsArgs = {
    /**
     * - Subscription limit
     */
    limit?: number | undefined;
};
export type SubscribeArgs = {
    /**
     * - Subreddit name
     */
    subreddit: string;
};
export type RedditMessage = {
    /**
     * - Message ID
     */
    id: string;
    /**
     * - Author username
     */
    author: string;
    /**
     * - Message subject
     */
    subject: string;
    /**
     * - Message body
     */
    body: string;
    /**
     * - Creation timestamp
     */
    created_utc: number;
    /**
     * - New message flag
     */
    new: boolean;
    /**
     * - Parent message ID
     */
    parent_id?: string | undefined;
};
//# sourceMappingURL=redditApi.d.ts.map