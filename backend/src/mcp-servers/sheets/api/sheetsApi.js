/**
 * Google Sheets API Client Class
 * OAuth-based API client for Google Sheets operations
 */

import {
	makeSheetsRequest,
	createSpreadsheet as createSpreadsheetModule,
	getSpreadsheet as getSpreadsheetModule,
	getCells,
	updateCells,
	appendValues as appendValuesModule,
	clearCells,
	addWorksheet,
	batchUpdate as batchUpdateModule
} from './modules/index.js';

/**
 * Google Sheets API Client
 */
export class SheetsApi {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 */
	constructor(bearerToken) {
		this.bearerToken = bearerToken;
	}

	/**
	 * Create a new spreadsheet
	 * @param {string} title - Spreadsheet title
	 * @param {string[]} sheetNames - Names of initial sheets
	 * @returns {Promise<Object>} Created spreadsheet info
	 */
	async createSpreadsheet(title, sheetNames = ['Sheet1']) {
		return createSpreadsheetModule(this.bearerToken, title, sheetNames);
	}

	/**
	 * Get spreadsheet metadata
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @returns {Promise<Object>} Spreadsheet metadata
	 */
	async getSpreadsheet(spreadsheetId) {
		return getSpreadsheetModule(this.bearerToken, spreadsheetId);
	}

	/**
	 * Read values from a range
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {string} range - A1 notation range
	 * @param {Object} options - Read options
	 * @returns {Promise<Object>} Range values
	 */
	async readRange(spreadsheetId, range, options = {}) {
		const params = new URLSearchParams();
		if (options.majorDimension) params.append('majorDimension', options.majorDimension);
		if (options.valueRenderOption) params.append('valueRenderOption', options.valueRenderOption);
		
		const queryString = params.toString();
		const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}${queryString ? '?' + queryString : ''}`;
		
		return makeSheetsRequest(this.bearerToken, url);
	}

	/**
	 * Write values to a range
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {string} range - A1 notation range
	 * @param {Array<Array>} values - 2D array of values
	 * @param {Object} options - Write options
	 * @returns {Promise<Object>} Update result
	 */
	async writeRange(spreadsheetId, range, values, options = {}) {
		return updateCells(
			this.bearerToken,
			spreadsheetId,
			range,
			values,
			options.valueInputOption || 'USER_ENTERED'
		);
	}

	/**
	 * Append values to a sheet
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {string} range - A1 notation range
	 * @param {Array<Array>} values - 2D array of values
	 * @param {Object} options - Append options
	 * @returns {Promise<Object>} Append result
	 */
	async appendValues(spreadsheetId, range, values, options = {}) {
		return appendValuesModule(
			this.bearerToken,
			spreadsheetId,
			range,
			values,
			options.valueInputOption || 'USER_ENTERED'
		);
	}

	/**
	 * Clear values from a range
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {string} range - A1 notation range
	 * @returns {Promise<Object>} Clear result
	 */
	async clearRange(spreadsheetId, range) {
		return clearCells(this.bearerToken, spreadsheetId, range);
	}

	/**
	 * Perform batch update
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {Array<Object>} requests - Array of update requests
	 * @returns {Promise<Object>} Batch update result
	 */
	async batchUpdate(spreadsheetId, requests) {
		return batchUpdateModule(this.bearerToken, spreadsheetId, requests);
	}

	/**
	 * Add a new sheet to the spreadsheet
	 * @param {string} spreadsheetId - Spreadsheet ID
	 * @param {string} sheetName - Name for the new sheet
	 * @param {number} [index] - Position to insert the sheet
	 * @returns {Promise<Object>} Add sheet result
	 */
	async addSheet(spreadsheetId, sheetName, index) {
		return addWorksheet(this.bearerToken, spreadsheetId, sheetName, index);
	}
}