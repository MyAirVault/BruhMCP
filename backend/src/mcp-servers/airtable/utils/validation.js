/**
 * Airtable Validation Utilities
 * Comprehensive validation for Airtable IDs, parameters, and data
 */

import { createLogger } from './logger.js';

const logger = createLogger('Validation');

/**
 * Airtable ID patterns
 * @type {Record<string, RegExp>}
 */
const ID_PATTERNS = {
	base: /^app[a-zA-Z0-9]{14}$/,
	table: /^tbl[a-zA-Z0-9]{14}$/,
	record: /^rec[a-zA-Z0-9]{14}$/,
	field: /^fld[a-zA-Z0-9]{14}$/,
	view: /^viw[a-zA-Z0-9]{14}$/,
	attachment: /^att[a-zA-Z0-9]{14}$/,
	user: /^usr[a-zA-Z0-9]{14}$/,
	workspace: /^wsp[a-zA-Z0-9]{14}$/
};

/**
 * API token patterns
 * @type {Record<string, RegExp>}
 */
const TOKEN_PATTERNS = {
	personalAccessToken: /^pat[a-zA-Z0-9]{14}\.[a-zA-Z0-9]{32,64}$/,
	legacyApiKey: /^key[a-zA-Z0-9]{14}$/
};

/**
 * Field type validation patterns
 * @type {Record<string, Function | null>}
 */
const FIELD_TYPES = {
	singleLineText: String,
	email: String,
	url: String,
	multilineText: String,
	number: Number,
	percent: Number,
	currency: Number,
	singleSelect: String,
	multipleSelect: Array,
	singleCollaborator: Object,
	multipleCollaborators: Array,
	multipleRecordLinks: Array,
	date: String,
	dateTime: String,
	phoneNumber: String,
	multipleAttachments: Array,
	checkbox: Boolean,
	formula: null, // Read-only
	createdTime: null, // Read-only
	createdBy: null, // Read-only
	lastModifiedTime: null, // Read-only
	lastModifiedBy: null, // Read-only
	autoNumber: null, // Read-only
	barcode: Object,
	rating: Number,
	richText: String,
	duration: Number,
	count: null, // Read-only
	lookup: null, // Read-only
	rollup: null, // Read-only
	multipleLookupValues: null, // Read-only
	externalSyncSource: null, // Read-only
	button: null // Read-only
};

/**
 * Validate Airtable ID
 * @param {string} id - ID to validate
 * @param {string} type - Type of ID (base, table, record, etc.)
 * @returns {boolean}
 */
export function validateAirtableId(id, type) {
	if (!id || typeof id !== 'string') {
		throw new Error(`Invalid ${type} ID: must be a non-empty string`);
	}

	const pattern = ID_PATTERNS[type];
	if (!pattern) {
		throw new Error(`Unknown ID type: ${type}`);
	}

	if (!pattern.test(id)) {
		throw new Error(`Invalid ${type} ID format: ${id}. Expected format: ${pattern.toString()}`);
	}

	return true;
}

/**
 * Validate API token
 * @param {string} token - Token to validate
 * @returns {boolean}
 */
export function validateApiToken(token) {
	if (!token || typeof token !== 'string') {
		throw new Error('Invalid API token: must be a non-empty string');
	}

	const isPersonalAccessToken = TOKEN_PATTERNS.personalAccessToken.test(token);
	const isLegacyApiKey = TOKEN_PATTERNS.legacyApiKey.test(token);

	if (!isPersonalAccessToken && !isLegacyApiKey) {
		throw new Error('Invalid API token format. Must be either Personal Access Token (pat + 14 chars + . + 32-64 chars) or Legacy API Key (key + 14 chars)');
	}

	return true;
}

/**
 * Validate field name
 * @param {string} fieldName - Field name to validate
 * @returns {boolean}
 */
