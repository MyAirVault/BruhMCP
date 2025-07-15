/**
 * Creates a successful MCP response with content
 * @param {any} data - Response data
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
export function createSuccessResponse(data: any, options?: object): object;
/**
 * Creates an error response following MCP protocol
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} data - Additional error data
 * @returns {object} MCP-compliant error response
 */
export function createErrorResponse(message: string, code?: string, data?: any): object;
/**
 * Creates a Figma-optimized response using simplified parser
 * @param {object} figmaData - Raw Figma API response
 * @param {object} options - Response options
 * @returns {object} MCP-compliant response
 */
export function createFigmaOptimizedResponse(figmaData: object, options?: object): object;
//# sourceMappingURL=mcp-responses.d.ts.map