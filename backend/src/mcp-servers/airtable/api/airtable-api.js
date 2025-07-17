/**
 * Airtable API Client
 * Enhanced API client with rate limiting, caching, and error handling
 */

import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';
import { sanitizeInput } from '../utils/sanitization.js';
import { validateAirtableId } from '../utils/validation.js';

const logger = createLogger('AirtableAPI');

export class AirtableAPI {
	/**
	 * @param {string} apiKey - Airtable API key
	 * @param {Object} options - Configuration options
	 */
	constructor(apiKey, options = {}) {
		this.apiKey = apiKey;
		this.baseUrl = options.baseUrl || 'https://api.airtable.com/v0';
		this.timeout = options.timeout || 30000;
		this.retryAttempts = options.retryAttempts || 3;
		this.rateLimitDelay = options.rateLimitDelay || 200; // 5 requests per second
		
		// Response cache
		this.cache = new Map();
		this.cacheConfig = {
			bases: 3600000, // 1 hour
			schemas: 3600000, // 1 hour
			records: 300000, // 5 minutes
			metadata: 1800000 // 30 minutes
		};
		
		// Rate limiting
		this.lastRequestTime = 0;
		this.requestQueue = [];
		this.isProcessingQueue = false;
		
		logger.info('AirtableAPI initialized', { baseUrl: this.baseUrl });
	}

	/**
	 * Rate limited request wrapper
	 * @param {string} endpoint - API endpoint
	 * @param {Object} options - Request options
	 * @returns {Promise<Response>}
	 */
	async makeRequest(endpoint, options = {}) {
		return new Promise((resolve, reject) => {
			this.requestQueue.push({ endpoint, options, resolve, reject });
			this.processQueue();
		});
	}

	/**
	 * Process request queue with rate limiting
	 */
	async processQueue() {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;

		while (this.requestQueue.length > 0) {
			const { endpoint, options, resolve, reject } = this.requestQueue.shift();

			try {
				// Enforce rate limiting
				const now = Date.now();
				const timeSinceLastRequest = now - this.lastRequestTime;
				if (timeSinceLastRequest < this.rateLimitDelay) {
					await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
				}

				const response = await this.executeRequest(endpoint, options);
				this.lastRequestTime = Date.now();
				resolve(response);
			} catch (error) {
				reject(error);
			}
		}

		this.isProcessingQueue = false;
	}

	/**
	 * Execute HTTP request with retry logic
	 * @param {string} endpoint - API endpoint
	 * @param {Object} options - Request options
	 * @returns {Promise<Response>}
	 */
	async executeRequest(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const requestOptions = {
			...options,
			headers: {
				'Authorization': `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				...options.headers
			},
			timeout: this.timeout
		};

		logger.debug('Making API request', { url, method: options.method || 'GET' });

		try {
			const response = await fetchWithRetry(url, requestOptions, this.retryAttempts);
			
			// Handle rate limiting
			if (response.status === 429) {
				const retryAfter = response.headers.get('Retry-After') || '5';
				logger.warn('Rate limit exceeded, retrying after', { retryAfter });
				await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
				return this.executeRequest(endpoint, options);
			}

			if (!response.ok) {
				throw AirtableErrorHandler.fromResponse(response);
			}

			return response;
		} catch (error) {
			logger.error('API request failed', { url, error: error.message });
			throw AirtableErrorHandler.fromError(error);
		}
	}

	/**
	 * Get from cache or execute request
	 * @param {string} cacheKey - Cache key
	 * @param {Function} requestFn - Function to execute if not cached
	 * @param {number} ttl - Time to live in milliseconds
	 * @returns {Promise<any>}
	 */
	async getCachedOrFetch(cacheKey, requestFn, ttl) {
		const cached = this.cache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < ttl) {
			logger.debug('Cache hit', { cacheKey });
			return cached.data;
		}

		logger.debug('Cache miss, fetching', { cacheKey });
		const data = await requestFn();
		this.cache.set(cacheKey, { data, timestamp: Date.now() });
		return data;
	}

	/**
	 * List all accessible bases
	 * @returns {Promise<Object>}
	 */
	async listBases() {
		return this.getCachedOrFetch(
			'bases',
			async () => {
				const response = await this.makeRequest('/meta/bases');
				return response.json();
			},
			this.cacheConfig.bases
		);
	}

	/**
	 * Get base schema
	 * @param {string} baseId - Base ID
	 * @returns {Promise<Object>}
	 */
	async getBaseSchema(baseId) {
		validateAirtableId(baseId, 'base');
		const sanitizedBaseId = sanitizeInput(baseId);

		return this.getCachedOrFetch(
			`schema:${sanitizedBaseId}`,
			async () => {
				const response = await this.makeRequest(`/meta/bases/${sanitizedBaseId}/tables`);
				return response.json();
			},
			this.cacheConfig.schemas
		);
	}

	/**
	 * List records from a table
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} options - Query options
	 * @returns {Promise<Object>}
	 */
	async listRecords(baseId, tableId, options = {}) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');
		
		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);
		
		const params = new URLSearchParams();
		
		// Add query parameters
		if (options.view) params.append('view', sanitizeInput(options.view));
		if (options.fields) {
			options.fields.forEach(field => params.append('fields[]', sanitizeInput(field)));
		}
		if (options.maxRecords) params.append('maxRecords', options.maxRecords.toString());
		if (options.sort) params.append('sort', JSON.stringify(options.sort));
		if (options.filterByFormula) params.append('filterByFormula', sanitizeInput(options.filterByFormula));
		if (options.offset) params.append('offset', sanitizeInput(options.offset));

		const queryString = params.toString();
		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}${queryString ? '?' + queryString : ''}`;

		// Cache key includes major parameters
		const cacheKey = `records:${sanitizedBaseId}:${sanitizedTableId}:${queryString}`;
		
		return this.getCachedOrFetch(
			cacheKey,
			async () => {
				const response = await this.makeRequest(endpoint);
				return response.json();
			},
			this.cacheConfig.records
		);
	}

	/**
	 * Get all records with automatic pagination
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} options - Query options
	 * @returns {Promise<Array>}
	 */
	async getAllRecords(baseId, tableId, options = {}) {
		let allRecords = [];
		let offset = null;
		let requestCount = 0;
		const maxRequests = 50; // Prevent infinite loops

		do {
			if (requestCount >= maxRequests) {
				logger.warn('Maximum pagination requests reached', { baseId, tableId });
				break;
			}

			const response = await this.listRecords(baseId, tableId, { ...options, offset });
			allRecords = allRecords.concat(response.records);
			offset = response.offset;
			requestCount++;

			logger.debug('Paginated request', { requestCount, recordCount: response.records.length, hasMore: !!offset });
		} while (offset);

		return allRecords;
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

		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);
		const sanitizedRecordId = sanitizeInput(recordId);

		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}/${sanitizedRecordId}`;

		const response = await this.makeRequest(endpoint);
		return response.json();
	}

	/**
	 * Create record
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Object} fields - Record fields
	 * @returns {Promise<Object>}
	 */
	async createRecord(baseId, tableId, fields) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);

		// Clear cache for this table
		this.clearCacheForTable(sanitizedBaseId, sanitizedTableId);

		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}`;

		const response = await this.makeRequest(endpoint, {
			method: 'POST',
			body: JSON.stringify({ fields })
		});

		return response.json();
	}

