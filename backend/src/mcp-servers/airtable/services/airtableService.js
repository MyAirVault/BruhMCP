/**
 * Airtable Service
 * Core business logic for Airtable operations with response optimization
 */

import * as AirtableAPI from '../api/index.js';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';
import { validateAirtableId, validateRecordFields, validateQueryParams, validateBatchRecords } from '../utils/validation.js';
import { sanitizeRecordFields, sanitizeQueryParams } from '../utils/sanitization.js';
import { deepClone, chunkArray, measureExecutionTime, withTimeout } from '../utils/common.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} airtableApiKey - API key for Airtable
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {number} [retryAttempts=3] - Number of retry attempts
 * @property {boolean} [useOptimization=true] - Enable response optimization
 * @property {boolean} [useSimplification=true] - Enable response simplification
 */

/**
 * @typedef {Object} AirtableRecord
 * @property {string} id - Record ID
 * @property {Object} fields - Record fields
 * @property {string} [createdTime] - Created timestamp
 */

/**
 * @typedef {Object} AirtableBase
 * @property {string} id - Base ID
 * @property {string} name - Base name
 * @property {string} permissionLevel - Permission level
 */

/**
 * @typedef {Object} AirtableTable
 * @property {string} id - Table ID
 * @property {string} name - Table name
 * @property {Array<Object>} fields - Table fields
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [maxRecords] - Maximum number of records to return
 * @property {Array<string>} [fields] - Fields to include
 * @property {string} [filterByFormula] - Formula to filter records
 * @property {Array<Object>} [sort] - Sort configuration
 * @property {string} [view] - View ID or name
 * @property {string} [offset] - Pagination offset
 */

/**
 * @typedef {Object} SchemaCache
 * @property {Object} data - Cached schema data
 * @property {number} timestamp - Cache timestamp
 */

/**
 * @typedef {Object} BatchResult
 * @property {Array<AirtableRecord>} records - Created records
 * @property {Array<Object>} [errors] - Batch errors if any
 */

const logger = createLogger('AirtableService');

export class AirtableService {
	/**
	 * @param {ServiceConfig} config - Service configuration
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

		// Cache for schemas
		/** @type {Map<string, SchemaCache>} */
		this.schemaCache = new Map();
		/** @type {number} */
		this.schemaCacheTimeout = 3600000; // 1 hour

