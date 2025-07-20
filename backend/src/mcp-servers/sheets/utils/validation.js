/**
 * Input validation utilities for Google Sheets MCP service
 * Validates parameters for Google Sheets API operations
 * Based on Gmail MCP implementation patterns
 */

/**
 * Validate input parameters for Google Sheets operations
 * @param {string} operation - Operation name
 * @param {Object} params - Parameters to validate
 * @throws {Error} If validation fails
 */
function validateSheetsInput(operation, params) {
  switch (operation) {
    case 'createSpreadsheet':
      validateCreateSpreadsheet(params);
      break;
    case 'getSpreadsheet':
      validateGetSpreadsheet(params);
      break;
    case 'updateCells':
      validateUpdateCells(params);
      break;
    case 'getCells':
      validateGetCells(params);
      break;
    case 'addWorksheet':
      validateAddWorksheet(params);
      break;
    case 'deleteWorksheet':
      validateDeleteWorksheet(params);
      break;
    case 'appendValues':
      validateAppendValues(params);
      break;
    case 'clearCells':
      validateClearCells(params);
      break;
    case 'formatCells':
      validateFormatCells(params);
      break;
    case 'listSpreadsheets':
      validateListSpreadsheets(params);
      break;
    case 'batchUpdate':
      validateBatchUpdate(params);
      break;
    case 'insertRows':
      validateInsertRows(params);
      break;
    case 'deleteRows':
      validateDeleteRows(params);
      break;
    case 'copySheet':
      validateCopySheet(params);
      break;
    case 'getSheetMetadata':
      validateGetSheetMetadata(params);
      break;
    default:
      console.warn(`⚠️  No validation defined for operation: ${operation}`);
  }
}

/**
 * Validate create spreadsheet parameters
 */
function validateCreateSpreadsheet(params) {
  const { title, sheets } = params;
  
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }
  
  if (title.length > 400) {
    throw new Error('Title must be 400 characters or less');
  }
  
  if (sheets && !Array.isArray(sheets)) {
    throw new Error('Sheets must be an array');
  }
  
  if (sheets) {
    sheets.forEach((sheet, index) => {
      if (!sheet.title || typeof sheet.title !== 'string') {
        throw new Error(`Sheet ${index + 1}: title is required and must be a string`);
      }
      
      if (sheet.rows && (typeof sheet.rows !== 'number' || sheet.rows < 1 || sheet.rows > 5000000)) {
        throw new Error(`Sheet ${index + 1}: rows must be a number between 1 and 5,000,000`);
      }
      
      if (sheet.cols && (typeof sheet.cols !== 'number' || sheet.cols < 1 || sheet.cols > 18278)) {
        throw new Error(`Sheet ${index + 1}: cols must be a number between 1 and 18,278`);
      }
    });
  }
}

/**
 * Validate get spreadsheet parameters
 */
function validateGetSpreadsheet(params) {
  const { spreadsheetId, includeData } = params;
  
  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    throw new Error('Spreadsheet ID is required and must be a string');
  }
  
  if (!isValidSpreadsheetId(spreadsheetId)) {
    throw new Error('Invalid spreadsheet ID format');
  }
  
  if (includeData !== undefined && typeof includeData !== 'boolean') {
    throw new Error('includeData must be a boolean');
  }
}

/**
 * Validate update cells parameters
 */
function validateUpdateCells(params) {
  const { spreadsheetId, range, values, valueInputOption } = params;
  
  validateSpreadsheetId(spreadsheetId);
  validateA1Range(range);
  
  if (!values || !Array.isArray(values)) {
    throw new Error('Values is required and must be an array');
  }
  
  if (values.length === 0) {
    throw new Error('Values array cannot be empty');
  }
  
  values.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) {
      throw new Error(`Row ${rowIndex + 1} must be an array`);
    }
  });
  
  if (valueInputOption && !['RAW', 'USER_ENTERED'].includes(valueInputOption)) {
    throw new Error('valueInputOption must be either "RAW" or "USER_ENTERED"');
  }
}

/**
 * Validate get cells parameters
 */
function validateGetCells(params) {
  const { spreadsheetId, range, valueRenderOption } = params;
  
  validateSpreadsheetId(spreadsheetId);
  validateA1Range(range);
  
  if (valueRenderOption && !['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'].includes(valueRenderOption)) {
    throw new Error('valueRenderOption must be "FORMATTED_VALUE", "UNFORMATTED_VALUE", or "FORMULA"');
  }
}

