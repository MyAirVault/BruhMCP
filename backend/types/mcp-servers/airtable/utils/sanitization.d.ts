/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @param {{removeHtml?: boolean, removeSqlInjection?: boolean, removeXss?: boolean, trimWhitespace?: boolean, maxLength?: number, allowedChars?: string|null}} [options] - Sanitization options
 * @returns {string}
 */
export function sanitizeInput(input: string, options?: {
    removeHtml?: boolean;
    removeSqlInjection?: boolean;
    removeXss?: boolean;
    trimWhitespace?: boolean;
    maxLength?: number;
    allowedChars?: string | null;
}): string;
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
 * @param {Object.<string, string|number|boolean|string[]|Object|null|undefined>} fields - Record fields to sanitize
 * @returns {Object.<string, string|number|boolean|string[]|Object|null|undefined>}
 */
export function sanitizeRecordFields(fields: {
    [x: string]: string | number | boolean | Object | string[] | null | undefined;
}): {
    [x: string]: string | number | boolean | Object | string[] | null | undefined;
};
/**
 * Sanitize object recursively
 * @param {string|number|boolean|Object|null|undefined} obj - Object to sanitize
 * @param {number} [depth=0] - Current depth (to prevent infinite recursion)
 * @returns {string|number|boolean|Object|null|undefined}
 */
export function sanitizeObject(obj: string | number | boolean | Object | null | undefined, depth?: number): string | number | boolean | Object | null | undefined;
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
 * @param {Object.<string, string|number|boolean|string[]|Object|null|undefined>} params - Query parameters to sanitize
 * @returns {Object.<string, string|number|boolean|string[]|Object|null|undefined>}
 */
export function sanitizeQueryParams(params: {
    [x: string]: string | number | boolean | Object | string[] | null | undefined;
}): {
    [x: string]: string | number | boolean | Object | string[] | null | undefined;
};
/**
 * Check if input contains malicious patterns
 * @param {string} input - Input to check
 * @returns {boolean}
 */
export function containsMaliciousPatterns(input: string): boolean;
/**
 * Sanitize for logging (remove sensitive information)
 * @param {string|number|boolean|Object|null|undefined} data - Data to sanitize for logging
 * @returns {string|number|boolean|Object|null|undefined}
 */
export function sanitizeForLogging(data: string | number | boolean | Object | null | undefined): string | number | boolean | Object | null | undefined;
/**
 * Create sanitization report
 * @param {string} original - Original input
 * @param {string} sanitized - Sanitized input
 * @returns {Object}
 */
export function createSanitizationReport(original: string, sanitized: string): Object;
/**
 * Batch sanitize multiple inputs
 * @param {(string|number|boolean|Object|null|undefined)[]} inputs - Array of inputs to sanitize
 * @param {function(string|number|boolean|Object|null|undefined): (string|number|boolean|Object|null|undefined)} [sanitizer=sanitizeInput] - Sanitization function
 * @returns {(string|number|boolean|Object|null|undefined|null)[]}
 */
export function batchSanitize(inputs: (string | number | boolean | Object | null | undefined)[], sanitizer?: (arg0: string | number | boolean | Object | null | undefined) => (string | number | boolean | Object | null | undefined)): (string | number | boolean | Object | null | undefined | null)[];
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