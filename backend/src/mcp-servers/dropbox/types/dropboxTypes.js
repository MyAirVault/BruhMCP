/**
 * Dropbox API Types and Interfaces
 * JSDoc type definitions for Dropbox API operations
 */

/**
 * @typedef {Object} DropboxFile
 * @property {string} tag - File type tag
 * @property {string} name - File name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - File ID
 * @property {string} client_modified - Client modified timestamp
 * @property {string} server_modified - Server modified timestamp
 * @property {string} rev - File revision
 * @property {number} size - File size in bytes
 * @property {boolean} is_downloadable - Whether file is downloadable
 * @property {string} content_hash - Content hash
 */

/**
 * @typedef {Object} DropboxFolder
 * @property {string} tag - Folder type tag
 * @property {string} name - Folder name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Folder ID
 */

/**
 * @typedef {DropboxFile | DropboxFolder} DropboxEntry
 */

/**
 * @typedef {Object} DropboxListResponse
 * @property {DropboxEntry[]} entries - Array of files and folders
 * @property {string} cursor - Pagination cursor
 * @property {boolean} has_more - Whether there are more results
 */

/**
 * @typedef {Object} DropboxMetadata
 * @property {string} tag - Entry type tag
 * @property {string} name - Entry name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Entry ID
 * @property {string} [client_modified] - Client modified timestamp (files only)
 * @property {string} [server_modified] - Server modified timestamp (files only)
 * @property {string} [rev] - File revision (files only)
 * @property {number} [size] - File size in bytes (files only)
 * @property {boolean} [is_downloadable] - Whether file is downloadable (files only)
 * @property {string} [content_hash] - Content hash (files only)
 */

/**
 * @typedef {Object} DropboxError
 * @property {string} error_summary - Error summary
 * @property {Object} error - Error details
 * @property {string} error.message - Error message
 * @property {string} error.code - Error code
 */

/**
 * @typedef {Object} DropboxSearchResult
 * @property {DropboxEntry[]} matches - Array of matching entries
 * @property {boolean} more - Whether there are more results
 * @property {string} start - Start cursor for pagination
 */

/**
 * @typedef {Object} DropboxSharedLink
 * @property {string} tag - Link type tag
 * @property {string} url - Shared link URL
 * @property {string} id - Link ID
 * @property {string} name - Link name
 * @property {string} expires - Expiration timestamp
 * @property {string} path_lower - Lowercase path
 * @property {string} link_permissions - Link permissions
 * @property {string} team_member_info - Team member info
 * @property {string} content_owner_team_info - Content owner team info
 */

/**
 * @typedef {Object} DropboxSpaceUsage
 * @property {number} used - Used space in bytes
 * @property {Object} allocation - Space allocation details
 * @property {string} allocation.tag - Allocation type
 * @property {number} allocation.allocated - Allocated space in bytes
 */

/**
 * @typedef {Object} DropboxUploadResult
 * @property {string} tag - Result type tag
 * @property {string} name - File name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - File ID
 * @property {string} client_modified - Client modified timestamp
 * @property {string} server_modified - Server modified timestamp
 * @property {string} rev - File revision
 * @property {number} size - File size in bytes
 * @property {boolean} is_downloadable - Whether file is downloadable
 * @property {string} content_hash - Content hash
 */

/**
 * @typedef {Object} DropboxDeleteResult
 * @property {string} tag - Result type tag
 * @property {string} name - Entry name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Entry ID
 */

/**
 * @typedef {Object} DropboxMoveResult
 * @property {string} tag - Result type tag
 * @property {string} name - Entry name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Entry ID
 */

/**
 * @typedef {Object} DropboxCopyResult
 * @property {string} tag - Result type tag
 * @property {string} name - Entry name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Entry ID
 */

/**
 * @typedef {Object} DropboxCreateFolderResult
 * @property {string} tag - Result type tag
 * @property {string} name - Folder name
 * @property {string} path_lower - Lowercase path
 * @property {string} path_display - Display path
 * @property {string} id - Folder ID
 */

/**
 * @typedef {Object} ListFilesOptions
 * @property {string} [path] - Path to list files from
 * @property {boolean} [recursive] - Whether to list recursively
 * @property {number} [limit] - Maximum number of results
 */

/**
 * @typedef {Object} GetMetadataOptions
 * @property {string} path - Path to get metadata for
 */

/**
 * @typedef {Object} DownloadFileOptions
 * @property {string} path - Dropbox path to download from
 * @property {string} localPath - Local path to save to
 */

/**
 * @typedef {Object} UploadFileOptions
 * @property {string} localPath - Local path to upload from
 * @property {string} dropboxPath - Dropbox path to upload to
 * @property {boolean} [overwrite] - Whether to overwrite existing files
 */

/**
 * @typedef {Object} CreateFolderOptions
 * @property {string} path - Path of folder to create
 * @property {boolean} [autorename] - Whether to autorename if exists
 */

/**
 * @typedef {Object} DeleteFileOptions
 * @property {string} path - Path to delete
 */

/**
 * @typedef {Object} MoveFileOptions
 * @property {string} fromPath - Source path
 * @property {string} toPath - Destination path
 * @property {boolean} [autorename] - Whether to autorename if exists
 */

/**
 * @typedef {Object} CopyFileOptions
 * @property {string} fromPath - Source path
 * @property {string} toPath - Destination path
 * @property {boolean} [autorename] - Whether to autorename if exists
 */

/**
 * @typedef {Object} SearchFilesOptions
 * @property {string} query - Search query
 * @property {string} [path] - Path to search within
 * @property {number} [maxResults] - Maximum number of results
 * @property {string} [fileStatus] - File status filter
 */

/**
 * @typedef {Object} GetSharedLinksOptions
 * @property {string} path - Path to get shared links for
 */

/**
 * @typedef {Object} CreateSharedLinkOptions
 * @property {string} path - Path to create shared link for
 * @property {boolean} [shortUrl] - Whether to create short URL
 */

/**
 * @typedef {Object} MCPToolResult
 * @property {Array<{type: string, text: string}>} content - Tool result content
 * @property {boolean} [isError] - Whether result is an error
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Service display name
 * @property {string} version - Service version
 * @property {string[]} scopes - Required OAuth scopes
 */

module.exports = {};