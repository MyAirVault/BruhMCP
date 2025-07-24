/**
 * @typedef {Object} BasesListResponse
 * @property {import('./common.js').AirtableBase[]} bases - List of bases
 * @property {import('./common.js').ApiResponseMeta} _meta - Response metadata
 */
/**
 * List all accessible Airtable bases
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BasesListResponse>} List of bases
 */
export function listBases(apiKey: string): Promise<BasesListResponse>;
/**
 * @typedef {Object} BaseSchemaResponse
 * @property {import('./common.js').AirtableTable[]} tables - List of tables
 * @property {import('./common.js').ApiResponseMeta} _meta - Response metadata
 */
/**
 * Get base schema (tables and fields)
 * @param {string} baseId - Base ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BaseSchemaResponse>} Base schema
 */
export function getBaseSchema(baseId: string, apiKey: string): Promise<BaseSchemaResponse>;
export type BasesListResponse = {
    /**
     * - List of bases
     */
    bases: import("./common.js").AirtableBase[];
    /**
     * - Response metadata
     */
    _meta: import("./common.js").ApiResponseMeta;
};
export type BaseSchemaResponse = {
    /**
     * - List of tables
     */
    tables: import("./common.js").AirtableTable[];
    /**
     * - Response metadata
     */
    _meta: import("./common.js").ApiResponseMeta;
};
//# sourceMappingURL=bases.d.ts.map