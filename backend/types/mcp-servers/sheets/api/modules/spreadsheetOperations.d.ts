/**
 * Create a new Google Sheets spreadsheet
 * @param {Object} params - Creation parameters
 * @param {string} params.title - Spreadsheet title
 * @param {Array<{title: string, rows?: number, cols?: number}>} params.sheets - Initial sheets to create
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').CreateSpreadsheetResponse>} Created spreadsheet details
 */
export function createSpreadsheet(params: {
    title: string;
    sheets: Array<{
        title: string;
        rows?: number;
        cols?: number;
    }>;
}, bearerToken: string): Promise<import("../../types/index.js").CreateSpreadsheetResponse>;
/**
 * Get spreadsheet metadata and optionally data
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {boolean} params.includeData - Include cell data
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Spreadsheet details
 */
export function getSpreadsheet(params: {
    spreadsheetId: string;
    includeData: boolean;
}, bearerToken: string): Promise<Record<string, any>>;
/**
 * List user's Google Sheets spreadsheets
 * @param {Object} params - List parameters
 * @param {number} params.pageSize - Max results per page
 * @param {string} params.pageToken - Next page token
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{files: Array<Record<string, any>>, nextPageToken?: string}>} List of spreadsheets
 */
export function listSpreadsheets(params: {
    pageSize: number;
    pageToken: string;
}, bearerToken: string): Promise<{
    files: Array<Record<string, any>>;
    nextPageToken?: string;
}>;
/**
 * Get spreadsheet metadata
 * @param {Object} params - Parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Spreadsheet metadata
 */
export function getSheetMetadata(params: {
    spreadsheetId: string;
}, bearerToken: string): Promise<Record<string, any>>;
//# sourceMappingURL=spreadsheetOperations.d.ts.map