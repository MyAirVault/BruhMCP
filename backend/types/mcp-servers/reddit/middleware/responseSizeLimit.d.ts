/**
 * Creates response size limiting middleware
 * @param {Partial<SizeLimitsConfig>} options - Size limit options
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createResponseSizeLimitMiddleware(options?: Partial<SizeLimitsConfig>): import("express").RequestHandler;
/**
 * Validate content string length
 * @param {string} content - Content to validate
 * @param {string} type - Content type
 * @throws {Error} If content exceeds length limit
 */
export function validateContentLength(content: string, type: string): void;
/**
 * Update size limits configuration
 * @param {Partial<SizeLimitsConfig>} newLimits - New size limits
 */
export function updateSizeLimits(newLimits: Partial<SizeLimitsConfig>): void;
/**
 * Get current size limits configuration
 * @returns {SizeLimitsConfig} Current size limits
 */
export function getSizeLimits(): SizeLimitsConfig;
/**
 * Get size limit for a specific tool
 * @param {string} toolName - Tool name
 * @returns {number} Size limit in bytes
 */
export function getToolSizeLimit(toolName: string): number;
/**
 * Format size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatSize(bytes: number): string;
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
//# sourceMappingURL=responseSizeLimit.d.ts.map