/**
 * Validate add worksheet parameters
 */
function validateAddWorksheet(params) {
  const { spreadsheetId, title, rows, cols } = params;
  
  validateSpreadsheetId(spreadsheetId);
  
  if (!title || typeof title !== 'string') {
    throw new Error('Worksheet title is required and must be a string');
  }
  
  if (title.length > 100) {
    throw new Error('Worksheet title must be 100 characters or less');
  }
  
  if (rows && (typeof rows !== 'number' || rows < 1 || rows > 5000000)) {
    throw new Error('Rows must be a number between 1 and 5,000,000');
  }
  
  if (cols && (typeof cols !== 'number' || cols < 1 || cols > 18278)) {
    throw new Error('Columns must be a number between 1 and 18,278');
  }
}

/**
 * Validate delete worksheet parameters
 */
function validateDeleteWorksheet(params) {
  const { spreadsheetId, sheetId } = params;
  
  validateSpreadsheetId(spreadsheetId);
  
  if (sheetId === undefined || typeof sheetId !== 'number') {
    throw new Error('Sheet ID is required and must be a number');
  }
  
  if (sheetId < 0) {
    throw new Error('Sheet ID must be a non-negative number');
  }
}

/**
 * Validate append values parameters
 */
function validateAppendValues(params) {
  const { spreadsheetId, range, values, valueInputOption } = params;
  
  validateSpreadsheetId(spreadsheetId);
  validateA1Range(range);
  
  if (!values || !Array.isArray(values)) {
    throw new Error('Values is required and must be an array');
  }
  
  if (values.length === 0) {
    throw new Error('Values array cannot be empty');
  }
  
  values.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) {
      throw new Error(`Row ${rowIndex + 1} must be an array`);
    }
  });
  
  if (valueInputOption && !['RAW', 'USER_ENTERED'].includes(valueInputOption)) {
    throw new Error('valueInputOption must be either "RAW" or "USER_ENTERED"');
  }
}

/**
 * Validate clear cells parameters
 */
function validateClearCells(params) {
  const { spreadsheetId, range } = params;
  
  validateSpreadsheetId(spreadsheetId);
  validateA1Range(range);
}

/**
 * Validate format cells parameters
 */
function validateFormatCells(params) {
  const { spreadsheetId, range, format } = params;
  
  validateSpreadsheetId(spreadsheetId);
  validateA1Range(range);
  
  if (!format || typeof format !== 'object') {
    throw new Error('Format is required and must be an object');
  }
  
  // Validate background color if provided
  if (format.backgroundColor) {
    const { red, green, blue } = format.backgroundColor;
    if (red !== undefined && (typeof red !== 'number' || red < 0 || red > 1)) {
      throw new Error('Background color red value must be a number between 0 and 1');
    }
    if (green !== undefined && (typeof green !== 'number' || green < 0 || green > 1)) {
      throw new Error('Background color green value must be a number between 0 and 1');
    }
    if (blue !== undefined && (typeof blue !== 'number' || blue < 0 || blue > 1)) {
      throw new Error('Background color blue value must be a number between 0 and 1');
    }
  }
  
  // Validate text format if provided
  if (format.textFormat) {
    const { bold, italic, fontSize } = format.textFormat;
    if (bold !== undefined && typeof bold !== 'boolean') {
      throw new Error('Text format bold must be a boolean');
    }
    if (italic !== undefined && typeof italic !== 'boolean') {
      throw new Error('Text format italic must be a boolean');
    }
    if (fontSize !== undefined && (typeof fontSize !== 'number' || fontSize < 6 || fontSize > 400)) {
      throw new Error('Font size must be a number between 6 and 400');
    }
  }
}

/**
 * Validate list spreadsheets parameters
 */
function validateListSpreadsheets(params) {
  const { maxResults, query } = params;
  
  if (maxResults && (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 100)) {
    throw new Error('maxResults must be a number between 1 and 100');
  }
  
  if (query && typeof query !== 'string') {
    throw new Error('Query must be a string');
  }
}

/**
 * Validate batch update parameters
 */
function validateBatchUpdate(params) {
  const { spreadsheetId, requests } = params;
  
  validateSpreadsheetId(spreadsheetId);
  
  if (!requests || !Array.isArray(requests)) {
    throw new Error('Requests is required and must be an array');
  }
  
  if (requests.length === 0) {
    throw new Error('Requests array cannot be empty');
  }
  
  if (requests.length > 100) {
    throw new Error('Maximum 100 requests allowed in batch update');
  }
  
  requests.forEach((request, index) => {
    if (!request || typeof request !== 'object') {
      throw new Error(`Request ${index + 1} must be an object`);
    }
  });
}

