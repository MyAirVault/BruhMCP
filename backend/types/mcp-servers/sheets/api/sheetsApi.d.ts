/**
 * Google Sheets API Client
 */
export class SheetsApi {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     */
    constructor(bearerToken: string);
    bearerToken: string;
    /**
     * Create a new spreadsheet
     * @param {string} title - Spreadsheet title
     * @param {string[]} sheetNames - Names of initial sheets
     * @returns {Promise<Object>} Created spreadsheet info
     */
    createSpreadsheet(title: string, sheetNames?: string[]): Promise<Object>;
    /**
     * Get spreadsheet metadata
     * @param {string} spreadsheetId - Spreadsheet ID
     * @returns {Promise<Object>} Spreadsheet metadata
     */
    getSpreadsheet(spreadsheetId: string): Promise<Object>;
    /**
     * Read values from a range
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - A1 notation range
     * @param {Object} options - Read options
     * @returns {Promise<Object>} Range values
     */
    readRange(spreadsheetId: string, range: string, options?: Object): Promise<Object>;
    /**
     * Write values to a range
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - A1 notation range
     * @param {Array<Array>} values - 2D array of values
     * @param {Object} options - Write options
     * @returns {Promise<Object>} Update result
     */
    writeRange(spreadsheetId: string, range: string, values: Array<any[]>, options?: Object): Promise<Object>;
    /**
     * Append values to a sheet
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - A1 notation range
     * @param {Array<Array>} values - 2D array of values
     * @param {Object} options - Append options
     * @returns {Promise<Object>} Append result
     */
    appendValues(spreadsheetId: string, range: string, values: Array<any[]>, options?: Object): Promise<Object>;
    /**
     * Clear values from a range
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} range - A1 notation range
     * @returns {Promise<Object>} Clear result
     */
    clearRange(spreadsheetId: string, range: string): Promise<Object>;
    /**
     * Perform batch update
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {Array<Object>} requests - Array of update requests
     * @returns {Promise<Object>} Batch update result
     */
    batchUpdate(spreadsheetId: string, requests: Array<Object>): Promise<Object>;
    /**
     * Add a new sheet to the spreadsheet
     * @param {string} spreadsheetId - Spreadsheet ID
     * @param {string} sheetName - Name for the new sheet
     * @param {number} [index] - Position to insert the sheet
     * @returns {Promise<Object>} Add sheet result
     */
    addSheet(spreadsheetId: string, sheetName: string, index?: number): Promise<Object>;
}
//# sourceMappingURL=sheetsApi.d.ts.map