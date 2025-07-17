/**
 * Response Simplifier
 * Simplifies Airtable API responses for better readability and usability
 */

import { createLogger } from '../utils/logger.js';
import { deepClone } from '../utils/common.js';

const logger = createLogger('ResponseSimplifier');

export class ResponseSimplifier {
	constructor() {
		this.cache = new Map();
		this.simplificationRules = {
			removeSystemFields: true,
			flattenSingleValues: true,
			simplifyAttachments: true,
			simplifyCollaborators: true,
			simplifyRecordLinks: true,
			formatDates: true,
			normalizeFieldNames: false // Keep original field names by default
		};
	}

	/**
	 * Set simplification rules
	 * @param {Object} rules - Simplification rules
	 */
	setRules(rules) {
		this.simplificationRules = { ...this.simplificationRules, ...rules };
		logger.debug('Simplification rules updated', { rules: this.simplificationRules });
	}

	/**
	 * Simplify records response
	 * @param {Object} response - Original response
	 * @returns {Object} Simplified response
	 */
	simplifyRecordsResponse(response) {
		if (!response || !response.records) {
			return response;
		}

		const simplified = {
			...response,
			records: response.records.map(record => this.simplifyRecord(record))
		};

		logger.debug('Records response simplified', {
			recordCount: simplified.records.length,
			hasOffset: !!simplified.offset
		});

		return simplified;
	}

	/**
	 * Simplify records array
	 * @param {Array} records - Array of records
	 * @returns {Array} Simplified records
	 */
	simplifyRecordsArray(records) {
		if (!Array.isArray(records)) {
			return records;
		}

		const simplified = records.map(record => this.simplifyRecord(record));

		logger.debug('Records array simplified', {
			recordCount: simplified.length
		});

		return simplified;
	}

	/**
	 * Simplify single record response
	 * @param {Object} response - Original response
	 * @returns {Object} Simplified response
	 */
	simplifyRecordResponse(response) {
		const simplified = this.simplifyRecord(response);

		logger.debug('Record response simplified', {
			recordId: simplified.id
		});

		return simplified;
	}

	/**
	 * Simplify multiple records response
	 * @param {Object} response - Original response
	 * @returns {Object} Simplified response
	 */
	simplifyMultipleRecordsResponse(response) {
		if (!response || !response.records) {
			return response;
		}

		const simplified = {
			...response,
			records: response.records.map(record => this.simplifyRecord(record))
		};

		logger.debug('Multiple records response simplified', {
			recordCount: simplified.records.length,
			hasErrors: !!simplified.errors
		});

		return simplified;
	}

	/**
	 * Simplify single record
	 * @param {Object} record - Record object
	 * @returns {Object} Simplified record
	 */
	simplifyRecord(record) {
		if (!record) {
			return record;
		}

		const simplified = {
			id: record.id
		};

		// Add creation time if not removing system fields
		if (!this.simplificationRules.removeSystemFields) {
			simplified.createdTime = record.createdTime;
		}

		// Simplify fields
		if (record.fields) {
			simplified.fields = {};
			for (const [fieldName, fieldValue] of Object.entries(record.fields)) {
				const simplifiedFieldName = this.simplificationRules.normalizeFieldNames ? 
					this.normalizeFieldName(fieldName) : fieldName;
				simplified.fields[simplifiedFieldName] = this.simplifyFieldValue(fieldValue, fieldName);
			}
		}

		return simplified;
	}

