/**
 * Creates response size limiting middleware
 * @param {Object} options - Size limit options
 * @returns {Function} Express middleware function
 */
export function createResponseSizeLimitMiddleware(options?: Object): Function;
/**
 * Validate content string length
 * @param {string} content - Content to validate
 * @param {string} type - Content type
 * @throws {Error} If content exceeds length limit
 */
export function validateContentLength(content: string, type: string): void;
/**
 * Update size limits configuration
 * @param {Object} newLimits - New size limits
 */
export function updateSizeLimits(newLimits: Object): void;
/**
 * Get current size limits configuration
 * @returns {Object} Current size limits
 */
export function getSizeLimits(): Object;
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
//# sourceMappingURL=responseSizeLimit.d.ts.map