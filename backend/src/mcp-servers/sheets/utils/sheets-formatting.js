/**
 * Google Sheets response formatting utilities
 * Provides consistent response formatting for Google Sheets API operations
 * Based on Gmail MCP implementation patterns
 */

/**
 * Format response for different Google Sheets operations
 * @param {string} operation - Operation type
 * @param {Object} data - Raw API response data
 * @returns {string} Formatted response string
 */
function formatSheetsResponse(operation, data) {
  try {
    switch (operation) {
      case 'createSpreadsheet':
        return formatCreateSpreadsheetResponse(data);
      case 'getSpreadsheet':
        return formatGetSpreadsheetResponse(data);
      case 'updateCells':
        return formatUpdateCellsResponse(data);
      case 'getCells':
        return formatGetCellsResponse(data);
      case 'addWorksheet':
        return formatAddWorksheetResponse(data);
      case 'deleteWorksheet':
        return formatDeleteWorksheetResponse(data);
      case 'appendValues':
        return formatAppendValuesResponse(data);
      case 'clearCells':
        return formatClearCellsResponse(data);
      case 'formatCells':
        return formatFormatCellsResponse(data);
      case 'listSpreadsheets':
        return formatListSpreadsheetsResponse(data);
      case 'batchUpdate':
        return formatBatchUpdateResponse(data);
      case 'insertRows':
        return formatInsertRowsResponse(data);
      case 'deleteRows':
        return formatDeleteRowsResponse(data);
      case 'copySheet':
        return formatCopySheetResponse(data);
      case 'getSheetMetadata':
        return formatGetSheetMetadataResponse(data);
      default:
        return formatGenericResponse(data);
    }
  } catch (error) {
    console.error('❌ Error formatting Sheets response:', error);
    return `Error formatting response: ${error.message}\n\nRaw data: ${JSON.stringify(data, null, 2)}`;
  }
}

/**
 * Format create spreadsheet response
 */
function formatCreateSpreadsheetResponse(data) {
  const { spreadsheetId, properties, spreadsheetUrl, sheets } = data;
  
  let response = `✅ Spreadsheet created successfully!\n\n`;
  response += `📊 Spreadsheet Details:\n`;
  response += `• ID: ${spreadsheetId}\n`;
  response += `• Title: ${properties.title}\n`;
  response += `• URL: ${spreadsheetUrl}\n`;
  response += `• Locale: ${properties.locale || 'en_US'}\n`;
  response += `• Time Zone: ${properties.timeZone || 'GMT'}\n\n`;
  
  if (sheets && sheets.length > 0) {
    response += `📋 Sheets created:\n`;
    sheets.forEach((sheet, index) => {
      response += `${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows × ${sheet.properties.gridProperties.columnCount} columns)\n`;
    });
  }
  
  return response;
}

/**
 * Format get spreadsheet response
 */
function formatGetSpreadsheetResponse(data) {
  const { spreadsheetId, properties, sheets } = data;
  
  let response = `📊 Spreadsheet Information:\n\n`;
  response += `• ID: ${spreadsheetId}\n`;
  response += `• Title: ${properties.title}\n`;
  response += `• Locale: ${properties.locale || 'en_US'}\n`;
  response += `• Time Zone: ${properties.timeZone || 'GMT'}\n\n`;
  
  if (sheets && sheets.length > 0) {
    response += `📋 Sheets (${sheets.length}):\n`;
    sheets.forEach((sheet, index) => {
      const props = sheet.properties;
      response += `${index + 1}. ${props.title}\n`;
      response += `   • Sheet ID: ${props.sheetId}\n`;
      response += `   • Dimensions: ${props.gridProperties.rowCount} rows × ${props.gridProperties.columnCount} columns\n`;
      response += `   • Type: ${props.sheetType || 'GRID'}\n\n`;
    });
  }
  
  return response;
}

/**
 * Format update cells response
 */
