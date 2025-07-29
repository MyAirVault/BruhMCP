/**
 * Validation utilities for Reddit MCP tools
 * Validates tool arguments against defined schemas
 */

const { getTools  } = require('../endpoints/tools');

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
function validateToolArguments(toolName, args) {
  const toolsData = /** @type {ToolsData} */ (getTools());
  const tool = toolsData.tools.find((/** @type {Tool} */ t) => t.name === toolName);
  
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
 * @param {Record<string, any>} obj - Object to validate
 * @param {JsonSchema} schema - JSON schema
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
 * @param {JsonSchemaProperty} schema - Property schema
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
    validateString(/** @type {string} */ (value), schema, context);
  }

  // Number validations
  if (schema.type === 'number') {
    validateNumber(/** @type {number} */ (value), schema, context);
  }

  // Array validations
  if (schema.type === 'array') {
    validateArray(/** @type {any[]} */ (value), schema, context);
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
 * @param {JsonSchemaProperty} schema - String schema
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

  // Subreddit name validation
  if (context.includes('subreddit')) {
    validateSubredditName(value, context);
  }

  // Username validation
  if (context.includes('username')) {
    validateUsername(value, context);
  }
}

/**
 * Validate number property
 * @param {number} value - Number value
 * @param {JsonSchemaProperty} schema - Number schema
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
 * @param {any[]} value - Array value
 * @param {JsonSchemaProperty} schema - Array schema
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
      validateProperty(item, /** @type {JsonSchemaProperty} */ (schema.items), `${context}[${index}]`);
    });
  }
}

/**
 * Validate subreddit name format
 * @param {string} value - Subreddit name
 * @param {string} context - Context for error messages
 */
function validateSubredditName(value, context) {
  if (!value || value.trim() === '') {
    return; // Empty subreddit names are handled by required validation
  }

  // Remove r/ prefix if present
  const cleanName = value.replace(/^r\//, '');
  
  // Reddit subreddit name rules:
  // - 3-21 characters
  // - alphanumeric and underscores only
  // - cannot start with underscore
  // - cannot end with underscore
  const subredditRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{1,19}[a-zA-Z0-9]$|^[a-zA-Z0-9]{3}$/;
  
  if (!subredditRegex.test(cleanName)) {
    throw new Error(`Invalid subreddit name format in ${context}: ${value}. Must be 3-21 characters, alphanumeric and underscores only, cannot start or end with underscore.`);
  }
}

/**
 * Validate Reddit username format
 * @param {string} value - Username
 * @param {string} context - Context for error messages
 */
function validateUsername(value, context) {
  if (!value || value.trim() === '') {
    return; // Empty usernames are handled by required validation
  }

  // Remove u/ prefix if present
  const cleanName = value.replace(/^u\//, '');
  
  // Reddit username rules:
  // - 3-20 characters
  // - alphanumeric, underscore, and hyphen only
  // - cannot start with underscore
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,18}[a-zA-Z0-9]$|^[a-zA-Z0-9]{3}$/;
  
  if (!usernameRegex.test(cleanName)) {
    throw new Error(`Invalid username format in ${context}: ${value}. Must be 3-20 characters, alphanumeric, underscore, and hyphen only, cannot start with underscore.`);
  }
}

/**
 * Validate Reddit post ID format
 * @param {string} postId - Reddit post ID
 * @throws {Error} If post ID format is invalid
 */
function validatePostId(postId) {
  if (!postId || typeof postId !== 'string') {
    throw new Error('Post ID is required and must be a string');
  }

  if (postId.trim() === '') {
    throw new Error('Post ID cannot be empty');
  }

  // Reddit post IDs are typically base36 alphanumeric strings
  const postIdRegex = /^[a-zA-Z0-9]{4,10}$/;
  if (!postIdRegex.test(postId)) {
    throw new Error(`Invalid post ID format: ${postId}. Must be 4-10 alphanumeric characters.`);
  }
}

/**
 * Validate Reddit comment ID format
 * @param {string} commentId - Reddit comment ID
 * @throws {Error} If comment ID format is invalid
 */
function validateCommentId(commentId) {
  if (!commentId || typeof commentId !== 'string') {
    throw new Error('Comment ID is required and must be a string');
  }

  if (commentId.trim() === '') {
    throw new Error('Comment ID cannot be empty');
  }

  // Reddit comment IDs are typically base36 alphanumeric strings
  const commentIdRegex = /^[a-zA-Z0-9]{4,10}$/;
  if (!commentIdRegex.test(commentId)) {
    throw new Error(`Invalid comment ID format: ${commentId}. Must be 4-10 alphanumeric characters.`);
  }
}

/**
 * Validate Reddit fullname format (t1_, t3_, etc.)
 * @param {string} fullname - Reddit fullname
 * @throws {Error} If fullname format is invalid
 */
function validateFullname(fullname) {
  if (!fullname || typeof fullname !== 'string') {
    throw new Error('Fullname is required and must be a string');
  }

  if (fullname.trim() === '') {
    throw new Error('Fullname cannot be empty');
  }

  // Reddit fullnames: t1_ (comment), t3_ (post), t2_ (account), t4_ (message), t5_ (subreddit)
  const fullnameRegex = /^t[1-6]_[a-zA-Z0-9]{4,10}$/;
  if (!fullnameRegex.test(fullname)) {
    throw new Error(`Invalid fullname format: ${fullname}. Must be in format t[1-6]_[id].`);
  }
}

/**
 * Validate Reddit search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid characters
 */
function validateRedditQuery(query) {
  if (!query || typeof query !== 'string') {
    return; // Empty queries are allowed
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

  // Reddit search has length limits
  if (query.length > 512) {
    throw new Error('Search query is too long (maximum 512 characters)');
  }
}

/**
 * Validate vote direction
 * @param {number} direction - Vote direction
 * @throws {Error} If direction is invalid
 */
function validateVoteDirection(direction) {
  if (typeof direction !== 'number') {
    throw new Error('Vote direction must be a number');
  }

  if (![1, 0, -1].includes(direction)) {
    throw new Error('Vote direction must be 1 (upvote), 0 (no vote), or -1 (downvote)');
  }
}

/**
 * Validate Reddit post content
 * @param {string} content - Post content
 * @param {'title' | 'text' | 'url'} type - Content type ('title', 'text', 'url')
 * @throws {Error} If content is invalid
 */
function validatePostContent(content, type) {
  if (!content || typeof content !== 'string') {
    throw new Error(`${type} is required and must be a string`);
  }

  const trimmed = content.trim();
  if (trimmed === '') {
    throw new Error(`${type} cannot be empty`);
  }

  switch (type) {
    case 'title':
      if (trimmed.length > 300) {
        throw new Error('Post title cannot exceed 300 characters');
      }
      break;
    case 'text':
      if (trimmed.length > 40000) {
        throw new Error('Post text cannot exceed 40,000 characters');
      }
      break;
    case 'url':
      try {
        new URL(content);
      } catch (error) {
        throw new Error('Invalid URL format');
      }
      break;
  }
}

module.exports = {
  validateToolArguments
};