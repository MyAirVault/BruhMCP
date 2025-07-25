/**
 * @typedef {Object} JSONSchema
 * @property {string} type - Schema type
 * @property {string[]} [required] - Required properties
 * @property {Object.<string, JSONSchema>} [properties] - Properties schema
 */
/**
 * @typedef {Object} SlackTool
 * @property {string} name - Tool name
 * @property {JSONSchema} inputSchema - Input schema
 */
/**
 * @typedef {Object} SlackToolsData
 * @property {SlackTool[]} tools - Array of tools
 */
/**
 * Validate object against JSON schema
 * @param {Object} obj - Object to validate
 * @param {JSONSchema} schema - JSON schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateObject(obj: Object, schema: JSONSchema, context: string, instanceId?: string): void;
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object, instanceId?: string): Promise<void>;
export type JSONSchema = {
    /**
     * - Schema type
     */
    type: string;
    /**
     * - Required properties
     */
    required?: string[] | undefined;
    /**
     * - Properties schema
     */
    properties?: {
        [x: string]: JSONSchema;
    } | undefined;
};
export type SlackTool = {
    /**
     * - Tool name
     */
    name: string;
    /**
     * - Input schema
     */
    inputSchema: JSONSchema;
};
export type SlackToolsData = {
    /**
     * - Array of tools
     */
    tools: SlackTool[];
};
//# sourceMappingURL=schemaValidation.d.ts.map