function formatUpdateCellsResponse(data) {
  const { updatedRows, updatedColumns, updatedCells, updatedRange } = data;
  
  let response = `✅ Cells updated successfully!\n\n`;
  response += `📊 Update Summary:\n`;
  response += `• Range: ${updatedRange}\n`;
  response += `• Cells updated: ${updatedCells || 0}\n`;
  response += `• Rows affected: ${updatedRows || 0}\n`;
  response += `• Columns affected: ${updatedColumns || 0}\n`;
  
  return response;
}

/**
 * Format get cells response
 */
function formatGetCellsResponse(data) {
  const { range, majorDimension, values } = data;
  
  let response = `📊 Cell Values Retrieved:\n\n`;
  response += `• Range: ${range}\n`;
  response += `• Dimension: ${majorDimension || 'ROWS'}\n\n`;
  
  if (values && values.length > 0) {
    response += `📋 Data (${values.length} rows):\n`;
    values.forEach((row, rowIndex) => {
      response += `Row ${rowIndex + 1}: [${row.join(', ')}]\n`;
    });
  } else {
    response += `ℹ️  No data found in the specified range.`;
  }
  
  return response;
}

/**
 * Format add worksheet response
 */
function formatAddWorksheetResponse(data) {
  const sheet = data.replies?.[0]?.addSheet?.properties;
  
  if (!sheet) {
    return `✅ Worksheet added successfully!`;
  }
  
  let response = `✅ Worksheet added successfully!\n\n`;
  response += `📋 New Sheet Details:\n`;
  response += `• Title: ${sheet.title}\n`;
  response += `• Sheet ID: ${sheet.sheetId}\n`;
  response += `• Dimensions: ${sheet.gridProperties.rowCount} rows × ${sheet.gridProperties.columnCount} columns\n`;
  response += `• Type: ${sheet.sheetType || 'GRID'}\n`;
  
  return response;
}

/**
 * Format delete worksheet response
 */
function formatDeleteWorksheetResponse(data) {
  return `✅ Worksheet deleted successfully!`;
}

/**
 * Format append values response
 */
function formatAppendValuesResponse(data) {
  const { updates } = data;
  
  let response = `✅ Values appended successfully!\n\n`;
  
  if (updates) {
    response += `📊 Append Summary:\n`;
    response += `• Range: ${updates.updatedRange}\n`;
    response += `• Cells updated: ${updates.updatedCells || 0}\n`;
    response += `• Rows added: ${updates.updatedRows || 0}\n`;
    response += `• Columns affected: ${updates.updatedColumns || 0}\n`;
  }
  
  return response;
}

/**
 * Format clear cells response
 */
function formatClearCellsResponse(data) {
  const { clearedRange } = data;
  
  let response = `✅ Cells cleared successfully!\n\n`;
  response += `📊 Clear Summary:\n`;
  response += `• Range cleared: ${clearedRange}\n`;
  
  return response;
}

/**
 * Format format cells response
 */
function formatFormatCellsResponse(data) {
  return `✅ Cell formatting applied successfully!`;
}

/**
 * Format list spreadsheets response
 */
function formatListSpreadsheetsResponse(data) {
  const { files } = data;
  
  let response = `📊 Your Google Sheets Spreadsheets:\n\n`;
  
  if (!files || files.length === 0) {
    response += `ℹ️  No spreadsheets found.`;
    return response;
  }
  
  response += `Found ${files.length} spreadsheet(s):\n\n`;
  
  files.forEach((file, index) => {
    response += `${index + 1}. ${file.name}\n`;
    response += `   • ID: ${file.id}\n`;
    response += `   • Created: ${new Date(file.createdTime).toLocaleDateString()}\n`;
    response += `   • Modified: ${new Date(file.modifiedTime).toLocaleDateString()}\n`;
    if (file.owners && file.owners.length > 0) {
      response += `   • Owner: ${file.owners[0].displayName || file.owners[0].emailAddress}\n`;
    }
    if (file.webViewLink) {
      response += `   • Link: ${file.webViewLink}\n`;
    }
    response += `\n`;
  });
  
  return response;
}