	/**
	 * Update record
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

		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);
		const sanitizedRecordId = sanitizeInput(recordId);

		// Clear cache for this table
		this.clearCacheForTable(sanitizedBaseId, sanitizedTableId);

		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}/${sanitizedRecordId}`;

		const response = await this.makeRequest(endpoint, {
			method: 'PATCH',
			body: JSON.stringify({ fields })
		});

		return response.json();
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

		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);
		const sanitizedRecordId = sanitizeInput(recordId);

		// Clear cache for this table
		this.clearCacheForTable(sanitizedBaseId, sanitizedTableId);

		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}/${sanitizedRecordId}`;

		const response = await this.makeRequest(endpoint, {
			method: 'DELETE'
		});

		return response.json();
	}

	/**
	 * Create multiple records
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 * @param {Array} records - Array of record objects
	 * @returns {Promise<Object>}
	 */
	async createMultipleRecords(baseId, tableId, records) {
		validateAirtableId(baseId, 'base');
		validateAirtableId(tableId, 'table');

		if (!Array.isArray(records) || records.length === 0) {
			throw new Error('Records must be a non-empty array');
		}

		if (records.length > 10) {
			throw new Error('Maximum 10 records can be created at once');
		}

		const sanitizedBaseId = sanitizeInput(baseId);
		const sanitizedTableId = sanitizeInput(tableId);

		// Clear cache for this table
		this.clearCacheForTable(sanitizedBaseId, sanitizedTableId);

		const endpoint = `/${sanitizedBaseId}/${sanitizedTableId}`;

		const response = await this.makeRequest(endpoint, {
			method: 'POST',
			body: JSON.stringify({ records })
		});

		return response.json();
	}

	/**
	 * Clear cache for specific table
	 * @param {string} baseId - Base ID
	 * @param {string} tableId - Table ID
	 */
	clearCacheForTable(baseId, tableId) {
		const keysToDelete = [];
		for (const key of this.cache.keys()) {
			if (key.startsWith(`records:${baseId}:${tableId}`)) {
				keysToDelete.push(key);
			}
		}
		keysToDelete.forEach(key => this.cache.delete(key));
		logger.debug('Cache cleared for table', { baseId, tableId, keysCleared: keysToDelete.length });
	}

	/**
	 * Clear all cache
	 */
	clearCache() {
		this.cache.clear();
		logger.info('All cache cleared');
	}

	/**
	 * Get cache statistics
	 * @returns {Object}
	 */
	getCacheStats() {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
			queueLength: this.requestQueue.length,
			isProcessingQueue: this.isProcessingQueue
		};
	}
}