/**
 * General input validation utilities for Google Drive MCP Service
 */

const { sanitizeString  } = require('./stringValidation');
const { sanitizeInteger, sanitizeBoolean, sanitizeArray  } = require('./typeValidation');

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
function sanitizeInput(input, schema) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  /** @type {SanitizedObject} */
  const sanitized = {};
  /** @type {string[]} */
  const errors = [];

  // Process each field in schema
  for (const [field, config] of Object.entries(schema)) {
    try {
      const value = input[field];
      
      // Check if required
      if (config.required && (value === null || value === undefined)) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip if not provided and not required
      if (value === null || value === undefined) {
        if (config.default !== undefined) {
          sanitized[field] = config.default;
        }
        continue;
      }
      
      // Sanitize based on type
      switch (config.type) {
        case 'string':
          sanitized[field] = sanitizeString(value, config.options || {});
          break;
          
        case 'integer':
          sanitized[field] = sanitizeInteger(value, config.options || {});
          break;
          
        case 'boolean':
          sanitized[field] = sanitizeBoolean(value);
          break;
          
        case 'array':
          sanitized[field] = sanitizeArray(value, config.options || {});
          break;
          
        case 'object':
          if (typeof value !== 'object') {
            throw new Error(`${field} must be an object`);
          }
          sanitized[field] = value; // TODO: Deep sanitization if needed
          break;
          
        default:
          sanitized[field] = value; // Pass through for unknown types
      }
      
      // Apply custom validator if provided
      if (config.validator && typeof config.validator === 'function') {
        const validationResult = config.validator(sanitized[field]);
        if (validationResult !== true) {
          errors.push(validationResult || `${field} validation failed`);
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${field}: ${errorMessage}`);
    }
  }
  
  // Check for unexpected fields
  for (const field of Object.keys(input)) {
    if (!schema[field]) {
      console.warn(`Unexpected field in input: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    /** @type {ValidationError} */
    const error = /** @type {ValidationError} */ (new Error('Input validation failed'));
    error.validationErrors = errors;
    throw error;
  }
  
  return sanitized;
}

module.exports = {
  sanitizeInput
};