export function validateFieldName(fieldName) {
	if (!fieldName || typeof fieldName !== 'string') {
		throw new Error('Field name must be a non-empty string');
	}

	if (fieldName.length > 100) {
		throw new Error('Field name cannot exceed 100 characters');
	}

	// Check for reserved field names
	const reservedNames = ['id', 'createdTime', 'createdBy', 'lastModifiedTime', 'lastModifiedBy'];
	if (reservedNames.includes(fieldName)) {
		throw new Error(`Field name '${fieldName}' is reserved`);
	}

	return true;
}

/**
 * @typedef {Object} Collaborator
 * @property {string} email - Collaborator email
 *
 * @typedef {Object} Attachment
 * @property {string} url - Attachment URL
 *
 * @typedef {Object} Barcode
 * @property {string} text - Barcode text
 *
 * @typedef {Object} FieldOptions
 * @property {string[]} [choices] - Available choices for select fields
 *
 * Validate field value based on field type
 * @param {string | number | boolean | Collaborator | Collaborator[] | Attachment[] | Barcode | string[] | null | undefined} value - Value to validate
 * @param {string} fieldType - Field type
 * @param {FieldOptions} fieldOptions - Field options
 * @returns {boolean}
 */
export function validateFieldValue(value, fieldType, fieldOptions = {}) {
	if (value === null || value === undefined) {
		return true; // Allow null/undefined values
	}

	const expectedType = FIELD_TYPES[fieldType];
	if (expectedType === null) {
		throw new Error(`Field type '${fieldType}' is read-only`);
	}

	if (expectedType === undefined) {
		throw new Error(`Unknown field type: ${fieldType}`);
	}

	switch (fieldType) {
		case 'singleLineText':
		case 'email':
		case 'url':
		case 'multilineText':
		case 'phoneNumber':
		case 'richText':
			if (typeof value !== 'string') {
				throw new Error(`${fieldType} must be a string`);
			}
			break;

		case 'number':
		case 'percent':
		case 'currency':
		case 'rating':
		case 'duration':
			if (typeof value !== 'number') {
				throw new Error(`${fieldType} must be a number`);
			}
			break;

		case 'checkbox':
			if (typeof value !== 'boolean') {
				throw new Error('Checkbox must be a boolean');
			}
			break;

		case 'singleSelect':
			if (typeof value !== 'string') {
				throw new Error('Single select must be a string');
			}
			if (fieldOptions.choices && Array.isArray(fieldOptions.choices) && !fieldOptions.choices.includes(value)) {
				throw new Error(`Single select value '${value}' is not in allowed choices`);
			}
			break;

		case 'multipleSelect':
			if (!Array.isArray(value)) {
				throw new Error('Multiple select must be an array');
			}
			if (fieldOptions.choices && Array.isArray(fieldOptions.choices)) {
				for (const item of value) {
					if (typeof item === 'string' && !fieldOptions.choices.includes(item)) {
						throw new Error(`Multiple select value '${item}' is not in allowed choices`);
					}
				}
			}
			break;

		case 'date':
		case 'dateTime':
			if (typeof value !== 'string') {
				throw new Error(`${fieldType} must be a string`);
			}
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				throw new Error(`Invalid ${fieldType} format: ${value}`);
			}
			break;

		case 'multipleAttachments':
			if (!Array.isArray(value)) {
				throw new Error('Multiple attachments must be an array');
			}
			for (const attachment of value) {
				const typedAttachment = /** @type {Attachment} */(attachment);
				if (typeof attachment !== 'object' || attachment === null || !typedAttachment.url || typeof typedAttachment.url !== 'string') {
					throw new Error('Attachment must have a valid URL');
				}
			}
			break;

		case 'singleCollaborator':
			if (typeof value !== 'object' || value === null || !(/** @type {Collaborator} */(value)).email) {
				throw new Error('Single collaborator must be an object with email property');
			}
			break;

		case 'multipleCollaborators':
			if (!Array.isArray(value)) {
				throw new Error('Multiple collaborators must be an array');
			}
			for (const collaborator of value) {
				if (typeof collaborator !== 'object' || collaborator === null || !(/** @type {Collaborator} */(collaborator)).email) {
					throw new Error('Collaborator must be an object with email property');
				}
			}
			break;

		case 'multipleRecordLinks':
			if (!Array.isArray(value)) {
				throw new Error('Multiple record links must be an array');
			}
			for (const link of value) {
				if (typeof link !== 'string') {
					throw new Error('Record link must be a string (record ID)');
				}
				validateAirtableId(link, 'record');
			}
			break;

		case 'barcode':
			if (typeof value !== 'object' || value === null || !(/** @type {Barcode} */(value)).text) {
				throw new Error('Barcode must be an object with text property');
			}
			break;

		default:
			logger.warn('Unknown field type for validation', { fieldType });
			break;
	}

	return true;
}

