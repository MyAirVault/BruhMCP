/**
 * Dropbox response formatting utilities
 * Standardizes response formats for Dropbox API operations to match Gmail patterns
 */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxFileMetadata} DropboxFileMetadata */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxFolder} DropboxFolder */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxListFolderResponse} DropboxListFolderResponse */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxSearchResponse} DropboxSearchResponse */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxSearchMatch} DropboxSearchMatch */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxSpaceUsage} DropboxSpaceUsage */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxSharedLink} DropboxSharedLink */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxMediaInfo} DropboxMediaInfo */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxSharingInfo} DropboxSharingInfo */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxPropertyGroup} DropboxPropertyGroup */
/** @typedef {import('../../../types/dropbox.d.ts').DropboxContentOwnership} DropboxContentOwnership */
/**
 * @typedef {Object} FormattedFileEntry
 * @property {string} name - File name
 * @property {string} path - File path
 * @property {string} type - File type ('file' or 'folder')
 * @property {string} id - File ID
 * @property {number} [size] - File size in bytes
 * @property {string} [server_modified] - Server modification date
 * @property {string} [client_modified] - Client modification date
 * @property {string} [rev] - File revision
 * @property {string} [content_hash] - Content hash
 * @property {boolean} [is_downloadable] - Whether file is downloadable
 * @property {boolean} [has_explicit_shared_members] - Whether file has explicit shared members
 * @property {DropboxMediaInfo} [media_info] - Media information
 * @property {DropboxSharingInfo} [sharing_info] - Sharing information
 * @property {DropboxPropertyGroup[]} [property_groups] - Property groups
 * @property {DropboxContentOwnership} [content_ownership] - Content ownership info
 * @property {string} [shared_folder_id] - Shared folder ID (for folders)
 * @property {string} [size_readable] - Human readable size
 */
/**
 * @typedef {Object} FormattedSearchMatch
 * @property {string} match_type - Type of match
 * @property {FormattedFileEntry} metadata - File metadata
 */
/**
 * @typedef {Object} DropboxResponseData
 * @property {string} action - The action that was performed
 * @property {string} [timestamp] - Timestamp of the operation
 * @property {Array<FormattedFileEntry>} [files] - Files array for list_files action
 * @property {number} [count] - Number of items
 * @property {string} [path] - Path for various operations
 * @property {boolean} [has_more] - Whether there are more items
 * @property {string} [name] - File/folder name
 * @property {number} [size] - File size in bytes
 * @property {string} [id] - File/folder ID
 * @property {string} [from_path] - Source path for move/copy operations
 * @property {string} [to_path] - Destination path for move/copy operations
 * @property {string} [url] - Share URL
 * @property {string} [visibility] - Share visibility
 * @property {string} [expires] - Expiration date
 * @property {Array<FormattedSearchMatch>} [matches] - Search matches
 * @property {string} [query] - Search query
 * @property {string} [used_gb] - Used storage in GB
 * @property {string} [allocated_gb] - Allocated storage in GB
 * @property {string} [usage_percent] - Usage percentage
 * @property {string} [allocation_type] - Allocation type
 * @property {string} [type] - File type
 * @property {string} [server_modified] - Server modification date
 */
/**
 * @typedef {Object} OperationResult
 * @property {Array<DropboxFileMetadata | DropboxFolder>} [entries] - List of entries
 * @property {boolean} [has_more] - Whether there are more entries
 * @property {Array<DropboxSearchMatch>} [matches] - Search matches
 * @property {number} [size] - File size
 * @property {DropboxFileMetadata | DropboxFolder} [metadata] - File metadata
 * @property {string} [url] - URL for shared links
 * @property {string} [expires] - Expiration date
 */
/**
 * @typedef {Object} FormattedSuccessResponse
 * @property {boolean} success - Success indicator
 * @property {string} message - Success message
 * @property {string} timestamp - ISO timestamp
 * @property {Object} [data] - Optional data payload
 */
/**
 * @typedef {Object} FormattedToolResponse
 * @property {string} tool - Tool name
 * @property {boolean} success - Success indicator
 * @property {string} message - Response message
 * @property {string} timestamp - ISO timestamp
 * @property {Object} [data] - Optional data payload
 */
/**
 * @typedef {Object} FormattedOperationSummary
 * @property {string} operation - Operation name
 * @property {string} path - Operation path
 * @property {boolean} success - Success indicator
 * @property {string} timestamp - ISO timestamp
 * @property {number} [items_count] - Number of items (for list operations)
 * @property {boolean} [has_more] - Whether there are more items
 * @property {number} [matches_count] - Number of matches (for search operations)
 * @property {number} [size] - File size (for upload/download operations)
 * @property {string} [size_readable] - Human readable size
 * @property {FormattedFileEntry} [metadata] - File metadata
 * @property {string} [url] - URL (for share operations)
 * @property {string} [expires] - Expiration date
 */
