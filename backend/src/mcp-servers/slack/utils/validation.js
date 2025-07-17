/**
 * Validation utilities for Slack MCP tools
 * Validates tool arguments against defined schemas
 * Enhanced with comprehensive validation features similar to Gmail implementation
 */

import { getTools } from '../endpoints/tools.js';
import { logValidationError } from './logger.js';

/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} Validation error if arguments are invalid
 */
export function validateToolArguments(toolName, args, instanceId = 'unknown') {
  try {
    const toolsData = getTools();
    const tool = toolsData.tools.find(t => t.name === toolName);
    
    if (!tool) {
      const error = new Error(`Unknown tool: ${toolName}`);
      logValidationError('tool_not_found', 'toolName', toolName, instanceId, { availableTools: toolsData.tools.map(t => t.name) });
      throw error;
    }

    const schema = tool.inputSchema;
    if (!schema) {
      return; // No validation schema defined
    }

    validateObject(args, schema, toolName, instanceId);
  } catch (error) {
    logValidationError('tool_validation_failed', 'arguments', args, instanceId, { toolName, error: error.message });
    throw error;
  }
}

/**
 * Validate object against JSON schema
 * @param {Object} obj - Object to validate
 * @param {Object} schema - JSON schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateObject(obj, schema, context, instanceId = 'unknown') {
  if (schema.type !== 'object') {
    const error = new Error(`Invalid schema type for ${context}: expected object`);
    logValidationError('invalid_schema_type', 'schema.type', schema.type, instanceId, { context, expectedType: 'object' });
    throw error;
  }

  // Check required properties
  if (schema.required && Array.isArray(schema.required)) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in obj)) {
        const error = new Error(`Missing required property: ${requiredProp}`);
        logValidationError('missing_required_property', requiredProp, undefined, instanceId, { context, providedProperties: Object.keys(obj) });
        throw error;
      }
      
      if (obj[requiredProp] === null || obj[requiredProp] === undefined || obj[requiredProp] === '') {
        const error = new Error(`Required property '${requiredProp}' cannot be empty`);
        logValidationError('empty_required_property', requiredProp, obj[requiredProp], instanceId, { context, valueType: typeof obj[requiredProp] });
        throw error;
      }
    }
  }

  // Validate each property
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propName in obj) {
        validateProperty(obj[propName], propSchema, `${context}.${propName}`, instanceId);
      }
    }
  }
}

/**
 * Validate individual property
 * @param {any} value - Value to validate
 * @param {Object} schema - Property schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateProperty(value, schema, context, instanceId = 'unknown') {
  // Type validation
  if (schema.type) {
    if (!validateType(value, schema.type)) {
      const error = new Error(`Invalid type for ${context}: expected ${schema.type}, got ${typeof value}`);
      logValidationError('invalid_type', context, value, instanceId, { expectedType: schema.type, actualType: typeof value });
      throw error;
    }
  }

  // String validations
  if (schema.type === 'string') {
    validateString(value, schema, context, instanceId);
  }

  // Number validations
  if (schema.type === 'number') {
    validateNumber(value, schema, context, instanceId);
  }

  // Array validations
  if (schema.type === 'array') {
    validateArray(value, schema, context, instanceId);
  }

  // Enum validation
  if (schema.enum) {
    if (!schema.enum.includes(value)) {
      const error = new Error(`Invalid value for ${context}: must be one of [${schema.enum.join(', ')}]`);
      logValidationError('invalid_enum_value', context, value, instanceId, { allowedValues: schema.enum });
      throw error;
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
 * @param {string} instanceId - Instance ID for logging
 */
function validateString(value, schema, context, instanceId = 'unknown') {
  if (schema.minLength && value.length < schema.minLength) {
    const error = new Error(`${context} must be at least ${schema.minLength} characters long`);
    logValidationError('string_too_short', context, value, instanceId, { minLength: schema.minLength, actualLength: value.length });
    throw error;
  }

  if (schema.maxLength && value.length > schema.maxLength) {
    const error = new Error(`${context} must be no more than ${schema.maxLength} characters long`);
    logValidationError('string_too_long', context, value, instanceId, { maxLength: schema.maxLength, actualLength: value.length });
    throw error;
  }

  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      const error = new Error(`${context} does not match required pattern: ${schema.pattern}`);
      logValidationError('pattern_mismatch', context, value, instanceId, { pattern: schema.pattern });
      throw error;
    }
  }

  // Slack-specific field validation
  if (context.includes('channel')) {
    validateSlackChannelId(value, context, instanceId);
  }
  
  if (context.includes('user')) {
    validateSlackUserId(value, context, instanceId);
  }
  
  if (context.includes('timestamp') || context.includes('ts')) {
    validateSlackTimestamp(value, context, instanceId);
  }
}

