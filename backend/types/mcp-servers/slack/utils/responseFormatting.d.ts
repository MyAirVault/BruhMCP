/**
 * Format a generic Slack API response
 * @param {Object} response - Raw Slack API response
 * @returns {Object} Formatted response
 */
export function formatSlackResponse(response: Object): Object;
/**
 * Create a simple text response for MCP
 * @param {string} text - Response text
 * @returns {Object} MCP response object
 */
export function createTextResponse(text: string): Object;
/**
 * Create a formatted response with multiple content blocks
 * @param {Object[]} blocks - Array of content blocks
 * @returns {Object} MCP response object
 */
export function createFormattedResponse(blocks: Object[]): Object;
/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {Object} MCP error response
 */
export function formatErrorResponse(error: Error): Object;
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
 * @param {string[]} headers - Table headers
 * @param {string[][]} rows - Table rows
 * @param {string} title - Table title
 * @returns {Object} Table MCP response object
 */
export function createTableResponse(headers: string[], rows: string[][], title?: string): Object;
//# sourceMappingURL=responseFormatting.d.ts.map