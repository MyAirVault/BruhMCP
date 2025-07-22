/**
 * Create a new Google Sheets spreadsheet
 * @param {Object} params - Creation parameters
 * @param {string} params.title - Spreadsheet title
 * @param {Array} params.sheets - Initial sheets configuration
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function createSpreadsheet(params: {
    title: string;
    sheets: any[];
}, bearerToken: string): Promise<string>;
/**
 * Get spreadsheet information
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {boolean} params.includeData - Include cell data
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function getSpreadsheet(params: {
    spreadsheetId: string;
    includeData: boolean;
}, bearerToken: string): Promise<string>;
/**
 * Update cells in a spreadsheet
 * @param {Object} params - Update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function updateCells(params: {
    spreadsheetId: string;
    range: string;
    values: any[];
    valueInputOption: string;
}, bearerToken: string): Promise<string>;
/**
 * Get cell values from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function getCells(params: {
    spreadsheetId: string;
    range: string;
    valueRenderOption: string;
}, bearerToken: string): Promise<string>;
/**
 * Add a new worksheet to a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.title - Worksheet title
 * @param {number} params.rows - Number of rows
 * @param {number} params.cols - Number of columns
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function addWorksheet(params: {
    spreadsheetId: string;
    title: string;
    rows: number;
    cols: number;
}, bearerToken: string): Promise<string>;
/**
 * Delete a worksheet from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to delete
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function deleteWorksheet(params: {
    spreadsheetId: string;
    sheetId: number;
}, bearerToken: string): Promise<string>;
/**
 * Append values to a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function appendValues(params: {
    spreadsheetId: string;
    range: string;
    values: any[];
    valueInputOption: string;
}, bearerToken: string): Promise<string>;
/**
 * Clear cell values in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function clearCells(params: {
    spreadsheetId: string;
    range: string;
}, bearerToken: string): Promise<string>;
/**
 * Format cells in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Object} params.format - Formatting options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function formatCells(params: {
    spreadsheetId: string;
    range: string;
    format: Object;
}, bearerToken: string): Promise<string>;
/**
 * List user's Google Sheets spreadsheets
 * @param {Object} params - Request parameters
 * @param {number} params.maxResults - Maximum results to return
 * @param {string} params.query - Search query
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function listSpreadsheets(params: {
    maxResults: number;
    query: string;
}, bearerToken: string): Promise<string>;
/**
 * Batch update operations (for complex updates)
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {Array} params.requests - Array of batch update requests
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function batchUpdate(params: {
    spreadsheetId: string;
    requests: any[];
}, bearerToken: string): Promise<string>;
/**
 * Insert rows in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function insertRows(params: {
    spreadsheetId: string;
    sheetId: number;
    startIndex: number;
    endIndex: number;
}, bearerToken: string): Promise<string>;
/**
 * Delete rows from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function deleteRows(params: {
    spreadsheetId: string;
    sheetId: number;
    startIndex: number;
    endIndex: number;
}, bearerToken: string): Promise<string>;
/**
 * Copy a sheet within or between spreadsheets
 * @param {Object} params - Request parameters
 * @param {string} params.sourceSpreadsheetId - Source spreadsheet ID
 * @param {number} params.sourceSheetId - Source sheet ID
 * @param {string} params.destinationSpreadsheetId - Destination spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function copySheet(params: {
    sourceSpreadsheetId: string;
    sourceSheetId: number;
    destinationSpreadsheetId: string;
}, bearerToken: string): Promise<string>;
/**
 * Get sheet metadata (properties, dimensions, etc.)
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
export function getSheetMetadata(params: {
    spreadsheetId: string;
}, bearerToken: string): Promise<string>;
//# sourceMappingURL=sheets-api.d.ts.map