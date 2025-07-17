export class AirtableService {
    /**
     * @param {Object} config - Service configuration
     */
    constructor(config: Object);
    config: {
        constructor: Function;
        toString(): string;
        toLocaleString(): string;
        valueOf(): Object;
        hasOwnProperty(v: PropertyKey): boolean;
        isPrototypeOf(v: Object): boolean;
        propertyIsEnumerable(v: PropertyKey): boolean;
        apiKey: any;
        timeout: any;
        retryAttempts: any;
        useOptimization: boolean;
        useSimplification: boolean;
    };
    api: AirtableAPI;
    responseOptimizer: any;
    responseSimplifier: any;
    globalVariableManager: any;
    schemaCache: Map<any, any>;
    schemaCacheTimeout: number;
    /**
     * List all accessible bases
     * @returns {Promise<Object>}
     */
    listBases(): Promise<Object>;
    /**
     * Get base schema with caching
     * @param {string} baseId - Base ID
     * @returns {Promise<Object>}
     */
    getBaseSchema(baseId: string): Promise<Object>;
    /**
     * List records with optimization
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
     * Create record with validation
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Object} fields - Record fields
     * @returns {Promise<Object>}
     */
    createRecord(baseId: string, tableId: string, fields: Object): Promise<Object>;
    /**
     * Update record with validation
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
     * Create multiple records with batching
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Array} records - Array of record objects
     * @returns {Promise<Object>}
     */
    createMultipleRecords(baseId: string, tableId: string, records: any[]): Promise<Object>;
    /**
     * Batch create records (internal method)
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Array} records - Array of record objects
     * @returns {Promise<Object>}
     */
    batchCreateRecords(baseId: string, tableId: string, records: any[]): Promise<Object>;
    /**
     * Search records across multiple tables
     * @param {string} baseId - Base ID
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>}
     */
    searchRecords(baseId: string, query: string, options?: Object): Promise<Object>;
    /**
     * Build search formula for Airtable
     * @param {string} query - Search query
     * @param {Array} fields - Fields to search
     * @param {Object} schema - Base schema
     * @param {string} tableId - Table ID
     * @returns {string}
     */
    buildSearchFormula(query: string, fields: any[], schema: Object, tableId: string): string;
    /**
     * Get service statistics
     * @returns {Object}
     */
    getStatistics(): Object;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Health check
     * @returns {Promise<Object>}
     */
    healthCheck(): Promise<Object>;
}
import { AirtableAPI } from '../api/airtable-api.js';
//# sourceMappingURL=airtable-service.d.ts.map