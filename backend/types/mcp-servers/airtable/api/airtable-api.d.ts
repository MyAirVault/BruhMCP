export class AirtableAPI {
    /**
     * @param {string} apiKey - Airtable API key
     * @param {Object} options - Configuration options
     */
    constructor(apiKey: string, options?: Object);
    apiKey: string;
    baseUrl: any;
    timeout: any;
    retryAttempts: any;
    rateLimitDelay: any;
    cache: Map<any, any>;
    cacheConfig: {
        bases: number;
        schemas: number;
        records: number;
        metadata: number;
    };
    lastRequestTime: number;
    requestQueue: any[];
    isProcessingQueue: boolean;
    /**
     * Rate limited request wrapper
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Response>}
     */
    makeRequest(endpoint: string, options?: Object): Promise<Response>;
    /**
     * Process request queue with rate limiting
     */
    processQueue(): Promise<void>;
    /**
     * Execute HTTP request with retry logic
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Response>}
     */
    executeRequest(endpoint: string, options?: Object): Promise<Response>;
    /**
     * Get from cache or execute request
     * @param {string} cacheKey - Cache key
     * @param {Function} requestFn - Function to execute if not cached
     * @param {number} ttl - Time to live in milliseconds
     * @returns {Promise<any>}
     */
    getCachedOrFetch(cacheKey: string, requestFn: Function, ttl: number): Promise<any>;
    /**
     * List all accessible bases
     * @returns {Promise<Object>}
     */
    listBases(): Promise<Object>;
    /**
     * Get base schema
     * @param {string} baseId - Base ID
     * @returns {Promise<Object>}
     */
    getBaseSchema(baseId: string): Promise<Object>;
    /**
     * List records from a table
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>}
     */
    listRecords(baseId: string, tableId: string, options?: Object): Promise<Object>;
    /**
     * Get all records with automatic pagination
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>}
     */
    getAllRecords(baseId: string, tableId: string, options?: Object): Promise<any[]>;
    /**
     * Get specific record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @returns {Promise<Object>}
     */
    getRecord(baseId: string, tableId: string, recordId: string): Promise<Object>;
    /**
     * Create record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Object} fields - Record fields
     * @returns {Promise<Object>}
     */
    createRecord(baseId: string, tableId: string, fields: Object): Promise<Object>;
    /**
     * Update record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @param {Object} fields - Updated fields
     * @returns {Promise<Object>}
     */
    updateRecord(baseId: string, tableId: string, recordId: string, fields: Object): Promise<Object>;
    /**
     * Delete record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @returns {Promise<Object>}
     */
    deleteRecord(baseId: string, tableId: string, recordId: string): Promise<Object>;
    /**
     * Create multiple records
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Array} records - Array of record objects
     * @returns {Promise<Object>}
     */
    createMultipleRecords(baseId: string, tableId: string, records: any[]): Promise<Object>;
    /**
     * Clear cache for specific table
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     */
    clearCacheForTable(baseId: string, tableId: string): void;
    /**
     * Clear all cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     * @returns {Object}
     */
    getCacheStats(): Object;
}
//# sourceMappingURL=airtable-api.d.ts.map