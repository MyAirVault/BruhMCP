/**
 * Type validation utilities for Google Drive MCP Service
 */
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
 * @param {any[]|string|null|undefined} value - Value to sanitize as array
 * @param {Object} options - Sanitization options
 * @returns {any[]} Sanitized array
 */
export function sanitizeArray(value: any[] | string | null | undefined, options?: Object): any[];
//# sourceMappingURL=typeValidation.d.ts.map