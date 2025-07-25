/**
 * Upload a file to Google Drive
 * @param {{localPath: string, fileName: string, parentFolderId?: string, mimeType?: string}} args - Upload arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} Upload result
 */
export function uploadFile(args: {
    localPath: string;
    fileName: string;
    parentFolderId?: string;
    mimeType?: string;
}, bearerToken: string): Promise<any>;
/**
 * Download a file from Google Drive
 * @param {{fileId: string, localPath: string}} args - Download arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} Download result
 */
export function downloadFile(args: {
    fileId: string;
    localPath: string;
}, bearerToken: string): Promise<any>;
/**
 * Get file metadata
 * @param {{fileId: string}} args - Arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} File metadata
 */
export function getFileMetadata(args: {
    fileId: string;
}, bearerToken: string): Promise<any>;
//# sourceMappingURL=fileOperations.d.ts.map