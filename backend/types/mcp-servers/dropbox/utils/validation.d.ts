export type JSONSchemaProperty = {
    /**
     * - The property type
     */
    type: string;
    /**
     * - Property description
     */
    description?: string | undefined;
    /**
     * - Minimum value for numbers
     */
    minimum?: number | undefined;
    /**
     * - Maximum value for numbers
     */
    maximum?: number | undefined;
    /**
     * - Minimum length for strings
     */
    minLength?: number | undefined;
    /**
     * - Maximum length for strings
     */
    maxLength?: number | undefined;
    /**
     * - Regex pattern for strings
     */
    pattern?: string | undefined;
    /**
     * - Multiple of value for numbers
     */
    multipleOf?: number | undefined;
    /**
     * - Allowed enum values
     */
    enum?: string[] | undefined;
    /**
     * - Minimum items for arrays
     */
    minItems?: number | undefined;
    /**
     * - Maximum items for arrays
     */
    maxItems?: number | undefined;
    /**
     * - Schema for array items
     */
    items?: JSONSchemaProperty | undefined;
    /**
     * - Default value
     */
    default?: string | number | boolean | undefined;
};
export type JSONSchema = {
    /**
     * - Schema type
     */
    type: string;
    /**
     * - Object properties
     */
    properties?: Record<string, JSONSchemaProperty> | undefined;
    /**
     * - Required property names
     */
    required?: string[] | undefined;
    /**
     * - Minimum value
     */
    minimum?: number | undefined;
    /**
     * - Maximum value
     */
    maximum?: number | undefined;
    /**
     * - Minimum length
     */
    minLength?: number | undefined;
    /**
     * - Maximum length
     */
    maxLength?: number | undefined;
    /**
     * - Regex pattern
     */
    pattern?: string | undefined;
    /**
     * - Multiple of value
     */
    multipleOf?: number | undefined;
    /**
     * - Allowed enum values
     */
    enum?: string[] | undefined;
    /**
     * - Minimum items
     */
    minItems?: number | undefined;
    /**
     * - Maximum items
     */
    maxItems?: number | undefined;
    /**
     * - Array item schema
     */
    items?: JSONSchemaProperty | undefined;
};
export type DropboxTool = {
    /**
     * - Tool name
     */
    name: string;
    /**
     * - Tool description
     */
    description: string;
    /**
     * - Input validation schema
     */
    inputSchema: JSONSchema;
};
export type DropboxToolsData = {
    /**
     * - Array of available tools
     */
    tools: DropboxTool[];
};
/**
 * @typedef {Object} JSONSchemaProperty
 * @property {string} type - The property type
 * @property {string} [description] - Property description
 * @property {number} [minimum] - Minimum value for numbers
 * @property {number} [maximum] - Maximum value for numbers
 * @property {number} [minLength] - Minimum length for strings
 * @property {number} [maxLength] - Maximum length for strings
 * @property {string} [pattern] - Regex pattern for strings
 * @property {number} [multipleOf] - Multiple of value for numbers
 * @property {string[]} [enum] - Allowed enum values
 * @property {number} [minItems] - Minimum items for arrays
 * @property {number} [maxItems] - Maximum items for arrays
 * @property {JSONSchemaProperty} [items] - Schema for array items
 * @property {boolean|string|number} [default] - Default value
 */
/**
 * @typedef {Object} JSONSchema
 * @property {string} type - Schema type
 * @property {Record<string, JSONSchemaProperty>} [properties] - Object properties
 * @property {string[]} [required] - Required property names
 * @property {number} [minimum] - Minimum value
 * @property {number} [maximum] - Maximum value
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {string} [pattern] - Regex pattern
 * @property {number} [multipleOf] - Multiple of value
 * @property {string[]} [enum] - Allowed enum values
 * @property {number} [minItems] - Minimum items
 * @property {number} [maxItems] - Maximum items
 * @property {JSONSchemaProperty} [items] - Array item schema
 */
/**
 * @typedef {Object} DropboxTool
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {JSONSchema} inputSchema - Input validation schema
 */
/**
 * @typedef {Object} DropboxToolsData
 * @property {DropboxTool[]} tools - Array of available tools
 */
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, unknown>} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 * @returns {void}
 */
export function validateToolArguments(toolName: string, args: Record<string, unknown>): void;
/**
 * Validate object against JSON schema
 * @param {Record<string, unknown>} obj - Object to validate
 * @param {JSONSchema} schema - JSON schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validateObject(obj: Record<string, unknown>, schema: JSONSchema, context: string): void;
/**
 * Validate individual property
 * @param {unknown} value - Value to validate
 * @param {JSONSchemaProperty} schema - Property schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validateProperty(value: unknown, schema: JSONSchemaProperty, context: string): void;
/**
 * Validate value type
 * @param {unknown} value - Value to validate
 * @param {string} expectedType - Expected type
 * @returns {boolean} True if type is valid
 */
export function validateType(value: unknown, expectedType: string): boolean;
/**
 * Validate string property
 * @param {string} value - String value
 * @param {JSONSchemaProperty} schema - String schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validateString(value: string, schema: JSONSchemaProperty, context: string): void;
/**
 * Validate number property
 * @param {number} value - Number value
 * @param {JSONSchemaProperty} schema - Number schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validateNumber(value: number, schema: JSONSchemaProperty, context: string): void;
/**
 * Validate array property
 * @param {unknown[]} value - Array value
 * @param {JSONSchemaProperty} schema - Array schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validateArray(value: unknown[], schema: JSONSchemaProperty, context: string): void;
/**
 * Validate path field format
 * @param {string} value - Path value
 * @param {string} context - Context for error messages
 * @returns {void}
 */
export function validatePathField(value: string, context: string): void;
/**
 * Validate Dropbox search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid patterns
 * @returns {void}
 */
export function validateDropboxQuery(query: string): void;
/**
 * Validate file path format
 * @param {string} path - Dropbox file path
 * @throws {Error} If path format is invalid
 * @returns {void}
 */
export function validateDropboxPath(path: string): void;
/**
 * Sanitize file path to prevent directory traversal attacks
 * @param {string} path - File path to sanitize
 * @returns {string} Sanitized path
 */
export function sanitizePath(path: string): string;
/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} [maxSize=157286400] - Maximum allowed size (150MB default)
 * @throws {Error} If size is invalid
 * @returns {void}
 */
export function validateFileSize(size: number, maxSize?: number | undefined): void;
//# sourceMappingURL=validation.d.ts.map