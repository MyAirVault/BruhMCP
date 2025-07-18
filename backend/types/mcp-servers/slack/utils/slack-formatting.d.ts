/**
 * Format a Slack message response
 * @param {Object} message - Raw Slack message object
 * @returns {Object} Formatted message
 */
export function formatMessageResponse(message: Object): Object;
/**
 * Format a Slack channel response
 * @param {Object} channel - Raw Slack channel object
 * @returns {Object} Formatted channel
 */
export function formatChannelResponse(channel: Object): Object;
/**
 * Format a Slack user response
 * @param {Object} user - Raw Slack user object
 * @returns {Object} Formatted user
 */
export function formatUserResponse(user: Object): Object;
/**
 * Format a Slack attachment
 * @param {Object} attachment - Raw Slack attachment object
 * @returns {Object} Formatted attachment
 */
export function formatAttachment(attachment: Object): Object;
/**
 * Format a Slack reaction
 * @param {Object} reaction - Raw Slack reaction object
 * @returns {Object} Formatted reaction
 */
export function formatReaction(reaction: Object): Object;
/**
 * Format a Slack file
 * @param {Object} file - Raw Slack file object
 * @returns {Object} Formatted file
 */
export function formatFile(file: Object): Object;
/**
 * Format a generic Slack API response
 * @param {Object} response - Raw Slack API response
 * @returns {Object} Formatted response
 */
export function formatSlackResponse(response: Object): Object;
/**
 * Format Slack timestamp to human readable format
 * @param {string} ts - Slack timestamp
 * @returns {string} Human readable timestamp
 */
export function formatSlackTimestamp(ts: string): string;
/**
 * Format Slack message text with user/channel mentions
 * @param {string} text - Raw message text
 * @param {Array} users - Array of user objects for mention resolution
 * @param {Array} channels - Array of channel objects for mention resolution
 * @returns {string} Formatted text with resolved mentions
 */
export function formatSlackText(text: string, users?: any[], channels?: any[]): string;
/**
 * Create a simple text response for MCP
 * @param {string} text - Response text
 * @returns {Object} MCP response object
 */
export function createTextResponse(text: string): Object;
/**
 * Create a formatted response with multiple content blocks
 * @param {Array} blocks - Array of content blocks
 * @returns {Object} MCP response object
 */
export function createFormattedResponse(blocks: any[]): Object;
/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {Object} MCP error response
 */
export function formatErrorResponse(error: Error): Object;
/**
 * Format search results for better readability
 * @param {Object} results - Search results from Slack API
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(results: Object, query: string): Object;
/**
 * Format team information response
 * @param {Object} team - Team information from Slack API
 * @returns {Object} Formatted team information
 */
export function formatTeamResponse(team: Object): Object;
/**
 * Format conversation history with enhanced metadata
 * @param {Object} history - Conversation history from Slack API
 * @param {Array} users - User data for mention resolution
 * @param {Array} channels - Channel data for mention resolution
 * @returns {Object} Formatted conversation history
 */
export function formatConversationHistory(history: Object, users?: any[], channels?: any[]): Object;
/**
 * Format bulk operation results
 * @param {Array} results - Array of operation results
 * @param {string} operation - Operation type
 * @returns {Object} Formatted bulk operation results
 */
export function formatBulkOperationResults(results: any[], operation: string): Object;
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
/**
 * Format file upload progress
 * @param {Object} uploadResult - File upload result
 * @returns {Object} Formatted upload result
 */
export function formatFileUploadResult(uploadResult: Object): Object;
/**
 * Create a rich text response with formatting
 * @param {string} title - Response title
 * @param {string} content - Response content
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Rich MCP response object
 */
export function createRichTextResponse(title: string, content: string, metadata?: Object): Object;
/**
 * Create a table response for structured data
 * @param {Array} headers - Table headers
 * @param {Array} rows - Table rows
 * @param {string} title - Table title
 * @returns {Object} Table MCP response object
 */
export function createTableResponse(headers: any[], rows: any[], title?: string): Object;
/**
 * Sanitize content for safe display
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content: string): string;
/**
 * Truncate long text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text: string, maxLength?: number): string;
//# sourceMappingURL=slack-formatting.d.ts.map