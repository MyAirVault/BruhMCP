/**
 * Dropbox tool argument validation utilities
 * Validates arguments for Dropbox MCP tools using schema-based validation like Gmail
 */

import { getTools } from '../endpoints/tools.js';

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
export function validateToolArguments(toolName, args) {
  const toolsData = /** @type {DropboxToolsData} */ (getTools());
  const tool = toolsData.tools.find(/** @param {DropboxTool} t */ t => t.name === toolName);
  
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const schema = tool.inputSchema;
  if (!schema) {
    return; // No validation schema defined
  }

  validateObject(args, schema, toolName);
}

/**
 * Validate object against JSON schema
 * @param {Record<string, unknown>} obj - Object to validate
 * @param {JSONSchema} schema - JSON schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validateObject(obj, schema, context) {
  if (schema.type !== 'object') {
    throw new Error(`Invalid schema type for ${context}: expected object`);
  }

  // Check required properties
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in obj)) {
        throw new Error(`Missing required property: ${requiredProp}`);
      }
      
      if (obj[requiredProp] === null || obj[requiredProp] === undefined || obj[requiredProp] === '') {
        throw new Error(`Required property '${requiredProp}' cannot be empty`);
      }
    }
  }

  // Validate each property
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propName in obj) {
        validateProperty(obj[propName], propSchema, `${context}.${propName}`);
      }
    }
  }
}

/**
 * Validate individual property
 * @param {unknown} value - Value to validate
 * @param {JSONSchemaProperty} schema - Property schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validateProperty(value, schema, context) {
  // Type validation
  if (schema.type) {
    if (!validateType(value, schema.type)) {
      throw new Error(`Invalid type for ${context}: expected ${schema.type}, got ${typeof value}`);
    }
  }

  // String validations
  if (schema.type === 'string') {
    validateString(/** @type {string} */ (value), schema, context);
  }

  // Number validations
  if (schema.type === 'number') {
    validateNumber(/** @type {number} */ (value), schema, context);
  }

  // Array validations
  if (schema.type === 'array') {
    validateArray(/** @type {unknown[]} */ (value), schema, context);
  }

  // Enum validation
  if (schema.enum) {
    if (!schema.enum.includes(/** @type {string} */ (value))) {
      throw new Error(`Invalid value for ${context}: must be one of [${schema.enum.join(', ')}]`);
    }
  }
}

/**
 * Validate value type
 * @param {unknown} value - Value to validate
 * @param {string} expectedType - Expected type
 * @returns {boolean} True if type is valid
 */
function validateType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

/**
 * Validate string property
 * @param {string} value - String value
 * @param {JSONSchemaProperty} schema - String schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validateString(value, schema, context) {
  if (schema.minLength && value.length < schema.minLength) {
    throw new Error(`${context} must be at least ${schema.minLength} characters long`);
  }

  if (schema.maxLength && value.length > schema.maxLength) {
    throw new Error(`${context} must be no more than ${schema.maxLength} characters long`);
  }

  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      throw new Error(`${context} does not match required pattern: ${schema.pattern}`);
    }
  }

  // Path validation for specific fields
  if (context.includes('path') || context.includes('Path')) {
    validatePathField(/** @type {string} */ (value), context);
  }
}

/**
 * Validate number property
 * @param {number} value - Number value
 * @param {JSONSchemaProperty} schema - Number schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validateNumber(value, schema, context) {
  if (schema.minimum !== undefined && value < schema.minimum) {
    throw new Error(`${context} must be at least ${schema.minimum}`);
  }

  if (schema.maximum !== undefined && value > schema.maximum) {
    throw new Error(`${context} must be no more than ${schema.maximum}`);
  }

  if (schema.multipleOf && value % schema.multipleOf !== 0) {
    throw new Error(`${context} must be a multiple of ${schema.multipleOf}`);
  }
}

/**
 * Validate array property
 * @param {unknown[]} value - Array value
 * @param {JSONSchemaProperty} schema - Array schema
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validateArray(value, schema, context) {
  if (schema.minItems && value.length < schema.minItems) {
    throw new Error(`${context} must have at least ${schema.minItems} items`);
  }

  if (schema.maxItems && value.length > schema.maxItems) {
    throw new Error(`${context} must have no more than ${schema.maxItems} items`);
  }

  // Validate array items
  if (schema.items) {
    const itemsSchema = schema.items;
    value.forEach((item, index) => {
      validateProperty(item, itemsSchema, `${context}[${index}]`);
    });
  }
}

/**
 * Validate path field format
 * @param {string} value - Path value
 * @param {string} context - Context for error messages
 * @returns {void}
 */
function validatePathField(value, context) {
  if (!value || value.trim() === '') {
    return; // Empty path fields are handled by required validation
  }

  // Check for dangerous patterns
  if (value.includes('..') || value.includes('\0')) {
    throw new Error(`Invalid path format in ${context}: contains dangerous characters`);
  }

  // Check path length
  if (value.length > 1000) {
    throw new Error(`Path too long in ${context}: maximum 1000 characters`);
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(value)) {
    throw new Error(`Invalid characters in path ${context}: cannot contain < > : " | ? *`);
  }
}

/**
 * Validate Dropbox search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid patterns
 * @returns {void}
 */
export function validateDropboxQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Query is required and must be a string');
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /[<>]/,  // HTML tags
    /javascript:/i,  // JavaScript
    /data:/i,  // Data URLs
    /vbscript:/i,  // VBScript
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      throw new Error('Query contains invalid characters or patterns');
    }
  }

  // Check query length
  if (query.length > 1000) {
    throw new Error('Query too long: maximum 1000 characters');
  }
}

/**
 * Validate file path format
 * @param {string} path - Dropbox file path
 * @throws {Error} If path format is invalid
 * @returns {void}
 */
export function validateDropboxPath(path) {
  if (!path || typeof path !== 'string') {
    throw new Error('Path is required and must be a string');
  }

  if (path.trim() === '') {
    throw new Error('Path cannot be empty');
  }

  // Check for dangerous patterns
  if (path.includes('..') || path.includes('\0')) {
    throw new Error('Path contains invalid characters');
  }

  // Check path length
  if (path.length > 1000) {
    throw new Error('Path is too long (max 1000 characters)');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/;
  if (invalidChars.test(path)) {
    throw new Error('Path contains invalid characters: < > : " | ? *');
  }
}

/**
 * Sanitize file path to prevent directory traversal attacks
 * @param {string} path - File path to sanitize
 * @returns {string} Sanitized path
 */
export function sanitizePath(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }
  
  // Remove dangerous patterns
  const sanitized = path
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/[<>:"|?*]/g, '') // Remove invalid characters
    .replace(/\\/g, '/') // Normalize path separators
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .replace(/^\/+/, '/'); // Ensure single leading slash
  
  // Ensure path starts with / for Dropbox API
  return sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
}

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} [maxSize=157286400] - Maximum allowed size (150MB default)
 * @throws {Error} If size is invalid
 * @returns {void}
 */
export function validateFileSize(size, maxSize = 150 * 1024 * 1024) { // 150MB default
  if (typeof size !== 'number' || isNaN(size) || size < 0) {
    throw new Error('File size must be a valid positive number');
  }

  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
}