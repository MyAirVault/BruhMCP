/**
 * Validate Airtable ID
 * @param {string} id - ID to validate
 * @param {string} type - Type of ID (base, table, record, etc.)
 * @returns {boolean}
 */
export function validateAirtableId(id: string, type: string): boolean;
/**
 * Validate API token
 * @param {string} token - Token to validate
 * @returns {boolean}
 */
export function validateApiToken(token: string): boolean;
/**
 * Validate field name
 * @param {string} fieldName - Field name to validate
 * @returns {boolean}
 */
export function validateFieldName(fieldName: string): boolean;
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
export function validateFieldValue(value: string | number | boolean | Collaborator | Collaborator[] | Attachment[] | Barcode | string[] | null | undefined, fieldType: string, fieldOptions?: FieldOptions): boolean;
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
export function validateRecordFields(fields: Record<string, string | number | boolean | string[] | Collaborator | Collaborator[] | Attachment[] | Barcode>, schema?: TableSchema): boolean;
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
export function validateQueryParams(params: QueryParams): boolean;
/**
 * @typedef {Object} RecordData
 * @property {Record<string, string | number | boolean | string[] | Collaborator | Collaborator[] | Attachment[] | Barcode>} fields - Record fields
 *
 * Validate batch records
 * @param {RecordData[]} records - Array of records
 * @param {TableSchema} schema - Table schema
 * @returns {boolean}
 */
export function validateBatchRecords(records: RecordData[], schema?: TableSchema): boolean;
/**
 * Validate URL parameters
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export function validateUrl(url: string): boolean;
/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function validateEmail(email: string): boolean;
/**
 * Sanitize and validate input
 * @param {string} input - Input to validate
 * @param {string} type - Type of input ('baseId' | 'tableId' | 'recordId' | 'apiToken' | 'email' | 'url' | 'fieldName')
 * @returns {string}
 */
export function sanitizeAndValidate(input: string, type: string): string;
/**
 * Get validation error message
 * @param {Error} error - Validation error
 * @returns {string}
 */
export function getValidationErrorMessage(error: Error): string;
/**
 * Create validation error
 * @param {string} message - Error message
 * @param {Record<string, string | number | boolean>} details - Error details
 * @returns {Error}
 */
export function createValidationError(message: string, details?: Record<string, string | number | boolean>): Error;
export type Collaborator = {
    /**
     * - Collaborator email
     */
    email: string;
};
export type Attachment = {
    /**
     * - Attachment URL
     */
    url: string;
};
export type Barcode = {
    /**
     * - Barcode text
     */
    text: string;
};
export type FieldOptions = {
    /**
     * - Available choices for select fields
     *
     * Validate field value based on field type
     */
    choices?: string[] | undefined;
};
export type FieldSchema = {
    /**
     * - Field name
     */
    name: string;
    /**
     * - Field type
     */
    type: string;
    /**
     * - Field options
     */
    options?: {
        /**
         * - Available choices for select fields
         */
        choices?: string[] | undefined;
    } | undefined;
};
export type TableSchema = {
    /**
     * - Schema fields array
     *
     * Validate record fields
     */
    fields?: FieldSchema[] | undefined;
};
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
export type QueryParams = {
    /**
     * - Maximum number of records
     */
    maxRecords?: number | undefined;
    /**
     * - Fields to include
     */
    fields?: string[] | undefined;
    /**
     * - Sort configuration
     */
    sort?: SortItem[] | undefined;
    /**
     * - View name
     */
    view?: string | undefined;
    /**
     * - Filter formula
     *
     * Validate query parameters
     */
    filterByFormula?: string | undefined;
};
export type RecordData = {
    /**
     * - Record fields
     *
     * Validate batch records
     */
    fields: Record<string, string | number | boolean | string[] | Collaborator | Collaborator[] | Attachment[] | Barcode>;
};
//# sourceMappingURL=validation.d.ts.map