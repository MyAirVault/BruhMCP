// @ts-check
/**
 * @fileoverview Cell operations for Google Sheets API
 * Functions for reading and writing cell data
 */

import { makeSheetsRequest } from './requestHandler.js';
import { formatSheetsResponse } from '../../utils/sheetsFormatting.js';
import { validateSheetsInput } from '../../utils/validation.js';

/**
 * Get cell values from a range
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').GetCellsResponse>} Cell values
 */
export async function getCells(params, bearerToken) {
	const validation = validateSheetsInput.getCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueRenderOption: params.valueRenderOption || 'FORMATTED_VALUE',
		dateTimeRenderOption: 'FORMATTED_STRING'
	});

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}?${queryParams}`,
		bearerToken,
		{}
	);

	return formatSheetsResponse.values(response);
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
export async function updateCells(params, bearerToken) {
	const validation = validateSheetsInput.updateCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueInputOption: params.valueInputOption || 'USER_ENTERED'
	});

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}?${queryParams}`,
		bearerToken,
		{
			method: 'PUT',
			body: {
				values: params.values
			}
		}
	);

	return formatSheetsResponse.updateResult(response);
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
export async function appendValues(params, bearerToken) {
	const validation = validateSheetsInput.appendValues(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const queryParams = new URLSearchParams({
		valueInputOption: params.valueInputOption || 'USER_ENTERED',
		insertDataOption: 'INSERT_ROWS'
	});

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:append?${queryParams}`,
		bearerToken,
		{
			method: 'POST',
			body: {
				values: params.values
			}
		}
	);

	return formatSheetsResponse.appendResult(response);
}

/**
 * Clear cell values in a range
 * @param {Object} params - Clear parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Clear result
 */
export async function clearCells(params, bearerToken) {
	const validation = validateSheetsInput.clearCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:clear`,
		bearerToken,
		{
			method: 'POST'
		}
	);

	return formatSheetsResponse.clearResult(response);
}