	/**
	 * Simplify field value based on type
	 * @param {any} value - Field value
	 * @param {string} fieldName - Field name for context
	 * @returns {any} Simplified value
	 */
	simplifyFieldValue(value, fieldName) {
		if (value === null || value === undefined) {
			return value;
		}

		// Handle arrays
		if (Array.isArray(value)) {
			return value.map(item => this.simplifyFieldValue(item, fieldName));
		}

		// Handle objects
		if (typeof value === 'object') {
			// Attachment simplification
			if (value.url && value.filename) {
				return this.simplifyAttachment(value);
			}

			// Collaborator simplification
			if (value.email) {
				return this.simplifyCollaborator(value);
			}

			// Record link simplification
			if (value.id && !value.url && !value.email) {
				return this.simplifyRecordLink(value);
			}

			// Single select/option simplification
			if (value.name && !value.id && !value.url && !value.email) {
				return this.simplificationRules.flattenSingleValues ? value.name : value;
			}

			// Generic object simplification
			return this.simplifyObject(value);
		}

		// Handle date strings
		if (typeof value === 'string' && this.simplificationRules.formatDates) {
			if (this.isDateString(value)) {
				return this.formatDate(value);
			}
		}

		// Handle strings - trim whitespace
		if (typeof value === 'string') {
			return value.trim();
		}

		return value;
	}

	/**
	 * Simplify attachment object
	 * @param {Object} attachment - Attachment object
	 * @returns {Object} Simplified attachment
	 */
	simplifyAttachment(attachment) {
		if (!this.simplificationRules.simplifyAttachments) {
			return attachment;
		}

		const simplified = {
			filename: attachment.filename,
			url: attachment.url,
			size: attachment.size,
			type: attachment.type
		};

		// Add dimensions for images
		if (attachment.width && attachment.height) {
			simplified.width = attachment.width;
			simplified.height = attachment.height;
		}

		// Add thumbnails if available
		if (attachment.thumbnails) {
			simplified.thumbnails = attachment.thumbnails;
		}

		return simplified;
	}

	/**
	 * Simplify collaborator object
	 * @param {Object} collaborator - Collaborator object
	 * @returns {Object|string} Simplified collaborator
	 */
	simplifyCollaborator(collaborator) {
		if (!this.simplificationRules.simplifyCollaborators) {
			return collaborator;
		}

		// Return just the name if available, otherwise email
		if (this.simplificationRules.flattenSingleValues) {
			return collaborator.name || collaborator.email;
		}

		return {
			name: collaborator.name,
			email: collaborator.email
		};
	}

	/**
	 * Simplify record link object
	 * @param {Object} recordLink - Record link object
	 * @returns {Object|string} Simplified record link
	 */
	simplifyRecordLink(recordLink) {
		if (!this.simplificationRules.simplifyRecordLinks) {
			return recordLink;
		}

		// Return just the name if available and flattening is enabled
		if (this.simplificationRules.flattenSingleValues && recordLink.name) {
			return recordLink.name;
		}

		return {
			id: recordLink.id,
			name: recordLink.name
		};
	}

	/**
	 * Simplify generic object
	 * @param {Object} obj - Object to simplify
	 * @returns {Object} Simplified object
	 */
	simplifyObject(obj) {
		const simplified = {};

		for (const [key, value] of Object.entries(obj)) {
			// Skip internal/system fields
			if (this.simplificationRules.removeSystemFields && this.isSystemField(key)) {
				continue;
			}

			simplified[key] = this.simplifyFieldValue(value, key);
		}

		return simplified;
	}

	/**
	 * Check if field is a system field
	 * @param {string} fieldName - Field name
	 * @returns {boolean}
	 */
	isSystemField(fieldName) {
		const systemFields = [
			'_rawJson',
			'_table',
			'_base',
			'__typename',
			'createdBy',
			'lastModifiedBy',
			'lastModifiedTime'
		];
		return systemFields.includes(fieldName);
	}

	/**
	 * Normalize field name
	 * @param {string} fieldName - Original field name
	 * @returns {string} Normalized field name
	 */
	normalizeFieldName(fieldName) {
		return fieldName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
	}

	/**
	 * Check if string is a date
	 * @param {string} value - String value
	 * @returns {boolean}
	 */
	isDateString(value) {
		// Check for ISO date format
		const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
		const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;
		
		return isoDateRegex.test(value) || simpleDateRegex.test(value);
	}

