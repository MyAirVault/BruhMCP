/**
 * General input validation utilities for Google Drive MCP Service
 */

import { sanitizeString } from './stringValidation.js';
import { sanitizeInteger, sanitizeBoolean, sanitizeArray } from './typeValidation.js';

/**
 * General input sanitization based on schema
 * @param {Object} input - Input object to sanitize
 * @param {Object} schema - Schema defining expected fields and types
 * @returns {Object} Sanitized input object
 */
export function sanitizeInput(input, schema) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  const sanitized = {};
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
      errors.push(`${field}: ${error.message}`);
    }
  }
  
  // Check for unexpected fields
  for (const field of Object.keys(input)) {
    if (!schema[field]) {
      console.warn(`Unexpected field in input: ${field}`);
    }
  }
  
  if (errors.length > 0) {
    const error = new Error('Input validation failed');
    error.validationErrors = errors;
    throw error;
  }
  
  return sanitized;
}