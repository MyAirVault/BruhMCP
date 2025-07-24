/**
 * Create a folder in Google Drive
 * @param {Object} args - Folder creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created folder info
 */
export function createFolder(args: Object, bearerToken: string): Object;
/**
 * Delete a file or folder from Google Drive
 * @param {Object} args - Deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Deletion result
 */
export function deleteFile(args: Object, bearerToken: string): Object;
/**
 * Copy a file in Google Drive
 * @param {Object} args - Copy arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Copied file info
 */
export function copyFile(args: Object, bearerToken: string): Object;
/**
 * Move a file to a different folder in Google Drive
 * @param {Object} args - Move arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Moved file info
 */
export function moveFile(args: Object, bearerToken: string): Object;
//# sourceMappingURL=fileManagement.d.ts.map