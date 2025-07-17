/**
 * Airtable Service
 * Core business logic for Airtable operations with response optimization
 */

import { AirtableAPI } from '../api/airtable-api.js';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';
import { validateAirtableId, validateRecordFields, validateQueryParams, validateBatchRecords } from '../utils/validation.js';
import { sanitizeRecordFields, sanitizeQueryParams } from '../utils/sanitization.js';
import { deepClone, chunkArray, measureExecutionTime, withTimeout } from '../utils/common.js';
import { ResponseOptimizer } from './cache/response-optimizer.js';
import { ResponseSimplifier } from './cache/response-simplifier.js';
import { GlobalVariableManager } from './session/global-variable-manager.js';

const logger = createLogger('AirtableService');

export class AirtableService {
	/**
	 * @param {Object} config - Service configuration
	 */
	constructor(config) {
		this.config = {
			apiKey: config.airtableApiKey,
			timeout: config.timeout || 30000,
			retryAttempts: config.retryAttempts || 3,
			useOptimization: config.useOptimization !== false,
			useSimplification: config.useSimplification !== false,
			...config
		};

		// Initialize API client
		this.api = new AirtableAPI(this.config.apiKey, {
			timeout: this.config.timeout,
			retryAttempts: this.config.retryAttempts
		});

		// Initialize optimization services
		this.responseOptimizer = new ResponseOptimizer();
		this.responseSimplifier = new ResponseSimplifier();
		this.globalVariableManager = new GlobalVariableManager();

		// Cache for schemas
		this.schemaCache = new Map();
		this.schemaCacheTimeout = 3600000; // 1 hour

		logger.info('AirtableService initialized', {
			useOptimization: this.config.useOptimization,
			useSimplification: this.config.useSimplification,
			timeout: this.config.timeout
		});
	}

	/**
	 * List all accessible bases
	 * @returns {Promise<Object>}
	 */
	async listBases() {
		logger.info('Listing bases');

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.listBases(),
					this.config.timeout,
					'List bases operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeBasesResponse(response);
				}

