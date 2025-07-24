/**
 * @fileoverview Response formatting for Google Sheets operations
 * Formats API responses for consistent output
 */

/**
 * Format Google Sheets API responses
 */
export const formatSheetsResponse = {
	/**
	 * Format spreadsheet response
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
	 */
	clearResult(response) {
		return {
			spreadsheetId: response.spreadsheetId,
			clearedRange: response.clearedRange
		};
	},

	/**
	 * Format batch update result
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