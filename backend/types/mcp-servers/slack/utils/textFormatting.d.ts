export type SlackUserFormatting = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User name
     */
    name: string;
};
/**
 * Text formatting utilities for Slack
 * Handles text processing, mentions, and timestamp formatting
 */
/**
 * Format Slack timestamp to human readable format
 * @param {string} ts - Slack timestamp
 * @returns {string|null} Human readable timestamp
 */
export function formatSlackTimestamp(ts: string): string | null;
/**
 * @typedef {Object} SlackUserFormatting
 * @property {string} id - User ID
 * @property {string} name - User name
 */
/**
 * Format Slack message text with user mentions
 * @param {string} text - Raw message text
 * @param {SlackUserFormatting[]} users - Array of user objects for mention resolution
 * @returns {string} Formatted text with resolved mentions
 */
export function formatSlackText(text: string, users?: SlackUserFormatting[]): string;
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
//# sourceMappingURL=textFormatting.d.ts.map