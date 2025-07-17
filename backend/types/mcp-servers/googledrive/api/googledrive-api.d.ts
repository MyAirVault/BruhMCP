/**
 * List files and folders in Google Drive
 * @param {Object} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Files list result
 */
export function listFiles(args: Object, bearerToken: string): Object;
/**
 * Get metadata for a specific file or folder
 * @param {Object} args - File metadata arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File metadata result
 */
export function getFileMetadata(args: Object, bearerToken: string): Object;
/**
 * Download a file from Google Drive
 * @param {Object} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Download result
 */
export function downloadFile(args: Object, bearerToken: string): Object;
/**
 * Upload a file to Google Drive
 * @param {Object} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Upload result
 */
export function uploadFile(args: Object, bearerToken: string): Object;
/**
 * Create a new folder in Google Drive
 * @param {Object} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Folder creation result
 */
export function createFolder(args: Object, bearerToken: string): Object;
/**
 * Delete a file or folder from Google Drive
 * @param {Object} args - Delete arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Delete result
 */
export function deleteFile(args: Object, bearerToken: string): Object;
/**
 * Copy a file in Google Drive
 * @param {Object} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Copy result
 */
export function copyFile(args: Object, bearerToken: string): Object;
/**
 * Move a file to a different folder in Google Drive
 * @param {Object} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Move result
 */
export function moveFile(args: Object, bearerToken: string): Object;
/**
 * Share a file or folder with specific users or make it publicly accessible
 * @param {Object} args - Share arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Share result
 */
export function shareFile(args: Object, bearerToken: string): Object;
/**
 * Search for files in Google Drive using advanced search syntax
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export function searchFiles(args: Object, bearerToken: string): Object;
/**
 * Get sharing permissions for a file or folder
 * @param {Object} args - Permissions arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Permissions result
 */
export function getFilePermissions(args: Object, bearerToken: string): Object;
/**
 * Get information about the user's Google Drive storage
 * @param {Object} args - Drive info arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Drive info result
 */
export function getDriveInfo(args: Object, bearerToken: string): Object;
//# sourceMappingURL=googledrive-api.d.ts.map