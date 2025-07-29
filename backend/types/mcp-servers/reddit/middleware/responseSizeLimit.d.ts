export type SizeLimitsConfig = {
    /**
     * - Maximum response size in bytes
     */
    maxResponseSize: number;
    /**
     * - Tool-specific size limits
     */
    toolLimits: {
        [x: string]: number;
    };
    /**
     * - String length limits by content type
     */
    stringLimits: {
        [x: string]: number;
    };
};
export type MCPResponse = {
    /**
     * - JSON-RPC version
     */
    jsonrpc?: string | undefined;
    /**
     * - Request ID
     */
    id?: string | number | undefined;
    /**
     * - Response result
     */
    result?: MCPResult | undefined;
    /**
     * - Response error
     */
    error?: MCPError | undefined;
};
export type MCPResult = {
    /**
     * - Response content array
     */
    content?: MCPContent[] | undefined;
};
export type MCPContent = {
    /**
     * - Content type (e.g., 'text')
     */
    type: string;
    /**
     * - Text content
     */
    text?: string | undefined;
};
export type MCPError = {
    /**
     * - Error code
     */
    code: number;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Additional error data
     */
    data?: Object | undefined;
};
export type RequestBody = {
    /**
     * - MCP method name
     */
    method?: string | undefined;
    /**
     * - Request parameters
     */
    params?: RequestParams | undefined;
};
export type RequestParams = {
    /**
     * - Tool name
     */
    name?: string | undefined;
};
/**
 * Creates response size limiting middleware
 * @param {Partial<SizeLimitsConfig>} options - Size limit options
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createResponseSizeLimitMiddleware(options?: Partial<SizeLimitsConfig>): import('express').RequestHandler;
/**
 * Get current size limits configuration
 * @returns {SizeLimitsConfig} Current size limits
 */
export function getSizeLimits(): SizeLimitsConfig;
/**
 * Truncate response to fit within size limit
 * @param {MCPResponse} data - Response data
 * @param {number} sizeLimit - Size limit in bytes
 * @param {string} toolName - Tool name for context
 * @returns {MCPResponse} Truncated response
 */
export function truncateResponse(data: MCPResponse, sizeLimit: number, toolName: string): MCPResponse;
/**
 * Truncate text content intelligently
 * @param {string} text - Text to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @param {string} toolName - Tool name for context
 * @returns {string} Truncated text
 */
export function truncateText(text: string, maxSize: number, toolName: string): string;
/**
 * Truncate post list responses
 * @param {string} text - Post list text
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
export function truncatePostList(text: string, maxSize: number): string;
/**
 * Truncate comment list responses
 * @param {string} text - Comment list text
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
export function truncateCommentList(text: string, maxSize: number): string;
//# sourceMappingURL=responseSizeLimit.d.ts.map