/**
 * Format search results for better readability
 * @param {Object} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(results: Object, query: string): Object;
/**
 * Format conversation history with enhanced metadata
 * @param {Object} history - Conversation history from Slack API
 * @param {Object[]} users - User data for mention resolution
 * @param {Object[]} channels - Channel data for mention resolution
 * @returns {Object} Formatted conversation history
 */
export function formatConversationHistory(history: Object, users?: Object[], channels?: Object[]): Object;
/**
 * Format bulk operation results
 * @param {Object[]} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {Object} Formatted bulk operation results
 */
export function formatBulkOperationResults(results: Object[], operation: string): Object;
/**
 * Format channel analytics data
 * @param {Object} analytics - Channel analytics data
 * @returns {Object} Formatted analytics
 */
export function formatChannelAnalytics(analytics: Object): Object;
/**
 * Format user activity summary
 * @param {Object} activity - User activity data
 * @returns {Object} Formatted activity summary
 */
export function formatUserActivity(activity: Object): Object;
/**
 * Format workspace statistics
 * @param {Object} stats - Workspace statistics
 * @returns {Object} Formatted workspace stats
 */
export function formatWorkspaceStats(stats: Object): Object;
//# sourceMappingURL=analyticsFormatting.d.ts.map