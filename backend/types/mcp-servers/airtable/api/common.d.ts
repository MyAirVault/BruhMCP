/**
 * @typedef {Object} AirtableRecord
 * @property {string} id - Record ID
 * @property {string} createdTime - Record creation timestamp
 * @property {Object} fields - Record fields
 */
/**
 * @typedef {Object} AirtableBase
 * @property {string} id - Base ID
 * @property {string} name - Base name
 * @property {string} permissionLevel - Permission level
 */
/**
 * @typedef {Object} AirtableField
 * @property {string} id - Field ID
 * @property {string} name - Field name
 * @property {string} type - Field type
 * @property {Object} [options] - Field options
 */
/**
 * @typedef {Object} AirtableView
 * @property {string} id - View ID
 * @property {string} name - View name
 * @property {string} type - View type
 */
/**
 * @typedef {Object} AirtableTable
 * @property {string} id - Table ID
 * @property {string} name - Table name
 * @property {string} primaryFieldId - Primary field ID
 * @property {AirtableField[]} fields - Table fields
 * @property {AirtableView[]} views - Table views
 */
/**
 * Handle common API response errors
 * @param {import('node-fetch').Response} response - Fetch response object
 * @param {string} context - Context for error message
 * @returns {Promise<void>}
 * @throws {Error} When API response indicates an error
 */
export function handleApiError(response: import("node-fetch").Response, context: string): Promise<void>;
/**
 * @typedef {Object} RequestOptions
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {string} [method] - HTTP method
 * @property {string} [body] - Request body
 */
/**
 * Make authenticated request to Airtable API
 * @param {string} endpoint - API endpoint
 * @param {string} apiKey - User's Airtable API key
 * @param {RequestOptions} [options] - Fetch options
 * @returns {Promise<import('node-fetch').Response>}
 */
export function makeAuthenticatedRequest(endpoint: string, apiKey: string, options?: RequestOptions): Promise<import("node-fetch").Response>;
/**
 * Build query parameters for Airtable API requests
 * @param {Record<string, string | number | boolean | string[] | undefined | null>} params - Query parameters
 * @returns {URLSearchParams}
 */
export function buildQueryParams(params: Record<string, string | number | boolean | string[] | undefined | null>): URLSearchParams;
/**
 * Validate Airtable ID format
 * @param {string} id - ID to validate
 * @param {string} type - Type of ID (base, table, record, etc.)
 * @throws {Error} If ID format is invalid
 */
export function validateAirtableId(id: string, type: string): void;
/**
 * Sanitize input for API requests
 * @param {string | number | boolean | Object | null | undefined} input - Input to sanitize
 * @returns {string | number | boolean | Object | null | undefined} Sanitized input
 */
export function sanitizeInput(input: string | number | boolean | Object | null | undefined): string | number | boolean | Object | null | undefined;
/**
 * @typedef {Object} ApiResponseMeta
 * @property {string} operation - Operation type
 * @property {string} timestamp - ISO timestamp
 * @property {string} source - Source identifier
 */
/**
 * Format Airtable API response for consistency
 * @param {Object | string | number | boolean | null} data - Response data
 * @param {string} operation - Operation type
 * @returns {Object | string | number | boolean | null} Formatted response
 */
export function formatApiResponse(data: Object | string | number | boolean | null, operation: string): Object | string | number | boolean | null;
export const AIRTABLE_BASE_URL: "https://api.airtable.com/v0";
export type AirtableRecord = {
    /**
     * - Record ID
     */
    id: string;
    /**
     * - Record creation timestamp
     */
    createdTime: string;
    /**
     * - Record fields
     */
    fields: Object;
};
export type AirtableBase = {
    /**
     * - Base ID
     */
    id: string;
    /**
     * - Base name
     */
    name: string;
    /**
     * - Permission level
     */
    permissionLevel: string;
};
export type AirtableField = {
    /**
     * - Field ID
     */
    id: string;
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
    options?: Object | undefined;
};
export type AirtableView = {
    /**
     * - View ID
     */
    id: string;
    /**
     * - View name
     */
    name: string;
    /**
     * - View type
     */
    type: string;
};
export type AirtableTable = {
    /**
     * - Table ID
     */
    id: string;
    /**
     * - Table name
     */
    name: string;
    /**
     * - Primary field ID
     */
    primaryFieldId: string;
    /**
     * - Table fields
     */
    fields: AirtableField[];
    /**
     * - Table views
     */
    views: AirtableView[];
};
export type RequestOptions = {
    /**
     * - Additional headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request body
     */
    body?: string | undefined;
};
export type ApiResponseMeta = {
    /**
     * - Operation type
     */
    operation: string;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Source identifier
     */
    source: string;
};
//# sourceMappingURL=common.d.ts.map