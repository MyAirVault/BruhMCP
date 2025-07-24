/**
 * @fileoverview Type definitions for Google Drive API modules
 */

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Object} [headers] - Request headers
 * @property {Object|string|FormData} [body] - Request body
 * @property {boolean} [raw] - Whether body is raw (not JSON)
 */

/**
 * @typedef {Object} ActivityOptions
 * @property {number} [pageSize=50] - Page size
 * @property {boolean} [filterByMe=false] - Filter by current user
 */

/**
 * @typedef {Object} CommentOptions
 * @property {boolean} [includeDeleted=false] - Include deleted comments
 * @property {number} [pageSize=100] - Page size
 */

/**
 * @typedef {Object} ChangeTrackingOptions
 * @property {string} [pageToken] - Page token
 * @property {number} [pageSize=100] - Page size
 * @property {boolean} [includeRemoved=true] - Include removed items
 * @property {boolean} [restrictToMyDrive=false] - Restrict to My Drive
 */

/**
 * @typedef {Object} ListOptions
 * @property {number} [pageSize=100] - Page size
 * @property {string} [pageToken] - Page token
 * @property {string} [orderBy='modifiedTime desc'] - Order by clause
 */

/**
 * @typedef {Object} SyncParams
 * @property {boolean} [recursive=true] - Apply recursively
 * @property {boolean} [applyToFiles=true] - Apply to files
 * @property {boolean} [applyToFolders=true] - Apply to folders
 */

/**
 * @typedef {Object} UpdateMetadata
 * @property {string} fileId - File ID
 * @property {Object} metadata - Metadata to update
 */

export {};