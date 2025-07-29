export type GoogleDriveFile = {
    /**
     * - File ID
     */
    id: string;
    /**
     * - File name
     */
    name: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - File size in bytes
     */
    size?: string | undefined;
    /**
     * - Creation timestamp
     */
    createdTime?: string | undefined;
    /**
     * - Modification timestamp
     */
    modifiedTime?: string | undefined;
    /**
     * - Web view URL
     */
    webViewLink?: string | undefined;
    /**
     * - Direct download URL
     */
    webContentLink?: string | undefined;
    /**
     * - Parent folder IDs
     */
    parents?: string[] | undefined;
    /**
     * - File permissions
     */
    permissions?: GoogleDrivePermission[] | undefined;
    /**
     * - Whether file is shared
     */
    shared?: boolean | undefined;
    /**
     * - Whether file is starred
     */
    starred?: boolean | undefined;
    /**
     * - Whether file is trashed
     */
    trashed?: boolean | undefined;
};
export type GoogleDrivePermission = {
    /**
     * - Permission ID
     */
    id: string;
    /**
     * - Permission type (user, group, domain, anyone)
     */
    type: string;
    /**
     * - Permission role (owner, organizer, fileOrganizer, writer, commenter, reader)
     */
    role: string;
    /**
     * - Email address for user permissions
     */
    emailAddress?: string | undefined;
    /**
     * - Display name
     */
    displayName?: string | undefined;
    /**
     * - Photo URL
     */
    photoLink?: string | undefined;
    /**
     * - Domain for domain permissions
     */
    domain?: string | undefined;
    /**
     * - Whether file can be discovered
     */
    allowFileDiscovery?: boolean | undefined;
    /**
     * - Whether permission is deleted
     */
    deleted?: boolean | undefined;
};
export type GoogleDriveFilesResponse = {
    /**
     * - Array of files
     */
    files: GoogleDriveFile[];
    /**
     * - Token for next page
     */
    nextPageToken?: string | undefined;
};
export type GoogleDriveAbout = {
    /**
     * - User information
     */
    user: {
        displayName: string;
        emailAddress: string;
        photoLink?: string | undefined;
    };
    /**
     * - Storage quota information
     */
    storageQuota: {
        usage: string;
        limit: string;
        usageInDrive: string;
        usageInDriveTrash: string;
    };
};
export type FormattedFile = {
    /**
     * - File ID
     */
    id: string;
    /**
     * - File name
     */
    name: string;
    /**
     * - MIME type
     */
    mimeType: string;
    /**
     * - Human-readable file type
     */
    type: string;
    /**
     * - Formatted file size
     */
    size: string | null;
    /**
     * - Formatted creation time
     */
    createdTime: string | null;
    /**
     * - Formatted modification time
     */
    modifiedTime: string | null;
    /**
     * - Web view URL
     */
    webViewLink?: string | undefined;
    /**
     * - Direct download URL
     */
    webContentLink?: string | undefined;
    /**
     * - Parent folder IDs
     */
    parents: string[];
    /**
     * - File permissions
     */
    permissions: GoogleDrivePermission[];
    /**
     * - Whether file is shared
     */
    shared: boolean;
    /**
     * - Whether file is starred
     */
    starred: boolean;
    /**
     * - Whether file is trashed
     */
    trashed: boolean;
};
export type FormattedFileList = {
    /**
     * - Array of formatted files
     */
    files: FormattedFile[];
    /**
     * - Total number of files
     */
    totalCount: number;
    /**
     * - Token for next page
     */
    nextPageToken: string | null;
    /**
     * - Whether more files exist
     */
    hasMore: boolean;
    /**
     * - Search query used
     */
    query: string | null;
};
/**
 * Google Drive response formatting utilities
 * Standardizes Google Drive API responses for MCP protocol
 */
/**
 * @typedef {Object} GoogleDriveFile
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} mimeType - MIME type
 * @property {string} [size] - File size in bytes
 * @property {string} [createdTime] - Creation timestamp
 * @property {string} [modifiedTime] - Modification timestamp
 * @property {string} [webViewLink] - Web view URL
 * @property {string} [webContentLink] - Direct download URL
 * @property {string[]} [parents] - Parent folder IDs
 * @property {GoogleDrivePermission[]} [permissions] - File permissions
 * @property {boolean} [shared] - Whether file is shared
 * @property {boolean} [starred] - Whether file is starred
 * @property {boolean} [trashed] - Whether file is trashed
 */
