/**
 * Validate object against JSON schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - JSON schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateObject(obj: Object, schema: Object, context: string, instanceId?: string): void;
/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName: string, args: Object, instanceId?: string): void;
//# sourceMappingURL=schemaValidation.d.ts.map