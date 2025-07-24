/**
 * Input sanitization and validation utilities for Google Drive MCP Service
 * Provides comprehensive security measures for user inputs
 */
/**
 * Sanitize string input to prevent injection attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeString(input: string, options?: Object): string;
/**
 * Sanitize file ID to ensure it's a valid Google Drive file ID
 * @param {string} fileId - File ID to sanitize
 * @returns {string} Sanitized file ID
 */
export function sanitizeFileId(fileId: string): string;
/**
 * Sanitize file name to prevent directory traversal and other attacks
 * @param {string} fileName - File name to sanitize
 * @returns {string} Sanitized file name
 */
export function sanitizeFileName(fileName: string): string;
/**
 * Sanitize email address
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email address
 */
export function sanitizeEmail(email: string): string;
/**
 * Sanitize URL to prevent malicious redirects
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url: string): string;
/**
 * Sanitize search query to prevent injection attacks
 * @param {string} query - Search query to sanitize
 * @returns {string} Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string;
/**
 * Sanitize MIME type
 * @param {string} mimeType - MIME type to sanitize
 * @returns {string} Sanitized MIME type
 */
export function sanitizeMimeType(mimeType: string): string;
/**
 * Sanitize integer input
 * @param {string|number|null|undefined} value - Value to sanitize as integer
 * @param {Object} options - Sanitization options
 * @returns {number} Sanitized integer
 */
export function sanitizeInteger(value: string | number | null | undefined, options?: Object): number;
/**
 * Sanitize boolean input
 * @param {string|number|boolean|null|undefined} value - Value to sanitize as boolean
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(value: string | number | boolean | null | undefined): boolean;
/**
 * Sanitize array input
 * @param {Array|string|null|undefined} value - Value to sanitize as array
 * @param {Object} options - Sanitization options
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(value: any[] | string | null | undefined, options?: Object): any[];
/**
 * Comprehensive input sanitization for API requests
 * @param {Object} input - Input object to sanitize
 * @param {Object} schema - Sanitization schema
 * @returns {Object} Sanitized input
 */
export function sanitizeInput(input: Object, schema: Object): Object;
declare namespace _default {
    export { sanitizeString };
    export { sanitizeFileId };
    export { sanitizeFileName };
    export { sanitizeEmail };
    export { sanitizeUrl };
    export { sanitizeSearchQuery };
    export { sanitizeMimeType };
    export { sanitizeInteger };
    export { sanitizeBoolean };
    export { sanitizeArray };
    export { sanitizeInput };
}
export default _default;
//# sourceMappingURL=sanitization.d.ts.map