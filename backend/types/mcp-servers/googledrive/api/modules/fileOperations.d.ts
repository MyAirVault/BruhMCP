/**
 * Upload a file to Google Drive
 * @param {Object} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Upload result
 */
export function uploadFile(args: Object, bearerToken: string): Object;
/**
 * Download a file from Google Drive
 * @param {Object} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Download result
 */
export function downloadFile(args: Object, bearerToken: string): Object;
/**
 * Get file metadata
 * @param {Object} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} File metadata
 */
export function getFileMetadata(args: Object, bearerToken: string): Object;
//# sourceMappingURL=fileOperations.d.ts.map