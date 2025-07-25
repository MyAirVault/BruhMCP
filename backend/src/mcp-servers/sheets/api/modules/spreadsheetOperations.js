/**
 * @fileoverview Spreadsheet operations for Google Sheets API
 * Core spreadsheet management functions
 */

// @ts-check
import { makeSheetsRequest, makeDriveRequest } from './requestHandler.js';
import { formatSheetsResponse } from '../../utils/sheetsFormatting.js';
import { validateSheetsInput } from '../../utils/validation.js';

/**
 * Create a new Google Sheets spreadsheet
 * @param {Object} params - Creation parameters
 * @param {string} params.title - Spreadsheet title
 * @param {Array<{title: string, rows?: number, cols?: number}>} params.sheets - Initial sheets to create
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<import('../../types/index.js').CreateSpreadsheetResponse>} Created spreadsheet details
 */
export async function createSpreadsheet(params, bearerToken) {
	const validation = validateSheetsInput.createSpreadsheet(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	/** @type {{properties: {title: string}, sheets?: Array<any>}} */
	const requestBody = {
		properties: {
			title: params.title
		}
	};

	if (params.sheets && params.sheets.length > 0) {
		requestBody.sheets = params.sheets.map((sheet, index) => ({
			properties: {
				sheetId: index,
				title: sheet.title,
				gridProperties: {
					rowCount: sheet.rows || 1000,
					columnCount: sheet.cols || 26
				}
			}
		}));
	}

	const response = await makeSheetsRequest('/spreadsheets', bearerToken, {
		method: 'POST',
		body: requestBody
	});

	/** @type {import('../../types/index.js').CreateSpreadsheetResponse} */
	const result = {
		...formatSheetsResponse.spreadsheet(response),
		properties: response.properties || { title: params.title, spreadsheetId: response.spreadsheetId }
	};
	return result;
}

/**
 * Get spreadsheet metadata and optionally data
 * @param {Object} params - Get parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {boolean} params.includeData - Include cell data
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Spreadsheet details
 */
export async function getSpreadsheet(params, bearerToken) {
	const validation = validateSheetsInput.getSpreadsheet(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	let endpoint = `/spreadsheets/${params.spreadsheetId}`;
	
	if (params.includeData) {
		endpoint += '?includeGridData=true';
	}

	const response = await makeSheetsRequest(endpoint, bearerToken, {});
	return formatSheetsResponse.spreadsheet(response);
}

/**
 * List user's Google Sheets spreadsheets
 * @param {Object} params - List parameters
 * @param {number} params.pageSize - Max results per page
 * @param {string} params.pageToken - Next page token
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{files: Array<Record<string, any>>, nextPageToken?: string}>} List of spreadsheets
 */
export async function listSpreadsheets(params, bearerToken) {
	const validation = validateSheetsInput.listSpreadsheets(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const query = [
		"mimeType='application/vnd.google-apps.spreadsheet'",
		"trashed=false"
	].join(' and ');

	const queryParams = new URLSearchParams();
	queryParams.set('q', query);
	queryParams.set('pageSize', String(params.pageSize || 100));
	queryParams.set('fields', 'nextPageToken,files(id,name,createdTime,modifiedTime,webViewLink)');

	if (params.pageToken) {
		queryParams.set('pageToken', params.pageToken);
	}

	const response = await makeDriveRequest(`/files?${queryParams}`, bearerToken, {});
	return formatSheetsResponse.filesList(response);
}

/**
 * Get spreadsheet metadata
 * @param {Object} params - Parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, any>>} Spreadsheet metadata
 */
export async function getSheetMetadata(params, bearerToken) {
	const validation = validateSheetsInput.getSheetMetadata(params);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}`,
		bearerToken,
		{}
	);

	return formatSheetsResponse.metadata(response);
}