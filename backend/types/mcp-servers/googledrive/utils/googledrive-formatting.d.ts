/**
 * Google Drive response formatting utilities
 * Standardizes Google Drive API responses for MCP protocol
 */
/**
 * Format file response for MCP protocol
 * @param {Object} file - Google Drive file object
 * @returns {Object} Formatted file response
 */
export function formatFileResponse(file: Object): Object;
/**
 * Format file list response
 * @param {Object} response - Google Drive files list response
 * @param {string} query - Optional search query
 * @returns {Object} Formatted file list
 */
export function formatFileListResponse(response: Object, query?: string): Object;
/**
 * Format upload response
 * @param {Object} response - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload response
 */
export function formatUploadResponse(response: Object, originalPath: string): Object;
/**
 * Format drive info response
 * @param {Object} about - Google Drive about response
 * @returns {Object} Formatted drive info
 */
export function formatDriveInfoResponse(about: Object): Object;
/**
 * Format file permissions
 * @param {Array} permissions - Array of permission objects
 * @returns {Object} Formatted permissions
 */
export function formatFilePermissions(permissions: any[]): Object;
/**
 * Format search results
 * @param {Object} response - Google Drive search response
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(response: Object, query: string): Object;
/**
 * Format upload result
 * @param {Object} uploadResponse - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload result
 */
export function formatUploadResult(uploadResponse: Object, originalPath: string): Object;
/**
 * Format error response
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error: Error, operation: string): Object;
/**
 * Format folder tree structure
 * @param {Array} files - Array of files and folders
 * @returns {Object} Formatted folder tree
 */
export function formatFolderTree(files: any[]): Object;
//# sourceMappingURL=googledrive-formatting.d.ts.map