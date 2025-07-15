/**
 * Gmail response formatting utilities
 * Standardizes Gmail API responses for MCP protocol
 */
/**
 * Format email response for MCP protocol
 * @param {Object} data - Email data to format
 * @returns {string} Formatted email response
 */
export function formatEmailResponse(data: Object): string;
/**
 * Format individual message response
 * @param {Object} message - Gmail message object
 * @returns {Object} Formatted message data
 */
export function formatMessageResponse(message: Object): Object;
/**
 * Format draft response for MCP protocol
 * @param {Object} data - Draft data to format
 * @returns {string} Formatted draft response
 */
export function formatDraftResponse(data: Object): string;
/**
 * Format search results for better readability
 * @param {Array} messages - Array of message objects
 * @param {string} query - Search query used
 * @returns {string} Formatted search results
 */
export function formatSearchResults(messages: any[], query: string): string;
/**
 * Format error messages for Gmail operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(operation: string, error: Error): string;
//# sourceMappingURL=gmail-formatting.d.ts.map