/**
 * Format file entry for display
 * @param {DropboxFileMetadata | DropboxFolder} entry - The file or folder entry to format
 * @returns {FormattedFileEntry} Formatted file entry
 */
export function formatFileEntry(entry: DropboxFileMetadata | DropboxFolder): FormattedFileEntry;
/**
 * Format file list response
 * @param {DropboxListFolderResponse} response - The Dropbox list folder response
 * @returns {Object} Formatted file list
 */
export function formatFileList(response: DropboxListFolderResponse): Object;
/**
 * Format search results
 * @param {DropboxSearchResponse} response - The Dropbox search response
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(response: DropboxSearchResponse): Object;
/**
 * Format shared link response
 * @param {DropboxSharedLink} link - The shared link to format
 * @returns {Object} Formatted shared link
 */
export function formatSharedLink(link: DropboxSharedLink): Object;
/**
 * Format space usage response
 * @param {DropboxSpaceUsage} usage - The space usage data
 * @returns {Object} Formatted space usage
 */
export function formatSpaceUsage(usage: DropboxSpaceUsage): Object;
/**
 * Format error response
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
export function formatError(error: Error): Object;
/**
 * Format success response with standard structure
 * @param {string} message - Success message
 * @param {Object|null} [data=null] - Optional data to include
 * @returns {FormattedSuccessResponse} Formatted success response
 */
export function formatSuccessResponse(message: string, data?: Object | null): FormattedSuccessResponse;
/**
 * Format file metadata for display
 * @param {DropboxFileMetadata | DropboxFolder} metadata - The file or folder metadata
 * @returns {FormattedFileEntry} Formatted metadata
 */
export function formatFileMetadata(metadata: DropboxFileMetadata | DropboxFolder): FormattedFileEntry;
/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Human-readable size string
 */
export function formatFileSize(bytes: number): string;
/**
 * Format date for display
 * @param {string|null|undefined} dateString - ISO date string
 * @returns {Object|null} Formatted date object or null
 */
export function formatDate(dateString: string | null | undefined): Object | null;
/**
 * Create standardized tool response
 * @param {string} toolName - Name of the tool
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {Object|null} [data=null] - Optional data to include
 * @returns {FormattedToolResponse} Standardized tool response
 */
export function createToolResponse(toolName: string, success: boolean, message: string, data?: Object | null): FormattedToolResponse;
/**
 * Format operation summary
 * @param {string} operation - The operation that was performed
 * @param {string} path - The path the operation was performed on
 * @param {OperationResult} result - The result of the operation
 * @returns {FormattedOperationSummary} Formatted operation summary
 */
export function formatOperationSummary(operation: string, path: string, result: OperationResult): FormattedOperationSummary;
/**
 * Format Dropbox tool response similar to Gmail formatting
 * @param {DropboxResponseData} data - Response data to format
 * @returns {string} Formatted response string
 */
