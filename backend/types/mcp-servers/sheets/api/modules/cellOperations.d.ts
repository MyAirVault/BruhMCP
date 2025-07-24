/**
 * Get cell values from a range
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').GetCellsResponse>} Cell values
 */
export function getCells(params: {
    spreadsheetId: string;
    range: string;
    valueRenderOption: string;
}, bearerToken: string): Promise<import("../../types/index.js").GetCellsResponse>;
/**
 * Update cell values in a range
 * @param {Object} params - Update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellGrid} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').UpdateCellsResponse>} Update result
 */
export function updateCells(params: {
    spreadsheetId: string;
    range: string;
    values: import("../../types/index.js").CellGrid;
    valueInputOption: string;
}, bearerToken: string): Promise<import("../../types/index.js").UpdateCellsResponse>;
/**
 * Append values to a range
 * @param {Object} params - Append parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellGrid} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Append result
 */
export function appendValues(params: {
    spreadsheetId: string;
    range: string;
    values: import("../../types/index.js").CellGrid;
    valueInputOption: string;
}, bearerToken: string): Promise<Record<string, any>>;
/**
 * Clear cell values in a range
 * @param {Object} params - Clear parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Clear result
 */
export function clearCells(params: {
    spreadsheetId: string;
    range: string;
}, bearerToken: string): Promise<Record<string, any>>;
//# sourceMappingURL=cellOperations.d.ts.map