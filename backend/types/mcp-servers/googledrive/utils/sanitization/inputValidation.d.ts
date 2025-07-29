export type ValidationConfig = {
    /**
     * - The expected type
     */
    type: 'string' | 'integer' | 'boolean' | 'array' | 'object';
    /**
     * - Whether the field is required
     */
    required?: boolean | undefined;
    /**
     * - Default value if not provided
     */
    default?: any;
    /**
     * - Type-specific options
     */
    options?: Object | undefined;
    /**
     * - Custom validator function
     */
    validator?: ((arg0: any) => boolean | string) | undefined;
};
export type ValidationSchema = {
    [x: string]: ValidationConfig;
};
export type InputObject = {
    [x: string]: any;
};
export type SanitizedObject = {
    [x: string]: any;
};
export type ValidationError = Error & {
    validationErrors: string[];
};
/**
 * @typedef {Object} ValidationConfig
 * @property {'string'|'integer'|'boolean'|'array'|'object'} type - The expected type
 * @property {boolean} [required] - Whether the field is required
 * @property {*} [default] - Default value if not provided
 * @property {Object} [options] - Type-specific options
 * @property {function(*): boolean|string} [validator] - Custom validator function
 */
/**
 * @typedef {Object.<string, ValidationConfig>} ValidationSchema
 */
/**
 * @typedef {Object.<string, *>} InputObject
 */
/**
 * @typedef {Object.<string, *>} SanitizedObject
 */
/**
 * @typedef {Error & {validationErrors: string[]}} ValidationError
 */
/**
 * General input sanitization based on schema
 * @param {InputObject} input - Input object to sanitize
 * @param {ValidationSchema} schema - Schema defining expected fields and types
 * @returns {SanitizedObject} Sanitized input object
 * @throws {ValidationError} When validation fails
 */
export function sanitizeInput(input: InputObject, schema: ValidationSchema): SanitizedObject;
//# sourceMappingURL=inputValidation.d.ts.map