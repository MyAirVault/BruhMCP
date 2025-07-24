/**
 * Get cell values from a range
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Cell values
 */
export function getCells(params: {
    spreadsheetId: string;
    range: string;
    valueRenderOption: string;
}, bearerToken: string): Promise<Object>;
/**
 * Update cell values in a range
 * @param {Object} params - Update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Update result
 */
export function updateCells(params: {
    spreadsheetId: string;
    range: string;
    values: any[];
    valueInputOption: string;
}, bearerToken: string): Promise<Object>;
/**
 * Append values to a range
 * @param {Object} params - Append parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Append result
 */
export function appendValues(params: {
    spreadsheetId: string;
    range: string;
    values: any[];
    valueInputOption: string;
}, bearerToken: string): Promise<Object>;
/**
 * Clear cell values in a range
 * @param {Object} params - Clear parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Clear result
 */
export function clearCells(params: {
    spreadsheetId: string;
    range: string;
}, bearerToken: string): Promise<Object>;
//# sourceMappingURL=cellOperations.d.ts.map