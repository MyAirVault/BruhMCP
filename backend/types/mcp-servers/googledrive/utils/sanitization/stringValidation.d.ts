/**
 * String sanitization utilities for Google Drive MCP Service
 */
/**
 * Sanitize string input to prevent injection attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeString(input: string, options?: Object): string;
/**
 * Sanitize file name
 * @param {string} fileName - File name to sanitize
 * @returns {string} Sanitized file name
 */
export function sanitizeFileName(fileName: string): string;
/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query: string): string;
//# sourceMappingURL=stringValidation.d.ts.map