		logger.info('AirtableService initialized', {
			useOptimization: this.config.useOptimization,
			useSimplification: this.config.useSimplification,
			timeout: this.config.timeout
		});
	}

	/**
	 * List all accessible bases
	 * @returns {Promise<{bases: Array<AirtableBase>}>}
	 */
	async listBases() {
		logger.info('Listing bases');

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				return await withTimeout(
					AirtableAPI.listBases(this.config.apiKey),
					this.config.timeout,
					'List bases operation timed out'
				);
			});

			logger.info('Bases listed successfully', {
				duration,
				baseCount: result.bases?.length || 0
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
				operation: 'listBases'
			});
			throw airtableError;
		}
	}

	/**
	 * Get base schema with caching
	 * @param {string} baseId - Base ID
	 * @returns {Promise<{tables: Array<AirtableTable>}>}
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
				return await withTimeout(
					AirtableAPI.getBaseSchema(baseId, this.config.apiKey),
					this.config.timeout,
					'Get base schema operation timed out'
				);
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
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {QueryOptions} options - Query options
	 * @returns {Promise<{records: Array<AirtableRecord>, offset?: string}>}
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
				return await withTimeout(
					AirtableAPI.listRecords(baseId, tableId, this.config.apiKey, sanitizedOptions),
					this.config.timeout,
					'List records operation timed out'
				);
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
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {QueryOptions} options - Query options
	 * @returns {Promise<Array<AirtableRecord>>}
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
				/** @type {Array<AirtableRecord>} */
				let allRecords = [];
				/** @type {string|undefined} */
				let offset = undefined;
				let requestCount = 0;
				const maxRequests = 50; // Prevent infinite loops

				do {
					if (requestCount >= maxRequests) {
						logger.warn('Maximum pagination requests reached', { baseId, tableId });
						break;
					}

					const response = await withTimeout(
						AirtableAPI.listRecords(baseId, tableId, this.config.apiKey, { ...sanitizedOptions, offset }),
						this.config.timeout,
						'Get all records pagination timed out'
					);
					
					allRecords = allRecords.concat(response.records);
					offset = response.offset;
					requestCount++;

					logger.debug('Paginated request', { requestCount, recordCount: response.records.length, hasMore: !!offset });
				} while (offset);

				return allRecords;
			});

			logger.info('All records retrieved successfully', {
				baseId,
				tableId,
				duration,
				recordCount: result.length
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @returns {Promise<AirtableRecord>}
	 */
	async getRecord(baseId, tableId, recordId) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		logger.info('Getting record', { baseId, tableId, recordId });

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				return await withTimeout(
					AirtableAPI.getRecord(baseId, tableId, recordId, this.config.apiKey),
					this.config.timeout,
					'Get record operation timed out'
				);
			});

			logger.info('Record retrieved successfully', {
				baseId,
				tableId,
				recordId,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {Record<string, any>} fields - Record fields
	 * @returns {Promise<AirtableRecord>}
	 */
	async createRecord(baseId, tableId, fields) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		/** @type {AirtableTable|undefined} */
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
				return await withTimeout(
					AirtableAPI.createRecord(baseId, tableId, sanitizedFields, this.config.apiKey),
					this.config.timeout,
					'Create record operation timed out'
				);
			});

			logger.info('Record created successfully', {
				baseId,
				tableId,
				recordId: result.id,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {Record<string, any>} fields - Updated fields
	 * @returns {Promise<AirtableRecord>}
	 */
	async updateRecord(baseId, tableId, recordId, fields) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		/** @type {AirtableTable|undefined} */
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
				return await withTimeout(
					AirtableAPI.updateRecord(baseId, tableId, recordId, sanitizedFields, this.config.apiKey),
					this.config.timeout,
					'Update record operation timed out'
				);
			});

			logger.info('Record updated successfully', {
				baseId,
				tableId,
				recordId,
				duration
			});

			return result;
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @returns {Promise<{deleted: boolean, id: string}>}
	 */
	async deleteRecord(baseId, tableId, recordId) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		validateAirtableId(recordId, 'record');

		logger.info('Deleting record', { baseId, tableId, recordId });

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				return await withTimeout(
					AirtableAPI.deleteRecord(baseId, tableId, recordId, this.config.apiKey),
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
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {Array<{fields: Record<string, any>}>} records - Array of record objects
	 * @returns {Promise<BatchResult>}
	 */
	async createMultipleRecords(baseId, tableId, records) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		// Get schema for validation
		const schema = await this.getBaseSchema(baseId);
		/** @type {AirtableTable|undefined} */
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
					return await withTimeout(
						AirtableAPI.createMultipleRecords(baseId, tableId, sanitizedRecords, this.config.apiKey),
						this.config.timeout,
						'Create multiple records operation timed out'
					);
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
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */(error), {
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
	 * @param {Array<{fields: Record<string, any>}>} records - Array of record objects
	 * @returns {Promise<BatchResult>}
	 */
	async batchCreateRecords(baseId, tableId, records) {
		const batches = chunkArray(records, 10);
		/** @type {Array<AirtableRecord>} */
		const allResults = [];
		/** @type {Array<{batch: number, error: string, records: Array<{fields: Record<string, any>}>}>} */
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
					AirtableAPI.createMultipleRecords(baseId, tableId, batch, this.config.apiKey),
					this.config.timeout,
					`Batch ${i + 1} operation timed out`
				);

				allResults.push(...batchResult.records);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				logger.error('Batch creation failed', { batchIndex: i, error: errorMessage });
				errors.push({
					batch: i,
					error: errorMessage,
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
	 * Get service statistics
	 * @returns {{schemaCacheSize: number, config: {useOptimization: boolean, useSimplification: boolean, timeout: number}}}
	 */
	getStatistics() {
		return {
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
		this.schemaCache.clear();
		logger.info('All caches cleared');
	}

	/**
	 * Health check
	 * @returns {Promise<{status: string, apiConnectivity: boolean, responseTime?: number, error?: string, timestamp: string}>}
	 */
	async healthCheck() {
		try {
			const startTime = Date.now();
			await AirtableAPI.listBases(this.config.apiKey);
			const duration = Date.now() - startTime;

			return {
				status: 'healthy',
				apiConnectivity: true,
				responseTime: duration,
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				status: 'unhealthy',
				apiConnectivity: false,
				error: errorMessage,
				timestamp: new Date().toISOString()
			};
		}
	}
}