/**
 * Validate number property
 * @param {number} value - Number value
 * @param {Object} schema - Number schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateNumber(value, schema, context, instanceId = 'unknown') {
  if (schema.minimum !== undefined && value < schema.minimum) {
    const error = new Error(`${context} must be at least ${schema.minimum}`);
    logValidationError('number_too_small', context, value, instanceId, { minimum: schema.minimum });
    throw error;
  }

  if (schema.maximum !== undefined && value > schema.maximum) {
    const error = new Error(`${context} must be no more than ${schema.maximum}`);
    logValidationError('number_too_large', context, value, instanceId, { maximum: schema.maximum });
    throw error;
  }

  if (schema.multipleOf && value % schema.multipleOf !== 0) {
    const error = new Error(`${context} must be a multiple of ${schema.multipleOf}`);
    logValidationError('number_not_multiple', context, value, instanceId, { multipleOf: schema.multipleOf });
    throw error;
  }
}

/**
 * Validate array property
 * @param {Array} value - Array value
 * @param {Object} schema - Array schema
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateArray(value, schema, context, instanceId = 'unknown') {
  if (schema.minItems && value.length < schema.minItems) {
    const error = new Error(`${context} must have at least ${schema.minItems} items`);
    logValidationError('array_too_short', context, value, instanceId, { minItems: schema.minItems, actualLength: value.length });
    throw error;
  }

  if (schema.maxItems && value.length > schema.maxItems) {
    const error = new Error(`${context} must have no more than ${schema.maxItems} items`);
    logValidationError('array_too_long', context, value, instanceId, { maxItems: schema.maxItems, actualLength: value.length });
    throw error;
  }

  // Validate array items
  if (schema.items) {
    value.forEach((item, index) => {
      validateProperty(item, schema.items, `${context}[${index}]`, instanceId);
    });
  }
}

/**
 * Validate Slack channel ID format
 * @param {string} value - Channel ID
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateSlackChannelId(value, context, instanceId = 'unknown') {
  if (!value || value.trim() === '') {
    return; // Empty channel IDs are handled by required validation
  }

  // Slack channel IDs start with 'C' (public), 'D' (direct), or 'G' (group/private)
  // Or can be channel names starting with '#' or plain names
  const channelIdRegex = /^[CDG][A-Z0-9]{8,}$|^#?[a-z0-9_-]+$/;
  
  if (!channelIdRegex.test(value)) {
    const error = new Error(`Invalid Slack channel ID format in ${context}: ${value}`);
    logValidationError('invalid_slack_channel_id', context, value, instanceId, { expectedFormat: 'C/D/G + 8+ chars OR #name OR name' });
    throw error;
  }
}

/**
 * Validate Slack user ID format
 * @param {string} value - User ID
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateSlackUserId(value, context, instanceId = 'unknown') {
  if (!value || value.trim() === '') {
    return; // Empty user IDs are handled by required validation
  }

  // Slack user IDs start with 'U' followed by alphanumeric characters
  const userIdRegex = /^U[A-Z0-9]{8,}$/;
  
  if (!userIdRegex.test(value)) {
    const error = new Error(`Invalid Slack user ID format in ${context}: ${value}`);
    logValidationError('invalid_slack_user_id', context, value, instanceId, { expectedFormat: 'U + 8+ alphanumeric chars' });
    throw error;
  }
}

/**
 * Validate Slack timestamp format
 * @param {string} value - Timestamp
 * @param {string} context - Context for error messages
 * @param {string} instanceId - Instance ID for logging
 */
function validateSlackTimestamp(value, context, instanceId = 'unknown') {
  if (!value || value.trim() === '') {
    return; // Empty timestamps are handled by required validation
  }

  // Slack timestamps are in format: seconds.microseconds (e.g., "1234567890.123456")
  const timestampRegex = /^\d{10}\.\d{6}$/;
  
  if (!timestampRegex.test(value)) {
    const error = new Error(`Invalid Slack timestamp format in ${context}: ${value} (expected format: 1234567890.123456)`);
    logValidationError('invalid_slack_timestamp', context, value, instanceId, { expectedFormat: '1234567890.123456' });
    throw error;
  }
}

/**
 * Validate Slack channel types
 * @param {string} types - Channel types (comma-separated)
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If channel types are invalid
 */
export function validateSlackChannelTypes(types, instanceId = 'unknown') {
  if (!types || typeof types !== 'string') {
    return; // Empty types are allowed (defaults to all)
  }

  const validTypes = [
    'public_channel',
    'private_channel',
    'mpim',
    'im'
  ];

  const typeList = types.split(',').map(type => type.trim());
  
  for (const type of typeList) {
    if (!validTypes.includes(type)) {
      const error = new Error(`Invalid Slack channel type: ${type}. Valid types: ${validTypes.join(', ')}`);
      logValidationError('invalid_channel_type', 'channel_types', type, instanceId, { validTypes, providedTypes: typeList });
      throw error;
    }
  }
}

/**
 * Validate Slack file ID format
 * @param {string} fileId - Slack file ID
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If file ID format is invalid
 */
