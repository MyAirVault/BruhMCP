/**
 * Add a new worksheet to a spreadsheet
 * @param {Object} params - Add parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.title - Worksheet title
 * @param {number} params.rows - Number of rows
 * @param {number} params.cols - Number of columns
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Created worksheet details
 */
export function addWorksheet(params: {
    spreadsheetId: string;
    title: string;
    rows: number;
    cols: number;
}, bearerToken: string): Promise<Object>;
/**
 * Delete a worksheet from a spreadsheet
 * @param {Object} params - Delete parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to delete
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Delete result
 */
export function deleteWorksheet(params: {
    spreadsheetId: string;
    sheetId: number;
}, bearerToken: string): Promise<Object>;
/**
 * Copy a worksheet
 * @param {Object} params - Copy parameters
 * @param {string} params.spreadsheetId - Source spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to copy
 * @param {string} params.destinationSpreadsheetId - Destination spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Copy result
 */
export function copySheet(params: {
    spreadsheetId: string;
    sheetId: number;
    destinationSpreadsheetId: string;
}, bearerToken: string): Promise<Object>;
/**
 * Insert rows into a worksheet
 * @param {Object} params - Insert parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Insert result
 */
export function insertRows(params: {
    spreadsheetId: string;
    sheetId: number;
    startIndex: number;
    endIndex: number;
}, bearerToken: string): Promise<Object>;
/**
 * Delete rows from a worksheet
 * @param {Object} params - Delete parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Delete result
 */
export function deleteRows(params: {
    spreadsheetId: string;
    sheetId: number;
    startIndex: number;
    endIndex: number;
}, bearerToken: string): Promise<Object>;
//# sourceMappingURL=worksheetOperations.d.ts.map