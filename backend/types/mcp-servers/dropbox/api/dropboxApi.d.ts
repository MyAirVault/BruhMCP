/**
 * Convenience functions for common operations
 */
/**
 * List files in a directory
 */
export function listFiles(args: any, bearerToken: any): Promise<{
    message: string;
    entries: any;
    has_more: any;
    cursor: any;
}>;
/**
 * Get file metadata
 */
export function getFileMetadata(args: any, bearerToken: any): Promise<{
    message: string;
    metadata: unknown;
}>;
/**
 * Create a new folder
 */
export function createFolder(args: any, bearerToken: any): Promise<{
    message: string;
    metadata: any;
}>;
/**
 * Delete a file or folder
 */
export function deleteFile(args: any, bearerToken: any): Promise<{
    message: string;
    metadata: any;
}>;
/**
 * Move a file or folder
 */
export function moveFile(args: any, bearerToken: any): Promise<{
    message: string;
    metadata: any;
}>;
/**
 * Copy a file or folder
 */
export function copyFile(args: any, bearerToken: any): Promise<{
    message: string;
    metadata: any;
}>;
/**
 * Search files
 */
export function searchFiles(args: any, bearerToken: any): Promise<{
    message: string;
    matches: any;
    has_more: any;
}>;
/**
 * Get shared links
 */
export function getSharedLinks(args: any, bearerToken: any): Promise<{
    message: string;
    links: any;
}>;
/**
 * Create shared link
 */
export function createSharedLink(args: any, bearerToken: any): Promise<{
    message: string;
    url: any;
    link: unknown;
}>;
/**
 * Get space usage
 */
export function getSpaceUsage(args: any, bearerToken: any): Promise<{
    message: string;
    used: any;
    allocated: any;
    usage_percent: string;
}>;
/**
 * Download file
 */
export function downloadFile(args: any, bearerToken: any): Promise<{
    message: string;
    size: any;
    metadata: any;
}>;
/**
 * Upload file
 */
export function uploadFile(args: any, bearerToken: any): Promise<{
    message: string;
    size: any;
    metadata: unknown;
}>;
/**
 * Base Dropbox API class
 * @class
 */
export class DropboxAPI {
    /**
     * Create a new Dropbox API instance
     * @param {string} bearerToken - OAuth Bearer token for authentication
     */
    constructor(bearerToken: string);
    bearerToken: string;
    baseUrl: string;
    contentUrl: string;
    /**
     * Make authenticated API request
     * @param {string} endpoint - API endpoint path
     * @param {Object} options - Request options
     * @returns {Promise<Response>} Response from Dropbox API
     * @throws {Error} If request fails or authentication is invalid
     */
    makeRequest(endpoint: string, options?: Object): Promise<Response>;
    /**
     * List files and folders
     */
    listFiles(path?: string, recursive?: boolean, limit?: number): Promise<unknown>;
    /**
     * Get file metadata
     */
    getFileMetadata(path: any): Promise<unknown>;
    /**
     * Create folder
     */
    createFolder(path: any, autorename?: boolean): Promise<unknown>;
    /**
     * Delete file or folder
     */
    deleteFile(path: any): Promise<unknown>;
    /**
     * Move file or folder
     */
    moveFile(fromPath: any, toPath: any, autorename?: boolean): Promise<unknown>;
    /**
     * Copy file or folder
     */
    copyFile(fromPath: any, toPath: any, autorename?: boolean): Promise<unknown>;
    /**
     * Search files
     */
    searchFiles(query: any, path?: string, maxResults?: number, fileStatus?: string): Promise<unknown>;
    /**
     * Get shared links
     */
    getSharedLinks(path: any): Promise<unknown>;
    /**
     * Create shared link
     */
    createSharedLink(path: any, shortUrl?: boolean): Promise<unknown>;
    /**
     * Get space usage
     */
    getSpaceUsage(): Promise<unknown>;
    /**
     * Download file
     */
    downloadFile(path: any): Promise<{
        data: import("stream/web").ReadableStream<any> | null;
        metadata: any;
    }>;
    /**
     * Upload file
     */
    uploadFile(path: any, content: any, overwrite?: boolean): Promise<unknown>;
}
//# sourceMappingURL=dropboxApi.d.ts.map