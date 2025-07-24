/**
 * Create a new Google Sheets spreadsheet
 * @param {Object} params - Creation parameters
 * @param {string} params.title - Spreadsheet title
 * @param {Array} params.sheets - Initial sheets to create
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Created spreadsheet details
 */
export function createSpreadsheet(params: {
    title: string;
    sheets: any[];
}, bearerToken: string): Promise<Object>;
/**
 * Get spreadsheet metadata and optionally data
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {boolean} params.includeData - Include cell data
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Spreadsheet details
 */
export function getSpreadsheet(params: {
    spreadsheetId: string;
    includeData: boolean;
}, bearerToken: string): Promise<Object>;
/**
 * List user's Google Sheets spreadsheets
 * @param {Object} params - List parameters
 * @param {number} params.pageSize - Max results per page
 * @param {string} params.pageToken - Next page token
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} List of spreadsheets
 */
export function listSpreadsheets(params: {
    pageSize: number;
    pageToken: string;
}, bearerToken: string): Promise<Object>;
/**
 * Get spreadsheet metadata
 * @param {Object} params - Parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Spreadsheet metadata
 */
export function getSheetMetadata(params: {
    spreadsheetId: string;
}, bearerToken: string): Promise<Object>;
//# sourceMappingURL=spreadsheetOperations.d.ts.map