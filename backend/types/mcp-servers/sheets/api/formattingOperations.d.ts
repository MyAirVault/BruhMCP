/**
 * Format cells in a range
 * @param {Object} params - Format parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Object} params.format - Formatting options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Format result
 */
export function formatCells(params: {
    spreadsheetId: string;
    range: string;
    format: Object;
}, bearerToken: string): Promise<Object>;
/**
 * Batch update a spreadsheet
 * @param {Object} params - Batch update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {Array} params.requests - Array of update requests
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Batch update result
 */
export function batchUpdate(params: {
    spreadsheetId: string;
    requests: any[];
}, bearerToken: string): Promise<Object>;
//# sourceMappingURL=formattingOperations.d.ts.map