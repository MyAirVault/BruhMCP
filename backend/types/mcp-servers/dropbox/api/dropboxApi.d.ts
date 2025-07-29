export type DropboxApiArgs = import('../../../types/dropbox.d.ts').DropboxApiArgs;
export type DropboxListFolderResponse = import('../../../types/dropbox.d.ts').DropboxListFolderResponse;
export type DropboxFileMetadata = import('../../../types/dropbox.d.ts').DropboxFileMetadata;
export type DropboxFolder = import('../../../types/dropbox.d.ts').DropboxFolder;
export type DropboxSearchResponse = import('../../../types/dropbox.d.ts').DropboxSearchResponse;
export type DropboxSearchMatch = import('../../../types/dropbox.d.ts').DropboxSearchMatch;
export type DropboxSharedLinksResponse = import('../../../types/dropbox.d.ts').DropboxSharedLinksResponse;
export type DropboxSharedLink = import('../../../types/dropbox.d.ts').DropboxSharedLink;
export type DropboxSpaceUsage = import('../../../types/dropbox.d.ts').DropboxSpaceUsage;
export type DropboxAPIError = import('../../../types/dropbox.d.ts').DropboxAPIError;
/**
 * @typedef {import('../../../types/dropbox.d.ts').DropboxApiArgs} DropboxApiArgs
 * @typedef {import('../../../types/dropbox.d.ts').DropboxListFolderResponse} DropboxListFolderResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxFileMetadata} DropboxFileMetadata
 * @typedef {import('../../../types/dropbox.d.ts').DropboxFolder} DropboxFolder
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSearchResponse} DropboxSearchResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSearchMatch} DropboxSearchMatch
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSharedLinksResponse} DropboxSharedLinksResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSharedLink} DropboxSharedLink
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSpaceUsage} DropboxSpaceUsage
 * @typedef {import('../../../types/dropbox.d.ts').DropboxAPIError} DropboxAPIError
 */
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
     * @param {RequestInit} options - Request options
     * @returns {Promise<Response>} Response from Dropbox API
     * @throws {Error} If request fails or authentication is invalid
     */
    makeRequest(endpoint: string, options?: RequestInit): Promise<Response>;
    /**
     * List files and folders
     * @param {string} path - Path to list files from
     * @param {boolean} recursive - Whether to list recursively
     * @param {number} limit - Maximum number of files to return
     * @returns {Promise<DropboxListFolderResponse>}
     */
    listFiles(path?: string, recursive?: boolean, limit?: number): Promise<DropboxListFolderResponse>;
    /**
     * Get file metadata
     * @param {string} path - Path to the file
     * @returns {Promise<DropboxFileMetadata>}
     */
    getFileMetadata(path: string): Promise<DropboxFileMetadata>;
    /**
     * Create folder
     * @param {string} path - Path where to create the folder
     * @param {boolean} autorename - Whether to autorename if folder exists
     * @returns {Promise<{metadata: DropboxFileMetadata}>}
     */
    createFolder(path: string, autorename?: boolean): Promise<{
        metadata: DropboxFileMetadata;
    }>;
    /**
     * Delete file or folder
     * @param {string} path - Path to the file or folder to delete
     * @returns {Promise<{metadata: DropboxFileMetadata}>}
     */
    deleteFile(path: string): Promise<{
        metadata: DropboxFileMetadata;
    }>;
    /**
     * Move file or folder
     * @param {string} fromPath - Source path
     * @param {string} toPath - Destination path
     * @param {boolean} autorename - Whether to autorename if destination exists
     * @returns {Promise<{metadata: DropboxFileMetadata}>}
     */
    moveFile(fromPath: string, toPath: string, autorename?: boolean): Promise<{
        metadata: DropboxFileMetadata;
    }>;
    /**
     * Copy file or folder
     * @param {string} fromPath - Source path
     * @param {string} toPath - Destination path
     * @param {boolean} autorename - Whether to autorename if destination exists
     * @returns {Promise<{metadata: DropboxFileMetadata}>}
     */
    copyFile(fromPath: string, toPath: string, autorename?: boolean): Promise<{
        metadata: DropboxFileMetadata;
    }>;
    /**
     * Search files
     * @param {string} query - Search query
     * @param {string} path - Path to search in
     * @param {number} maxResults - Maximum number of results
     * @param {string} fileStatus - File status filter
     * @returns {Promise<DropboxSearchResponse>}
     */
    searchFiles(query: string, path?: string, maxResults?: number, fileStatus?: string): Promise<DropboxSearchResponse>;
    /**
     * Get shared links
     * @param {string} path - Path to get shared links for
     * @returns {Promise<DropboxSharedLinksResponse>}
     */
    getSharedLinks(path: string): Promise<DropboxSharedLinksResponse>;
    /**
     * Create shared link
     * @param {string} path - Path to create shared link for
     * @param {boolean} shortUrl - Whether to create a short URL
     * @returns {Promise<DropboxSharedLink>}
     */
    createSharedLink(path: string, shortUrl?: boolean): Promise<DropboxSharedLink>;
    /**
     * Get space usage
     * @returns {Promise<DropboxSpaceUsage>}
     */
    getSpaceUsage(): Promise<DropboxSpaceUsage>;
    /**
     * Download file
     * @param {string} path - Path to the file to download
     * @returns {Promise<{data: ReadableStream, metadata: DropboxFileMetadata}>}
     */
    downloadFile(path: string): Promise<{
        data: ReadableStream;
        metadata: DropboxFileMetadata;
    }>;
    /**
     * Upload file
     * @param {string} path - Path where to upload the file
     * @param {string|Buffer} content - File content
     * @param {boolean} overwrite - Whether to overwrite if file exists
     * @returns {Promise<DropboxFileMetadata>}
     */
    uploadFile(path: string, content: string | Buffer, overwrite?: boolean): Promise<DropboxFileMetadata>;
}
/**
 * Convenience functions for common operations
 */
