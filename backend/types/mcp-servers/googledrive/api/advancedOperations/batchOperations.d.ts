/**
 * Batch delete multiple files
 * @param {string[]} fileIds - Array of file IDs to delete
 * @param {boolean} permanent - Whether to permanently delete (vs trash)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Batch operation results
 */
export function batchDeleteFiles(fileIds: string[], permanent: boolean | undefined, bearerToken: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: Array<any>;
    errors: Array<any>;
}>;
/**
 * Batch update file metadata
 * @param {Array<import('../types.js').UpdateMetadata>} updates - Array of {fileId, metadata} objects
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Batch operation results
 */
export function batchUpdateMetadata(updates: Array<import('../types.js').UpdateMetadata>, bearerToken: string): Promise<{
    processed: number;
    successful: number;
    failed: number;
    results: Array<any>;
    errors: Array<any>;
}>;
/**
 * Sync folder permissions recursively
 * @param {string} folderId - Source folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @param {import('../types.js').SyncParams} [params={}] - Sync parameters
 * @returns {Promise<{folderId: string, folderPermissions: number, processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Sync results
 */
export function syncFolderPermissions(folderId: string, bearerToken: string, params?: import("../types.js").SyncParams | undefined): Promise<{
    folderId: string;
    folderPermissions: number;
    processed: number;
    successful: number;
    failed: number;
    results: Array<any>;
    errors: Array<any>;
}>;
//# sourceMappingURL=batchOperations.d.ts.map