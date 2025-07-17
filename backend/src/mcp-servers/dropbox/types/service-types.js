/**
 * Dropbox Service API Types
 * JSDoc type definitions for the Dropbox service layer
 */

/**
 * @typedef {Object} DropboxServiceConfig
 * @property {string} apiBaseUrl - Base URL for Dropbox API
 * @property {string} contentApiBaseUrl - Base URL for Dropbox Content API
 * @property {number} maxRetries - Maximum number of retries for API calls
 * @property {number} retryDelay - Delay between retries in milliseconds
 * @property {number} timeout - Request timeout in milliseconds
 */

/**
 * @typedef {Object} DropboxServiceInstance
 * @property {string} bearerToken - OAuth bearer token
 * @property {DropboxServiceConfig} config - Service configuration
 * @property {Function} listFiles - List files in a folder
 * @property {Function} getMetadata - Get file/folder metadata
 * @property {Function} downloadFile - Download a file
 * @property {Function} uploadFile - Upload a file
 * @property {Function} createFolder - Create a folder
 * @property {Function} deleteFile - Delete a file/folder
 * @property {Function} moveFile - Move a file/folder
 * @property {Function} copyFile - Copy a file/folder
 * @property {Function} searchFiles - Search for files
 * @property {Function} getSharedLinks - Get shared links for a file
 * @property {Function} createSharedLink - Create a shared link
 * @property {Function} getSpaceUsage - Get space usage information
 */

/**
 * @typedef {Object} APIRequestOptions
 * @property {string} method - HTTP method
 * @property {Object} headers - Request headers
 * @property {string} [body] - Request body
 * @property {number} [timeout] - Request timeout
 */

/**
 * @typedef {Object} APIResponse
 * @property {boolean} ok - Whether request was successful
 * @property {number} status - HTTP status code
 * @property {string} statusText - HTTP status text
 * @property {Function} json - Parse response as JSON
 * @property {Function} text - Parse response as text
 * @property {Function} arrayBuffer - Parse response as ArrayBuffer
 */

/**
 * @typedef {Object} RetryOptions
 * @property {number} maxRetries - Maximum number of retries
 * @property {number} baseDelay - Base delay between retries
 * @property {number} timeout - Request timeout
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - Field that failed validation
 * @property {string} message - Error message
 * @property {any} value - Invalid value
 */

/**
 * @typedef {Object} ServiceError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {any} [data] - Additional error data
 * @property {boolean} retryable - Whether error is retryable
 */

/**
 * @typedef {Object} FileOperationResult
 * @property {boolean} success - Whether operation was successful
 * @property {string} [path] - File path
 * @property {string} [id] - File ID
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} PaginationOptions
 * @property {string} [cursor] - Pagination cursor
 * @property {number} [limit] - Maximum number of results
 * @property {boolean} [hasMore] - Whether there are more results
 */

/**
 * @typedef {Object} SearchOptions
 * @property {string} query - Search query
 * @property {string} [path] - Path to search within
 * @property {number} [maxResults] - Maximum number of results
 * @property {string} [fileStatus] - File status filter
 * @property {string} [fileCategories] - File categories filter
 * @property {string} [mode] - Search mode
 */

/**
 * @typedef {Object} UploadOptions
 * @property {string} mode - Upload mode (add, overwrite, update)
 * @property {boolean} [autorename] - Whether to autorename
 * @property {string} [clientModified] - Client modified timestamp
 * @property {boolean} [mute] - Whether to mute notifications
 * @property {boolean} [strictConflict] - Whether to use strict conflict resolution
 */

/**
 * @typedef {Object} SharedLinkSettings
 * @property {string} [requestedVisibility] - Requested visibility
 * @property {string} [linkPassword] - Link password
 * @property {string} [expires] - Expiration timestamp
 * @property {string} [audience] - Audience setting
 * @property {string} [access] - Access setting
 * @property {boolean} [allowDownload] - Whether to allow download
 * @property {boolean} [shortUrl] - Whether to use short URL
 */

/**
 * @typedef {Object} TokenInfo
 * @property {string} accessToken - Access token
 * @property {string} [refreshToken] - Refresh token
 * @property {number} [expiresIn] - Token expiration time
 * @property {string} [tokenType] - Token type
 * @property {string[]} [scopes] - Token scopes
 */

/**
 * @typedef {Object} AuthenticationError
 * @property {string} error - Error type
 * @property {string} errorDescription - Error description
 * @property {string} [errorUri] - Error URI
 */

export {};