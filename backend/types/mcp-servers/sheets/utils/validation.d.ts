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
export function validateSheetsInput(operation: string, params: Object): void;
/**
 * Validate spreadsheet ID
 */
export function validateSpreadsheetId(spreadsheetId: any, fieldName?: string): void;
/**
 * Validate A1 notation range
 */
export function validateA1Range(range: any): void;
/**
 * Check if spreadsheet ID format is valid
 */
export function isValidSpreadsheetId(id: any): boolean;
/**
 * Check if A1 notation range is valid
 */
export function isValidA1Range(range: any): boolean;
/**
 * Sanitize string input
 */
export function sanitizeString(input: any, maxLength?: number): string;
/**
 * Validate email address format
 */
export function validateEmail(email: any): boolean;
//# sourceMappingURL=validation.d.ts.map