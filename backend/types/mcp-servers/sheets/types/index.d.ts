/**
 * Represents a single cell value in Google Sheets
 */
export type CellValue = string | number | boolean | null;
/**
 * Represents a 2D array of cell values
 */
export type CellGrid = CellValue[][];
export type GoogleSheetsCredentials = {
    /**
     * - OAuth client ID
     */
    clientId: string;
    /**
     * - OAuth client secret
     */
    clientSecret: string;
    /**
     * - Current access token
     */
    accessToken?: string | undefined;
    /**
     * - Refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - Token expiration timestamp
     */
    expiresAt?: number | undefined;
};
export type ErrorResponse = {
    /**
     * - HTTP error code
     */
    code: number;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Additional error details
     */
    details?: string | undefined;
    /**
     * - Error type (e.g., 'authentication', 'validation')
     */
    type?: string | undefined;
};
export type SheetProperties = {
    /**
     * - Unique sheet ID
     */
    sheetId: number;
    /**
     * - Sheet title
     */
    title: string;
    /**
     * - Sheet index in spreadsheet
     */
    index: number;
    /**
     * - Type of sheet (GRID, etc.)
     */
    sheetType: string;
    /**
     * - Grid properties
     */
    gridProperties: GridProperties;
};
export type GridProperties = {
    /**
     * - Number of rows
     */
    rowCount: number;
    /**
     * - Number of columns
     */
    columnCount: number;
    /**
     * - Number of frozen rows
     */
    frozenRowCount?: number | undefined;
    /**
     * - Number of frozen columns
     */
    frozenColumnCount?: number | undefined;
};
export type SpreadsheetProperties = {
    /**
     * - Spreadsheet title
     */
    title: string;
    /**
     * - Spreadsheet locale
     */
    locale: string;
    /**
     * - Spreadsheet timezone
     */
    timeZone: string;
    /**
     * - Auto recalculation setting
     */
    autoRecalc?: string | undefined;
};
export type UpdateCellsResponse = {
    /**
     * - ID of updated spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Range that was updated
     */
    updatedRange: string;
    /**
     * - Number of rows updated
     */
    updatedRows: number;
    /**
     * - Number of columns updated
     */
    updatedColumns: number;
    /**
     * - Total cells updated
     */
    updatedCells: number;
};
export type GetCellsResponse = {
    /**
     * - Range of cells retrieved
     */
    range: string;
    /**
     * - Row or column major
     */
    majorDimension: string;
    /**
     * - Cell values
     */
    values: CellGrid;
};
export type CreateSpreadsheetResponse = {
    /**
     * - ID of created spreadsheet
     */
    spreadsheetId: string;
    /**
     * - Spreadsheet properties
     */
    properties: SpreadsheetProperties;
    /**
     * - Array of sheets
     */
    sheets: SheetProperties[];
    /**
     * - URL to access spreadsheet
     */
    spreadsheetUrl: string;
};
export type BatchUpdateRequest = {
    /**
     * - Array of update requests
     */
    requests: Request[];
    /**
     * - Include full spreadsheet in response
     */
    includeSpreadsheetInResponse?: boolean | undefined;
    /**
     * - Ranges to include in response
     */
    responseRanges?: string | undefined;
    /**
     * - Include grid data in response
     */
    responseIncludeGridData?: boolean | undefined;
};
export type Request = {
    /**
     * - Update cells request
     */
    updateCells?: Object | undefined;
    /**
     * - Add sheet request
     */
    addSheet?: Object | undefined;
    /**
     * - Delete sheet request
     */
    deleteSheet?: Object | undefined;
    /**
     * - Update sheet properties request
     */
    updateSheetProperties?: Object | undefined;
    /**
     * - Copy paste request
     */
    copyPaste?: Object | undefined;
    /**
     * - Cut paste request
     */
    cutPaste?: Object | undefined;
    /**
     * - Repeat cell request
     */
    repeatCell?: Object | undefined;
};
export type ValueRange = {
    /**
     * - A1 notation range
     */
    range: string;
    /**
     * - ROWS or COLUMNS
     */
    majorDimension: string;
    /**
     * - Cell values
     */
    values: CellGrid;
};
/**
 * How values should be rendered in output
 */
export type ValueRenderOption = 'FORMATTED_VALUE' | 'UNFORMATTED_VALUE' | 'FORMULA';
/**
 * How input data should be interpreted
 */
export type ValueInputOption = 'RAW' | 'USER_ENTERED';
export type BorderStyle = {
    /**
     * - Border style
     */
    style?: string | undefined;
    /**
     * - Border color
     */
    color?: Color | undefined;
    /**
     * - Border width
     */
    width?: number | undefined;
};
export type Borders = {
    /**
     * - Top border
     */
    top?: BorderStyle | undefined;
    /**
     * - Bottom border
     */
    bottom?: BorderStyle | undefined;
    /**
     * - Left border
     */
    left?: BorderStyle | undefined;
    /**
     * - Right border
     */
    right?: BorderStyle | undefined;
};
export type CellFormat = {
    /**
     * - Text formatting
     */
    textFormat?: TextFormat | undefined;
    /**
     * - Background color
     */
    backgroundColor?: Color | undefined;
    /**
     * - Cell borders
     */
    borders?: Borders | undefined;
    /**
     * - Horizontal alignment
     */
    horizontalAlignment?: string | undefined;
    /**
     * - Vertical alignment
     */
    verticalAlignment?: string | undefined;
    /**
     * - Text wrapping
     */
    wrapStrategy?: boolean | undefined;
};
export type TextFormat = {
    /**
     * - Text color
     */
    foregroundColor?: Color | undefined;
    /**
     * - Font family
     */
    fontFamily?: string | undefined;
    /**
     * - Font size
     */
    fontSize?: number | undefined;
    /**
     * - Bold text
     */
    bold?: boolean | undefined;
    /**
     * - Italic text
     */
    italic?: boolean | undefined;
    /**
     * - Strikethrough text
     */
    strikethrough?: boolean | undefined;
    /**
     * - Underline text
     */
    underline?: boolean | undefined;
};
export type Color = {
    /**
     * - Red component (0-1)
     */
    red?: number | undefined;
    /**
     * - Green component (0-1)
     */
    green?: number | undefined;
    /**
     * - Blue component (0-1)
     */
    blue?: number | undefined;
    /**
     * - Alpha component (0-1)
     */
    alpha?: number | undefined;
};
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
export const Types: {};
//# sourceMappingURL=index.d.ts.map