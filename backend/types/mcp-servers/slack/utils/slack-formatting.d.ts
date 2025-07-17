/**
 * Slack response formatting utilities
 * Formats Slack API responses for consistent output
 */
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
//# sourceMappingURL=slack-formatting.d.ts.map