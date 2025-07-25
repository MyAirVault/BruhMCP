/**
 * Validation utilities for Google Drive MCP tools
 * Validates tool arguments against defined schemas
 */

import { getTools } from '../endpoints/tools.js';

/**
 * @typedef {Object} JsonSchemaProperty
 * @property {string} [type] - Property type
 * @property {string} [description] - Property description
 * @property {string[]} [enum] - Enumeration values
 * @property {string} [pattern] - Regex pattern
 * @property {number} [minLength] - Minimum string length
 * @property {number} [maxLength] - Maximum string length
 * @property {number} [minimum] - Minimum number value
 * @property {number} [maximum] - Maximum number value
 * @property {number} [multipleOf] - Number must be multiple of this
 * @property {number} [minItems] - Minimum array items
 * @property {number} [maxItems] - Maximum array items
 * @property {JsonSchemaProperty} [items] - Array item schema
 * @property {string | number | boolean} [default] - Default value
 */

/**
 * @typedef {Object} JsonSchema
 * @property {string} type - Schema type
 * @property {Record<string, JsonSchemaProperty>} [properties] - Object properties
 * @property {string[]} [required] - Required properties
 */

/**
 * @typedef {Object} DriveToolDefinition
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {JsonSchema} inputSchema - Input validation schema
 */

/**
 * @typedef {Object} DriveToolsResponse
 * @property {DriveToolDefinition[]} tools - Available tools
 */

/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Record<string, string | number | boolean | string[] | Record<string, unknown>>} args - Arguments to validate
 * @throws {Error} Validation error if arguments are invalid
 * @returns {void}
 */
export function validateToolArguments(toolName, args) {
	/** @type {DriveToolsResponse} */
	const toolsData = getTools();
	const tool = toolsData.tools.find((t) => t.name === toolName);

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
 * @param {Record<string, string | number | boolean | string[] | Record<string, unknown>>} obj - Object to validate
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
 * @param {string | number | boolean | string[] | Record<string, unknown> | null | undefined} value - Value to validate
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
	if (schema.type === 'string' && typeof value === 'string') {
		validateString(value, schema, context);
	}

	// Number validations
	if (schema.type === 'number' && typeof value === 'number') {
		validateNumber(value, schema, context);
	}

	// Array validations
	if (schema.type === 'array' && Array.isArray(value)) {
		validateArray(value, schema, context);
	}

	// Enum validation
	if (schema.enum) {
		if (!schema.enum.includes(String(value))) {
			throw new Error(`Invalid value for ${context}: must be one of [${schema.enum.join(', ')}]`);
		}
	}
}

/**
 * Validate value type
 * @param {string | number | boolean | string[] | Record<string, unknown> | null | undefined} value - Value to validate
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
 * @param {string[]} value - Array value
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
			if (schema.items) {
				validateProperty(item, schema.items, `${context}[${index}]`);
			}
		});
	}
}

/**
 * Validate Google Drive search query
 * @param {string} query - Search query
 * @throws {Error} If query contains invalid operators
 */
export function validateDriveQuery(query) {
	if (!query || typeof query !== 'string') {
		return; // Empty queries are allowed
	}

	// Check for potentially dangerous patterns
	const dangerousPatterns = [
		/[<>]/, // HTML tags
		/javascript:/i, // JavaScript
		/data:/i, // Data URLs
		/vbscript:/i, // VBScript
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(query)) {
			throw new Error('Query contains invalid characters or patterns');
		}
	}

	// Validate Google Drive search operators format
	const driveOperators = [
		'name:',
		'fullText:',
		'mimeType:',
		'modifiedTime:',
		'parents:',
		'owners:',
		'type:',
		'trashed:',
		'starred:',
		'properties:',
		'appProperties:',
		'visibility:',
		'createdTime:',
		'sharedWithMe:',
	];

	// Basic validation for operator format
	const operatorMatches = query.match(/(\w+):/g);
	if (operatorMatches) {
		for (const match of operatorMatches) {
			const operator = match.toLowerCase();
			if (!driveOperators.includes(operator)) {
				console.warn(`Unknown Google Drive search operator: ${operator}`);
			}
		}
	}
}

/**
 * Validate file ID format
 * @param {string} fileId - Google Drive file ID
 * @throws {Error} If file ID format is invalid
 */
export function validateFileId(fileId) {
	if (!fileId || typeof fileId !== 'string') {
		throw new Error('File ID is required and must be a string');
	}

	if (fileId.trim() === '') {
		throw new Error('File ID cannot be empty');
	}

	// Google Drive file IDs are typically alphanumeric with hyphens and underscores
	const fileIdRegex = /^[a-zA-Z0-9_-]+$/;
	if (!fileIdRegex.test(fileId)) {
		throw new Error('Invalid file ID format');
	}

	if (fileId.length < 10 || fileId.length > 100) {
		throw new Error('File ID length is invalid');
	}
}

