/**
 * Google Sheets API integration functions
 * Provides core Google Sheets functionality with OAuth Bearer token authentication
 * Based on Gmail MCP implementation patterns
 */

const { formatSheetsResponse } = require('../utils/sheets-formatting');
const { validateSheetsInput } = require('../utils/validation');

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make authenticated request to Google Sheets API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} API response
 */
async function makeSheetsAPIRequest(endpoint, options = {}, bearerToken) {
  const url = `${SHEETS_API_BASE}${endpoint}`;
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  console.log(`📡 Google Sheets API ${requestOptions.method}: ${url}`);

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Google Sheets API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.message) {
          errorMessage = `Google Sheets API error: ${errorJson.error.message}`;
        }
      } catch (parseError) {
        // Use default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ Google Sheets API request successful`);
    return data;

  } catch (error) {
    console.error(`❌ Google Sheets API request failed:`, error);
    throw error;
  }
}

/**
 * Make authenticated request to Google Drive API (for listing spreadsheets)
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Request options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} API response
 */
async function makeDriveAPIRequest(endpoint, options = {}, bearerToken) {
  const url = `${DRIVE_API_BASE}${endpoint}`;
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  console.log(`📡 Google Drive API ${requestOptions.method}: ${url}`);

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Google Drive API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.message) {
          errorMessage = `Google Drive API error: ${errorJson.error.message}`;
        }
      } catch (parseError) {
        // Use default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ Google Drive API request successful`);
    return data;

  } catch (error) {
    console.error(`❌ Google Drive API request failed:`, error);
    throw error;
  }
}

