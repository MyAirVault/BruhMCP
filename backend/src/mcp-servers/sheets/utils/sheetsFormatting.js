/**
 * @fileoverview Response formatting for Google Sheets operations
 * Formats API responses for consistent output
 */

/**
 * @typedef {Object} SpreadsheetProperties
 * @property {string} title - Spreadsheet title
 * @property {string} locale - Spreadsheet locale
 * @property {string} autoRecalc - Auto recalculation setting
 * @property {string} timeZone - Time zone
 * @property {Object} defaultFormat - Default format
 */

/**
 * @typedef {Object} GridProperties
 * @property {number} rowCount - Number of rows
 * @property {number} columnCount - Number of columns
 */

/**
 * @typedef {Object} SheetProperties
 * @property {number} sheetId - Sheet ID
 * @property {string} title - Sheet title
 * @property {number} index - Sheet index
 * @property {string} sheetType - Sheet type
 * @property {GridProperties} gridProperties - Grid properties
 */

/**
 * @typedef {Object} Sheet
 * @property {SheetProperties} properties - Sheet properties
 */

/**
 * @typedef {Object} SpreadsheetResponse
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {string} spreadsheetUrl - Spreadsheet URL
 * @property {SpreadsheetProperties} properties - Spreadsheet properties
 * @property {Sheet[]} sheets - Array of sheets
 * @property {Object[]} namedRanges - Named ranges
 * @property {Object[]} developerMetadata - Developer metadata
 */

/**
 * @typedef {Object} ValuesResponse
 * @property {string} range - Range
 * @property {string} majorDimension - Major dimension
 * @property {string[][]} values - Values array
 */

/**
 * @typedef {Object} UpdateResult
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {string} updatedRange - Updated range
 * @property {number} updatedRows - Number of updated rows
 * @property {number} updatedColumns - Number of updated columns
 * @property {number} updatedCells - Number of updated cells
 */

/**
 * @typedef {Object} AppendResult
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {string} tableRange - Table range
 * @property {UpdateResult} updates - Update result
 */

/**
 * @typedef {Object} ClearResult
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {string} clearedRange - Cleared range
 */

/**
 * @typedef {Object} BatchUpdateResult
 * @property {string} spreadsheetId - Spreadsheet ID
 * @property {Object[]} replies - Batch update replies
 * @property {Object} updatedSpreadsheet - Updated spreadsheet
 */

/**
 * @typedef {Object} DriveFile
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} createdTime - Creation time
 * @property {string} modifiedTime - Modification time
 * @property {string} webViewLink - Web view link
 */

/**
 * @typedef {Object} FilesListResponse
 * @property {DriveFile[]} files - Array of files
 * @property {string} nextPageToken - Next page token
 */

/**
 * @typedef {Object} CopyResult
 * @property {number} sheetId - Sheet ID
 * @property {string} sheetType - Sheet type
 * @property {string} title - Sheet title
 */

/**
 * Format Google Sheets API responses
 */
export const formatSheetsResponse = {
	/**
	 * Format spreadsheet response
	 * @param {SpreadsheetResponse} response - Spreadsheet response
	 * @returns {{spreadsheetId: string, spreadsheetUrl: string, title: string, sheets: Array<{sheetId: number, title: string, index: number, rowCount: number, columnCount: number}>, namedRanges: Object[], developerMetadata: Object[]}} Formatted spreadsheet
	 */
	spreadsheet(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			spreadsheetUrl: response.spreadsheetUrl,
			title: response.properties?.title,
			sheets: response.sheets?.map(sheet => ({
				sheetId: sheet.properties.sheetId,
				title: sheet.properties.title,
				index: sheet.properties.index,
				rowCount: sheet.properties.gridProperties?.rowCount,
				columnCount: sheet.properties.gridProperties?.columnCount
			})),
			namedRanges: response.namedRanges,
			developerMetadata: response.developerMetadata
		};
	},

	/**
	 * Format values response
	 * @param {ValuesResponse} response - Values response
	 * @returns {{range: string, majorDimension: string, values: string[][]}} Formatted values
	 */
	values(response) {
		return {
			range: response.range,
			majorDimension: response.majorDimension,
			values: response.values || []
		};
	},

	/**
	 * Format update result
	 * @param {UpdateResult} response - Update result response
	 * @returns {{spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}} Formatted update result
	 */
	updateResult(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			updatedRange: response.updatedRange,
			updatedRows: response.updatedRows,
			updatedColumns: response.updatedColumns,
			updatedCells: response.updatedCells
		};
	},

	/**
	 * Format append result
	 * @param {AppendResult} response - Append result response
	 * @returns {{spreadsheetId: string, tableRange: string, updates: {spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}}} Formatted append result
	 */
	appendResult(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			tableRange: response.tableRange,
			updates: {
				spreadsheetId: response.updates?.spreadsheetId,
				updatedRange: response.updates?.updatedRange,
				updatedRows: response.updates?.updatedRows,
				updatedColumns: response.updates?.updatedColumns,
				updatedCells: response.updates?.updatedCells
			}
		};
	},

	/**
	 * Format clear result
	 * @param {ClearResult} response - Clear result response
	 * @returns {{spreadsheetId: string, clearedRange: string}} Formatted clear result
	 */
	clearResult(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			clearedRange: response.clearedRange
		};
	},

	/**
	 * Format batch update result
	 * @param {BatchUpdateResult} response - Batch update result response
	 * @returns {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} Formatted batch update result
	 */
	batchUpdateResult(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			replies: response.replies,
			updatedSpreadsheet: response.updatedSpreadsheet
		};
	},

	/**
	 * Format files list response
	 * @param {FilesListResponse} response - Files list response
	 * @returns {{files: Array<{id: string, name: string, createdTime: string, modifiedTime: string, webViewLink: string}>, nextPageToken: string}} Formatted files list
	 */
	filesList(response) {
		return {
			files: response.files?.map(file => ({
				id: file.id,
				name: file.name,
				createdTime: file.createdTime,
				modifiedTime: file.modifiedTime,
				webViewLink: file.webViewLink
			})),
			nextPageToken: response.nextPageToken
		};
	},

	/**
	 * Format copy result
	 * @param {CopyResult} response - Copy result response
	 * @returns {{sheetId: number, sheetType: string, title: string}} Formatted copy result
	 */
	copyResult(response) {
		return {
			sheetId: response.sheetId,
			sheetType: response.sheetType,
			title: response.title
		};
	},

	/**
	 * Format metadata response
	 * @param {SpreadsheetResponse} response - Spreadsheet metadata response
	 * @returns {{spreadsheetId: string, title: string, locale: string, autoRecalc: string, timeZone: string, defaultFormat: Object, sheets: Array<{sheetId: number, title: string, index: number, sheetType: string, gridProperties: GridProperties}>}} Formatted metadata
	 */
	metadata(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			title: response.properties?.title,
			locale: response.properties?.locale,
			autoRecalc: response.properties?.autoRecalc,
			timeZone: response.properties?.timeZone,
			defaultFormat: response.properties?.defaultFormat,
			sheets: response.sheets?.map(sheet => ({
				sheetId: sheet.properties.sheetId,
				title: sheet.properties.title,
				index: sheet.properties.index,
				sheetType: sheet.properties.sheetType,
				gridProperties: sheet.properties.gridProperties
			}))
		};
	}
};