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
export function formatRedditResponse(data: RedditFormattingData): string;
/**
 * Format Reddit error messages
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatRedditErrorMessage(operation: string, error: Error): string;
/**
 * Format Reddit post for display
 * @param {RedditPost} post - Reddit post object
 * @returns {RedditPost} Formatted post data
 */
export function formatPostData(post: RedditPost): RedditPost;
/**
 * Format Reddit comment for display
 * @param {RedditComment} comment - Reddit comment object
 * @returns {RedditComment} Formatted comment data
 */
export function formatCommentData(comment: RedditComment): RedditComment;
/**
 * Format Reddit user for display
 * @param {RedditUser} user - Reddit user object
 * @returns {RedditUser} Formatted user data
 */
export function formatUserData(user: RedditUser): RedditUser;
/**
 * Format Reddit subreddit for display
 * @param {RedditSubreddit} subreddit - Reddit subreddit object
 * @returns {RedditSubreddit} Formatted subreddit data
 */
export function formatSubredditData(subreddit: RedditSubreddit): RedditSubreddit;
export type RedditPost = {
    id: string;
    title: string;
    author: string;
    subreddit: string;
    score: number;
    num_comments: number;
    created_utc: number;
    url: string;
    selftext: string;
    is_self: boolean;
    over_18: boolean;
    spoiler: boolean;
    locked: boolean;
    stickied: boolean;
    upvote_ratio: number;
    permalink: string;
    domain: string;
    thumbnail: string;
    preview: Object;
};
export type RedditComment = {
    id: string;
    author: string;
    body: string;
    score: number;
    created_utc: number;
    subreddit: string;
    parent_id: string;
    link_id: string;
    depth: number;
    is_submitter: boolean;
    stickied: boolean;
    score_hidden: boolean;
    permalink: string;
    replies: Object;
};
export type RedditUser = {
    name: string;
    id: string;
    created_utc: number;
    comment_karma: number;
    link_karma: number;
    total_karma: number;
    is_gold: boolean;
    is_mod: boolean;
    verified: boolean;
    has_verified_email: boolean;
    icon_img: string;
    subreddit: RedditSubreddit;
};
export type RedditSubreddit = {
    display_name: string;
    id: string;
    name: string;
    title: string;
    description: string;
    public_description: string;
    subscribers: number;
    active_user_count: number;
    created_utc: number;
    over18: boolean;
    lang: string;
    subreddit_type: string;
    url: string;
    icon_img: string;
    banner_img: string;
};
export type RedditMessage = {
    id: string;
    author: string;
    subject: string;
    body: string;
    created_utc: number;
    new: boolean;
};
export type RedditFormattingData = {
    action: string;
    timestamp?: string | undefined;
    postId?: string | undefined;
    title?: string | undefined;
    subreddit?: string | undefined;
    kind?: string | undefined;
    commentId?: string | undefined;
    parent?: string | undefined;
    direction?: number | undefined;
    type?: string | undefined;
    itemId?: string | undefined;
    display_name?: string | undefined;
    public_description?: string | undefined;
    subscribers?: number | undefined;
    active_user_count?: number | undefined;
    created_utc?: number | undefined;
    subreddit_type?: string | undefined;
    over18?: boolean | undefined;
    lang?: string | undefined;
    description?: string | undefined;
    posts?: RedditPost[] | undefined;
    sort?: string | undefined;
    post?: RedditPost | undefined;
    comments?: RedditComment[] | undefined;
    user?: RedditUser | undefined;
    username?: string | undefined;
    query?: string | undefined;
    subreddits?: RedditSubreddit[] | undefined;
    subscriptions?: RedditSubreddit[] | undefined;
    messages?: RedditMessage[] | undefined;
    to?: string | undefined;
    subject?: string | undefined;
    count?: number | undefined;
    messageIds?: string[] | undefined;
};
//# sourceMappingURL=redditFormatting.d.ts.map