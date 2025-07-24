export namespace formatSheetsResponse {
    /**
     * Format spreadsheet response
     */
    function spreadsheet(response: any): {
        spreadsheetId: any;
        spreadsheetUrl: any;
        title: any;
        sheets: any;
        namedRanges: any;
        developerMetadata: any;
    };
    /**
     * Format values response
     */
    function values(response: any): {
        range: any;
        majorDimension: any;
        values: any;
    };
    /**
     * Format update result
     */
    function updateResult(response: any): {
        spreadsheetId: any;
        updatedRange: any;
        updatedRows: any;
        updatedColumns: any;
        updatedCells: any;
    };
    /**
     * Format append result
     */
    function appendResult(response: any): {
        spreadsheetId: any;
        tableRange: any;
        updates: {
            spreadsheetId: any;
            updatedRange: any;
            updatedRows: any;
            updatedColumns: any;
            updatedCells: any;
        };
    };
    /**
     * Format clear result
     */
    function clearResult(response: any): {
        spreadsheetId: any;
        clearedRange: any;
    };
    /**
     * Format batch update result
     */
    function batchUpdateResult(response: any): {
        spreadsheetId: any;
        replies: any;
        updatedSpreadsheet: any;
    };
    /**
     * Format files list response
     */
    function filesList(response: any): {
        files: any;
        nextPageToken: any;
    };
    /**
     * Format copy result
     */
    function copyResult(response: any): {
        sheetId: any;
        sheetType: any;
        title: any;
    };
    /**
     * Format metadata response
     */
    function metadata(response: any): {
        spreadsheetId: any;
        title: any;
        locale: any;
        autoRecalc: any;
        timeZone: any;
        defaultFormat: any;
        sheets: any;
    };
}
//# sourceMappingURL=sheetsFormatting.d.ts.map