				return response;
			});

			logger.info('Bases listed successfully', {
				duration,
				baseCount: result.bases?.length || 0
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'listBases'
			});
			throw airtableError;
		}
	}

	/**
	 * Get base schema with caching
	 * @param {string} baseId - Base ID
	 * @returns {Promise<Object>}
	 */
	async getBaseSchema(baseId) {
		validateAirtableId(baseId, 'base');
		logger.info('Getting base schema', { baseId });

		// Check cache first
		const cacheKey = `schema:${baseId}`;
		const cached = this.schemaCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < this.schemaCacheTimeout) {
			logger.debug('Schema cache hit', { baseId });
			return cached.data;
		}

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getBaseSchema(baseId),
					this.config.timeout,
					'Get base schema operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeSchemaResponse(response);
				}

				return response;
			});

			// Cache the result
			this.schemaCache.set(cacheKey, {
				data: result,
				timestamp: Date.now()
			});

			logger.info('Base schema retrieved successfully', {
				baseId,
				duration,
				tableCount: result.tables?.length || 0
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'getBaseSchema',
				baseId
			});
			throw airtableError;
		}
	}

	/**
	 * List records with optimization
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} options - Query options
	 * @returns {Promise<Object>}
	 */
	async listRecords(baseId, tableId, options = {}) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateQueryParams(options);

		const sanitizedOptions = sanitizeQueryParams(options);
		
		logger.info('Listing records', {
			baseId,
			tableId,
			options: sanitizedOptions
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.listRecords(baseId, tableId, sanitizedOptions),
					this.config.timeout,
					'List records operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeRecordsResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyRecordsResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Records listed successfully', {
				baseId,
				tableId,
				duration,
				recordCount: result.records?.length || 0,
				hasMore: !!result.offset
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'listRecords',
				baseId,
				tableId,
				options: sanitizedOptions
			});
			throw airtableError;
		}
	}

	/**
	 * Get all records with automatic pagination
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} options - Query options
	 * @returns {Promise<Array>}
	 */
	async getAllRecords(baseId, tableId, options = {}) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateQueryParams(options);

		const sanitizedOptions = sanitizeQueryParams(options);
		
		logger.info('Getting all records', {
			baseId,
			tableId,
			options: sanitizedOptions
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const allRecords = await withTimeout(
					this.api.getAllRecords(baseId, tableId, sanitizedOptions),
					this.config.timeout * 3, // Extended timeout for pagination
					'Get all records operation timed out'
				);

				// Apply optimization and simplification
				let optimizedRecords = allRecords;

				if (this.config.useOptimization) {
					optimizedRecords = this.responseOptimizer.optimizeRecordsArray(optimizedRecords);
				}

				if (this.config.useSimplification) {
					optimizedRecords = this.responseSimplifier.simplifyRecordsArray(optimizedRecords);
				}

				return optimizedRecords;
			});

			logger.info('All records retrieved successfully', {
				baseId,
				tableId,
				duration,
				recordCount: result.length
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'getAllRecords',
				baseId,
				tableId,
				options: sanitizedOptions
			});
			throw airtableError;
		}
	}

	/**
	 * Get specific record
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {string} recordId - Record ID
	 * @returns {Promise<Object>}
	 */
	async getRecord(baseId, tableId, recordId) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		logger.info('Getting record', { baseId, tableId, recordId });

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getRecord(baseId, tableId, recordId),
					this.config.timeout,
					'Get record operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeRecordResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyRecordResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Record retrieved successfully', {
				baseId,
				tableId,
				recordId,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'getRecord',
				baseId,
				tableId,
				recordId
			});
			throw airtableError;
		}
	}

	/**
	 * Create record with validation
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} fields - Record fields
	 * @returns {Promise<Object>}
	 */
	async createRecord(baseId, tableId, fields) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		const tableSchema = schema.tables.find(t => t.id === tableId || t.name === tableId);

		if (tableSchema) {
			validateRecordFields(fields, tableSchema);
		}

		const sanitizedFields = sanitizeRecordFields(fields);

		logger.info('Creating record', {
			baseId,
			tableId,
			fieldCount: Object.keys(sanitizedFields).length
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.createRecord(baseId, tableId, sanitizedFields),
					this.config.timeout,
					'Create record operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeRecordResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyRecordResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Record created successfully', {
				baseId,
				tableId,
				recordId: result.id,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'createRecord',
				baseId,
				tableId,
				fields: Object.keys(sanitizedFields)
			});
			throw airtableError;
		}
	}

	/**
	 * Update record with validation
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {string} recordId - Record ID
	 * @param {Object} fields - Updated fields
	 * @returns {Promise<Object>}
	 */
	async updateRecord(baseId, tableId, recordId, fields) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		const tableSchema = schema.tables.find(t => t.id === tableId || t.name === tableId);

		if (tableSchema) {
			validateRecordFields(fields, tableSchema);
		}

		const sanitizedFields = sanitizeRecordFields(fields);

		logger.info('Updating record', {
			baseId,
			tableId,
			recordId,
			fieldCount: Object.keys(sanitizedFields).length
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.updateRecord(baseId, tableId, recordId, sanitizedFields),
					this.config.timeout,
					'Update record operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeRecordResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyRecordResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Record updated successfully', {
				baseId,
				tableId,
				recordId,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'updateRecord',
				baseId,
				tableId,
				recordId,
				fields: Object.keys(sanitizedFields)
			});
			throw airtableError;
		}
	}

	/**
	 * Delete record
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {string} recordId - Record ID
	 * @returns {Promise<Object>}
	 */
	async deleteRecord(baseId, tableId, recordId) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		logger.info('Deleting record', { baseId, tableId, recordId });

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				return await withTimeout(
					this.api.deleteRecord(baseId, tableId, recordId),
					this.config.timeout,
					'Delete record operation timed out'
				);
			});

			logger.info('Record deleted successfully', {
				baseId,
				tableId,
				recordId,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'deleteRecord',
				baseId,
				tableId,
				recordId
			});
			throw airtableError;
		}
	}

	/**
	 * Create multiple records with batching
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Array} records - Array of record objects
	 * @returns {Promise<Object>}
	 */
	async createMultipleRecords(baseId, tableId, records) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		const tableSchema = schema.tables.find(t => t.id === tableId || t.name === tableId);

		if (tableSchema) {
			validateBatchRecords(records, tableSchema);
		}

		// Sanitize all records
		const sanitizedRecords = records.map(record => ({
			...record,
			fields: sanitizeRecordFields(record.fields)
		}));

		logger.info('Creating multiple records', {
			baseId,
			tableId,
			recordCount: sanitizedRecords.length
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				// Handle batching if more than 10 records
				if (sanitizedRecords.length <= 10) {
					const response = await withTimeout(
						this.api.createMultipleRecords(baseId, tableId, sanitizedRecords),
						this.config.timeout,
						'Create multiple records operation timed out'
					);

					let optimizedResponse = response;

					// Apply optimization if enabled
					if (this.config.useOptimization) {
						optimizedResponse = this.responseOptimizer.optimizeMultipleRecordsResponse(optimizedResponse);
					}

					// Apply simplification if enabled
					if (this.config.useSimplification) {
						optimizedResponse = this.responseSimplifier.simplifyMultipleRecordsResponse(optimizedResponse);
					}

					return optimizedResponse;
				} else {
					// Batch processing for more than 10 records
					return await this.batchCreateRecords(baseId, tableId, sanitizedRecords);
				}
			});

			logger.info('Multiple records created successfully', {
				baseId,
				tableId,
				recordCount: result.records?.length || sanitizedRecords.length,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'createMultipleRecords',
				baseId,
				tableId,
				recordCount: sanitizedRecords.length
			});
			throw airtableError;
		}
	}

	/**
	 * Batch create records (internal method)
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Array} records - Array of record objects
	 * @returns {Promise<Object>}
	 */
	async batchCreateRecords(baseId, tableId, records) {
		const batches = chunkArray(records, 10);
		const allResults = [];
		const errors = [];

		logger.info('Processing batched record creation', {
			baseId,
			tableId,
			totalRecords: records.length,
			batchCount: batches.length
		});

		for (let i = 0; i < batches.length; i++) {
			try {
				const batch = batches[i];
				logger.debug('Processing batch', { batchIndex: i, recordCount: batch.length });

				const batchResult = await withTimeout(
					this.api.createMultipleRecords(baseId, tableId, batch),
					this.config.timeout,
					`Batch ${i + 1} operation timed out`
				);

				// Apply optimization and simplification
				let optimizedResult = batchResult;

				if (this.config.useOptimization) {
					optimizedResult = this.responseOptimizer.optimizeMultipleRecordsResponse(optimizedResult);
				}

				if (this.config.useSimplification) {
					optimizedResult = this.responseSimplifier.simplifyMultipleRecordsResponse(optimizedResult);
				}

				allResults.push(...optimizedResult.records);
			} catch (error) {
				logger.error('Batch creation failed', { batchIndex: i, error: error.message });
				errors.push({
					batch: i,
					error: error.message,
					records: batches[i]
				});
			}
		}

		if (errors.length > 0) {
			logger.warn('Some batches failed', { errorCount: errors.length });
		}

		return {
			records: allResults,
			errors: errors.length > 0 ? errors : undefined
		};
	}

	/**
	 * Search records across multiple tables
	 * @param {string} baseId - Base ID
	 * @param {string} query - Search query
	 * @param {Object} options - Search options
	 * @returns {Promise<Object>}
	 */
	async searchRecords(baseId, query, options = {}) {
		validateAirtableId(baseId, 'base');

		const {
			tables = [],
			fields = [],
			maxRecords = 100
		} = options;

		logger.info('Searching records', {
			baseId,
			query,
			tableCount: tables.length,
			fieldCount: fields.length,
			maxRecords
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const schema = await this.getBaseSchema(baseId);
				const tablesToSearch = tables.length > 0 ? tables : schema.tables.map(t => t.id);

				const searchResults = [];

				for (const tableId of tablesToSearch) {
					try {
						const formula = this.buildSearchFormula(query, fields, schema, tableId);
						const records = await this.listRecords(baseId, tableId, {
							filterByFormula: formula,
							maxRecords: Math.ceil(maxRecords / tablesToSearch.length)
						});

						searchResults.push({
							tableId,
							records: records.records || []
						});
					} catch (error) {
						logger.warn('Search failed for table', { tableId, error: error.message });
					}
				}

				return {
					query,
					results: searchResults,
					totalRecords: searchResults.reduce((total, result) => total + result.records.length, 0)
				};
			});

			logger.info('Search completed successfully', {
				baseId,
				query,
				duration,
				totalRecords: result.totalRecords
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'searchRecords',
				baseId,
				query,
				options
			});
			throw airtableError;
		}
	}

	/**
	 * Build search formula for Airtable
	 * @param {string} query - Search query
	 * @param {Array} fields - Fields to search
	 * @param {Object} schema - Base schema
	 * @param {string} tableId - Table ID
	 * @returns {string}
	 */
	buildSearchFormula(query, fields, schema, tableId) {
		const table = schema.tables.find(t => t.id === tableId);
		if (!table) {
			throw new Error(`Table ${tableId} not found in schema`);
		}

		const searchFields = fields.length > 0 ? fields : 
			table.fields.filter(f => ['singleLineText', 'multilineText', 'richText'].includes(f.type)).map(f => f.name);

		if (searchFields.length === 0) {
			throw new Error('No searchable fields found');
		}

		const searchConditions = searchFields.map(field => 
			`SEARCH(LOWER("${query}"), LOWER({${field}}))`
		).join(', ');

		return `OR(${searchConditions})`;
	}

	/**
	 * Get service statistics
	 * @returns {Object}
	 */
	getStatistics() {
		return {
			apiStats: this.api.getCacheStats(),
			schemaCacheSize: this.schemaCache.size,
			config: {
				useOptimization: this.config.useOptimization,
				useSimplification: this.config.useSimplification,
				timeout: this.config.timeout
			}
		};
	}

	/**
	 * Clear all caches
	 */
	clearCaches() {
		this.api.clearCache();
		this.schemaCache.clear();
		this.responseOptimizer.clearCache();
		this.responseSimplifier.clearCache();
		
		logger.info('All caches cleared');
	}

	/**
	 * Health check
	 * @returns {Promise<Object>}
	 */
	async healthCheck() {
		try {
			const startTime = Date.now();
			await this.api.listBases();
			const duration = Date.now() - startTime;

			return {
				status: 'healthy',
				apiConnectivity: true,
				responseTime: duration,
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				apiConnectivity: false,
				error: error.message,
				timestamp: new Date().toISOString()
			};
		}
	}
}