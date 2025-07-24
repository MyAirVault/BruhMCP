export type DropboxFile = {
    /**
     * '.tag' - File type tag
     */
    "": string;
    /**
     * - File name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - File ID
     */
    id: string;
    /**
     * - Client modified timestamp
     */
    client_modified: string;
    /**
     * - Server modified timestamp
     */
    server_modified: string;
    /**
     * - File revision
     */
    rev: string;
    /**
     * - File size in bytes
     */
    size: number;
    /**
     * - Whether file is downloadable
     */
    is_downloadable: boolean;
    /**
     * - Content hash
     */
    content_hash: string;
};
export type DropboxFolder = {
    /**
     * '.tag' - Folder type tag
     */
    "": string;
    /**
     * - Folder name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Folder ID
     */
    id: string;
};
export type DropboxEntry = DropboxFile | DropboxFolder;
export type DropboxListResponse = {
    /**
     * - Array of files and folders
     */
    entries: DropboxEntry[];
    /**
     * - Pagination cursor
     */
    cursor: string;
    /**
     * - Whether there are more results
     */
    has_more: boolean;
};
export type DropboxMetadata = {
    /**
     * '.tag' - Entry type tag
     */
    "": string;
    /**
     * - Entry name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Entry ID
     */
    id: string;
    /**
     * - Client modified timestamp (files only)
     */
    client_modified?: string | undefined;
    /**
     * - Server modified timestamp (files only)
     */
    server_modified?: string | undefined;
    /**
     * - File revision (files only)
     */
    rev?: string | undefined;
    /**
     * - File size in bytes (files only)
     */
    size?: number | undefined;
    /**
     * - Whether file is downloadable (files only)
     */
    is_downloadable?: boolean | undefined;
    /**
     * - Content hash (files only)
     */
    content_hash?: string | undefined;
};
export type DropboxError = {
    /**
     * - Error summary
     */
    error_summary: string;
    /**
     * - Error details
     */
    error: {
        message: string;
        code: string;
    };
};
export type DropboxSearchResult = {
    /**
     * - Array of matching entries
     */
    matches: DropboxEntry[];
    /**
     * - Whether there are more results
     */
    more: boolean;
    /**
     * - Start cursor for pagination
     */
    start: string;
};
export type DropboxSharedLink = {
    /**
     * '.tag' - Link type tag
     */
    "": string;
    /**
     * - Shared link URL
     */
    url: string;
    /**
     * - Link ID
     */
    id: string;
    /**
     * - Link name
     */
    name: string;
    /**
     * - Expiration timestamp
     */
    expires: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Link permissions
     */
    link_permissions: string;
    /**
     * - Team member info
     */
    team_member_info: string;
    /**
     * - Content owner team info
     */
    content_owner_team_info: string;
};
export type DropboxSpaceUsage = {
    /**
     * - Used space in bytes
     */
    used: number;
    /**
     * - Space allocation details
     */
    allocation: Object;
    /**
     * - Allocated space in bytes
     */
    allocated: number;
};
export type DropboxUploadResult = {
    /**
     * '.tag' - Result type tag
     */
    "": string;
    /**
     * - File name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - File ID
     */
    id: string;
    /**
     * - Client modified timestamp
     */
    client_modified: string;
    /**
     * - Server modified timestamp
     */
    server_modified: string;
    /**
     * - File revision
     */
    rev: string;
    /**
     * - File size in bytes
     */
    size: number;
    /**
     * - Whether file is downloadable
     */
    is_downloadable: boolean;
    /**
     * - Content hash
     */
    content_hash: string;
};
export type DropboxDeleteResult = {
    /**
     * '.tag' - Result type tag
     */
    "": string;
    /**
     * - Entry name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Entry ID
     */
    id: string;
};
export type DropboxMoveResult = {
    /**
     * '.tag' - Result type tag
     */
    "": string;
    /**
     * - Entry name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Entry ID
     */
    id: string;
};
export type DropboxCopyResult = {
    /**
     * '.tag' - Result type tag
     */
    "": string;
    /**
     * - Entry name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Entry ID
     */
    id: string;
};
export type DropboxCreateFolderResult = {
    /**
     * '.tag' - Result type tag
     */
    "": string;
    /**
     * - Folder name
     */
    name: string;
    /**
     * - Lowercase path
     */
    path_lower: string;
    /**
     * - Display path
     */
    path_display: string;
    /**
     * - Folder ID
     */
    id: string;
};
export type ListFilesOptions = {
    /**
     * - Path to list files from
     */
    path?: string | undefined;
    /**
     * - Whether to list recursively
     */
    recursive?: boolean | undefined;
    /**
     * - Maximum number of results
     */
    limit?: number | undefined;
};
export type GetMetadataOptions = {
    /**
     * - Path to get metadata for
     */
    path: string;
};
export type DownloadFileOptions = {
    /**
     * - Dropbox path to download from
     */
    path: string;
    /**
     * - Local path to save to
     */
    localPath: string;
};
export type UploadFileOptions = {
    /**
     * - Local path to upload from
     */
    localPath: string;
    /**
     * - Dropbox path to upload to
     */
    dropboxPath: string;
    /**
     * - Whether to overwrite existing files
     */
    overwrite?: boolean | undefined;
};
export type CreateFolderOptions = {
    /**
     * - Path of folder to create
     */
    path: string;
    /**
     * - Whether to autorename if exists
     */
    autorename?: boolean | undefined;
};
export type DeleteFileOptions = {
    /**
     * - Path to delete
     */
    path: string;
};
export type MoveFileOptions = {
    /**
     * - Source path
     */
    fromPath: string;
    /**
     * - Destination path
     */
    toPath: string;
    /**
     * - Whether to autorename if exists
     */
    autorename?: boolean | undefined;
};
export type CopyFileOptions = {
    /**
     * - Source path
     */
    fromPath: string;
    /**
     * - Destination path
     */
    toPath: string;
    /**
     * - Whether to autorename if exists
     */
    autorename?: boolean | undefined;
};
export type SearchFilesOptions = {
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
};
export type GetSharedLinksOptions = {
    /**
     * - Path to get shared links for
     */
    path: string;
};
export type CreateSharedLinkOptions = {
    /**
     * - Path to create shared link for
     */
    path: string;
    /**
     * - Whether to create short URL
     */
    shortUrl?: boolean | undefined;
};
export type MCPToolResult = {
    /**
     * - Tool result content
     */
    content: Array<{
        type: string;
        text: string;
    }>;
    /**
     * - Whether result is an error
     */
    isError?: boolean | undefined;
};
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Service display name
     */
    displayName: string;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Required OAuth scopes
     */
    scopes: string[];
};
//# sourceMappingURL=dropboxTypes.d.ts.map