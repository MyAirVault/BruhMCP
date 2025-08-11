export type AirtableRecord = import("./common.js").AirtableRecord;
export type ListRecordsOptions = {
    /**
     * - View name or ID
     */
    view?: string | undefined;
    /**
     * - Fields to include
     */
    fields?: string[] | undefined;
    /**
     * - Maximum number of records
     */
    maxRecords?: number | undefined;
    /**
     * - Sort options
     */
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    /**
     * - Filter formula
     */
    filterByFormula?: string | undefined;
    /**
     * - Pagination offset
     */
    offset?: string | undefined;
};
export type DeleteResponse = {
    /**
     * - Deleted record ID
     */
    id: string;
    /**
     * - Deletion status
     */
    deleted: boolean;
};
export type RecordInput = {
    /**
     * - Record fields
     */
    fields: Record<string, string | number | boolean | string[]>;
};
export type BatchCreateResponse = {
    /**
     * - Created records
     */
    records: AirtableRecord[];
};
/**
 * @typedef {import('./common.js').AirtableRecord} AirtableRecord
 */
/**
 * @typedef {Object} ListRecordsOptions
 * @property {string} [view] - View name or ID
 * @property {string[]} [fields] - Fields to include
 * @property {number} [maxRecords] - Maximum number of records
 * @property {Array<{field: string, direction: 'asc' | 'desc'}>} [sort] - Sort options
 * @property {string} [filterByFormula] - Filter formula
 * @property {string} [offset] - Pagination offset
 */
/**
 * List records from a table
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} apiKey - Airtable API key
 * @param {ListRecordsOptions} [options] - Query options
 * @returns {Promise<Object>} Records list
 */
export function listRecords(baseId: string, tableId: string, apiKey: string, options?: ListRecordsOptions): Promise<Object>;
/**
 * Get a specific record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Record data
 */
export function getRecord(baseId: string, tableId: string, recordId: string, apiKey: string): Promise<AirtableRecord>;
/**
 * Create a new record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {Record<string, string | number | boolean | string[]>} fields - Record fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Created record
 */
export function createRecord(baseId: string, tableId: string, fields: Record<string, string | number | boolean | string[]>, apiKey: string): Promise<AirtableRecord>;
/**
 * Update an existing record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {Record<string, string | number | boolean | string[]>} fields - Updated fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Updated record
 */
export function updateRecord(baseId: string, tableId: string, recordId: string, fields: Record<string, string | number | boolean | string[]>, apiKey: string): Promise<AirtableRecord>;
/**
 * @typedef {Object} DeleteResponse
 * @property {string} id - Deleted record ID
 * @property {boolean} deleted - Deletion status
 */
/**
 * Delete a record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<DeleteResponse>} Deletion confirmation
 */
export function deleteRecord(baseId: string, tableId: string, recordId: string, apiKey: string): Promise<DeleteResponse>;
/**
 * @typedef {Object} RecordInput
 * @property {Record<string, string | number | boolean | string[]>} fields - Record fields
 */
/**
 * @typedef {Object} BatchCreateResponse
 * @property {AirtableRecord[]} records - Created records
 */
/**
 * Create multiple records in batch
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {RecordInput[]} records - Array of record objects with fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BatchCreateResponse>} Created records
 */
export function createMultipleRecords(baseId: string, tableId: string, records: RecordInput[], apiKey: string): Promise<BatchCreateResponse>;
//# sourceMappingURL=records.d.ts.map