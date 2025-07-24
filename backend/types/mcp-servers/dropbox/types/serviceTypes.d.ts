export type DropboxServiceConfig = {
    /**
     * - Base URL for Dropbox API
     */
    apiBaseUrl: string;
    /**
     * - Base URL for Dropbox Content API
     */
    contentApiBaseUrl: string;
    /**
     * - Maximum number of retries for API calls
     */
    maxRetries: number;
    /**
     * - Delay between retries in milliseconds
     */
    retryDelay: number;
    /**
     * - Request timeout in milliseconds
     */
    timeout: number;
};
export type DropboxServiceInstance = {
    /**
     * - OAuth bearer token
     */
    bearerToken: string;
    /**
     * - Service configuration
     */
    config: DropboxServiceConfig;
    /**
     * - List files in a folder
     */
    listFiles: Function;
    /**
     * - Get file/folder metadata
     */
    getMetadata: Function;
    /**
     * - Download a file
     */
    downloadFile: Function;
    /**
     * - Upload a file
     */
    uploadFile: Function;
    /**
     * - Create a folder
     */
    createFolder: Function;
    /**
     * - Delete a file/folder
     */
    deleteFile: Function;
    /**
     * - Move a file/folder
     */
    moveFile: Function;
    /**
     * - Copy a file/folder
     */
    copyFile: Function;
    /**
     * - Search for files
     */
    searchFiles: Function;
    /**
     * - Get shared links for a file
     */
    getSharedLinks: Function;
    /**
     * - Create a shared link
     */
    createSharedLink: Function;
    /**
     * - Get space usage information
     */
    getSpaceUsage: Function;
};
export type APIRequestOptions = {
    /**
     * - HTTP method
     */
    method: string;
    /**
     * - Request headers
     */
    headers: Object;
    /**
     * - Request body
     */
    body?: string | undefined;
    /**
     * - Request timeout
     */
    timeout?: number | undefined;
};
export type APIResponse = {
    /**
     * - Whether request was successful
     */
    ok: boolean;
    /**
     * - HTTP status code
     */
    status: number;
    /**
     * - HTTP status text
     */
    statusText: string;
    /**
     * - Parse response as JSON
     */
    json: Function;
    /**
     * - Parse response as text
     */
    text: Function;
    /**
     * - Parse response as ArrayBuffer
     */
    arrayBuffer: Function;
};
export type RetryOptions = {
    /**
     * - Maximum number of retries
     */
    maxRetries: number;
    /**
     * - Base delay between retries
     */
    baseDelay: number;
    /**
     * - Request timeout
     */
    timeout: number;
};
export type ValidationError = {
    /**
     * - Field that failed validation
     */
    field: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Invalid value
     */
    value: any;
};
export type ServiceError = {
    /**
     * - Error code
     */
    code: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Additional error data
     */
    data?: any;
    /**
     * - Whether error is retryable
     */
    retryable: boolean;
};
export type FileOperationResult = {
    /**
     * - Whether operation was successful
     */
    success: boolean;
    /**
     * - File path
     */
    path?: string | undefined;
    /**
     * - File ID
     */
    id?: string | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
};
export type PaginationOptions = {
    /**
     * - Pagination cursor
     */
    cursor?: string | undefined;
    /**
     * - Maximum number of results
     */
    limit?: number | undefined;
    /**
     * - Whether there are more results
     */
    hasMore?: boolean | undefined;
};
export type SearchOptions = {
    /**
     * - Search query
     */
    query: string;
    /**
     * - Path to search within
     */
    path?: string | undefined;
    /**
     * - Maximum number of results
     */
    maxResults?: number | undefined;
    /**
     * - File status filter
     */
    fileStatus?: string | undefined;
    /**
     * - File categories filter
     */
    fileCategories?: string | undefined;
    /**
     * - Search mode
     */
    mode?: string | undefined;
};
export type UploadOptions = {
    /**
     * - Upload mode (add, overwrite, update)
     */
    mode: string;
    /**
     * - Whether to autorename
     */
    autorename?: boolean | undefined;
    /**
     * - Client modified timestamp
     */
    clientModified?: string | undefined;
    /**
     * - Whether to mute notifications
     */
    mute?: boolean | undefined;
    /**
     * - Whether to use strict conflict resolution
     */
    strictConflict?: boolean | undefined;
};
export type SharedLinkSettings = {
    /**
     * - Requested visibility
     */
    requestedVisibility?: string | undefined;
    /**
     * - Link password
     */
    linkPassword?: string | undefined;
    /**
     * - Expiration timestamp
     */
    expires?: string | undefined;
    /**
     * - Audience setting
     */
    audience?: string | undefined;
    /**
     * - Access setting
     */
    access?: string | undefined;
    /**
     * - Whether to allow download
     */
    allowDownload?: boolean | undefined;
    /**
     * - Whether to use short URL
     */
    shortUrl?: boolean | undefined;
};
export type TokenInfo = {
    /**
     * - Access token
     */
    accessToken: string;
    /**
     * - Refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - Token expiration time
     */
    expiresIn?: number | undefined;
    /**
     * - Token type
     */
    tokenType?: string | undefined;
    /**
     * - Token scopes
     */
    scopes?: string[] | undefined;
};
export type AuthenticationError = {
    /**
     * - Error type
     */
    error: string;
    /**
     * - Error description
     */
    errorDescription: string;
    /**
     * - Error URI
     */
    errorUri?: string | undefined;
};
//# sourceMappingURL=serviceTypes.d.ts.map