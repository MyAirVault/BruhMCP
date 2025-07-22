/**
 * Google Sheets response formatting utilities
 * Provides consistent response formatting for Google Sheets API operations
 * Based on Gmail MCP implementation patterns
 */
/**
 * Format response for different Google Sheets operations
 * @param {string} operation - Operation type
 * @param {Object} data - Raw API response data
 * @returns {string} Formatted response string
 */
export function formatSheetsResponse(operation: string, data: Object): string;
/**
 * Format error response
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatSheetsError(operation: string, error: Error): string;
/**
 * Truncate response if too long
 * @param {string} response - Response string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated response
 */
export function truncateResponse(response: string, maxLength?: number): string;
//# sourceMappingURL=sheets-formatting.d.ts.map