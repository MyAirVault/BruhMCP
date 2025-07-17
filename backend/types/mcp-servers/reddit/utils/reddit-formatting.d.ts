/**
 * Reddit response formatting utilities
 * Standardizes Reddit API responses for MCP protocol
 */
/**
 * Format Reddit API response for MCP protocol
 * @param {Object} data - Reddit data to format
 * @returns {string} Formatted Reddit response
 */
export function formatRedditResponse(data: Object): string;
/**
 * Format Reddit error messages
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatRedditErrorMessage(operation: string, error: Error): string;
/**
 * Format Reddit post for display
 * @param {Object} post - Reddit post object
 * @returns {Object} Formatted post data
 */
export function formatPostData(post: Object): Object;
/**
 * Format Reddit comment for display
 * @param {Object} comment - Reddit comment object
 * @returns {Object} Formatted comment data
 */
export function formatCommentData(comment: Object): Object;
/**
 * Format Reddit user for display
 * @param {Object} user - Reddit user object
 * @returns {Object} Formatted user data
 */
export function formatUserData(user: Object): Object;
/**
 * Format Reddit subreddit for display
 * @param {Object} subreddit - Reddit subreddit object
 * @returns {Object} Formatted subreddit data
 */
export function formatSubredditData(subreddit: Object): Object;
//# sourceMappingURL=reddit-formatting.d.ts.map