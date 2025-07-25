/**
 * @typedef {Object} JsonSchemaProperty
 * @property {string} [type] - Property type
 * @property {string} [description] - Property description
 * @property {string[]} [enum] - Enumeration values
 * @property {string} [pattern] - Regex pattern
 * @property {number} [minLength] - Minimum string length
 * @property {number} [maxLength] - Maximum string length
 * @property {number} [minimum] - Minimum number value
 * @property {number} [maximum] - Maximum number value
 * @property {number} [multipleOf] - Number must be multiple of this
 * @property {number} [minItems] - Minimum array items
 * @property {number} [maxItems] - Maximum array items
 * @property {JsonSchemaProperty} [items] - Array item schema
 */
/**
 * @typedef {Object} JsonSchema
 * @property {string} type - Schema type
 * @property {Record<string, JsonSchemaProperty>} [properties] - Object properties
 * @property {string[]} [required] - Required properties
 */
/**
 * @typedef {Object} DriveToolDefinition
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {JsonSchema} inputSchema - Input validation schema
 */
/**
 * @typedef {Object} DriveToolsResponse
 * @property {DriveToolDefinition[]} tools - Available tools
 */
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, string | number | boolean | string[] | Record<string, unknown>>} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 * @returns {void}
 */
export function validateToolArguments(toolName: string, args: Record<string, string | number | boolean | string[] | Record<string, unknown>>): void;
/**
 * Validate Google Drive search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid operators
 */
export function validateDriveQuery(query: string): void;
/**
 * Validate file ID format
 * @param {string} fileId - Google Drive file ID
 * @throws {Error} If file ID format is invalid
 */
export function validateFileId(fileId: string): void;
/**
 * Validate folder ID format
 * @param {string} folderId - Google Drive folder ID
 * @throws {Error} If folder ID format is invalid
 */
export function validateFolderId(folderId: string): void;
/**
 * Validate MIME type format
 * @param {string} mimeType - MIME type string
 * @throws {Error} If MIME type format is invalid
 */
export function validateMimeType(mimeType: string): void;
/**
 * Validate file name
 * @param {string} fileName - File name
 * @throws {Error} If file name is invalid
 */
export function validateFileName(fileName: string): void;
/**
 * Validate permissions role
 * @param {string} role - Permission role
 * @throws {Error} If role is invalid
 */
export function validatePermissionRole(role: string): void;
/**
 * Validate permissions type
 * @param {string} type - Permission type
 * @throws {Error} If type is invalid
 */
export function validatePermissionType(type: string): void;
/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @throws {Error} If email format is invalid
 */
export function validateEmailAddress(email: string): void;
/**
 * Validate domain name format
 * @param {string} domain - Domain name to validate
 * @throws {Error} If domain format is invalid
 */
export function validateDomainName(domain: string): void;
/**
 * Validate local file path
 * @param {string} path - File path to validate
 * @throws {Error} If path is invalid
 */
export function validateLocalPath(path: string): void;
export type JsonSchemaProperty = {
    /**
     * - Property type
     */
    type?: string | undefined;
    /**
     * - Property description
     */
    description?: string | undefined;
    /**
     * - Enumeration values
     */
    enum?: string[] | undefined;
    /**
     * - Regex pattern
     */
    pattern?: string | undefined;
    /**
     * - Minimum string length
     */
    minLength?: number | undefined;
    /**
     * - Maximum string length
     */
    maxLength?: number | undefined;
    /**
     * - Minimum number value
     */
    minimum?: number | undefined;
    /**
     * - Maximum number value
     */
    maximum?: number | undefined;
    /**
     * - Number must be multiple of this
     */
    multipleOf?: number | undefined;
    /**
     * - Minimum array items
     */
    minItems?: number | undefined;
    /**
     * - Maximum array items
     */
    maxItems?: number | undefined;
    /**
     * - Array item schema
     */
    items?: JsonSchemaProperty | undefined;
};
export type JsonSchema = {
    /**
     * - Schema type
     */
    type: string;
    /**
     * - Object properties
     */
    properties?: Record<string, JsonSchemaProperty> | undefined;
    /**
     * - Required properties
     */
    required?: string[] | undefined;
};
export type DriveToolDefinition = {
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
    inputSchema: JsonSchema;
};
export type DriveToolsResponse = {
    /**
     * - Available tools
     */
    tools: DriveToolDefinition[];
};
//# sourceMappingURL=validation.d.ts.map