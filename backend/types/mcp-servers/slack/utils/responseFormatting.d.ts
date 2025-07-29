export type SlackAPIResponse = {
    /**
     * - Whether the API call was successful
     */
    ok: boolean;
    /**
     * - Error message if ok is false
     */
    error?: string | undefined;
    /**
     * - Warning message if present
     */
    warning?: string | undefined;
    /**
     * - Response metadata
     */
    response_metadata?: {
        /**
         * - Cursor for pagination
         */
        next_cursor?: string | undefined;
        /**
         * - OAuth scopes
         */
        scopes?: string[] | undefined;
        /**
         * - Accepted OAuth scopes
         */
        acceptedScopes?: string[] | undefined;
    } | undefined;
};
export type FormattedSlackResponse = {
    /**
     * - Whether the API call was successful
     */
    ok: boolean;
    /**
     * - ISO timestamp of formatting
     */
    timestamp: string;
    /**
     * - Error message if present
     */
    error?: string | undefined;
    /**
     * - Warning message if present
     */
    warning?: string | undefined;
    /**
     * - Response metadata
     */
    response_metadata?: Object | undefined;
};
export type MCPContentBlock = {
    /**
     * - Content type (usually 'text')
     */
    type: string;
    /**
     * - Content text
     */
    text: string;
};
export type MCPResponse = {
    /**
     * - Array of content blocks
     */
    content: MCPContentBlock[];
    /**
     * - Whether this is an error response
     */
    isError?: boolean | undefined;
};
/**
 * @typedef {Object} SlackAPIResponse
 * @property {boolean} ok - Whether the API call was successful
 * @property {string} [error] - Error message if ok is false
 * @property {string} [warning] - Warning message if present
 * @property {Object} [response_metadata] - Response metadata
 * @property {string} [response_metadata.next_cursor] - Cursor for pagination
 * @property {string[]} [response_metadata.scopes] - OAuth scopes
 * @property {string[]} [response_metadata.acceptedScopes] - Accepted OAuth scopes
 */
/**
 * @typedef {Object} FormattedSlackResponse
 * @property {boolean} ok - Whether the API call was successful
 * @property {string} timestamp - ISO timestamp of formatting
 * @property {string} [error] - Error message if present
 * @property {string} [warning] - Warning message if present
 * @property {Object} [response_metadata] - Response metadata
 */
/**
 * @typedef {Object} MCPContentBlock
 * @property {string} type - Content type (usually 'text')
 * @property {string} text - Content text
 */
/**
 * @typedef {Object} MCPResponse
 * @property {MCPContentBlock[]} content - Array of content blocks
 * @property {boolean} [isError] - Whether this is an error response
 */
/**
 * Format a generic Slack API response
 * @param {SlackAPIResponse|null} response - Raw Slack API response
 * @returns {FormattedSlackResponse|null} Formatted response
 */
export function formatSlackResponse(response: SlackAPIResponse | null): FormattedSlackResponse | null;
/**
 * Create a simple text response for MCP
 * @param {string} text - Response text
 * @returns {MCPResponse} MCP response object
 */
export function createTextResponse(text: string): MCPResponse;
/**
 * Create a formatted response with multiple content blocks
 * @param {MCPContentBlock[]} blocks - Array of content blocks
 * @returns {MCPResponse} MCP response object
 */
export function createFormattedResponse(blocks: MCPContentBlock[]): MCPResponse;
/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {MCPResponse} MCP error response
 */
export function formatErrorResponse(error: Error): MCPResponse;
/**
 * Create a rich text response with formatting
 * @param {string} title - Response title
 * @param {string} content - Response content
 * @param {Record<string, any>} metadata - Additional metadata
 * @returns {MCPResponse} Rich MCP response object
 */
export function createRichTextResponse(title: string, content: string, metadata?: Record<string, any>): MCPResponse;
/**
 * Create a table response for structured data
 * @param {string[]} headers - Table headers
 * @param {string[][]} rows - Table rows
 * @param {string} title - Table title
 * @returns {MCPResponse} Table MCP response object
 */
export function createTableResponse(headers: string[], rows: string[][], title?: string): MCPResponse;
//# sourceMappingURL=responseFormatting.d.ts.map