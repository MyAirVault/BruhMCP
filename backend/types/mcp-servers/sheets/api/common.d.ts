/**
 * Make authenticated request to Google Sheets API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} API response
 */
export function makeSheetsAPIRequest(endpoint: string, options: Object | undefined, bearerToken: string): Promise<Object>;
/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} API response
 */
export function makeDriveAPIRequest(endpoint: string, options: Object | undefined, bearerToken: string): Promise<Object>;
/**
 * @fileoverview Common utilities for Google Sheets API
 * Shared functions for API requests and error handling
 */
export const SHEETS_API_BASE: "https://sheets.googleapis.com/v4";
export const DRIVE_API_BASE: "https://www.googleapis.com/drive/v3";
//# sourceMappingURL=common.d.ts.map