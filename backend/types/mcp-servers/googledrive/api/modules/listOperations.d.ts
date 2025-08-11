/**
 * List files in Google Drive
 * @param {{
 *   parentFolderId?: string,
 *   pageSize?: number,
 *   pageToken?: string,
 *   showTrashed?: boolean,
 *   orderBy?: string
 * }} args - List arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} List result
 */
export function listFiles(args: {
    parentFolderId?: string;
    pageSize?: number;
    pageToken?: string;
    showTrashed?: boolean;
    orderBy?: string;
}, bearerToken: string): Promise<Object>;
/**
 * Search files in Google Drive
 * @param {{
 *   query?: string,
 *   name?: string,
 *   mimeType?: string,
 *   parentFolderId?: string,
 *   pageSize?: number,
 *   pageToken?: string,
 *   showTrashed?: boolean,
 *   orderBy?: string,
 *   searchInContent?: boolean
 * }} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Search result
 */
export function searchFiles(args: {
    query?: string;
    name?: string;
    mimeType?: string;
    parentFolderId?: string;
    pageSize?: number;
    pageToken?: string;
    showTrashed?: boolean;
    orderBy?: string;
    searchInContent?: boolean;
}, bearerToken: string): Promise<Object>;
/**
 * Get Google Drive storage information
 * @param {Object} _args - Arguments (unused but kept for consistency)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object|null>} Drive info
 */
export function getDriveInfo(_args: Object, bearerToken: string): Promise<Object | null>;
//# sourceMappingURL=listOperations.d.ts.map