/**
 * @typedef {Object} FieldSchema
 * @property {string} name - Field name
 * @property {string} type - Field type
 * @property {Object} [options] - Field options
 * @property {string[]} [options.choices] - Available choices for select fields
 *
 * @typedef {Object} TableSchema
 * @property {FieldSchema[]} [fields] - Schema fields array
 *
 * Validate record fields
 * @param {Record<string, string | number | boolean | string[] | Collaborator | Collaborator[] | Attachment[] | Barcode>} fields - Record fields
 * @param {TableSchema} schema - Table schema
 * @returns {boolean}
 */
export function validateRecordFields(fields, schema = {}) {
	if (!fields || typeof fields !== 'object') {
		throw new Error('Record fields must be an object');
	}

	if (Object.keys(fields).length === 0) {
		throw new Error('Record fields cannot be empty');
	}

	// Validate each field
	for (const [fieldName, value] of Object.entries(fields)) {
		validateFieldName(fieldName);

		// If schema is provided, validate against it
		if (schema.fields && Array.isArray(schema.fields)) {
			const fieldSchema = schema.fields.find(f => f && (/** @type {FieldSchema} */(f)).name === fieldName);
			if (fieldSchema) {
				const typedFieldSchema = /** @type {FieldSchema} */(fieldSchema);
				if (typedFieldSchema.type) {
					validateFieldValue(value, typedFieldSchema.type, typedFieldSchema.options || {});
				}
			}
		}
	}

	return true;
}

/**
 * @typedef {Object} SortItem
 * @property {string} field - Field name to sort by
 * @property {'asc' | 'desc'} [direction] - Sort direction
 *
 * @typedef {Object} QueryParams
 * @property {number} [maxRecords] - Maximum number of records
 * @property {string[]} [fields] - Fields to include
 * @property {SortItem[]} [sort] - Sort configuration
 * @property {string} [view] - View name
 * @property {string} [filterByFormula] - Filter formula
 *
 * Validate query parameters
 * @param {QueryParams} params - Query parameters
 * @returns {boolean}
 */
export function validateQueryParams(params) {
	if (!params || typeof params !== 'object') {
		return true; // Empty params are valid
	}

	// Validate maxRecords
	if (params.maxRecords !== undefined) {
		if (typeof params.maxRecords !== 'number' || params.maxRecords < 1 || params.maxRecords > 100) {
			throw new Error('maxRecords must be a number between 1 and 100');
		}
	}

	// Validate fields
	if (params.fields !== undefined) {
		if (!Array.isArray(params.fields)) {
			throw new Error('fields must be an array');
		}
		for (const field of params.fields) {
			validateFieldName(field);
		}
	}

	// Validate sort
	if (params.sort !== undefined) {
		if (!Array.isArray(params.sort)) {
			throw new Error('sort must be an array');
		}
		for (const sortItem of params.sort) {
			const typedSortItem = /** @type {SortItem} */(sortItem);
			if (typeof sortItem !== 'object' || sortItem === null || !typedSortItem.field || typeof typedSortItem.field !== 'string') {
				throw new Error('sort item must have a field property');
			}
			if (typedSortItem.direction && !['asc', 'desc'].includes(typedSortItem.direction)) {
				throw new Error('sort direction must be "asc" or "desc"');
			}
		}
	}

	// Validate view
	if (params.view !== undefined) {
		if (typeof params.view !== 'string') {
			throw new Error('view must be a string');
		}
	}

	// Validate filterByFormula
	if (params.filterByFormula !== undefined) {
		if (typeof params.filterByFormula !== 'string') {
			throw new Error('filterByFormula must be a string');
		}
	}

	return true;
}