/**
 * List files in a directory
 * @param {DropboxApiArgs} args - Arguments for listing files
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, entries: (DropboxFileMetadata | DropboxFolder)[], has_more: boolean, cursor: string}>}
 */
export function listFiles(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    entries: (DropboxFileMetadata | DropboxFolder)[];
    has_more: boolean;
    cursor: string;
}>;
/**
 * Get file metadata
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export function getFileMetadata(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    metadata: DropboxFileMetadata;
}>;
/**
 * Create a new folder
 * @param {DropboxApiArgs} args - Arguments containing path and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export function createFolder(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    metadata: DropboxFileMetadata;
}>;
/**
 * Delete a file or folder
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export function deleteFile(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    metadata: DropboxFileMetadata;
}>;
/**
 * Move a file or folder
 * @param {DropboxApiArgs} args - Arguments containing fromPath, toPath, and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export function moveFile(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    metadata: DropboxFileMetadata;
}>;
/**
 * Copy a file or folder
 * @param {DropboxApiArgs} args - Arguments containing fromPath, toPath, and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export function copyFile(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    metadata: DropboxFileMetadata;
}>;
/**
 * Search files
 * @param {DropboxApiArgs} args - Arguments containing query, path, maxResults, and fileStatus
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, matches: DropboxSearchMatch[], has_more: boolean}>}
 */
export function searchFiles(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    matches: DropboxSearchMatch[];
    has_more: boolean;
}>;
/**
 * Get shared links
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, links: DropboxSharedLink[]}>}
 */
export function getSharedLinks(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    links: DropboxSharedLink[];
}>;
/**
 * Create shared link
 * @param {DropboxApiArgs} args - Arguments containing path and shortUrl option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, url: string, link: DropboxSharedLink}>}
 */
export function createSharedLink(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    url: string;
    link: DropboxSharedLink;
}>;
/**
 * Get space usage
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, used: number, allocated: number, usage_percent: string}>}
 */
export function getSpaceUsage(bearerToken: string): Promise<{
    message: string;
    used: number;
    allocated: number;
    usage_percent: string;
}>;
/**
 * Download file
 * @param {DropboxApiArgs} args - Arguments containing path and localPath
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, size: number, metadata: DropboxFileMetadata}>}
 */
export function downloadFile(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    size: number;
    metadata: DropboxFileMetadata;
}>;
/**
 * Upload file
 * @param {DropboxApiArgs} args - Arguments containing localPath, dropboxPath, and overwrite option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, size: number, metadata: DropboxFileMetadata}>}
 */
export function uploadFile(args: DropboxApiArgs, bearerToken: string): Promise<{
    message: string;
    size: number;
    metadata: DropboxFileMetadata;
}>;
//# sourceMappingURL=dropboxApi.d.ts.map