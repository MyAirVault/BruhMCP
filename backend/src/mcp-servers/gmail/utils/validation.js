/**
 * Validation utilities for Gmail MCP tools
 * Validates tool arguments against defined schemas
 */

import { getTools } from '../endpoints/tools.js';

/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName, args) {
  const toolsData = getTools();
  const tool = toolsData.tools.find(t => t.name === toolName);
  
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
 * @param {Object} obj - Object to validate
 * @param {Object} schema - JSON schema
 * @param {string} context - Context for error messages
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
 * @param {any} value - Value to validate
 * @param {Object} schema - Property schema
 * @param {string} context - Context for error messages
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
    validateString(value, schema, context);
  }

  // Number validations
  if (schema.type === 'number') {
    validateNumber(value, schema, context);
  }

  // Array validations
  if (schema.type === 'array') {
    validateArray(value, schema, context);
  }

  // Enum validation
  if (schema.enum) {
    if (!schema.enum.includes(value)) {
      throw new Error(`Invalid value for ${context}: must be one of [${schema.enum.join(', ')}]`);
    }
  }
}

/**
 * Validate value type
 * @param {any} value - Value to validate
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
 * @param {Object} schema - String schema
 * @param {string} context - Context for error messages
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

  // Email validation for specific fields
  if (context.includes('email') || context.includes('to') || context.includes('from') || context.includes('cc') || context.includes('bcc')) {
    validateEmailField(value, context);
  }
}

/**
 * Validate number property
 * @param {number} value - Number value
 * @param {Object} schema - Number schema
 * @param {string} context - Context for error messages
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
 * @param {Array} value - Array value
 * @param {Object} schema - Array schema
 * @param {string} context - Context for error messages
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
    value.forEach((item, index) => {
      validateProperty(item, schema.items, `${context}[${index}]`);
    });
  }
}

/**
 * Validate email field format
 * @param {string} value - Email value(s)
 * @param {string} context - Context for error messages
 */
function validateEmailField(value, context) {
  if (!value || value.trim() === '') {
    return; // Empty email fields are handled by required validation
  }

  // Handle comma-separated emails (for cc, bcc)
  const emails = value.split(',').map(email => email.trim()).filter(email => email);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  for (const email of emails) {
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format in ${context}: ${email}`);
    }
  }
}

/**
 * Validate Gmail search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid operators
 */
export function validateGmailQuery(query) {
  if (!query || typeof query !== 'string') {
    return; // Empty queries are allowed
  }

  // Check for potentially dangerous operators
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

  // Validate Gmail search operators format
  const gmailOperators = [
    'from:', 'to:', 'subject:', 'has:', 'is:', 'in:', 'label:', 
    'after:', 'before:', 'older_than:', 'newer_than:', 'size:'
  ];

  // Basic validation for operator format
  const operatorMatches = query.match(/(\w+):/g);
  if (operatorMatches) {
    for (const match of operatorMatches) {
      const operator = match.toLowerCase();
      if (!gmailOperators.includes(operator)) {
        console.warn(`Unknown Gmail search operator: ${operator}`);
      }
    }
  }
}

/**
 * Validate message ID format
 * @param {string} messageId - Gmail message ID
 * @throws {Error} If message ID format is invalid
 */
export function validateMessageId(messageId) {
  if (!messageId || typeof messageId !== 'string') {
    throw new Error('Message ID is required and must be a string');
  }

  if (messageId.trim() === '') {
    throw new Error('Message ID cannot be empty');
  }

  // Gmail message IDs are typically base64-like strings
  const messageIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!messageIdRegex.test(messageId)) {
    throw new Error('Invalid message ID format');
  }

  if (messageId.length < 10 || messageId.length > 100) {
    throw new Error('Message ID length is invalid');
  }
}

/**
 * Validate thread ID format
 * @param {string} threadId - Gmail thread ID
 * @throws {Error} If thread ID format is invalid
 */
export function validateThreadId(threadId) {
  if (!threadId || typeof threadId !== 'string') {
    throw new Error('Thread ID is required and must be a string');
  }

  if (threadId.trim() === '') {
    throw new Error('Thread ID cannot be empty');
  }

  // Gmail thread IDs are similar to message IDs
  const threadIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!threadIdRegex.test(threadId)) {
    throw new Error('Invalid thread ID format');
  }

  if (threadId.length < 10 || threadId.length > 100) {
    throw new Error('Thread ID length is invalid');
  }
}

/**
 * Validate label ID format
 * @param {string} labelId - Gmail label ID
 * @throws {Error} If label ID format is invalid
 */
export function validateLabelId(labelId) {
  if (!labelId || typeof labelId !== 'string') {
    throw new Error('Label ID is required and must be a string');
  }

  if (labelId.trim() === '') {
    throw new Error('Label ID cannot be empty');
  }

  // Gmail label IDs can be system labels (UPPERCASE) or user labels (alphanumeric with underscores)
  const labelIdRegex = /^[A-Z_0-9]+$|^Label_[a-zA-Z0-9_-]+$/;
  if (!labelIdRegex.test(labelId)) {
    console.warn(`Unusual label ID format: ${labelId} (may still be valid)`);
  }
}