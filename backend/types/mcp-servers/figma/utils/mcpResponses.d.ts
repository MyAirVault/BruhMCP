/**
 * Creates a successful MCP response with content
 * @param {unknown} data - Response data
 * @param {Record<string, unknown>} options - Response options
 * @returns {Record<string, unknown>} MCP-compliant response
 */
export function createSuccessResponse(data: unknown, options?: Record<string, unknown>): Record<string, unknown>;
/**
 * Creates an error MCP response
 * @param {string} message - Error message
 * @param {Record<string, unknown>} options - Error options
 * @returns {Record<string, unknown>} MCP-compliant error response
 */
export function createErrorResponse(message: string, options?: Record<string, unknown>): Record<string, unknown>;
/**
 * Create optimized Figma response with deduplication (enhanced version)
 * @param {Record<string, unknown>} figmaData - Raw Figma API response
 * @param {Record<string, unknown>} options - Response options
 * @returns {Record<string, unknown>} MCP-compliant response
 */
export function createFigmaOptimizedResponse(figmaData: Record<string, unknown>, options?: Record<string, unknown>): Record<string, unknown>;
//# sourceMappingURL=mcpResponses.d.ts.map