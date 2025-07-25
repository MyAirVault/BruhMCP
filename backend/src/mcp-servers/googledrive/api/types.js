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

/**
 * @typedef {Object} DriveRevision
 * @property {string} id - Revision ID
 * @property {string} modifiedTime - Modified time
 * @property {boolean} keepForever - Keep forever flag
 * @property {boolean} published - Published flag
 * @property {boolean} publishAuto - Auto publish flag
 * @property {boolean} publishedOutsideDomain - Published outside domain flag
 * @property {Object} lastModifyingUser - Last modifying user
 * @property {string} originalFilename - Original filename
 * @property {string} md5Checksum - MD5 checksum
 * @property {string} size - File size
 */

/**
 * @typedef {Object} DriveFile
 * @property {string} id - File ID
 * @property {string} name - File name
 * @property {string} mimeType - MIME type
 * @property {string} modifiedTime - Modified time
 * @property {string} viewedByMeTime - Viewed by me time
 * @property {string} modifiedByMeTime - Modified by me time
 * @property {Object} lastModifyingUser - Last modifying user
 * @property {Object[]} owners - File owners
 */

/**
 * @typedef {Object} DriveComment
 * @property {string} id - Comment ID
 * @property {string} content - Comment content
 * @property {string} createdTime - Created time
 * @property {string} modifiedTime - Modified time
 * @property {Object} author - Comment author
 * @property {boolean} resolved - Resolved flag
 * @property {DriveReply[]} replies - Comment replies
 */

/**
 * @typedef {Object} DriveReply
 * @property {string} id - Reply ID
 * @property {string} content - Reply content
 * @property {string} createdTime - Created time
 * @property {string} modifiedTime - Modified time
 * @property {Object} author - Reply author
 */

/**
 * @typedef {Object} DriveChange
 * @property {boolean} removed - Removed flag
 * @property {string} changeType - Change type
 * @property {string} time - Change time
 * @property {DriveFile|null} file - Changed file
 */

/**
 * @typedef {Object} DrivePermission
 * @property {string} id - Permission ID
 * @property {string} type - Permission type (user, group, domain, anyone)
 * @property {string} role - Permission role (owner, organizer, fileOrganizer, writer, commenter, reader)
 * @property {string} [emailAddress] - Email address for user/group permissions
 * @property {string} [domain] - Domain for domain permissions
 */

/**
 * @typedef {Object} DriveMetadata
 * @property {string} [name] - File name
 * @property {string} [description] - File description
 * @property {string[]} [parents] - Parent folder IDs
 * @property {boolean} [starred] - Starred flag
 * @property {boolean} [trashed] - Trashed flag
 */

export {};