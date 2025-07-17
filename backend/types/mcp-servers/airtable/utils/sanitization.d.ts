/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string}
 */
export function sanitizeInput(input: string, options?: Object): string;
/**
 * Escape HTML entities
 * @param {string} input - Input string
 * @returns {string}
 */
export function escapeHtml(input: string): string;
/**
 * Sanitize Airtable field name
 * @param {string} fieldName - Field name to sanitize
 * @returns {string}
 */
export function sanitizeFieldName(fieldName: string): string;
/**
 * Sanitize Airtable record fields
 * @param {Object} fields - Record fields to sanitize
 * @returns {Object}
 */
export function sanitizeRecordFields(fields: Object): Object;
/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {number} depth - Current depth (to prevent infinite recursion)
 * @returns {Object}
 */
export function sanitizeObject(obj: Object, depth?: number): Object;
/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string}
 */
export function sanitizeUrl(url: string): string;
/**
 * Sanitize file name
 * @param {string} fileName - File name to sanitize
 * @returns {string}
 */
export function sanitizeFileName(fileName: string): string;
/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string}
 */
export function sanitizeEmail(email: string): string;
/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string}
 */
export function sanitizePhoneNumber(phone: string): string;
/**
 * Sanitize formula
 * @param {string} formula - Airtable formula to sanitize
 * @returns {string}
 */
export function sanitizeFormula(formula: string): string;
/**
 * Sanitize query parameters
 * @param {Object} params - Query parameters to sanitize
 * @returns {Object}
 */
export function sanitizeQueryParams(params: Object): Object;
/**
 * Check if input contains malicious patterns
 * @param {string} input - Input to check
 * @returns {boolean}
 */
export function containsMaliciousPatterns(input: string): boolean;
/**
 * Sanitize for logging (remove sensitive information)
 * @param {any} data - Data to sanitize for logging
 * @returns {any}
 */
export function sanitizeForLogging(data: any): any;
/**
 * Create sanitization report
 * @param {string} original - Original input
 * @param {string} sanitized - Sanitized input
 * @returns {Object}
 */
export function createSanitizationReport(original: string, sanitized: string): Object;
/**
 * Batch sanitize multiple inputs
 * @param {Array} inputs - Array of inputs to sanitize
 * @param {Function} sanitizer - Sanitization function
 * @returns {Array}
 */
export function batchSanitize(inputs: any[], sanitizer?: Function): any[];
declare namespace _default {
    export { sanitizeInput };
    export { escapeHtml };
    export { sanitizeFieldName };
    export { sanitizeRecordFields };
    export { sanitizeObject };
    export { sanitizeUrl };
    export { sanitizeFileName };
    export { sanitizeEmail };
    export { sanitizePhoneNumber };
    export { sanitizeFormula };
    export { sanitizeQueryParams };
    export { containsMaliciousPatterns };
    export { sanitizeForLogging };
    export { createSanitizationReport };
    export { batchSanitize };
}
export default _default;
//# sourceMappingURL=sanitization.d.ts.map