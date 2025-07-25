export namespace formatSheetsResponse {
    /**
     * Format spreadsheet response
     * @param {SpreadsheetResponse} response - Spreadsheet response
     * @returns {{spreadsheetId: string, spreadsheetUrl: string, title: string, sheets: Array<{sheetId: number, title: string, index: number, rowCount: number, columnCount: number}>, namedRanges: Object[], developerMetadata: Object[]}} Formatted spreadsheet
     */
    function spreadsheet(response: SpreadsheetResponse): {
        spreadsheetId: string;
        spreadsheetUrl: string;
        title: string;
        sheets: Array<{
            sheetId: number;
            title: string;
            index: number;
            rowCount: number;
            columnCount: number;
        }>;
        namedRanges: Object[];
        developerMetadata: Object[];
    };
    /**
     * Format values response
     * @param {ValuesResponse} response - Values response
     * @returns {{range: string, majorDimension: string, values: string[][]}} Formatted values
     */
    function values(response: ValuesResponse): {
        range: string;
        majorDimension: string;
        values: string[][];
    };
    /**
     * Format update result
     * @param {UpdateResult} response - Update result response
     * @returns {{spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}} Formatted update result
     */
    function updateResult(response: UpdateResult): {
        spreadsheetId: string;
        updatedRange: string;
        updatedRows: number;
        updatedColumns: number;
        updatedCells: number;
    };
    /**
     * Format append result
     * @param {AppendResult} response - Append result response
     * @returns {{spreadsheetId: string, tableRange: string, updates: {spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}}} Formatted append result
     */
    function appendResult(response: AppendResult): {
        spreadsheetId: string;
        tableRange: string;
        updates: {
            spreadsheetId: string;
            updatedRange: string;
            updatedRows: number;
            updatedColumns: number;
            updatedCells: number;
        };
    };
    /**
     * Format clear result
     * @param {ClearResult} response - Clear result response
     * @returns {{spreadsheetId: string, clearedRange: string}} Formatted clear result
     */
    function clearResult(response: ClearResult): {
        spreadsheetId: string;
        clearedRange: string;
    };
    /**
     * Format batch update result
     * @param {BatchUpdateResult} response - Batch update result response
     * @returns {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} Formatted batch update result
     */
    function batchUpdateResult(response: BatchUpdateResult): {
        spreadsheetId: string;
        replies: Object[];
        updatedSpreadsheet: Object;
    };
    /**
     * Format files list response
     * @param {FilesListResponse} response - Files list response
     * @returns {{files: Array<{id: string, name: string, createdTime: string, modifiedTime: string, webViewLink: string}>, nextPageToken: string}} Formatted files list
     */
    function filesList(response: FilesListResponse): {
        files: Array<{
            id: string;
            name: string;
            createdTime: string;
            modifiedTime: string;
            webViewLink: string;
        }>;
        nextPageToken: string;
    };
    /**
     * Format copy result
     * @param {CopyResult} response - Copy result response
     * @returns {{sheetId: number, sheetType: string, title: string}} Formatted copy result
     */
    function copyResult(response: CopyResult): {
        sheetId: number;
        sheetType: string;
        title: string;
    };
    /**
     * Format metadata response
     * @param {SpreadsheetResponse} response - Spreadsheet metadata response
     * @returns {{spreadsheetId: string, title: string, locale: string, autoRecalc: string, timeZone: string, defaultFormat: Object, sheets: Array<{sheetId: number, title: string, index: number, sheetType: string, gridProperties: GridProperties}>}} Formatted metadata
     */
    function metadata(response: SpreadsheetResponse): {
        spreadsheetId: string;
        title: string;
        locale: string;
        autoRecalc: string;
        timeZone: string;
        defaultFormat: Object;
        sheets: Array<{
            sheetId: number;
            title: string;
            index: number;
            sheetType: string;
            gridProperties: GridProperties;
        }>;
    };
}
export type SpreadsheetProperties = {
    /**
     * - Spreadsheet title
     */
    title: string;
    /**
     * - Spreadsheet locale
     */
    locale: string;
    /**
     * - Auto recalculation setting
     */
    autoRecalc: string;
    /**
     * - Time zone
     */
    timeZone: string;
    /**
     * - Default format
     */
    defaultFormat: Object;
};
export type GridProperties = {
    /**
     * - Number of rows
     */
    rowCount: number;
    /**
     * - Number of columns
     */
    columnCount: number;
};
export type SheetProperties = {
    /**
     * - Sheet ID
     */
    sheetId: number;
    /**
     * - Sheet title
     */
    title: string;
    /**
     * - Sheet index
     */
    index: number;
    /**
     * - Sheet type
     */
    sheetType: string;
    /**
     * - Grid properties
     */
    gridProperties: GridProperties;
};
export type Sheet = {
    /**
     * - Sheet properties
     */
    properties: SheetProperties;
};
export type SpreadsheetResponse = {
    /**
     * - Spreadsheet ID
     */
    spreadsheetId: string;
    /**
     * - Spreadsheet URL
     */
    spreadsheetUrl: string;
    /**
     * - Spreadsheet properties
     */
    properties: SpreadsheetProperties;
    /**
     * - Array of sheets
     */
    sheets: Sheet[];
    /**
     * - Named ranges
     */
    namedRanges: Object[];
    /**
     * - Developer metadata
     */
    developerMetadata: Object[];
};
export type ValuesResponse = {
    /**
     * - Range
     */
    range: string;
    /**
     * - Major dimension
     */
    majorDimension: string;
    /**
     * - Values array
     */
    values: string[][];
};
export type UpdateResult = {
    /**
     * - Spreadsheet ID
     */
    spreadsheetId: string;
    /**
     * - Updated range
     */
    updatedRange: string;
    /**
     * - Number of updated rows
     */
    updatedRows: number;
    /**
     * - Number of updated columns
     */
    updatedColumns: number;
    /**
     * - Number of updated cells
     */
    updatedCells: number;
};
export type AppendResult = {
    /**
     * - Spreadsheet ID
     */
    spreadsheetId: string;
    /**
     * - Table range
     */
    tableRange: string;
    /**
     * - Update result
     */
    updates: UpdateResult;
};
export type ClearResult = {
    /**
     * - Spreadsheet ID
     */
    spreadsheetId: string;
    /**
     * - Cleared range
     */
    clearedRange: string;
};
export type BatchUpdateResult = {
    /**
     * - Spreadsheet ID
     */
    spreadsheetId: string;
    /**
     * - Batch update replies
     */
    replies: Object[];
    /**
     * - Updated spreadsheet
     */
    updatedSpreadsheet: Object;
};
export type DriveFile = {
    /**
     * - File ID
     */
    id: string;
    /**
     * - File name
     */
    name: string;
    /**
     * - Creation time
     */
    createdTime: string;
    /**
     * - Modification time
     */
    modifiedTime: string;
    /**
     * - Web view link
     */
    webViewLink: string;
};
export type FilesListResponse = {
    /**
     * - Array of files
     */
    files: DriveFile[];
    /**
     * - Next page token
     */
    nextPageToken: string;
};
export type CopyResult = {
    /**
     * - Sheet ID
     */
    sheetId: number;
    /**
     * - Sheet type
     */
    sheetType: string;
    /**
     * - Sheet title
     */
    title: string;
};
//# sourceMappingURL=sheetsFormatting.d.ts.map