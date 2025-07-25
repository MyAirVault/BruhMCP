// @ts-check

/**
 * Type definitions for Google Sheets MCP Server
 * Common types used across the Sheets implementation
 */

/**
 * @typedef {string|number|boolean|null} CellValue
 * Represents a single cell value in Google Sheets
 */

/**
 * @typedef {CellValue[][]} CellGrid
 * Represents a 2D array of cell values
 */

/**
 * @typedef {Object} GoogleSheetsCredentials
 * @property {string} clientId - OAuth client ID
 * @property {string} clientSecret - OAuth client secret
 * @property {string} [accessToken] - Current access token
 * @property {string} [refreshToken] - Refresh token
 * @property {number} [expiresAt] - Token expiration timestamp
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {number} code - HTTP error code
 * @property {string} message - Error message
 * @property {string} [details] - Additional error details
 * @property {string} [type] - Error type (e.g., 'authentication', 'validation')
 */

/**
 * @typedef {Object} SheetProperties
 * @property {number} sheetId - Unique sheet ID
 * @property {string} title - Sheet title
 * @property {number} index - Sheet index in spreadsheet
 * @property {string} sheetType - Type of sheet (GRID, etc.)
 * @property {GridProperties} gridProperties - Grid properties
 */

/**
 * @typedef {Object} GridProperties
 * @property {number} rowCount - Number of rows
 * @property {number} columnCount - Number of columns
 * @property {number} [frozenRowCount] - Number of frozen rows
 * @property {number} [frozenColumnCount] - Number of frozen columns
 */

/**
 * @typedef {Object} SpreadsheetProperties
 * @property {string} title - Spreadsheet title
 * @property {string} locale - Spreadsheet locale
 * @property {string} timeZone - Spreadsheet timezone
 * @property {string} [autoRecalc] - Auto recalculation setting
 */

/**
 * @typedef {Object} UpdateCellsResponse
 * @property {string} spreadsheetId - ID of updated spreadsheet
 * @property {string} updatedRange - Range that was updated
 * @property {number} updatedRows - Number of rows updated
 * @property {number} updatedColumns - Number of columns updated
 * @property {number} updatedCells - Total cells updated
 */

/**
 * @typedef {Object} GetCellsResponse
 * @property {string} range - Range of cells retrieved
 * @property {string} majorDimension - Row or column major
 * @property {CellGrid} values - Cell values
 */

/**
 * @typedef {Object} CreateSpreadsheetResponse
 * @property {string} spreadsheetId - ID of created spreadsheet
 * @property {SpreadsheetProperties} properties - Spreadsheet properties
 * @property {SheetProperties[]} sheets - Array of sheets
 * @property {string} spreadsheetUrl - URL to access spreadsheet
 */

/**
 * @typedef {Object} BatchUpdateRequest
 * @property {Request[]} requests - Array of update requests
 * @property {boolean} [includeSpreadsheetInResponse] - Include full spreadsheet in response
 * @property {string} [responseRanges] - Ranges to include in response
 * @property {boolean} [responseIncludeGridData] - Include grid data in response
 */

/**
 * @typedef {Object} Request
 * @property {Object} [updateCells] - Update cells request
 * @property {Object} [addSheet] - Add sheet request
 * @property {Object} [deleteSheet] - Delete sheet request
 * @property {Object} [updateSheetProperties] - Update sheet properties request
 * @property {Object} [copyPaste] - Copy paste request
 * @property {Object} [cutPaste] - Cut paste request
 * @property {Object} [repeatCell] - Repeat cell request
 */

/**
 * @typedef {Object} ValueRange
 * @property {string} range - A1 notation range
 * @property {string} majorDimension - ROWS or COLUMNS
 * @property {CellGrid} values - Cell values
 */

/**
 * @typedef {'FORMATTED_VALUE'|'UNFORMATTED_VALUE'|'FORMULA'} ValueRenderOption
 * How values should be rendered in output
 */

/**
 * @typedef {'RAW'|'USER_ENTERED'} ValueInputOption
 * How input data should be interpreted
 */

/**
 * @typedef {Object} BorderStyle
 * @property {string} [style] - Border style
 * @property {Color} [color] - Border color
 * @property {number} [width] - Border width
 */

/**
 * @typedef {Object} Borders
 * @property {BorderStyle} [top] - Top border
 * @property {BorderStyle} [bottom] - Bottom border
 * @property {BorderStyle} [left] - Left border
 * @property {BorderStyle} [right] - Right border
 */

/**
 * @typedef {Object} CellFormat
 * @property {TextFormat} [textFormat] - Text formatting
 * @property {Color} [backgroundColor] - Background color
 * @property {Borders} [borders] - Cell borders
 * @property {string} [horizontalAlignment] - Horizontal alignment
 * @property {string} [verticalAlignment] - Vertical alignment
 * @property {boolean} [wrapStrategy] - Text wrapping
 */

/**
 * @typedef {Object} TextFormat
 * @property {Color} [foregroundColor] - Text color
 * @property {string} [fontFamily] - Font family
 * @property {number} [fontSize] - Font size
 * @property {boolean} [bold] - Bold text
 * @property {boolean} [italic] - Italic text
 * @property {boolean} [strikethrough] - Strikethrough text
 * @property {boolean} [underline] - Underline text
 */

/**
 * @typedef {Object} Color
 * @property {number} [red] - Red component (0-1)
 * @property {number} [green] - Green component (0-1)
 * @property {number} [blue] - Blue component (0-1)
 * @property {number} [alpha] - Alpha component (0-1)
 */

export const Types = {};