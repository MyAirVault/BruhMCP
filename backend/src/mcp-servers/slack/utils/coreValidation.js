/**
 * Core validation utilities
 * Basic validation functions for types, strings, numbers, etc.
 */

const { logValidationError } = require('./logger');

/**
 * Validate type of value
 * @param {string|number|boolean|Array<string|number|boolean|Object>|Object|null|undefined} value - Value to validate
 * @param {string} expectedType - Expected type
 * @returns {boolean} True if type is valid
 */
function validateType(value, expectedType) {
	if (expectedType === 'string') return typeof value === 'string';
	if (expectedType === 'number') return typeof value === 'number' && !isNaN(value);
	if (expectedType === 'boolean') return typeof value === 'boolean';
	if (expectedType === 'array') return Array.isArray(value);
	if (expectedType === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
	return false;
}

/**
 * Validate string value
 * @param {string} value - String value to validate
 * @param {{minLength?: number, maxLength?: number, pattern?: string}} schema - String schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateString(value, schema, context, instanceId = 'unknown') {
	// Length validation
	if (schema.minLength !== undefined && value.length < schema.minLength) {
		const error = new Error(`${context} must be at least ${schema.minLength} characters long`);
		logValidationError('string_too_short', context, value, instanceId, { 
			actualLength: value.length, 
			minLength: schema.minLength 
		});
		throw error;
	}

	if (schema.maxLength !== undefined && value.length > schema.maxLength) {
		const error = new Error(`${context} must be at most ${schema.maxLength} characters long`);
		logValidationError('string_too_long', context, value, instanceId, { 
			actualLength: value.length, 
			maxLength: schema.maxLength 
		});
		throw error;
	}

	// Pattern validation
	if (schema.pattern) {
		const regex = new RegExp(schema.pattern);
		if (!regex.test(value)) {
			const error = new Error(`${context} does not match required pattern: ${schema.pattern}`);
			logValidationError('string_pattern_mismatch', context, value, instanceId, { 
				pattern: schema.pattern 
			});
			throw error;
		}
	}
}

/**
 * Validate number value
 * @param {number} value - Number value to validate
 * @param {{minimum?: number, maximum?: number, type?: string}} schema - Number schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateNumber(value, schema, context, instanceId = 'unknown') {
	// Range validation
	if (schema.minimum !== undefined && value < schema.minimum) {
		const error = new Error(`${context} must be at least ${schema.minimum}`);
		logValidationError('number_too_small', context, value, instanceId, { 
			actualValue: value, 
			minimum: schema.minimum 
		});
		throw error;
	}

	if (schema.maximum !== undefined && value > schema.maximum) {
		const error = new Error(`${context} must be at most ${schema.maximum}`);
		logValidationError('number_too_large', context, value, instanceId, { 
			actualValue: value, 
			maximum: schema.maximum 
		});
		throw error;
	}

	// Integer validation
	if (schema.type === 'integer' && !Number.isInteger(value)) {
		const error = new Error(`${context} must be an integer`);
		logValidationError('not_integer', context, value, instanceId, { 
			actualValue: value 
		});
		throw error;
	}
}

/**
 * Validate array value
 * @param {Array<string|number|boolean|Object>} value - Array value to validate
 * @param {{minItems?: number, maxItems?: number, items?: Object}} schema - Array schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateArray(value, schema, context, instanceId = 'unknown') {
	// Length validation
	if (schema.minItems !== undefined && value.length < schema.minItems) {
		const error = new Error(`${context} must have at least ${schema.minItems} items`);
		logValidationError('array_too_short', context, value, instanceId, { 
			actualLength: value.length, 
			minItems: schema.minItems 
		});
		throw error;
	}

	if (schema.maxItems !== undefined && value.length > schema.maxItems) {
		const error = new Error(`${context} must have at most ${schema.maxItems} items`);
		logValidationError('array_too_long', context, value, instanceId, { 
			actualLength: value.length, 
			maxItems: schema.maxItems 
		});
		throw error;
	}

	// Items validation
	if (schema.items) {
		value.forEach((item, index) => {
			validateProperty(item, /** @type {{type?: string, minLength?: number, maxLength?: number, pattern?: string, minimum?: number, maximum?: number, minItems?: number, maxItems?: number, items?: Object, enum?: Array<string|number|boolean>}} */ (schema.items), `${context}[${index}]`, instanceId);
		});
	}
}

/**
 * Validate individual property
 * @param {string|number|boolean|Array<string|number|boolean|Object>|Object|null|undefined} value - Value to validate
 * @param {{type?: string, minLength?: number, maxLength?: number, pattern?: string, minimum?: number, maximum?: number, minItems?: number, maxItems?: number, items?: Object, enum?: Array<string|number|boolean>}} schema - Property schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateProperty(value, schema, context, instanceId = 'unknown') {
	// Type validation
	if (schema.type) {
		if (!validateType(value, schema.type)) {
			const error = new Error(`Invalid type for ${context}: expected ${schema.type}, got ${typeof value}`);
			logValidationError('invalid_type', context, value, instanceId, { 
				expectedType: schema.type, 
				actualType: typeof value 
			});
			throw error;
		}
	}

	// Type-specific validations
	if (schema.type === 'string' && typeof value === 'string') {
		validateString(value, schema, context, instanceId);
	} else if (schema.type === 'number' && typeof value === 'number') {
		validateNumber(value, schema, context, instanceId);
	} else if (schema.type === 'array' && Array.isArray(value)) {
		validateArray(value, schema, context, instanceId);
	}

	// Enum validation
	if (schema.enum && !schema.enum.includes(/** @type {string|number|boolean} */ (value))) {
		const error = new Error(`${context} must be one of: ${schema.enum.join(', ')}`);
		logValidationError('invalid_enum_value', context, value, instanceId, { 
			allowedValues: schema.enum 
		});
		throw error;
	}
}

module.exports = {
	validateType,
	validateString,
	validateNumber,
	validateArray,
	validateProperty
};