/**
 * Format cells in a range
 * @param {Object} params - Format parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellFormat} params.format - Formatting options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Format result
 */
export function formatCells(params: {
    spreadsheetId: string;
    range: string;
    format: import("../../types/index.js").CellFormat;
}, bearerToken: string): Promise<Record<string, any>>;
/**
 * Batch update a spreadsheet
 * @param {Object} params - Batch update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {import('../../types/index.js').Request[]} params.requests - Array of update requests
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Batch update result
 */
export function batchUpdate(params: {
    spreadsheetId: string;
    requests: import("../../types/index.js").Request[];
}, bearerToken: string): Promise<Record<string, any>>;
//# sourceMappingURL=formattingOperations.d.ts.map