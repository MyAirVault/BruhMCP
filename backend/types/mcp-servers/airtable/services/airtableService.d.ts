export class AirtableService {
    /**
     * @param {ServiceConfig} config - Service configuration
     */
    constructor(config: ServiceConfig);
    config: {
        /**
         * - API key for Airtable
         */
        airtableApiKey: string;
        /**
         * - Request timeout in milliseconds
         */
        timeout: number;
        /**
         * - Number of retry attempts
         */
        retryAttempts: number;
        /**
         * - Enable response optimization
         */
        useOptimization: boolean;
        /**
         * - Enable response simplification
         */
        useSimplification: boolean;
        apiKey: string;
    };
    /** @type {Map<string, SchemaCache>} */
    schemaCache: Map<string, SchemaCache>;
    /** @type {number} */
    schemaCacheTimeout: number;
    /**
     * List all accessible bases
     * @returns {Promise<{bases: Array<AirtableBase>}>}
     */
    listBases(): Promise<{
        bases: Array<AirtableBase>;
    }>;
    /**
     * Get base schema with caching
     * @param {string} baseId - Base ID
     * @returns {Promise<{tables: Array<AirtableTable>}>}
     */
    getBaseSchema(baseId: string): Promise<{
        tables: Array<AirtableTable>;
    }>;
    /**
     * List records with optimization
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {QueryOptions} options - Query options
     * @returns {Promise<{records: Array<AirtableRecord>, offset?: string}>}
     */
    listRecords(baseId: string, tableId: string, options?: QueryOptions): Promise<{
        records: Array<AirtableRecord>;
        offset?: string;
    }>;
    /**
     * Get all records with automatic pagination
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {QueryOptions} options - Query options
     * @returns {Promise<Array<AirtableRecord>>}
     */
    getAllRecords(baseId: string, tableId: string, options?: QueryOptions): Promise<Array<AirtableRecord>>;
    /**
     * Get specific record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @returns {Promise<AirtableRecord>}
     */
    getRecord(baseId: string, tableId: string, recordId: string): Promise<AirtableRecord>;
    /**
     * Create record with validation
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Record<string, any>} fields - Record fields
     * @returns {Promise<AirtableRecord>}
     */
    createRecord(baseId: string, tableId: string, fields: Record<string, any>): Promise<AirtableRecord>;
    /**
     * Update record with validation
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @param {Record<string, any>} fields - Updated fields
     * @returns {Promise<AirtableRecord>}
     */
    updateRecord(baseId: string, tableId: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord>;
    /**
     * Delete record
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {string} recordId - Record ID
     * @returns {Promise<{deleted: boolean, id: string}>}
     */
    deleteRecord(baseId: string, tableId: string, recordId: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    /**
     * Create multiple records with batching
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Array<{fields: Record<string, any>}>} records - Array of record objects
     * @returns {Promise<BatchResult>}
     */
    createMultipleRecords(baseId: string, tableId: string, records: Array<{
        fields: Record<string, any>;
    }>): Promise<BatchResult>;
    /**
     * Batch create records (internal method)
     * @param {string} baseId - Base ID
     * @param {string} tableId - Table ID
     * @param {Array<{fields: Record<string, any>}>} records - Array of record objects
     * @returns {Promise<BatchResult>}
     */
    batchCreateRecords(baseId: string, tableId: string, records: Array<{
        fields: Record<string, any>;
    }>): Promise<BatchResult>;
    /**
     * Get service statistics
     * @returns {{schemaCacheSize: number, config: {useOptimization: boolean, useSimplification: boolean, timeout: number}}}
     */
    getStatistics(): {
        schemaCacheSize: number;
        config: {
            useOptimization: boolean;
            useSimplification: boolean;
            timeout: number;
        };
    };
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Health check
     * @returns {Promise<{status: string, apiConnectivity: boolean, responseTime?: number, error?: string, timestamp: string}>}
     */
    healthCheck(): Promise<{
        status: string;
        apiConnectivity: boolean;
        responseTime?: number;
        error?: string;
        timestamp: string;
    }>;
}
export type ServiceConfig = {
    /**
     * - API key for Airtable
     */
    airtableApiKey: string;
    /**
     * - Request timeout in milliseconds
     */
    timeout?: number | undefined;
    /**
     * - Number of retry attempts
     */
    retryAttempts?: number | undefined;
    /**
     * - Enable response optimization
     */
    useOptimization?: boolean | undefined;
    /**
     * - Enable response simplification
     */
    useSimplification?: boolean | undefined;
};
export type AirtableRecord = import("../api/common.js").AirtableRecord;
export type AirtableBase = import("../api/common.js").AirtableBase;
export type AirtableField = import("../api/common.js").AirtableField;
export type AirtableTable = import("../api/common.js").AirtableTable;
export type SortItem = {
    /**
     * - Field name to sort by
     */
    field: string;
    /**
     * - Sort direction
     */
    direction?: "asc" | "desc" | undefined;
};
export type QueryOptions = {
    /**
     * - Maximum number of records to return
     */
    maxRecords?: number | undefined;
    /**
     * - Fields to include
     */
    fields?: string[] | undefined;
    /**
     * - Formula to filter records
     */
    filterByFormula?: string | undefined;
    /**
     * - Sort configuration
     */
    sort?: SortItem[] | undefined;
    /**
     * - View ID or name
     */
    view?: string | undefined;
    /**
     * - Pagination offset
     */
    offset?: string | undefined;
};
export type SchemaCache = {
    /**
     * - Cached schema data
     */
    data: {
        tables: Array<AirtableTable>;
    };
    /**
     * - Cache timestamp
     */
    timestamp: number;
};
export type BatchResult = {
    /**
     * - Created records
     */
    records: Array<AirtableRecord>;
    /**
     * - Batch errors if any
     */
    errors?: Object[] | undefined;
};
//# sourceMappingURL=airtableService.d.ts.map