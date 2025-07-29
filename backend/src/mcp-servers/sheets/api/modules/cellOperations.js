// @ts-check
/**
 * @fileoverview Cell operations for Google Sheets API
 * Functions for reading and writing cell data
 */

const { makeSheetsRequest  } = require('./requestHandler');
const { formatSheetsResponse  } = require('../../utils/sheetsFormatting');
const { validateSheetsInput  } = require('../../utils/validation');

/**
 * Get cell values from a range
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').GetCellsResponse>} Cell values
 */
async function getCells(params, bearerToken) {
	const validation = validateSheetsInput.getCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueRenderOption: params.valueRenderOption || 'FORMATTED_VALUE',
		dateTimeRenderOption: 'FORMATTED_STRING'
	});

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}?${queryParams}`,
		bearerToken,
		{}
	);

	/** @type {{range: string, majorDimension: string, values: string[][]}} */
	const valuesResponse = {
		range: response.range,
		majorDimension: response.majorDimension,
		values: response.values || []
	};

	return formatSheetsResponse.values(valuesResponse);
}

/**
 * Update cell values in a range
 * @param {Object} params - Update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellGrid} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').UpdateCellsResponse>} Update result
 */
async function updateCells(params, bearerToken) {
	/** @type {{spreadsheetId: string, range: string, values: (string|number)[][], valueInputOption: string}} */
	const validatedParams = {
		spreadsheetId: params.spreadsheetId,
		range: params.range,
		values: params.values.map(row => row.map(cell => cell === null ? '' : typeof cell === 'boolean' ? String(cell) : cell)),
		valueInputOption: params.valueInputOption || 'USER_ENTERED'
	};

	const validation = validateSheetsInput.updateCells(validatedParams);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueInputOption: validatedParams.valueInputOption
	});

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${validatedParams.spreadsheetId}/values/${encodeURIComponent(validatedParams.range)}?${queryParams}`,
		bearerToken,
		{
			method: 'PUT',
			body: {
				values: validatedParams.values
			}
		}
	);

	/** @type {{spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}} */
	const updateResult = {
		spreadsheetId: response.spreadsheetId,
		updatedRange: response.updatedRange,
		updatedRows: response.updatedRows,
		updatedColumns: response.updatedColumns,
		updatedCells: response.updatedCells
	};

	return formatSheetsResponse.updateResult(updateResult);
}

/**
 * Append values to a range
 * @param {Object} params - Append parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellGrid} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Append result
 */
async function appendValues(params, bearerToken) {
	/** @type {{spreadsheetId: string, range: string, values: (string|number)[][], valueInputOption: string}} */
	const validatedParams = {
		spreadsheetId: params.spreadsheetId,
		range: params.range,
		values: params.values.map(row => row.map(cell => cell === null ? '' : typeof cell === 'boolean' ? String(cell) : cell)),
		valueInputOption: params.valueInputOption || 'USER_ENTERED'
	};

	const validation = validateSheetsInput.appendValues(validatedParams);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueInputOption: validatedParams.valueInputOption,
		insertDataOption: 'INSERT_ROWS'
	});

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${validatedParams.spreadsheetId}/values/${encodeURIComponent(validatedParams.range)}:append?${queryParams}`,
		bearerToken,
		{
			method: 'POST',
			body: {
				values: validatedParams.values
			}
		}
	);

	/** @type {{spreadsheetId: string, tableRange: string, updates: {spreadsheetId: string, updatedRange: string, updatedRows: number, updatedColumns: number, updatedCells: number}}} */
	const appendResult = {
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

	return formatSheetsResponse.appendResult(appendResult);
}

/**
 * Clear cell values in a range
 * @param {Object} params - Clear parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Clear result
 */
async function clearCells(params, bearerToken) {
	const validation = validateSheetsInput.clearCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:clear`,
		bearerToken,
		{
			method: 'POST'
		}
	);

	/** @type {{spreadsheetId: string, clearedRange: string}} */
	const clearResult = {
		spreadsheetId: response.spreadsheetId,
		clearedRange: response.clearedRange
	};

	return formatSheetsResponse.clearResult(clearResult);
}
module.exports = {
  getCells,
  updateCells,
  appendValues,
  clearCells
};