/**
 * Create a new Google Sheets spreadsheet
 * @param {Object} params - Creation parameters
 * @param {string} params.title - Spreadsheet title
 * @param {Array} params.sheets - Initial sheets configuration
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function createSpreadsheet(params, bearerToken) {
  const { title, sheets = [] } = params;
  
  // Validate input
  validateSheetsInput('createSpreadsheet', params);
  
  const requestBody = {
    properties: {
      title: title
    }
  };

  // Add sheet configurations if provided
  if (sheets.length > 0) {
    requestBody.sheets = sheets.map(sheet => ({
      properties: {
        title: sheet.title,
        gridProperties: {
          rowCount: sheet.rows || 1000,
          columnCount: sheet.cols || 26
        }
      }
    }));
  }

  const response = await makeSheetsAPIRequest('/spreadsheets', {
    method: 'POST',
    body: requestBody
  }, bearerToken);

  return formatSheetsResponse('createSpreadsheet', response);
}

/**
 * Get spreadsheet information
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {boolean} params.includeData - Include cell data
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function getSpreadsheet(params, bearerToken) {
  const { spreadsheetId, includeData = false } = params;
  
  validateSheetsInput('getSpreadsheet', params);
  
  let endpoint = `/spreadsheets/${spreadsheetId}`;
  
  if (!includeData) {
    endpoint += '?fields=properties,sheets.properties';
  }

  const response = await makeSheetsAPIRequest(endpoint, {}, bearerToken);
  
  return formatSheetsResponse('getSpreadsheet', response);
}

/**
 * Update cells in a spreadsheet
 * @param {Object} params - Update parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function updateCells(params, bearerToken) {
  const { spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' } = params;
  
  validateSheetsInput('updateCells', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}/values/${range}`, {
    method: 'PUT',
    body: {
      values: values,
      majorDimension: 'ROWS'
    }
  }, bearerToken);

  return formatSheetsResponse('updateCells', response);
}

/**
 * Get cell values from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} params.valueRenderOption - How to render values
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function getCells(params, bearerToken) {
  const { spreadsheetId, range, valueRenderOption = 'FORMATTED_VALUE' } = params;
  
  validateSheetsInput('getCells', params);
  
  const queryParams = new URLSearchParams({
    valueRenderOption: valueRenderOption
  });

  const response = await makeSheetsAPIRequest(
    `/spreadsheets/${spreadsheetId}/values/${range}?${queryParams}`, 
    {}, 
    bearerToken
  );

  return formatSheetsResponse('getCells', response);
}

/**
 * Add a new worksheet to a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.title - Worksheet title
 * @param {number} params.rows - Number of rows
 * @param {number} params.cols - Number of columns
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function addWorksheet(params, bearerToken) {
  const { spreadsheetId, title, rows = 1000, cols = 26 } = params;
  
  validateSheetsInput('addWorksheet', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        addSheet: {
          properties: {
            title: title,
            gridProperties: {
              rowCount: rows,
              columnCount: cols
            }
          }
        }
      }]
    }
  }, bearerToken);

  return formatSheetsResponse('addWorksheet', response);
}

/**
 * Delete a worksheet from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID to delete
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function deleteWorksheet(params, bearerToken) {
  const { spreadsheetId, sheetId } = params;
  
  validateSheetsInput('deleteWorksheet', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        deleteSheet: {
          sheetId: sheetId
        }
      }]
    }
  }, bearerToken);

  return formatSheetsResponse('deleteWorksheet', response);
}

/**
 * Append values to a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Array} params.values - 2D array of values
 * @param {string} params.valueInputOption - How to interpret input
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function appendValues(params, bearerToken) {
  const { spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' } = params;
  
  validateSheetsInput('appendValues', params);
  
  const queryParams = new URLSearchParams({
    valueInputOption: valueInputOption
  });

  const response = await makeSheetsAPIRequest(
    `/spreadsheets/${spreadsheetId}/values/${range}:append?${queryParams}`, 
    {
      method: 'POST',
      body: {
        values: values,
        majorDimension: 'ROWS'
      }
    }, 
    bearerToken
  );

  return formatSheetsResponse('appendValues', response);
}

/**
 * Clear cell values in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function clearCells(params, bearerToken) {
  const { spreadsheetId, range } = params;
  
  validateSheetsInput('clearCells', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
    method: 'POST'
  }, bearerToken);

  return formatSheetsResponse('clearCells', response);
}

/**
 * Format cells in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} params.range - A1 notation range
 * @param {Object} params.format - Formatting options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function formatCells(params, bearerToken) {
  const { spreadsheetId, range, format } = params;
  
  validateSheetsInput('formatCells', params);
  
  // Convert A1 notation to grid range (simplified)
  const sheetName = range.split('!')[0];
  const cellRange = range.split('!')[1];
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        repeatCell: {
          range: {
            sheetId: 0, // Simplified - would need sheet name lookup
            startRowIndex: 0,
            endRowIndex: 10,
            startColumnIndex: 0,
            endColumnIndex: 10
          },
          cell: {
            userEnteredFormat: format
          },
          fields: 'userEnteredFormat'
        }
      }]
    }
  }, bearerToken);

  return formatSheetsResponse('formatCells', response);
}

/**
 * List user's Google Sheets spreadsheets
 * @param {Object} params - Request parameters
 * @param {number} params.maxResults - Maximum results to return
 * @param {string} params.query - Search query
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function listSpreadsheets(params, bearerToken) {
  const { maxResults = 10, query = '' } = params;
  
  validateSheetsInput('listSpreadsheets', params);
  
  const queryParams = new URLSearchParams({
    q: `${query} mimeType='application/vnd.google-apps.spreadsheet'`,
    pageSize: maxResults.toString(),
    fields: 'files(id,name,createdTime,modifiedTime,owners,webViewLink)'
  });

  const response = await makeDriveAPIRequest(`/files?${queryParams}`, {}, bearerToken);
  
  return formatSheetsResponse('listSpreadsheets', response);
}

/**
 * Batch update operations (for complex updates)
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {Array} params.requests - Array of batch update requests
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function batchUpdate(params, bearerToken) {
  const { spreadsheetId, requests } = params;
  
  validateSheetsInput('batchUpdate', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: requests
    }
  }, bearerToken);

  return formatSheetsResponse('batchUpdate', response);
}

/**
 * Insert rows in a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function insertRows(params, bearerToken) {
  const { spreadsheetId, sheetId, startIndex, endIndex } = params;
  
  validateSheetsInput('insertRows', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        insertDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: startIndex,
            endIndex: endIndex
          }
        }
      }]
    }
  }, bearerToken);

  return formatSheetsResponse('insertRows', response);
}

/**
 * Delete rows from a spreadsheet
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {number} params.sheetId - Sheet ID
 * @param {number} params.startIndex - Start row index
 * @param {number} params.endIndex - End row index
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function deleteRows(params, bearerToken) {
  const { spreadsheetId, sheetId, startIndex, endIndex } = params;
  
  validateSheetsInput('deleteRows', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: 'ROWS',
            startIndex: startIndex,
            endIndex: endIndex
          }
        }
      }]
    }
  }, bearerToken);

  return formatSheetsResponse('deleteRows', response);
}

/**
 * Copy a sheet within or between spreadsheets
 * @param {Object} params - Request parameters
 * @param {string} params.sourceSpreadsheetId - Source spreadsheet ID
 * @param {number} params.sourceSheetId - Source sheet ID
 * @param {string} params.destinationSpreadsheetId - Destination spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function copySheet(params, bearerToken) {
  const { sourceSpreadsheetId, sourceSheetId, destinationSpreadsheetId } = params;
  
  validateSheetsInput('copySheet', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${sourceSpreadsheetId}/sheets/${sourceSheetId}:copyTo`, {
    method: 'POST',
    body: {
      destinationSpreadsheetId: destinationSpreadsheetId
    }
  }, bearerToken);

  return formatSheetsResponse('copySheet', response);
}

/**
 * Get sheet metadata (properties, dimensions, etc.)
 * @param {Object} params - Request parameters
 * @param {string} params.spreadsheetId - Spreadsheet ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<string>} Formatted response
 */
async function getSheetMetadata(params, bearerToken) {
  const { spreadsheetId } = params;
  
  validateSheetsInput('getSheetMetadata', params);
  
  const response = await makeSheetsAPIRequest(`/spreadsheets/${spreadsheetId}?fields=properties,sheets.properties`, {}, bearerToken);
  
  return formatSheetsResponse('getSheetMetadata', response);
}

module.exports = {
  createSpreadsheet,
  getSpreadsheet,
  updateCells,
  getCells,
  addWorksheet,
  deleteWorksheet,
  appendValues,
  clearCells,
  formatCells,
  listSpreadsheets,
  batchUpdate,
  insertRows,
  deleteRows,
  copySheet,
  getSheetMetadata
};