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
 * Validate field value based on field type
 * @param {any} value - Value to validate
 * @param {string} fieldType - Field type
 * @param {Object} fieldOptions - Field options
 * @returns {boolean}
 */
export function validateFieldValue(value: any, fieldType: string, fieldOptions?: Object): boolean;
/**
 * Validate record fields
 * @param {Object} fields - Record fields
 * @param {Object} schema - Table schema
 * @returns {boolean}
 */
export function validateRecordFields(fields: Object, schema?: Object): boolean;
/**
 * Validate query parameters
 * @param {Object} params - Query parameters
 * @returns {boolean}
 */
export function validateQueryParams(params: Object): boolean;
/**
 * Validate batch records
 * @param {Array} records - Array of records
 * @param {Object} schema - Table schema
 * @returns {boolean}
 */
export function validateBatchRecords(records: any[], schema?: Object): boolean;
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
 * @param {any} input - Input to validate
 * @param {string} type - Type of input
 * @returns {any}
 */
export function sanitizeAndValidate(input: any, type: string): any;
/**
 * Get validation error message
 * @param {Error} error - Validation error
 * @returns {string}
 */
export function getValidationErrorMessage(error: Error): string;
/**
 * Create validation error
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Error}
 */
export function createValidationError(message: string, details?: Object): Error;
//# sourceMappingURL=validation.d.ts.map