/**
 * Format batch update response
 */
function formatBatchUpdateResponse(data) {
  const { replies } = data;
  
  let response = `✅ Batch update completed successfully!\n\n`;
  response += `📊 Operations Summary:\n`;
  response += `• Total operations: ${replies ? replies.length : 0}\n`;
  
  if (replies && replies.length > 0) {
    response += `\n📋 Operation Results:\n`;
    replies.forEach((reply, index) => {
      const operation = Object.keys(reply)[0];
      response += `${index + 1}. ${operation}: Success\n`;
    });
  }
  
  return response;
}

/**
 * Format insert rows response
 */
function formatInsertRowsResponse(data) {
  return `✅ Rows inserted successfully!`;
}

/**
 * Format delete rows response
 */
function formatDeleteRowsResponse(data) {
  return `✅ Rows deleted successfully!`;
}

/**
 * Format copy sheet response
 */
function formatCopySheetResponse(data) {
  const { sheetId, title } = data;
  
  let response = `✅ Sheet copied successfully!\n\n`;
  response += `📋 New Sheet Details:\n`;
  response += `• Title: ${title}\n`;
  response += `• Sheet ID: ${sheetId}\n`;
  
  return response;
}

/**
 * Format get sheet metadata response
 */
function formatGetSheetMetadataResponse(data) {
  const { properties, sheets } = data;
  
  let response = `📊 Spreadsheet Metadata:\n\n`;
  response += `• Title: ${properties.title}\n`;
  response += `• Locale: ${properties.locale || 'en_US'}\n`;
  response += `• Time Zone: ${properties.timeZone || 'GMT'}\n\n`;
  
  if (sheets && sheets.length > 0) {
    response += `📋 Sheet Metadata (${sheets.length} sheets):\n`;
    sheets.forEach((sheet, index) => {
      const props = sheet.properties;
      response += `${index + 1}. ${props.title}\n`;
      response += `   • Sheet ID: ${props.sheetId}\n`;
      response += `   • Index: ${props.index}\n`;
      response += `   • Dimensions: ${props.gridProperties.rowCount} rows × ${props.gridProperties.columnCount} columns\n`;
      response += `   • Type: ${props.sheetType || 'GRID'}\n`;
      response += `   • Hidden: ${props.hidden ? 'Yes' : 'No'}\n\n`;
    });
  }
  
  return response;
}

/**
 * Format generic response for unknown operations
 */
function formatGenericResponse(data) {
  return `✅ Operation completed successfully!\n\nResponse data:\n${JSON.stringify(data, null, 2)}`;
}

/**
 * Format error response
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
function formatSheetsError(operation, error) {
  let response = `❌ Google Sheets ${operation} failed:\n\n`;
  response += `Error: ${error.message}\n`;
  
  // Add specific guidance for common errors
  if (error.message.includes('permissions')) {
    response += `\n💡 Tip: Check that you have permission to access this spreadsheet.`;
  } else if (error.message.includes('not found')) {
    response += `\n💡 Tip: Verify the spreadsheet ID or range is correct.`;
  } else if (error.message.includes('invalid')) {
    response += `\n💡 Tip: Check the format of your input parameters.`;
  }
  
  return response;
}

/**
 * Truncate response if too long
 * @param {string} response - Response string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated response
 */
function truncateResponse(response, maxLength = 4000) {
  if (response.length <= maxLength) {
    return response;
  }
  
  const truncated = response.substring(0, maxLength - 100);
  return `${truncated}\n\n... (Response truncated - ${response.length} total characters)`;
}

export {
  formatSheetsResponse,
  formatSheetsError,
  truncateResponse
};