/**
 * @typedef {Object} RecordData
 * @property {Record<string, string | number | boolean | string[] | Collaborator | Collaborator[] | Attachment[] | Barcode>} fields - Record fields
 *
 * Validate batch records
 * @param {RecordData[]} records - Array of records
 * @param {TableSchema} schema - Table schema
 * @returns {boolean}
 */
export function validateBatchRecords(records, schema = {}) {
	if (!Array.isArray(records)) {
		throw new Error('Records must be an array');
	}

	if (records.length === 0) {
		throw new Error('Records array cannot be empty');
	}

	if (records.length > 10) {
		throw new Error('Maximum 10 records can be processed at once');
	}

	for (let i = 0; i < records.length; i++) {
		const record = records[i];
		const typedRecord = /** @type {RecordData} */(record);
		if (typeof record !== 'object' || record === null || !typedRecord.fields || typeof typedRecord.fields !== 'object' || typedRecord.fields === null) {
			throw new Error(`Record at index ${i} must have a fields property`);
		}
		validateRecordFields(typedRecord.fields, schema);
	}

	return true;
}

/**
 * Validate URL parameters
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function validateUrl(url) {
	if (!url || typeof url !== 'string') {
		throw new Error('URL must be a non-empty string');
	}

	try {
		new URL(url);
		return true;
	} catch (error) {
		throw new Error(`Invalid URL format: ${url}`);
	}
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email) {
	if (!email || typeof email !== 'string') {
		throw new Error('Email must be a non-empty string');
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new Error(`Invalid email format: ${email}`);
	}

	return true;
}

/**
 * Sanitize and validate input
 * @param {string} input - Input to validate
 * @param {string} type - Type of input ('baseId' | 'tableId' | 'recordId' | 'apiToken' | 'email' | 'url' | 'fieldName')
 * @returns {string}
 */
export function sanitizeAndValidate(input, type) {
	switch (type) {
		case 'baseId':
			validateAirtableId(input, 'base');
			break;
		case 'tableId':
			validateAirtableId(input, 'table');
			break;
		case 'recordId':
			validateAirtableId(input, 'record');
			break;
		case 'apiToken':
			validateApiToken(input);
			break;
		case 'email':
			validateEmail(input);
			break;
		case 'url':
			validateUrl(input);
			break;
		case 'fieldName':
			validateFieldName(input);
			break;
		default:
			logger.warn('Unknown validation type', { type });
			break;
	}

	return input;
}

/**
 * Get validation error message
 * @param {Error} error - Validation error
 * @returns {string}
 */
export function getValidationErrorMessage(error) {
	if (error.name === 'ValidationError') {
		return error.message;
	}
	
	return `Validation failed: ${error.message}`;
}

/**
 * Create validation error
 * @param {string} message - Error message
 * @param {Record<string, string | number | boolean>} details - Error details
 * @returns {Error}
 */
export function createValidationError(message, details = {}) {
	const error = new Error(message);
	error.name = 'ValidationError';
	// Add details property to error object
	Object.defineProperty(error, 'details', {
		value: details,
		writable: true,
		enumerable: true,
		configurable: true
	});
	return error;
}