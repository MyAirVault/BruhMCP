/**
 * Create successful text response
 * @param {string} text - Response text
 * @param {Object} [options] - Response options
 * @returns {Object} MCP response
 */
export function createTextResponse(text: string, options?: Object): Object;
/**
 * Create error response
 * @param {string} message - Error message
 * @param {Object} [context] - Error context
 * @returns {Object} MCP error response
 */
export function createErrorResponse(message: string, context?: Object): Object;
/**
 * Create YAML formatted response
 * @param {any} data - Data to format
 * @param {Object} [options] - YAML formatting options
 * @returns {Object} MCP response with YAML content
 */
export function createYamlResponse(data: any, options?: Object): Object;
/**
 * Create JSON formatted response
 * @param {any} data - Data to format
 * @param {number} [indent] - JSON indentation
 * @returns {Object} MCP response with JSON content
 */
export function createJsonResponse(data: any, indent?: number): Object;
/**
 * Create table formatted response
 * @param {Array} data - Array of objects to format as table
 * @param {Array} [columns] - Column names to include
 * @returns {Object} MCP response with table content
 */
export function createTableResponse(data: any[], columns?: any[]): Object;
/**
 * Create list formatted response
 * @param {Array} items - Array of items to format as list
 * @param {boolean} [numbered] - Whether to use numbered list
 * @returns {Object} MCP response with list content
 */
export function createListResponse(items: any[], numbered?: boolean): Object;
/**
 * Create summary response with statistics
 * @param {any} data - Data to summarize
 * @param {Object} stats - Statistics object
 * @returns {Object} MCP response with summary
 */
export function createSummaryResponse(data: any, stats: Object): Object;
/**
 * Create paginated response
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @returns {Object} MCP response with pagination info
 */
export function createPaginatedResponse(data: any[], pagination: Object): Object;
/**
 * Format Airtable error for MCP response
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 * @returns {Object} MCP error response
 */
export function formatAirtableError(error: Error, context?: Object): Object;
/**
 * Create progress response for long operations
 * @param {string} operation - Operation name
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {string} [status] - Additional status message
 * @returns {Object} MCP response with progress
 */
export function createProgressResponse(operation: string, current: number, total: number, status?: string): Object;
//# sourceMappingURL=mcpResponses.d.ts.map