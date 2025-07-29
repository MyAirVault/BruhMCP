/**
 * Validation result structure
 */
export type ValidationResult = {
    /**
     * - Whether the validation passed
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
};
/**
 * Parameters for creating a spreadsheet
 */
export type CreateSpreadsheetParams = {
    /**
     * - Title of the spreadsheet
     */
    title: string;
    /**
     * - Additional properties
     */
    properties?: Object | undefined;
};
/**
 * Parameters for getting a spreadsheet
 */
export type GetSpreadsheetParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Fields to include
     */
    fields?: string[] | undefined;
};
/**
 * Parameters for listing spreadsheets
 */
export type ListSpreadsheetsParams = {
    /**
     * - Number of results per page (1-1000)
     */
    pageSize?: number | undefined;
    /**
     * - Token for pagination
     */
    pageToken?: string | undefined;
};
/**
 * Parameters for getting cells
 */
export type GetCellsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range in A1 notation
     */
    range: string;
    /**
     * - How values should be rendered
     */
    valueRenderOption?: string | undefined;
};
/**
 * Parameters for updating cells
 */
export type UpdateCellsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range in A1 notation
     */
    range: string;
    /**
     * - 2D array of values
     */
    values: Array<Array<string | number>>;
    /**
     * - How values should be interpreted
     */
    valueInputOption?: string | undefined;
};
/**
 * Parameters for appending values
 */
export type AppendValuesParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range in A1 notation
     */
    range: string;
    /**
     * - 2D array of values
     */
    values: Array<Array<string | number>>;
    /**
     * - How values should be interpreted
     */
    valueInputOption?: string | undefined;
};
/**
 * Parameters for clearing cells
 */
export type ClearCellsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range in A1 notation
     */
    range: string;
};
/**
 * Parameters for adding a worksheet
 */
export type AddWorksheetParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Title of the new worksheet
     */
    title: string;
    /**
     * - Position of the worksheet
     */
    index?: number | undefined;
};
/**
 * Parameters for deleting a worksheet
 */
export type DeleteWorksheetParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - ID of the sheet to delete
     */
    sheetId: number;
};
/**
 * Parameters for formatting cells
 */
export type FormatCellsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range in A1 notation
     */
    range: string;
    /**
     * - Format properties
     */
    format: Object;
};
/**
 * Parameters for batch update
 */
export type BatchUpdateParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Array of request objects
     */
    requests: Array<Object>;
};
/**
 * Parameters for copying a sheet
 */
export type CopySheetParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - ID of the sheet to copy
     */
    sheetId: number;
    /**
     * - ID of destination spreadsheet
     */
    destinationSpreadsheetId?: string | undefined;
};
/**
 * Parameters for inserting rows
 */
export type InsertRowsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - ID of the sheet
     */
    sheetId: number;
    /**
     * - Start index for insertion
     */
    startIndex: number;
    /**
     * - End index for insertion
     */
    endIndex: number;
};
/**
 * Parameters for deleting rows
 */
export type DeleteRowsParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - ID of the sheet
     */
    sheetId: number;
    /**
     * - Start index for deletion
     */
    startIndex: number;
    /**
     * - End index for deletion
     */
    endIndex: number;
};
/**
 * Parameters for getting sheet metadata
 */
export type GetSheetMetadataParams = {
    /**
     * - ID of the spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Fields to include
     */
    fields?: string[] | undefined;
};
export namespace validateSheetsInput {
    /**
     * Validate create spreadsheet parameters
     * @param {CreateSpreadsheetParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function createSpreadsheet(params: CreateSpreadsheetParams): ValidationResult;
    /**
     * Validate get spreadsheet parameters
     * @param {GetSpreadsheetParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function getSpreadsheet(params: GetSpreadsheetParams): ValidationResult;
    /**
     * Validate list spreadsheets parameters
     * @param {ListSpreadsheetsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function listSpreadsheets(params: ListSpreadsheetsParams): ValidationResult;
    /**
     * Validate get cells parameters
     * @param {GetCellsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function getCells(params: GetCellsParams): ValidationResult;
    /**
     * Validate update cells parameters
     * @param {UpdateCellsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function updateCells(params: UpdateCellsParams): ValidationResult;
    /**
     * Validate append values parameters
     * @param {AppendValuesParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function appendValues(params: AppendValuesParams): ValidationResult;
    /**
     * Validate clear cells parameters
     * @param {ClearCellsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function clearCells(params: ClearCellsParams): ValidationResult;
    /**
     * Validate add worksheet parameters
     * @param {AddWorksheetParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function addWorksheet(params: AddWorksheetParams): ValidationResult;
    /**
     * Validate delete worksheet parameters
     * @param {DeleteWorksheetParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function deleteWorksheet(params: DeleteWorksheetParams): ValidationResult;
    /**
     * Validate format cells parameters
     * @param {FormatCellsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function formatCells(params: FormatCellsParams): ValidationResult;
    /**
     * Validate batch update parameters
     * @param {BatchUpdateParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function batchUpdate(params: BatchUpdateParams): ValidationResult;
    /**
     * Validate copy sheet parameters
     * @param {CopySheetParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function copySheet(params: CopySheetParams): ValidationResult;
    /**
     * Validate insert rows parameters
     * @param {InsertRowsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function insertRows(params: InsertRowsParams): ValidationResult;
    /**
     * Validate delete rows parameters
     * @param {DeleteRowsParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function deleteRows(params: DeleteRowsParams): ValidationResult;
    /**
     * Validate get sheet metadata parameters
     * @param {GetSheetMetadataParams} params - Parameters to validate
     * @returns {ValidationResult} Validation result
     */
    function getSheetMetadata(params: GetSheetMetadataParams): ValidationResult;
}
//# sourceMappingURL=validation.d.ts.map