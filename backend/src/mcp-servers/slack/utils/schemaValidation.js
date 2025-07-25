/**
 * Schema-based validation utilities
 * Handles JSON schema validation for objects and tools
 */

import { validateProperty } from './coreValidation.js';
import { logValidationError } from './logger.js';

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
 * @param {Record<string, unknown>} obj - Object to validate
 * @param {JSONSchema} schema - JSON schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
export function validateObject(obj, schema, context, instanceId = 'unknown') {
	if (schema.type !== 'object') {
		const error = new Error(`Invalid schema type for ${context}: expected object`);
		logValidationError('invalid_schema_type', 'schema.type', schema.type, instanceId, { 
			context, 
			expectedType: 'object' 
		});
		throw error;
	}

	// Check required properties
	if (schema.required && Array.isArray(schema.required)) {
		for (const requiredProp of schema.required) {
			if (!(requiredProp in obj)) {
				const error = new Error(`Missing required property: ${requiredProp}`);
				logValidationError('missing_required_property', requiredProp, undefined, instanceId, { 
					context, 
					providedProperties: Object.keys(obj) 
				});
				throw error;
			}
			
			const propValue = obj[requiredProp];
			if (propValue === null || propValue === undefined || propValue === '') {
				const error = new Error(`Required property '${requiredProp}' cannot be empty`);
				logValidationError('empty_required_property', requiredProp, propValue, instanceId, { 
					context, 
					valueType: typeof propValue 
				});
				throw error;
			}
		}
	}

	// Validate each property
	if (schema.properties) {
		for (const [propName, propSchema] of Object.entries(schema.properties)) {
			if (propName in obj) {
				const propValue = obj[propName];
				if (typeof propValue !== 'undefined') {
					validateProperty(propValue, propSchema, `${context}.${propName}`, instanceId);
				}
			}
		}
	}
}

/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, unknown>} args - Arguments to validate
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} Validation error if arguments are invalid
 */
export async function validateToolArguments(toolName, args, instanceId = 'unknown') {
	try {
		const { getTools } = await import('../endpoints/tools.js');
		const toolsData = getTools();
		if (!toolsData || !('tools' in toolsData) || !Array.isArray(toolsData.tools)) {
			throw new Error('Invalid tools data structure');
		}
		const tool = toolsData.tools.find(t => t && typeof t === 'object' && 'name' in t && t.name === toolName);
		
		if (!tool) {
			const error = new Error(`Unknown tool: ${toolName}`);
			logValidationError('tool_not_found', 'toolName', toolName, instanceId, { 
				availableTools: toolsData.tools.map(t => t && typeof t === 'object' && 'name' in t ? t.name : 'unknown') 
			});
			throw error;
		}

		const schema = tool && typeof tool === 'object' && 'inputSchema' in tool ? tool.inputSchema : null;
		if (!schema) {
			return; // No validation schema defined
		}

		validateObject(args, schema, toolName, instanceId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logValidationError('tool_validation_failed', 'arguments', args, instanceId, { 
			toolName, 
			error: errorMessage 
		});
		throw error;
	}
}