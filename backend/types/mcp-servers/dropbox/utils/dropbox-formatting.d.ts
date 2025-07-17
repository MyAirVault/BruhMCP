/**
 * Dropbox response formatting utilities
 * Standardizes response formats for Dropbox API operations to match Gmail patterns
 */
/**
 * Format file entry for display
 */
export function formatFileEntry(entry: any): {
    shared_folder_id: any;
    sharing_info: any;
    name: any;
    path: any;
    type: string;
    id: any;
} | {
    size: any;
    client_modified: any;
    server_modified: any;
    rev: any;
    content_hash: any;
    is_downloadable: any;
    has_explicit_shared_members: any;
    name: any;
    path: any;
    type: string;
    id: any;
};
/**
 * Format file list response
 */
export function formatFileList(response: any): {
    entries: any;
    has_more: any;
    cursor: any;
};
/**
 * Format search results
 */
export function formatSearchResults(response: any): {
    matches: any;
    has_more: any;
    start: any;
};
/**
 * Format shared link response
 */
export function formatSharedLink(link: any): {
    url: any;
    name: any;
    path: any;
    id: any;
    expires: any;
    visibility: any;
    link_permissions: any;
    team_member_info: any;
};
/**
 * Format space usage response
 */
export function formatSpaceUsage(usage: any): {
    used_bytes: any;
    allocated_bytes: any;
    used_gb: string;
    allocated_gb: string;
    usage_percent: string;
    allocation_type: any;
};
/**
 * Format error response
 */
export function formatError(error: any): {
    error: boolean;
    message: any;
    type: any;
    timestamp: string;
};
/**
 * Format success response with standard structure
 */
export function formatSuccessResponse(message: any, data?: null): {
    success: boolean;
    message: any;
    timestamp: string;
};
/**
 * Format file metadata for display
 */
export function formatFileMetadata(metadata: any): {
    name: any;
    path: any;
    type: string;
    id: any;
};
/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: any): string;
/**
 * Format date for display
 */
export function formatDate(dateString: any): {
    iso: string;
    readable: string;
    timestamp: number;
} | null;
/**
 * Create standardized tool response
 */
export function createToolResponse(toolName: any, success: any, message: any, data?: null): {
    tool: any;
    success: any;
    message: any;
    timestamp: string;
};
/**
 * Format operation summary
 */
export function formatOperationSummary(operation: any, path: any, result: any): {
    operation: any;
    path: any;
    success: boolean;
    timestamp: string;
};
/**
 * Format Dropbox tool response similar to Gmail formatting
 * @param {Object} data - Response data to format
 * @returns {string} Formatted response string
 */
export function formatDropboxResponse(data: Object): string;
/**
 * Format error messages for Dropbox operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatDropboxError(operation: string, error: Error): string;
//# sourceMappingURL=dropbox-formatting.d.ts.map