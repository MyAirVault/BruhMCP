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

	/** @type {{spreadsheetId: string, spreadsheetUrl: string, properties: {title: string, locale: string, autoRecalc: string, timeZone: string, defaultFormat: Object}, sheets: Array<{properties: import('../../types/index.js').SheetProperties}>, namedRanges: Object[], developerMetadata: Object[]}} */
	const spreadsheetResponse = {
		spreadsheetId: response.spreadsheetId,
		spreadsheetUrl: response.spreadsheetUrl,
		properties: {
			title: response.properties?.title || params.title,
			locale: response.properties?.locale || 'en_US',
			autoRecalc: response.properties?.autoRecalc || 'ON_CHANGE',
			timeZone: response.properties?.timeZone || 'America/New_York',
			defaultFormat: response.properties?.defaultFormat || {}
		},
		sheets: response.sheets || [],
		namedRanges: response.namedRanges || [],
		developerMetadata: response.developerMetadata || []
	};

	/** @type {import('../../types/index.js').CreateSpreadsheetResponse} */
	const result = {
		spreadsheetId: spreadsheetResponse.spreadsheetId,
		properties: {
			title: spreadsheetResponse.properties.title,
			locale: spreadsheetResponse.properties.locale,
			timeZone: spreadsheetResponse.properties.timeZone,
			autoRecalc: spreadsheetResponse.properties.autoRecalc
		},
		sheets: spreadsheetResponse.sheets.map(sheet => ({
			sheetId: sheet.properties.sheetId,
			title: sheet.properties.title,
			index: sheet.properties.index,
			sheetType: sheet.properties.sheetType || 'GRID',
			gridProperties: sheet.properties.gridProperties || { rowCount: 1000, columnCount: 26 }
		})),
		spreadsheetUrl: spreadsheetResponse.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${response.spreadsheetId}/edit`
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

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(endpoint, bearerToken, {});

	/** @type {{spreadsheetId: string, spreadsheetUrl: string, properties: {title: string, locale: string, autoRecalc: string, timeZone: string, defaultFormat: Object}, sheets: Array<{properties: import('../../types/index.js').SheetProperties}>, namedRanges: Object[], developerMetadata: Object[]}} */
	const spreadsheetResponse = {
		spreadsheetId: response.spreadsheetId,
		spreadsheetUrl: response.spreadsheetUrl,
		properties: {
			title: response.properties?.title || '',
			locale: response.properties?.locale || 'en_US',
			autoRecalc: response.properties?.autoRecalc || 'ON_CHANGE',
			timeZone: response.properties?.timeZone || 'America/New_York',
			defaultFormat: response.properties?.defaultFormat || {}
		},
		sheets: response.sheets || [],
		namedRanges: response.namedRanges || [],
		developerMetadata: response.developerMetadata || []
	};

	return formatSheetsResponse.spreadsheet(spreadsheetResponse);
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

	/** @type {Record<string, any>} */
	const response = await makeDriveRequest(`/files?${queryParams}`, bearerToken, {});

	/** @type {{files: Array<{id: string, name: string, createdTime: string, modifiedTime: string, webViewLink: string}>, nextPageToken: string}} */
	const filesListResponse = {
		files: response.files || [],
		nextPageToken: response.nextPageToken
	};

	return formatSheetsResponse.filesList(filesListResponse);
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

	/** @type {Record<string, any>} */
	const response = await makeSheetsRequest(
		`/spreadsheets/${params.spreadsheetId}`,
		bearerToken,
		{}
	);

	/** @type {{spreadsheetId: string, spreadsheetUrl: string, properties: {title: string, locale: string, autoRecalc: string, timeZone: string, defaultFormat: Object}, sheets: Array<{properties: import('../../types/index.js').SheetProperties}>, namedRanges: Object[], developerMetadata: Object[]}} */
	const spreadsheetResponse = {
		spreadsheetId: response.spreadsheetId,
		spreadsheetUrl: response.spreadsheetUrl,
		properties: {
			title: response.properties?.title || '',
			locale: response.properties?.locale || 'en_US',
			autoRecalc: response.properties?.autoRecalc || 'ON_CHANGE',
			timeZone: response.properties?.timeZone || 'America/New_York',
			defaultFormat: response.properties?.defaultFormat || {}
		},
		sheets: response.sheets || [],
		namedRanges: response.namedRanges || [],
		developerMetadata: response.developerMetadata || []
	};

	return formatSheetsResponse.metadata(spreadsheetResponse);
}