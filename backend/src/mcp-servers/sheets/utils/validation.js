/**
 * @fileoverview Input validation for Google Sheets operations
 * Provides validation functions for API parameters
 */

/**
 * Validation functions for Google Sheets inputs
 */
export const validateSheetsInput = {
	/**
	 * Validate create spreadsheet parameters
	 */
	createSpreadsheet(params) {
		if (!params.title) {
			return { valid: false, error: 'Title is required' };
		}
		return { valid: true };
	},

	/**
	 * Validate get spreadsheet parameters
	 */
	getSpreadsheet(params) {
		if (!params.spreadsheetId) {
			return { valid: false, error: 'Spreadsheet ID is required' };
		}
		return { valid: true };
	},

	/**
	 * Validate list spreadsheets parameters
	 */
	listSpreadsheets(params) {
		if (params.pageSize && (params.pageSize < 1 || params.pageSize > 1000)) {
			return { valid: false, error: 'Page size must be between 1 and 1000' };
		}
		return { valid: true };
	},

	/**
	 * Validate get cells parameters
	 */
	getCells(params) {
		if (!params.spreadsheetId || !params.range) {
			return { valid: false, error: 'Spreadsheet ID and range are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate update cells parameters
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
	 */
	clearCells(params) {
		if (!params.spreadsheetId || !params.range) {
			return { valid: false, error: 'Spreadsheet ID and range are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate add worksheet parameters
	 */
	addWorksheet(params) {
		if (!params.spreadsheetId || !params.title) {
			return { valid: false, error: 'Spreadsheet ID and title are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate delete worksheet parameters
	 */
	deleteWorksheet(params) {
		if (!params.spreadsheetId || params.sheetId === undefined) {
			return { valid: false, error: 'Spreadsheet ID and sheet ID are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate format cells parameters
	 */
	formatCells(params) {
		if (!params.spreadsheetId || !params.range || !params.format) {
			return { valid: false, error: 'Spreadsheet ID, range, and format are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate batch update parameters
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
	 */
	copySheet(params) {
		if (!params.spreadsheetId || params.sheetId === undefined) {
			return { valid: false, error: 'Spreadsheet ID and sheet ID are required' };
		}
		return { valid: true };
	},

	/**
	 * Validate insert rows parameters
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
	 */
	getSheetMetadata(params) {
		if (!params.spreadsheetId) {
			return { valid: false, error: 'Spreadsheet ID is required' };
		}
		return { valid: true };
	}
};