	/**
	 * Format date string
	 * @param {string} dateString - Date string
	 * @returns {string} Formatted date
	 */
	formatDate(dateString) {
		try {
			const date = new Date(dateString);
			
			// Return ISO date string (YYYY-MM-DD) for date-only values
			if (dateString.includes('T')) {
				return date.toISOString();
			} else {
				return date.toISOString().split('T')[0];
			}
		} catch (error) {
			logger.warn('Failed to format date', { dateString, error: error.message });
			return dateString;
		}
	}

	/**
	 * Flatten nested objects to a single level
	 * @param {Object} obj - Object to flatten
	 * @param {string} prefix - Prefix for keys
	 * @returns {Object} Flattened object
	 */
	flattenObject(obj, prefix = '') {
		const flattened = {};

		for (const [key, value] of Object.entries(obj)) {
			const newKey = prefix ? `${prefix}_${key}` : key;

			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				Object.assign(flattened, this.flattenObject(value, newKey));
			} else {
				flattened[newKey] = value;
			}
		}

		return flattened;
	}

	/**
	 * Create summary view of records
	 * @param {Array} records - Array of records
	 * @param {Object} options - Summary options
	 * @returns {Object} Summary object
	 */
	createSummary(records, options = {}) {
		const {
			includeFieldTypes = true,
			includeValueCounts = true,
			includeFieldStats = true
		} = options;

		if (!Array.isArray(records) || records.length === 0) {
			return { recordCount: 0, fields: {} };
		}

		const summary = {
			recordCount: records.length,
			fields: {}
		};

		// Analyze fields
		for (const record of records) {
			if (!record.fields) continue;

			for (const [fieldName, fieldValue] of Object.entries(record.fields)) {
				if (!summary.fields[fieldName]) {
					summary.fields[fieldName] = {
						presentCount: 0,
						nullCount: 0,
						emptyCount: 0,
						types: new Set(),
						values: new Set()
					};
				}

				const fieldSummary = summary.fields[fieldName];

				if (fieldValue === null || fieldValue === undefined) {
					fieldSummary.nullCount++;
				} else if (fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
					fieldSummary.emptyCount++;
				} else {
					fieldSummary.presentCount++;
					
					if (includeFieldTypes) {
						fieldSummary.types.add(typeof fieldValue);
					}

					if (includeValueCounts && fieldSummary.values.size < 100) {
						fieldSummary.values.add(JSON.stringify(fieldValue));
					}
				}
			}
		}

		// Convert sets to arrays for serialization
		for (const fieldName of Object.keys(summary.fields)) {
			const fieldSummary = summary.fields[fieldName];
			fieldSummary.types = Array.from(fieldSummary.types);
			fieldSummary.uniqueValues = fieldSummary.values.size;
			
			if (includeValueCounts) {
				fieldSummary.sampleValues = Array.from(fieldSummary.values).slice(0, 10);
			}
			
			delete fieldSummary.values;

			if (includeFieldStats) {
				fieldSummary.fillRate = fieldSummary.presentCount / records.length;
				fieldSummary.nullRate = fieldSummary.nullCount / records.length;
				fieldSummary.emptyRate = fieldSummary.emptyCount / records.length;
			}
		}

		return summary;
	}

	/**
	 * Extract field values as arrays
	 * @param {Array} records - Array of records
	 * @param {string} fieldName - Field name to extract
	 * @returns {Array} Array of field values
	 */
	extractFieldValues(records, fieldName) {
		if (!Array.isArray(records)) {
			return [];
		}

		return records
			.map(record => record.fields?.[fieldName])
			.filter(value => value !== null && value !== undefined);
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		this.cache.clear();
		logger.debug('Response simplifier cache cleared');
	}

	/**
	 * Get current rules
	 * @returns {Object} Current simplification rules
	 */
	getRules() {
		return { ...this.simplificationRules };
	}
}