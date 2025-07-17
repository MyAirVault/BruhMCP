/**
 * Response Optimizer
 * Optimizes Airtable API responses for better performance and reduced payload size
 */

import { createLogger } from '../utils/logger.js';
import { deepClone, formatBytes } from '../utils/common.js';

const logger = createLogger('ResponseOptimizer');

export class ResponseOptimizer {
	constructor() {
		this.cache = new Map();
		this.compressionStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalOptimizedSize: 0,
			compressionRatio: 0
		};
	}

	/**
	 * Optimize bases response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeBasesResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizeResponse(response, {
			removeEmptyFields: true,
			compressArrays: true,
			optimizeMetadata: true
		});

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Bases response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize schema response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeSchemaResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		// Create optimized schema with essential information only
		const optimized = {
			...response,
			tables: response.tables?.map(table => ({
				id: table.id,
				name: table.name,
				description: table.description,
				primaryFieldId: table.primaryFieldId,
				fields: table.fields?.map(field => ({
					id: field.id,
					name: field.name,
					type: field.type,
					options: this.optimizeFieldOptions(field.options),
					description: field.description
				})) || [],
				views: table.views?.map(view => ({
					id: view.id,
					name: view.name,
					type: view.type
				})) || []
			})) || []
		};

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Schema response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			tableCount: optimized.tables.length
		});

		return optimized;
	}

	/**
	 * Optimize field options
	 * @param {Object} options - Field options
	 * @returns {Object} Optimized options
	 */
	optimizeFieldOptions(options) {
		if (!options) return options;

		const optimized = { ...options };

		// Remove verbose descriptions and keep only essential data
		if (optimized.choices) {
			optimized.choices = optimized.choices.map(choice => ({
				id: choice.id,
				name: choice.name,
				color: choice.color
			}));
		}

		// Remove unnecessary precision for numbers
		if (optimized.precision !== undefined && optimized.precision === 0) {
			delete optimized.precision;
		}

		return optimized;
	}

	/**
	 * Optimize records response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeRecordsResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = {
			...response,
			records: response.records?.map(record => this.optimizeRecord(record)) || []
		};

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Records response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			recordCount: optimized.records.length
		});

		return optimized;
	}

	/**
	 * Optimize records array
	 * @param {Array} records - Array of records
	 * @returns {Array} Optimized records
	 */
	optimizeRecordsArray(records) {
		if (!Array.isArray(records)) return records;

		const originalSize = this.calculateResponseSize(records);
		const optimized = records.map(record => this.optimizeRecord(record));

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Records array optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			recordCount: optimized.length
		});

		return optimized;
	}

	/**
	 * Optimize single record
	 * @param {Object} record - Record object
	 * @returns {Object} Optimized record
	 */
	optimizeRecord(record) {
		if (!record) return record;

		const optimized = {
			id: record.id,
			createdTime: record.createdTime,
			fields: {}
		};

		// Optimize fields
		if (record.fields) {
			for (const [fieldName, fieldValue] of Object.entries(record.fields)) {
				optimized.fields[fieldName] = this.optimizeFieldValue(fieldValue);
			}
		}

		return optimized;
	}

	/**
	 * Optimize single record response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeRecordResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizeRecord(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Record response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize multiple records response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeMultipleRecordsResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = {
			...response,
			records: response.records?.map(record => this.optimizeRecord(record)) || []
		};

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Multiple records response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			recordCount: optimized.records.length
		});

		return optimized;
	}

	/**
	 * Optimize field value based on type
	 * @param {any} value - Field value
	 * @returns {any} Optimized value
	 */
	optimizeFieldValue(value) {
		if (value === null || value === undefined) {
			return value;
		}

		// Handle arrays (multiple select, attachments, etc.)
		if (Array.isArray(value)) {
			return value.map(item => this.optimizeFieldValue(item));
		}

		// Handle objects
		if (typeof value === 'object') {
			// Attachment optimization
			if (value.url && value.filename) {
				return {
					id: value.id,
					url: value.url,
					filename: value.filename,
					type: value.type,
					size: value.size,
					width: value.width,
					height: value.height
				};
			}

			// Collaborator optimization
			if (value.email) {
				return {
					id: value.id,
					email: value.email,
					name: value.name
				};
			}

			// Record link optimization
			if (value.id && !value.url) {
				return {
					id: value.id,
					name: value.name
				};
			}

			// Remove empty or unnecessary fields
			return this.optimizeResponse(value, {
				removeEmptyFields: true,
				compressArrays: false
			});
		}

		// Handle strings - trim whitespace
		if (typeof value === 'string') {
			return value.trim();
		}

		// Handle numbers - remove unnecessary decimals
		if (typeof value === 'number') {
			return Number(value.toFixed(10)); // Remove floating point errors
		}

		return value;
	}

	/**
	 * Generic response optimization
	 * @param {Object} response - Response to optimize
	 * @param {Object} options - Optimization options
	 * @returns {Object} Optimized response
	 */
	optimizeResponse(response, options = {}) {
		const {
			removeEmptyFields = false,
			compressArrays = false,
			optimizeMetadata = false
		} = options;

		if (!response || typeof response !== 'object') {
			return response;
		}

		const optimized = Array.isArray(response) ? [] : {};

		for (const [key, value] of Object.entries(response)) {
			// Skip empty fields if requested
			if (removeEmptyFields && this.isEmpty(value)) {
				continue;
			}

			// Optimize metadata fields
			if (optimizeMetadata && this.isMetadataField(key)) {
				continue;
			}

			// Handle arrays
			if (Array.isArray(value)) {
				if (compressArrays && value.length === 0) {
					continue; // Skip empty arrays
				}
				optimized[key] = value.map(item => 
					typeof item === 'object' ? this.optimizeResponse(item, options) : item
				);
			}
			// Handle objects
			else if (typeof value === 'object' && value !== null) {
				optimized[key] = this.optimizeResponse(value, options);
			}
			// Handle primitive values
			else {
				optimized[key] = value;
			}
		}

		return optimized;
	}

	/**
	 * Check if value is empty
	 * @param {any} value - Value to check
	 * @returns {boolean}
	 */
	isEmpty(value) {
		if (value === null || value === undefined) return true;
		if (typeof value === 'string') return value.trim().length === 0;
		if (Array.isArray(value)) return value.length === 0;
		if (typeof value === 'object') return Object.keys(value).length === 0;
		return false;
	}

	/**
	 * Check if field is metadata
	 * @param {string} fieldName - Field name
	 * @returns {boolean}
	 */
	isMetadataField(fieldName) {
		const metadataFields = [
			'_rawJson',
			'_table',
			'_base',
			'commentCount',
			'createdBy',
			'lastModifiedBy',
			'lastModifiedTime'
		];
		return metadataFields.includes(fieldName);
	}

	/**
	 * Calculate response size (rough estimate)
	 * @param {any} response - Response object
	 * @returns {number} Size in bytes
	 */
	calculateResponseSize(response) {
		try {
			return JSON.stringify(response).length;
		} catch (error) {
			logger.warn('Failed to calculate response size', { error: error.message });
			return 0;
		}
	}

	/**
	 * Update compression statistics
	 * @param {number} originalSize - Original size
	 * @param {number} optimizedSize - Optimized size
	 */
	updateCompressionStats(originalSize, optimizedSize) {
		this.compressionStats.totalRequests++;
		this.compressionStats.totalOriginalSize += originalSize;
		this.compressionStats.totalOptimizedSize += optimizedSize;
		
		if (this.compressionStats.totalOriginalSize > 0) {
			this.compressionStats.compressionRatio = 
				(this.compressionStats.totalOriginalSize - this.compressionStats.totalOptimizedSize) / 
				this.compressionStats.totalOriginalSize;
		}
	}

	/**
	 * Get compression statistics
	 * @returns {Object}
	 */
	getCompressionStats() {
		return {
			...this.compressionStats,
			averageOriginalSize: this.compressionStats.totalRequests > 0 ? 
				this.compressionStats.totalOriginalSize / this.compressionStats.totalRequests : 0,
			averageOptimizedSize: this.compressionStats.totalRequests > 0 ? 
				this.compressionStats.totalOptimizedSize / this.compressionStats.totalRequests : 0,
			totalSaved: this.compressionStats.totalOriginalSize - this.compressionStats.totalOptimizedSize,
			compressionRatioPercent: Math.round(this.compressionStats.compressionRatio * 100)
		};
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		this.cache.clear();
		logger.debug('Response optimizer cache cleared');
	}

	/**
	 * Reset statistics
	 */
	resetStats() {
		this.compressionStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalOptimizedSize: 0,
			compressionRatio: 0
		};
		logger.debug('Response optimizer statistics reset');
	}
}