export function formatDropboxResponse(data: DropboxResponseData): string;
/**
 * Format error messages for Dropbox operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatDropboxError(operation: string, error: Error): string;
export type DropboxFileMetadata = import("../../../types/dropbox.d.ts").DropboxFileMetadata;
export type DropboxFolder = import("../../../types/dropbox.d.ts").DropboxFolder;
export type DropboxListFolderResponse = import("../../../types/dropbox.d.ts").DropboxListFolderResponse;
export type DropboxSearchResponse = import("../../../types/dropbox.d.ts").DropboxSearchResponse;
export type DropboxSearchMatch = import("../../../types/dropbox.d.ts").DropboxSearchMatch;
export type DropboxSpaceUsage = import("../../../types/dropbox.d.ts").DropboxSpaceUsage;
export type DropboxSharedLink = import("../../../types/dropbox.d.ts").DropboxSharedLink;
export type DropboxMediaInfo = import("../../../types/dropbox.d.ts").DropboxMediaInfo;
export type DropboxSharingInfo = import("../../../types/dropbox.d.ts").DropboxSharingInfo;
export type DropboxPropertyGroup = import("../../../types/dropbox.d.ts").DropboxPropertyGroup;
export type DropboxContentOwnership = import("../../../types/dropbox.d.ts").DropboxContentOwnership;
export type FormattedFileEntry = {
    /**
     * - File name
     */
    name: string;
    /**
     * - File path
     */
    path: string;
    /**
     * - File type ('file' or 'folder')
     */
    type: string;
    /**
     * - File ID
     */
    id: string;
    /**
     * - File size in bytes
     */
    size?: number | undefined;
    /**
     * - Server modification date
     */
    server_modified?: string | undefined;
    /**
     * - Client modification date
     */
    client_modified?: string | undefined;
    /**
     * - File revision
     */
    rev?: string | undefined;
    /**
     * - Content hash
     */
    content_hash?: string | undefined;
    /**
     * - Whether file is downloadable
     */
    is_downloadable?: boolean | undefined;
    /**
     * - Whether file has explicit shared members
     */
    has_explicit_shared_members?: boolean | undefined;
    /**
     * - Media information
     */
    media_info?: import("../../../types/dropbox.d.ts").DropboxMediaInfo | undefined;
    /**
     * - Sharing information
     */
    sharing_info?: import("../../../types/dropbox.d.ts").DropboxSharingInfo | undefined;
    /**
     * - Property groups
     */
    property_groups?: import("../../../types/dropbox.d.ts").DropboxPropertyGroup[] | undefined;
    /**
     * - Content ownership info
     */
    content_ownership?: import("../../../types/dropbox.d.ts").DropboxContentOwnership | undefined;
    /**
     * - Shared folder ID (for folders)
     */
    shared_folder_id?: string | undefined;
    /**
     * - Human readable size
     */
    size_readable?: string | undefined;
};
export type FormattedSearchMatch = {
    /**
     * - Type of match
     */
    match_type: string;
    /**
     * - File metadata
     */
    metadata: FormattedFileEntry;
};
export type DropboxResponseData = {
    /**
     * - The action that was performed
     */
    action: string;
    /**
     * - Timestamp of the operation
     */
    timestamp?: string | undefined;
    /**
     * - Files array for list_files action
     */
    files?: FormattedFileEntry[] | undefined;
    /**
     * - Number of items
     */
    count?: number | undefined;
    /**
     * - Path for various operations
     */
    path?: string | undefined;
    /**
     * - Whether there are more items
     */
    has_more?: boolean | undefined;
    /**
     * - File/folder name
     */
    name?: string | undefined;
    /**
     * - File size in bytes
     */
    size?: number | undefined;
    /**
     * - File/folder ID
     */
    id?: string | undefined;
    /**
     * - Source path for move/copy operations
     */
    from_path?: string | undefined;
    /**
     * - Destination path for move/copy operations
     */
    to_path?: string | undefined;
    /**
     * - Share URL
     */
    url?: string | undefined;
    /**
     * - Share visibility
     */
    visibility?: string | undefined;
    /**
     * - Expiration date
     */
    expires?: string | undefined;
    /**
     * - Search matches
     */
    matches?: FormattedSearchMatch[] | undefined;
    /**
     * - Search query
     */
    query?: string | undefined;
    /**
     * - Used storage in GB
     */
    used_gb?: string | undefined;
    /**
     * - Allocated storage in GB
     */
    allocated_gb?: string | undefined;
    /**
     * - Usage percentage
     */
    usage_percent?: string | undefined;
    /**
     * - Allocation type
     */
    allocation_type?: string | undefined;
    /**
     * - File type
     */
    type?: string | undefined;
    /**
     * - Server modification date
     */
    server_modified?: string | undefined;
};
export type OperationResult = {
    /**
     * - List of entries
     */
    entries?: (import("../../../types/dropbox.d.ts").DropboxFileMetadata | import("../../../types/dropbox.d.ts").DropboxFolder)[] | undefined;
    /**
     * - Whether there are more entries
     */
    has_more?: boolean | undefined;
    /**
     * - Search matches
     */
    matches?: import("../../../types/dropbox.d.ts").DropboxSearchMatch[] | undefined;
    /**
     * - File size
     */
    size?: number | undefined;
    /**
     * - File metadata
     */
    metadata?: import("../../../types/dropbox.d.ts").DropboxFileMetadata | import("../../../types/dropbox.d.ts").DropboxFolder | undefined;
    /**
     * - URL for shared links
     */
    url?: string | undefined;
    /**
     * - Expiration date
     */
    expires?: string | undefined;
};
export type FormattedSuccessResponse = {
    /**
     * - Success indicator
     */
    success: boolean;
    /**
     * - Success message
     */
    message: string;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Optional data payload
     */
    data?: Object | undefined;
};
export type FormattedToolResponse = {
    /**
     * - Tool name
     */
    tool: string;
    /**
     * - Success indicator
     */
    success: boolean;
    /**
     * - Response message
     */
    message: string;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Optional data payload
     */
    data?: Object | undefined;
};
export type FormattedOperationSummary = {
    /**
     * - Operation name
     */
    operation: string;
    /**
     * - Operation path
     */
    path: string;
    /**
     * - Success indicator
     */
    success: boolean;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Number of items (for list operations)
     */
    items_count?: number | undefined;
    /**
     * - Whether there are more items
     */
    has_more?: boolean | undefined;
    /**
     * - Number of matches (for search operations)
     */
    matches_count?: number | undefined;
    /**
     * - File size (for upload/download operations)
     */
    size?: number | undefined;
    /**
     * - Human readable size
     */
    size_readable?: string | undefined;
    /**
     * - File metadata
     */
    metadata?: FormattedFileEntry | undefined;
    /**
     * - URL (for share operations)
     */
    url?: string | undefined;
    /**
     * - Expiration date
     */
    expires?: string | undefined;
};
//# sourceMappingURL=dropboxFormatting.d.ts.map