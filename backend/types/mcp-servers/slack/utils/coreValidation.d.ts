/**
 * Validate type of value
 * @param {string|number|boolean|Array<string|number|boolean|Object>|Object|null|undefined} value - Value to validate
 * @param {string} expectedType - Expected type
 * @returns {boolean} True if type is valid
 */
export function validateType(value: string | number | boolean | Array<string | number | boolean | Object> | Object | null | undefined, expectedType: string): boolean;
/**
 * Validate string value
 * @param {string} value - String value to validate
 * @param {{minLength?: number, maxLength?: number, pattern?: string}} schema - String schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateString(value: string, schema: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}, context: string, instanceId?: string): void;
/**
 * Validate number value
 * @param {number} value - Number value to validate
 * @param {{minimum?: number, maximum?: number, type?: string}} schema - Number schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateNumber(value: number, schema: {
    minimum?: number;
    maximum?: number;
    type?: string;
}, context: string, instanceId?: string): void;
/**
 * Validate array value
 * @param {Array<string|number|boolean|Object>} value - Array value to validate
 * @param {{minItems?: number, maxItems?: number, items?: Object}} schema - Array schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateArray(value: Array<string | number | boolean | Object>, schema: {
    minItems?: number;
    maxItems?: number;
    items?: Object;
}, context: string, instanceId?: string): void;
/**
 * Validate individual property
 * @param {string|number|boolean|Array<string|number|boolean|Object>|Object|null|undefined} value - Value to validate
 * @param {{type?: string, minLength?: number, maxLength?: number, pattern?: string, minimum?: number, maximum?: number, minItems?: number, maxItems?: number, items?: Object, enum?: Array<string|number|boolean>}} schema - Property schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateProperty(value: string | number | boolean | Array<string | number | boolean | Object> | Object | null | undefined, schema: {
    type?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minItems?: number;
    maxItems?: number;
    items?: Object;
    enum?: Array<string | number | boolean>;
}, context: string, instanceId?: string): void;
//# sourceMappingURL=coreValidation.d.ts.map