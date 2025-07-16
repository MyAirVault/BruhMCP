/**
 * Creates a successful MCP response with content
 * @param {any} data - Response data
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
export function createSuccessResponse(data: any, options?: object): object;
/**
 * Creates an error MCP response
 * @param {string} message - Error message
 * @param {object} options - Error options
 * @returns {object} MCP-compliant error response
 */
export function createErrorResponse(message: string, options?: object): object;
/**
 * Create optimized Figma response with deduplication (enhanced version)
 * @param {object} figmaData - Raw Figma API response
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
export function createFigmaOptimizedResponse(figmaData: object, options?: object): object;
//# sourceMappingURL=mcp-responses.d.ts.map