/**
 * @typedef {Object} GoogleDrivePermission
 * @property {string} id - Permission ID
 * @property {string} type - Permission type (user, group, domain, anyone)
 * @property {string} role - Permission role (owner, organizer, fileOrganizer, writer, commenter, reader)
 * @property {string} [emailAddress] - Email address for user permissions
 * @property {string} [displayName] - Display name
 * @property {string} [photoLink] - Photo URL
 * @property {string} [domain] - Domain for domain permissions
 * @property {boolean} [allowFileDiscovery] - Whether file can be discovered
 * @property {boolean} [deleted] - Whether permission is deleted
 */
/**
 * @typedef {Object} GoogleDriveFilesResponse
 * @property {GoogleDriveFile[]} files - Array of files
 * @property {string} [nextPageToken] - Token for next page
 */
/**
 * @typedef {Object} GoogleDriveAbout
 * @property {Object} user - User information
 * @property {string} user.displayName - User display name
 * @property {string} user.emailAddress - User email
 * @property {string} [user.photoLink] - User photo URL
 * @property {Object} storageQuota - Storage quota information
 * @property {string} storageQuota.usage - Total usage in bytes
 * @property {string} storageQuota.limit - Storage limit in bytes
 * @property {string} storageQuota.usageInDrive - Drive usage in bytes
 * @property {string} storageQuota.usageInDriveTrash - Trash usage in bytes
 */
/**
 * @typedef {Object} FormattedFile
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} mimeType - MIME type
 * @property {string} type - Human-readable file type
 * @property {string|null} size - Formatted file size
 * @property {string|null} createdTime - Formatted creation time
 * @property {string|null} modifiedTime - Formatted modification time
 * @property {string} [webViewLink] - Web view URL
 * @property {string} [webContentLink] - Direct download URL
 * @property {string[]} parents - Parent folder IDs
 * @property {GoogleDrivePermission[]} permissions - File permissions
 * @property {boolean} shared - Whether file is shared
 * @property {boolean} starred - Whether file is starred
 * @property {boolean} trashed - Whether file is trashed
 */
/**
 * @typedef {Object} FormattedFileList
 * @property {FormattedFile[]} files - Array of formatted files
 * @property {number} totalCount - Total number of files
 * @property {string|null} nextPageToken - Token for next page
 * @property {boolean} hasMore - Whether more files exist
 * @property {string|null} query - Search query used
 */
/**
 * Format file response for MCP protocol
 * @param {GoogleDriveFile|null|undefined} file - Google Drive file object
 * @returns {FormattedFile|null} Formatted file response
 */
export function formatFileResponse(file: GoogleDriveFile | null | undefined): FormattedFile | null;
/**
 * Format file list response
 * @param {GoogleDriveFilesResponse|null|undefined} response - Google Drive files list response
 * @param {string} query - Optional search query
 * @returns {FormattedFileList} Formatted file list
 */
export function formatFileListResponse(response: GoogleDriveFilesResponse | null | undefined, query?: string): FormattedFileList;
/**
 * Format upload response
 * @param {GoogleDriveFile} response - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload response
 */
export function formatUploadResponse(response: GoogleDriveFile, originalPath: string): Object;
/**
 * Format drive info response
 * @param {GoogleDriveAbout|null|undefined} about - Google Drive about response
 * @returns {Object|null} Formatted drive info
 */
export function formatDriveInfoResponse(about: GoogleDriveAbout | null | undefined): Object | null;
/**
 * Format file permissions
 * @param {GoogleDrivePermission[]|null|undefined} permissions - Array of permission objects
 * @returns {Object} Formatted permissions
 */
export function formatFilePermissions(permissions: GoogleDrivePermission[] | null | undefined): Object;
/**
 * Format search results
 * @param {GoogleDriveFilesResponse} response - Google Drive search response
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(response: GoogleDriveFilesResponse, query: string): Object;
/**
 * Format upload result
 * @param {GoogleDriveFile} uploadResponse - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload result
 */
export function formatUploadResult(uploadResponse: GoogleDriveFile, originalPath: string): Object;
/**
 * Format error response
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error: Error, operation: string): Object;
/**
 * Get file type from MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} Human-readable file type
 */
export function getFileType(mimeType: string): string;
/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes: number): string;
/**
 * Get file type summary from file list
 * @param {FormattedFile[]|null|undefined} files - Array of formatted files
 * @returns {Record<string, number>} File type summary
 */
export function getFileTypeSummary(files: FormattedFile[] | null | undefined): Record<string, number>;
/**
 * Get size distribution from file list
 * @param {FormattedFile[]|null|undefined} files - Array of formatted files
 * @returns {Record<string, number>} Size distribution
 */
export function getSizeDistribution(files: FormattedFile[] | null | undefined): Record<string, number>;
/**
 * Format folder tree structure
 * @param {FormattedFile[]} files - Array of files and folders
 * @returns {Object} Formatted folder tree
 */
export function formatFolderTree(files: FormattedFile[]): Object;
//# sourceMappingURL=googledriveFormatting.d.ts.map