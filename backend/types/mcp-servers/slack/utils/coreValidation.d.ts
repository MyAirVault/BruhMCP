/**
 * Validate type of value
 * @param {*} value - Value to validate
 * @param {string} expectedType - Expected type
 * @returns {boolean} True if type is valid
 */
export function validateType(value: any, expectedType: string): boolean;
/**
 * Validate string value
 * @param {string} value - String value to validate
 * @param {Object} schema - String schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateString(value: string, schema: Object, context: string, instanceId?: string): void;
/**
 * Validate number value
 * @param {number} value - Number value to validate
 * @param {Object} schema - Number schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateNumber(value: number, schema: Object, context: string, instanceId?: string): void;
/**
 * Validate array value
 * @param {Array} value - Array value to validate
 * @param {Object} schema - Array schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateArray(value: any[], schema: Object, context: string, instanceId?: string): void;
/**
 * Validate individual property
 * @param {*} value - Value to validate
 * @param {Object} schema - Property schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateProperty(value: any, schema: Object, context: string, instanceId?: string): void;
//# sourceMappingURL=coreValidation.d.ts.map