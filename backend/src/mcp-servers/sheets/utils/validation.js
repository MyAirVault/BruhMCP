/**
 * @fileoverview Input validation for Google Sheets operations
 * Provides validation functions for API parameters
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Parameters for creating a spreadsheet
 * @typedef {Object} CreateSpreadsheetParams
 * @property {string} title - Title of the spreadsheet
 * @property {Object} [properties] - Additional properties
 */

/**
 * Parameters for getting a spreadsheet
 * @typedef {Object} GetSpreadsheetParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string[]} [fields] - Fields to include
 */

/**
 * Parameters for listing spreadsheets
 * @typedef {Object} ListSpreadsheetsParams
 * @property {number} [pageSize] - Number of results per page (1-1000)
 * @property {string} [pageToken] - Token for pagination
 */

/**
 * Parameters for getting cells
 * @typedef {Object} GetCellsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} range - Range in A1 notation
 * @property {string} [valueRenderOption] - How values should be rendered
 */

/**
 * Parameters for updating cells
 * @typedef {Object} UpdateCellsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} range - Range in A1 notation
 * @property {Array<Array<string|number>>} values - 2D array of values
 * @property {string} [valueInputOption] - How values should be interpreted
 */

/**
 * Parameters for appending values
 * @typedef {Object} AppendValuesParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} range - Range in A1 notation
 * @property {Array<Array<string|number>>} values - 2D array of values
 * @property {string} [valueInputOption] - How values should be interpreted
 */

/**
 * Parameters for clearing cells
 * @typedef {Object} ClearCellsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} range - Range in A1 notation
 */

/**
 * Parameters for adding a worksheet
 * @typedef {Object} AddWorksheetParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} title - Title of the new worksheet
 * @property {number} [index] - Position of the worksheet
 */

/**
 * Parameters for deleting a worksheet
 * @typedef {Object} DeleteWorksheetParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {number} sheetId - ID of the sheet to delete
 */

/**
 * Parameters for formatting cells
 * @typedef {Object} FormatCellsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string} range - Range in A1 notation
 * @property {Object} format - Format properties
 */

/**
 * Parameters for batch update
 * @typedef {Object} BatchUpdateParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {Array<Object>} requests - Array of request objects
 */

/**
 * Parameters for copying a sheet
 * @typedef {Object} CopySheetParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {number} sheetId - ID of the sheet to copy
 * @property {string} [destinationSpreadsheetId] - ID of destination spreadsheet
 */

/**
 * Parameters for inserting rows
 * @typedef {Object} InsertRowsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {number} sheetId - ID of the sheet
 * @property {number} startIndex - Start index for insertion
 * @property {number} endIndex - End index for insertion
 */

/**
 * Parameters for deleting rows
 * @typedef {Object} DeleteRowsParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {number} sheetId - ID of the sheet
 * @property {number} startIndex - Start index for deletion
 * @property {number} endIndex - End index for deletion
 */

/**
 * Parameters for getting sheet metadata
 * @typedef {Object} GetSheetMetadataParams
 * @property {string} spreadsheetId - ID of the spreadsheet
 * @property {string[]} [fields] - Fields to include
 */

/**
 * Validation functions for Google Sheets inputs
 */
export const validateSheetsInput = {
	/**
	 * Validate create spreadsheet parameters
	 * @param {CreateSpreadsheetParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	createSpreadsheet(params) {
		if (!params.title) {
			return { valid: false, error: 'Title is required' };
		}
		return { valid: true };
	},

	/**
	 * Validate get spreadsheet parameters
	 * @param {GetSpreadsheetParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	getSpreadsheet(params) {
		if (!params.spreadsheetId) {
			return { valid: false, error: 'Spreadsheet ID is required' };
		}
		return { valid: true };
	},

	/**
	 * Validate list spreadsheets parameters
	 * @param {ListSpreadsheetsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	listSpreadsheets(params) {
		if (params.pageSize && (params.pageSize < 1 || params.pageSize > 1000)) {
			return { valid: false, error: 'Page size must be between 1 and 1000' };
		}
		return { valid: true };
	},

	/**
	 * Validate get cells parameters
	 * @param {GetCellsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	getCells(params) {
		if (!params.spreadsheetId || !params.range) {
			return { valid: false, error: 'Spreadsheet ID and range are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate update cells parameters
	 * @param {UpdateCellsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	updateCells(params) {
		if (!params.spreadsheetId || !params.range || !params.values) {
			return { valid: false, error: 'Spreadsheet ID, range, and values are required' };
		}
		if (!Array.isArray(params.values)) {
			return { valid: false, error: 'Values must be a 2D array' };
		}
		return { valid: true };
	},

	/**
	 * Validate append values parameters
	 * @param {AppendValuesParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	appendValues(params) {
		if (!params.spreadsheetId || !params.range || !params.values) {
			return { valid: false, error: 'Spreadsheet ID, range, and values are required' };
		}
		if (!Array.isArray(params.values)) {
			return { valid: false, error: 'Values must be a 2D array' };
		}
		return { valid: true };
	},

	/**
	 * Validate clear cells parameters
	 * @param {ClearCellsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	clearCells(params) {
		if (!params.spreadsheetId || !params.range) {
			return { valid: false, error: 'Spreadsheet ID and range are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate add worksheet parameters
	 * @param {AddWorksheetParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	addWorksheet(params) {
		if (!params.spreadsheetId || !params.title) {
			return { valid: false, error: 'Spreadsheet ID and title are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate delete worksheet parameters
	 * @param {DeleteWorksheetParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	deleteWorksheet(params) {
		if (!params.spreadsheetId || params.sheetId === undefined) {
			return { valid: false, error: 'Spreadsheet ID and sheet ID are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate format cells parameters
	 * @param {FormatCellsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	formatCells(params) {
		if (!params.spreadsheetId || !params.range || !params.format) {
			return { valid: false, error: 'Spreadsheet ID, range, and format are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate batch update parameters
	 * @param {BatchUpdateParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	batchUpdate(params) {
		if (!params.spreadsheetId || !params.requests) {
			return { valid: false, error: 'Spreadsheet ID and requests are required' };
		}
		if (!Array.isArray(params.requests)) {
			return { valid: false, error: 'Requests must be an array' };
		}
		return { valid: true };
	},

	/**
	 * Validate copy sheet parameters
	 * @param {CopySheetParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	copySheet(params) {
		if (!params.spreadsheetId || params.sheetId === undefined) {
			return { valid: false, error: 'Spreadsheet ID and sheet ID are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate insert rows parameters
	 * @param {InsertRowsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	insertRows(params) {
		if (!params.spreadsheetId || params.sheetId === undefined || 
			params.startIndex === undefined || params.endIndex === undefined) {
			return { valid: false, error: 'Spreadsheet ID, sheet ID, start index, and end index are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate delete rows parameters
	 * @param {DeleteRowsParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	deleteRows(params) {
		if (!params.spreadsheetId || params.sheetId === undefined || 
			params.startIndex === undefined || params.endIndex === undefined) {
			return { valid: false, error: 'Spreadsheet ID, sheet ID, start index, and end index are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate get sheet metadata parameters
	 * @param {GetSheetMetadataParams} params - Parameters to validate
	 * @returns {ValidationResult} Validation result
	 */
	getSheetMetadata(params) {
		if (!params.spreadsheetId) {
			return { valid: false, error: 'Spreadsheet ID is required' };
		}
		return { valid: true };
	}
};