/**
 * Validate folder ID format
 * @param {string} folderId - Google Drive folder ID
 * @throws {Error} If folder ID format is invalid
 */
export function validateFolderId(folderId) {
	if (!folderId || typeof folderId !== 'string') {
		throw new Error('Folder ID is required and must be a string');
	}

	if (folderId.trim() === '') {
		throw new Error('Folder ID cannot be empty');
	}

	// Google Drive folder IDs are similar to file IDs
	const folderIdRegex = /^[a-zA-Z0-9_-]+$/;
	if (!folderIdRegex.test(folderId)) {
		throw new Error('Invalid folder ID format');
	}

	if (folderId.length < 10 || folderId.length > 100) {
		throw new Error('Folder ID length is invalid');
	}
}

/**
 * Validate MIME type format
 * @param {string} mimeType - MIME type string
 * @throws {Error} If MIME type format is invalid
 */
export function validateMimeType(mimeType) {
	if (!mimeType || typeof mimeType !== 'string') {
		throw new Error('MIME type is required and must be a string');
	}

	if (mimeType.trim() === '') {
		throw new Error('MIME type cannot be empty');
	}

	// Basic MIME type validation
	const mimeTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
	if (!mimeTypeRegex.test(mimeType)) {
		throw new Error('Invalid MIME type format');
	}
}

/**
 * Validate file name
 * @param {string} fileName - File name
 * @throws {Error} If file name is invalid
 */
export function validateFileName(fileName) {
	if (!fileName || typeof fileName !== 'string') {
		throw new Error('File name is required and must be a string');
	}

	if (fileName.trim() === '') {
		throw new Error('File name cannot be empty');
	}

	// Check for invalid characters in file names
	const invalidChars = /[<>:"/\\|?*]/;
	if (invalidChars.test(fileName)) {
		throw new Error('File name contains invalid characters');
	}

	if (fileName.length > 255) {
		throw new Error('File name is too long (maximum 255 characters)');
	}

	// Check for reserved names
	const reservedNames = [
		'CON',
		'PRN',
		'AUX',
		'NUL',
		'COM1',
		'COM2',
		'COM3',
		'COM4',
		'COM5',
		'COM6',
		'COM7',
		'COM8',
		'COM9',
		'LPT1',
		'LPT2',
		'LPT3',
		'LPT4',
		'LPT5',
		'LPT6',
		'LPT7',
		'LPT8',
		'LPT9',
	];
	if (reservedNames.includes(fileName.toUpperCase())) {
		throw new Error('File name is reserved and cannot be used');
	}
}

/**
 * Validate permissions role
 * @param {string} role - Permission role
 * @throws {Error} If role is invalid
 */
export function validatePermissionRole(role) {
	const validRoles = ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];

	if (!validRoles.includes(role)) {
		throw new Error(`Invalid permission role: ${role}. Must be one of: ${validRoles.join(', ')}`);
	}
}

/**
 * Validate permissions type
 * @param {string} type - Permission type
 * @throws {Error} If type is invalid
 */
export function validatePermissionType(type) {
	const validTypes = ['user', 'group', 'domain', 'anyone'];

	if (!validTypes.includes(type)) {
		throw new Error(`Invalid permission type: ${type}. Must be one of: ${validTypes.join(', ')}`);
	}
}

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @throws {Error} If email format is invalid
 */
export function validateEmailAddress(email) {
	if (!email || typeof email !== 'string') {
		throw new Error('Email address is required and must be a string');
	}

	if (email.trim() === '') {
		throw new Error('Email address cannot be empty');
	}

	// Basic email validation regex
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new Error('Invalid email address format');
	}
}

/**
 * Validate domain name format
 * @param {string} domain - Domain name to validate
 * @throws {Error} If domain format is invalid
 */
export function validateDomainName(domain) {
	if (!domain || typeof domain !== 'string') {
		throw new Error('Domain name is required and must be a string');
	}

	if (domain.trim() === '') {
		throw new Error('Domain name cannot be empty');
	}

	// Basic domain validation regex
	const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	if (!domainRegex.test(domain)) {
		throw new Error('Invalid domain name format');
	}
}

/**
 * Validate local file path
 * @param {string} path - File path to validate
 * @throws {Error} If path is invalid
 */
export function validateLocalPath(path) {
	if (!path || typeof path !== 'string') {
		throw new Error('Local path is required and must be a string');
	}

	if (path.trim() === '') {
		throw new Error('Local path cannot be empty');
	}

	// Check for dangerous path patterns
	const dangerousPatterns = [
		/\.\./, // Parent directory traversal
		/\/\//, // Double slashes
		/\0/, // Null bytes
	];

	for (const pattern of dangerousPatterns) {
		if (pattern.test(path)) {
			throw new Error('Local path contains invalid patterns');
		}
	}
}