export function validateSlackFileId(fileId, instanceId = 'unknown') {
  if (!fileId || typeof fileId !== 'string') {
    const error = new Error('File ID is required and must be a string');
    logValidationError('file_id_invalid_type', 'file_id', fileId, instanceId, { expectedType: 'string', actualType: typeof fileId });
    throw error;
  }

  if (fileId.trim() === '') {
    const error = new Error('File ID cannot be empty');
    logValidationError('file_id_empty', 'file_id', fileId, instanceId);
    throw error;
  }

  // Slack file IDs start with 'F' followed by alphanumeric characters
  const fileIdRegex = /^F[A-Z0-9]{8,}$/;
  if (!fileIdRegex.test(fileId)) {
    const error = new Error('Invalid Slack file ID format');
    logValidationError('invalid_file_id_format', 'file_id', fileId, instanceId, { expectedFormat: 'F + 8+ alphanumeric chars' });
    throw error;
  }
}

/**
 * Validate Slack emoji name format
 * @param {string} emojiName - Emoji name (without colons)
 * @param {string} instanceId - Instance ID for logging
 * @throws {Error} If emoji name format is invalid
 */
export function validateSlackEmojiName(emojiName, instanceId = 'unknown') {
  if (!emojiName || typeof emojiName !== 'string') {
    const error = new Error('Emoji name is required and must be a string');
    logValidationError('emoji_name_invalid_type', 'emoji_name', emojiName, instanceId, { expectedType: 'string', actualType: typeof emojiName });
    throw error;
  }

  if (emojiName.trim() === '') {
    const error = new Error('Emoji name cannot be empty');
    logValidationError('emoji_name_empty', 'emoji_name', emojiName, instanceId);
    throw error;
  }

  // Emoji names should not contain colons (they're added automatically)
  if (emojiName.includes(':')) {
    const error = new Error('Emoji name should not contain colons (they are added automatically)');
    logValidationError('emoji_name_contains_colons', 'emoji_name', emojiName, instanceId);
    throw error;
  }

  // Basic emoji name validation (alphanumeric, underscore, dash)
  const emojiNameRegex = /^[a-zA-Z0-9_+-]+$/;
  if (!emojiNameRegex.test(emojiName)) {
    const error = new Error('Invalid emoji name format (use only letters, numbers, underscores, plus, and dash)');
    logValidationError('invalid_emoji_name_format', 'emoji_name', emojiName, instanceId, { allowedChars: 'a-zA-Z0-9_+-' });
    throw error;
  }
}

/**
 * Validate Slack reminder time format
 * @param {string} time - Reminder time string
 * @throws {Error} If time format is invalid
 */
export function validateSlackReminderTime(time) {
  if (!time || typeof time !== 'string') {
    throw new Error('Reminder time is required and must be a string');
  }

  if (time.trim() === '') {
    throw new Error('Reminder time cannot be empty');
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /[<>]/,  // HTML tags
    /javascript:/i,  // JavaScript
    /data:/i,  // Data URLs
    /vbscript:/i,  // VBScript
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(time)) {
      throw new Error('Reminder time contains invalid characters or patterns');
    }
  }

  // Basic format validation for common patterns
  const validPatterns = [
    /^in \d+ (minute|minutes|hour|hours|day|days)$/i,
    /^(tomorrow|today) at \d{1,2}:\d{2}(am|pm)?$/i,
    /^at \d{1,2}:\d{2}(am|pm)?$/i,
    /^\d{4}-\d{2}-\d{2}( \d{1,2}:\d{2}(am|pm)?)?$/i
  ];

  const isValidFormat = validPatterns.some(pattern => pattern.test(time));
  if (!isValidFormat) {
    console.warn(`Unusual reminder time format: ${time} (may still be valid)`);
  }
}

/**
 * Validate Slack message text for safety
 * @param {string} text - Message text
 * @throws {Error} If text contains dangerous content
 */
export function validateSlackMessageText(text) {
  if (!text || typeof text !== 'string') {
    return; // Empty text is handled by required validation
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /javascript:/i,  // JavaScript
    /data:/i,  // Data URLs
    /vbscript:/i,  // VBScript
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      throw new Error('Message text contains invalid characters or patterns');
    }
  }

  // Check message length (Slack limit is 40,000 characters)
  if (text.length > 40000) {
    throw new Error('Message text exceeds Slack limit of 40,000 characters');
  }
}

/**
 * Validate Slack filename
 * @param {string} filename - Filename
 * @throws {Error} If filename is invalid
 */
export function validateSlackFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename is required and must be a string');
  }

  if (filename.trim() === '') {
    throw new Error('Filename cannot be empty');
  }

  // Check for dangerous filename patterns
  const dangerousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|*?]/,  // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(filename)) {
      throw new Error('Filename contains invalid characters or patterns');
    }
  }

  // Check filename length
  if (filename.length > 255) {
    throw new Error('Filename exceeds maximum length of 255 characters');
  }
}