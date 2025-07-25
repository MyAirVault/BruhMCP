// @ts-check
/**
 * @fileoverview Formatting operations for Google Sheets API
 * Functions for formatting cells and ranges
 */

import { makeSheetsRequest } from './requestHandler.js';
import { formatSheetsResponse } from '../../utils/sheetsFormatting.js';
import { validateSheetsInput } from '../../utils/validation.js';

/**
 * Format cells in a range
 * @param {Object} params - Format parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {import('../../types/index.js').CellFormat} params.format - Formatting options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Format result
 */
export async function formatCells(params, bearerToken) {
	const validation = validateSheetsInput.formatCells(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	// Parse A1 notation to get sheet name and range
	const [sheetName, cellRange] = params.range.includes('!') 
		? params.range.split('!') 
		: ['Sheet1', params.range];

	// Get sheet ID from spreadsheet metadata
	const metadata = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}`,
		bearerToken,
		{}
	);

	const sheet = metadata.sheets.find(/** @param {any} s */ (s) => s.properties.title === sheetName);
	if (!sheet) {
		throw new Error(`Sheet "${sheetName}" not found`);
	}

	// Convert A1 notation to grid range
	const gridRange = convertA1ToGridRange(cellRange, sheet.properties.sheetId);

	// Build format request
	const requests = [];
	
	if (params.format.backgroundColor) {
		requests.push({
			repeatCell: {
				range: gridRange,
				cell: {
					userEnteredFormat: {
						backgroundColor: params.format.backgroundColor
					}
				},
				fields: 'userEnteredFormat.backgroundColor'
			}
		});
	}

	if (params.format.textFormat) {
		requests.push({
			repeatCell: {
				range: gridRange,
				cell: {
					userEnteredFormat: {
						textFormat: params.format.textFormat
					}
				},
				fields: 'userEnteredFormat.textFormat'
			}
		});
	}

	const requestBody = { requests };

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: requestBody
		}
	);

	return formatSheetsResponse.batchUpdateResult(response);
}

/**
 * Batch update a spreadsheet
 * @param {Object} params - Batch update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {import('../../types/index.js').Request[]} params.requests - Array of update requests
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Batch update result
 */
export async function batchUpdate(params, bearerToken) {
	const validation = validateSheetsInput.batchUpdate(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}:batchUpdate`,
		bearerToken,
		{
			method: 'POST',
			body: {
				requests: params.requests
			}
		}
	);

	return formatSheetsResponse.batchUpdateResult(response);
}

/**
 * Convert A1 notation to grid range
 * @param {string} a1Notation - A1 notation (e.g., 'A1:B2')
 * @param {number} sheetId - Sheet ID
 * @returns {{sheetId: number, startRowIndex: number, startColumnIndex: number, endRowIndex: number, endColumnIndex: number}} Grid range object
 */
function convertA1ToGridRange(a1Notation, sheetId) {
	// Simple A1 to grid range conversion
	// This is a simplified version - full implementation would handle all cases
	/** @type {{sheetId: number, startRowIndex: number, startColumnIndex: number, endRowIndex: number, endColumnIndex: number}} */
	const range = {
		sheetId: sheetId,
		startRowIndex: 0,
		startColumnIndex: 0,
		endRowIndex: 0,
		endColumnIndex: 0
	};

	// Parse single cell or range
	const parts = a1Notation.split(':');
	const startCell = parseA1Cell(parts[0]);
	
	range.startRowIndex = startCell.row;
	range.startColumnIndex = startCell.col;

	if (parts.length > 1) {
		const endCell = parseA1Cell(parts[1]);
		range.endRowIndex = endCell.row + 1;
		range.endColumnIndex = endCell.col + 1;
	} else {
		range.endRowIndex = startCell.row + 1;
		range.endColumnIndex = startCell.col + 1;
	}

	return range;
}

/**
 * Parse A1 cell notation
 * @param {string} cell - Cell reference (e.g., 'A1')
 * @returns {{row: number, col: number}} Row and column indices
 */
function parseA1Cell(cell) {
	const match = cell.match(/^([A-Z]+)(\d+)$/);
	if (!match) {
		throw new Error(`Invalid cell reference: ${cell}`);
	}

	const col = match[1].split('').reduce((acc, char, i, arr) => {
		return acc + (char.charCodeAt(0) - 64) * Math.pow(26, arr.length - i - 1);
	}, 0) - 1;

	const row = parseInt(match[2]) - 1;

	return { row, col };
}