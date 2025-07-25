/**
 * @typedef {Object} JsonSchemaProperty
 * @property {string} [type] - The type of the property
 * @property {string[]} [enum] - Allowed enum values
 * @property {number} [minimum] - Minimum value for numbers
 * @property {number} [maximum] - Maximum value for numbers
 * @property {number} [multipleOf] - Multiple constraint for numbers
 * @property {number} [minLength] - Minimum length for strings
 * @property {number} [maxLength] - Maximum length for strings
 * @property {string} [pattern] - Regex pattern for strings
 * @property {number} [minItems] - Minimum items for arrays
 * @property {number} [maxItems] - Maximum items for arrays
 * @property {JsonSchemaProperty} [items] - Schema for array items
 */
/**
 * @typedef {Object} JsonSchema
 * @property {string} type - The schema type
 * @property {string[]} [required] - Required properties
 * @property {Object<string, JsonSchemaProperty>} [properties] - Property definitions
 * @property {string[]} [enum] - Allowed enum values
 * @property {number} [minimum] - Minimum value for numbers
 * @property {number} [maximum] - Maximum value for numbers
 * @property {number} [multipleOf] - Multiple constraint for numbers
 * @property {number} [minLength] - Minimum length for strings
 * @property {number} [maxLength] - Maximum length for strings
 * @property {string} [pattern] - Regex pattern for strings
 * @property {number} [minItems] - Minimum items for arrays
 * @property {number} [maxItems] - Maximum items for arrays
 * @property {JsonSchemaProperty} [items] - Schema for array items
 */
/**
 * @typedef {Object} Tool
 * @property {string} name - Tool name
 * @property {JsonSchema} [inputSchema] - Input validation schema
 */
/**
 * @typedef {Object} ToolsData
 * @property {Tool[]} tools - Array of available tools
 */
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, any>} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Record<string, any>): void;
/**
 * Validate Reddit post ID format
 * @param {string} postId - Reddit post ID
 * @throws {Error} If post ID format is invalid
 */
export function validatePostId(postId: string): void;
/**
 * Validate Reddit comment ID format
 * @param {string} commentId - Reddit comment ID
 * @throws {Error} If comment ID format is invalid
 */
export function validateCommentId(commentId: string): void;
/**
 * Validate Reddit fullname format (t1_, t3_, etc.)
 * @param {string} fullname - Reddit fullname
 * @throws {Error} If fullname format is invalid
 */
export function validateFullname(fullname: string): void;
/**
 * Validate Reddit search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid characters
 */
export function validateRedditQuery(query: string): void;
/**
 * Validate vote direction
 * @param {number} direction - Vote direction
 * @throws {Error} If direction is invalid
 */
export function validateVoteDirection(direction: number): void;
/**
 * Validate Reddit post content
 * @param {string} content - Post content
 * @param {'title' | 'text' | 'url'} type - Content type ('title', 'text', 'url')
 * @throws {Error} If content is invalid
 */
export function validatePostContent(content: string, type: "title" | "text" | "url"): void;
export type JsonSchemaProperty = {
    /**
     * - The type of the property
     */
    type?: string | undefined;
    /**
     * - Allowed enum values
     */
    enum?: string[] | undefined;
    /**
     * - Minimum value for numbers
     */
    minimum?: number | undefined;
    /**
     * - Maximum value for numbers
     */
    maximum?: number | undefined;
    /**
     * - Multiple constraint for numbers
     */
    multipleOf?: number | undefined;
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
    items?: JsonSchemaProperty | undefined;
};
export type JsonSchema = {
    /**
     * - The schema type
     */
    type: string;
    /**
     * - Required properties
     */
    required?: string[] | undefined;
    /**
     * - Property definitions
     */
    properties?: {
        [x: string]: JsonSchemaProperty;
    } | undefined;
    /**
     * - Allowed enum values
     */
    enum?: string[] | undefined;
    /**
     * - Minimum value for numbers
     */
    minimum?: number | undefined;
    /**
     * - Maximum value for numbers
     */
    maximum?: number | undefined;
    /**
     * - Multiple constraint for numbers
     */
    multipleOf?: number | undefined;
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
    items?: JsonSchemaProperty | undefined;
};
export type Tool = {
    /**
     * - Tool name
     */
    name: string;
    /**
     * - Input validation schema
     */
    inputSchema?: JsonSchema | undefined;
};
export type ToolsData = {
    /**
     * - Array of available tools
     */
    tools: Tool[];
};
//# sourceMappingURL=validation.d.ts.map