/**
 * Validate insert rows parameters
 */
function validateInsertRows(params) {
  const { spreadsheetId, sheetId, startIndex, endIndex } = params;
  
  validateSpreadsheetId(spreadsheetId);
  
  if (sheetId === undefined || typeof sheetId !== 'number') {
    throw new Error('Sheet ID is required and must be a number');
  }
  
  if (startIndex === undefined || typeof startIndex !== 'number') {
    throw new Error('Start index is required and must be a number');
  }
  
  if (endIndex === undefined || typeof endIndex !== 'number') {
    throw new Error('End index is required and must be a number');
  }
  
  if (startIndex < 0) {
    throw new Error('Start index must be non-negative');
  }
  
  if (endIndex <= startIndex) {
    throw new Error('End index must be greater than start index');
  }
}

/**
 * Validate delete rows parameters
 */
function validateDeleteRows(params) {
  validateInsertRows(params); // Same validation as insert rows
}

/**
 * Validate copy sheet parameters
 */
function validateCopySheet(params) {
  const { sourceSpreadsheetId, sourceSheetId, destinationSpreadsheetId } = params;
  
  validateSpreadsheetId(sourceSpreadsheetId, 'Source spreadsheet ID');
  validateSpreadsheetId(destinationSpreadsheetId, 'Destination spreadsheet ID');
  
  if (sourceSheetId === undefined || typeof sourceSheetId !== 'number') {
    throw new Error('Source sheet ID is required and must be a number');
  }
  
  if (sourceSheetId < 0) {
    throw new Error('Source sheet ID must be non-negative');
  }
}

/**
 * Validate get sheet metadata parameters
 */
function validateGetSheetMetadata(params) {
  const { spreadsheetId } = params;
  
  validateSpreadsheetId(spreadsheetId);
}

/**
 * Validate spreadsheet ID
 */
function validateSpreadsheetId(spreadsheetId, fieldName = 'Spreadsheet ID') {
  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  
  if (!isValidSpreadsheetId(spreadsheetId)) {
    throw new Error(`Invalid ${fieldName.toLowerCase()} format`);
  }
}

/**
 * Validate A1 notation range
 */
function validateA1Range(range) {
  if (!range || typeof range !== 'string') {
    throw new Error('Range is required and must be a string');
  }
  
  if (!isValidA1Range(range)) {
    throw new Error('Invalid A1 notation range format (e.g., "Sheet1!A1:B2")');
  }
}

/**
 * Check if spreadsheet ID format is valid
 */
function isValidSpreadsheetId(id) {
  // Google Sheets ID pattern: typically 44 characters, alphanumeric and some special chars
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(id) && id.length >= 40;
}

/**
 * Check if A1 notation range is valid
 */
function isValidA1Range(range) {
  // Basic A1 notation patterns:
  // "A1" - single cell
  // "A1:B2" - range
  // "Sheet1!A1" - sheet with cell
  // "Sheet1!A1:B2" - sheet with range
  // "'Sheet Name'!A1:B2" - quoted sheet name with range
  
  const patterns = [
    /^'?[^'!]+!?[A-Z]+\d+$/,                    // Sheet!A1
    /^'?[^'!]+!?[A-Z]+\d+:[A-Z]+\d+$/,         // Sheet!A1:B2
    /^[A-Z]+\d+$/,                             // A1
    /^[A-Z]+\d+:[A-Z]+\d+$/,                   // A1:B2
    /^'[^']+!'?[A-Z]+\d+$/,                    // 'Sheet Name'!A1
    /^'[^']+!'?[A-Z]+\d+:[A-Z]+\d+$/,          // 'Sheet Name'!A1:B2
    /^[A-Z]+:[A-Z]+$/,                         // A:B (entire columns)
    /^\d+:\d+$/,                               // 1:2 (entire rows)
    /^'?[^'!]+![A-Z]+:[A-Z]+$/,                // Sheet!A:B
    /^'?[^'!]+!\d+:\d+$/                       // Sheet!1:2
  ];
  
  return patterns.some(pattern => pattern.test(range));
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input.trim().substring(0, maxLength);
}

/**
 * Validate email address format
 */
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export {
  validateSheetsInput,
  validateSpreadsheetId,
  validateA1Range,
  isValidSpreadsheetId,
  isValidA1Range,
  sanitizeString,
  validateEmail
};