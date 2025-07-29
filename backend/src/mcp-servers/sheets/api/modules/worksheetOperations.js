// @ts-check
/**
 * @fileoverview Worksheet operations for Google Sheets API
 * Functions for managing worksheets within spreadsheets
 */

const { makeSheetsRequest  } = require('./requestHandler');
const { formatSheetsResponse  } = require('../../utils/sheetsFormatting');
const { validateSheetsInput  } = require('../../utils/validation');

/**
 * Add a new worksheet to a spreadsheet
 * @param {Object} params - Add parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.title - Worksheet title
 * @param {number} params.rows - Number of rows
 * @param {number} params.cols - Number of columns
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Created worksheet details
 */
async function addWorksheet(params, bearerToken) {
	const validation = validateSheetsInput.addWorksheet(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const requestBody = {
		requests: [{
			addSheet: {
				properties: {
					title: params.title,
					gridProperties: {
						rowCount: params.rows || 1000,
						columnCount: params.cols || 26
					}
				}
			}
		}]
	};

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	/** @type {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} */
	const batchUpdateResult = {
		spreadsheetId: response.spreadsheetId,
		replies: response.replies,
		updatedSpreadsheet: response.updatedSpreadsheet
	};

	return formatSheetsResponse.batchUpdateResult(batchUpdateResult);
}

/**
 * Delete a worksheet from a spreadsheet
 * @param {Object} params - Delete parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to delete
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Delete result
 */
async function deleteWorksheet(params, bearerToken) {
	const validation = validateSheetsInput.deleteWorksheet(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const requestBody = {
		requests: [{
			deleteSheet: {
				sheetId: params.sheetId
			}
		}]
	};

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	/** @type {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} */
	const batchUpdateResult = {
		spreadsheetId: response.spreadsheetId,
		replies: response.replies,
		updatedSpreadsheet: response.updatedSpreadsheet
	};

	return formatSheetsResponse.batchUpdateResult(batchUpdateResult);
}

/**
 * Copy a worksheet
 * @param {Object} params - Copy parameters
 * @param {string} params.spreadsheetId - Source spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to copy
 * @param {string} params.destinationSpreadsheetId - Destination spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Copy result
 */
async function copySheet(params, bearerToken) {
	const validation = validateSheetsInput.copySheet(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const requestBody = {
		destinationSpreadsheetId: params.destinationSpreadsheetId || params.spreadsheetId
	};

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/sheets/${params.sheetId}:copyTo`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	/** @type {{sheetId: number, sheetType: string, title: string}} */
	const copyResult = {
		sheetId: response.sheetId,
		sheetType: response.sheetType,
		title: response.title
	};

	return formatSheetsResponse.copyResult(copyResult);
}

/**
 * Insert rows into a worksheet
 * @param {Object} params - Insert parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Insert result
 */
async function insertRows(params, bearerToken) {
	const validation = validateSheetsInput.insertRows(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const requestBody = {
		requests: [{
			insertDimension: {
				range: {
					sheetId: params.sheetId,
					dimension: 'ROWS',
					startIndex: params.startIndex,
					endIndex: params.endIndex
				},
				inheritFromBefore: false
			}
		}]
	};

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	/** @type {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} */
	const batchUpdateResult = {
		spreadsheetId: response.spreadsheetId,
		replies: response.replies,
		updatedSpreadsheet: response.updatedSpreadsheet
	};

	return formatSheetsResponse.batchUpdateResult(batchUpdateResult);
}

/**
 * Delete rows from a worksheet
 * @param {Object} params - Delete parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Delete result
 */
async function deleteRows(params, bearerToken) {
	const validation = validateSheetsInput.deleteRows(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const requestBody = {
		requests: [{
			deleteDimension: {
				range: {
					sheetId: params.sheetId,
					dimension: 'ROWS',
					startIndex: params.startIndex,
					endIndex: params.endIndex
				}
			}
		}]
	};

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	/** @type {{spreadsheetId: string, replies: Object[], updatedSpreadsheet: Object}} */
	const batchUpdateResult = {
		spreadsheetId: response.spreadsheetId,
		replies: response.replies,
		updatedSpreadsheet: response.updatedSpreadsheet
	};

	return formatSheetsResponse.batchUpdateResult(batchUpdateResult);
}
module.exports = {
  addWorksheet,
  deleteWorksheet,
  copySheet,
  insertRows,
  deleteRows
};