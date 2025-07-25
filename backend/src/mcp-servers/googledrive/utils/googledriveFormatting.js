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
export function formatFileResponse(file) {
  if (!file) return null;

  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    type: getFileType(file.mimeType),
    size: file.size ? formatFileSize(parseInt(file.size)) : null,
    createdTime: file.createdTime ? new Date(file.createdTime).toLocaleString() : null,
    modifiedTime: file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : null,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink,
    parents: file.parents || [],
    permissions: file.permissions || [],
    shared: file.shared || false,
    starred: file.starred || false,
    trashed: file.trashed || false
  };
}

/**
 * Format file list response
 * @param {GoogleDriveFilesResponse|null|undefined} response - Google Drive files list response
 * @param {string} query - Optional search query
 * @returns {FormattedFileList} Formatted file list
 */
export function formatFileListResponse(response, query = '') {
  if (!response || !response.files) {
    return { 
      files: [], 
      totalCount: 0,
      nextPageToken: null,
      hasMore: false,
      query: query || null
    };
  }

  const formattedFiles = response.files.map(file => formatFileResponse(file)).filter(file => file !== null);
  
  return {
    files: formattedFiles,
    totalCount: formattedFiles.length,
    nextPageToken: response.nextPageToken || null,
    hasMore: !!response.nextPageToken,
    query: query || null
  };
}

/**
 * Format upload response
 * @param {GoogleDriveFile} response - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload response
 */
export function formatUploadResponse(response, originalPath) {
  const formatted = formatFileResponse(response);
  
  return {
    success: true,
    message: 'File uploaded successfully',
    originalPath,
    file: formatted,
    uploadTime: new Date().toISOString()
  };
}

/**
 * Format drive info response
 * @param {GoogleDriveAbout|null|undefined} about - Google Drive about response
 * @returns {Object|null} Formatted drive info
 */
export function formatDriveInfoResponse(about) {
  if (!about || typeof about !== 'object' || !about.storageQuota) return null;

  const quota = about.storageQuota;
  if (!quota || typeof quota !== 'object') return null;

  const used = parseInt(quota.usage) || 0;
  const limit = parseInt(quota.limit) || 0;
  const usageInDrive = parseInt(quota.usageInDrive) || 0;
  const usageInDriveTrash = parseInt(quota.usageInDriveTrash) || 0;

  return {
    user: about.user && typeof about.user === 'object' ? {
      displayName: about.user.displayName || null,
      emailAddress: about.user.emailAddress || null,
      photoLink: about.user.photoLink || null
    } : null,
    storage: {
      used: formatFileSize(used),
      limit: limit > 0 ? formatFileSize(limit) : 'Unlimited',
      usageInDrive: formatFileSize(usageInDrive),
      usageInDriveTrash: formatFileSize(usageInDriveTrash),
      percentUsed: limit > 0 ? Math.round((used / limit) * 100) : 0,
      available: limit > 0 ? formatFileSize(limit - used) : 'Unlimited'
    },
    raw: {
      used,
      limit,
      usageInDrive,
      usageInDriveTrash
    }
  };
}

/**
 * Format file permissions
 * @param {GoogleDrivePermission[]|null|undefined} permissions - Array of permission objects
 * @returns {Object} Formatted permissions
 */
export function formatFilePermissions(permissions) {
  if (!permissions || !Array.isArray(permissions)) return { permissions: [], summary: {} };

  const formattedPermissions = permissions.map(permission => ({
    id: permission.id,
    type: permission.type,
    role: permission.role,
    emailAddress: permission.emailAddress,
    displayName: permission.displayName,
    photoLink: permission.photoLink,
    domain: permission.domain,
    allowFileDiscovery: permission.allowFileDiscovery,
    deleted: permission.deleted || false
  }));

  // Create summary
  const summary = {
    totalPermissions: formattedPermissions.length,
    /** @type {Record<string, number>} */
    byType: {},
    /** @type {Record<string, number>} */
    byRole: {},
    isPublic: permissions.some(p => p.type === 'anyone'),
    hasExternalUsers: permissions.some(p => p.type === 'user' && p.emailAddress && !p.emailAddress.includes('@gmail.com'))
  };

  // Count by type and role
  formattedPermissions.forEach(permission => {
    if (permission.type) {
      summary.byType[permission.type] = (summary.byType[permission.type] || 0) + 1;
    }
    if (permission.role) {
      summary.byRole[permission.role] = (summary.byRole[permission.role] || 0) + 1;
    }
  });

  return {
    permissions: formattedPermissions,
    summary
  };
}

/**
 * Format search results
 * @param {GoogleDriveFilesResponse} response - Google Drive search response
 * @param {string} query - Original search query
 * @returns {Object} Formatted search results
 */
export function formatSearchResults(response, query) {
  const fileList = formatFileListResponse(response, query);
  
  return {
    query,
    results: fileList.files,
    totalResults: fileList.totalCount,
    nextPageToken: fileList.nextPageToken,
    hasMore: fileList.hasMore,
    searchTime: new Date().toISOString(),
    summary: {
      totalFiles: fileList.totalCount,
      fileTypes: getFileTypeSummary(fileList.files),
      sizeDistribution: getSizeDistribution(fileList.files)
    }
  };
}

/**
 * Format upload result
 * @param {GoogleDriveFile} uploadResponse - Google Drive upload response
 * @param {string} originalPath - Original file path
 * @returns {Object} Formatted upload result
 */
export function formatUploadResult(uploadResponse, originalPath) {
  const formatted = formatFileResponse(uploadResponse);
  
  return {
    success: true,
    message: 'File uploaded successfully',
    originalPath,
    file: formatted,
    uploadTime: new Date().toISOString()
  };
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @param {string} operation - Operation that failed
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error, operation) {
  return {
    success: false,
    error: {
      message: error.message,
      operation,
      timestamp: new Date().toISOString(),
      type: error.constructor.name
    }
  };
}

/**
 * Get file type from MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} Human-readable file type
 */
function getFileType(mimeType) {
  if (!mimeType) return 'Unknown';

  /** @type {Record<string, string>} */
  const typeMap = {
    'application/vnd.google-apps.folder': 'Folder',
    'application/vnd.google-apps.document': 'Google Doc',
    'application/vnd.google-apps.spreadsheet': 'Google Sheet',
    'application/vnd.google-apps.presentation': 'Google Slides',
    'application/vnd.google-apps.form': 'Google Form',
    'application/vnd.google-apps.drawing': 'Google Drawing',
    'application/vnd.google-apps.script': 'Google Apps Script',
    'application/vnd.google-apps.site': 'Google Sites',
    'application/pdf': 'PDF',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
    'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
    'text/plain': 'Text File',
    'text/html': 'HTML File',
    'text/css': 'CSS File',
    'text/javascript': 'JavaScript File',
    'application/json': 'JSON File',
    'application/zip': 'ZIP Archive',
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/svg+xml': 'SVG Image',
    'video/mp4': 'MP4 Video',
    'video/quicktime': 'QuickTime Video',
    'audio/mpeg': 'MP3 Audio',
    'audio/wav': 'WAV Audio'
  };

  if (mimeType in typeMap) {
    return typeMap[mimeType];
  }
  return mimeType.split('/')[0].toUpperCase();
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return 'Unknown';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type summary from file list
 * @param {FormattedFile[]|null|undefined} files - Array of formatted files
 * @returns {Record<string, number>} File type summary
 */
function getFileTypeSummary(files) {
  /** @type {Record<string, number>} */
  const summary = {};
  
  // Validate input
  if (!files || !Array.isArray(files)) {
    return summary;
  }
  
  files.forEach(file => {
    if (!file || typeof file !== 'object') {
      return;
    }
    
    const type = file.type || 'Unknown';
    if (typeof type === 'string') {
      summary[type] = (summary[type] || 0) + 1;
    }
  });

  return summary;
}

/**
 * Get size distribution from file list
 * @param {FormattedFile[]|null|undefined} files - Array of formatted files
 * @returns {Record<string, number>} Size distribution
 */
function getSizeDistribution(files) {
  /** @type {Record<string, number>} */
  const distribution = {
    'Small (< 1MB)': 0,
    'Medium (1MB - 10MB)': 0,
    'Large (10MB - 100MB)': 0,
    'Very Large (> 100MB)': 0,
    'Unknown': 0
  };

  // Validate input
  if (!files || !Array.isArray(files)) {
    return distribution;
  }

  files.forEach(file => {
    if (!file || typeof file !== 'object') {
      distribution['Unknown']++;
      return;
    }
    
    if (!file.size) {
      distribution['Unknown']++;
      return;
    }

    // Extract numeric value from formatted size
    const sizeStr = file.size.toString();
    if (typeof sizeStr !== 'string' || sizeStr.length === 0) {
      distribution['Unknown']++;
      return;
    }
    
    const value = parseFloat(sizeStr);
    if (isNaN(value)) {
      distribution['Unknown']++;
      return;
    }
    
    if (sizeStr.includes('KB') || (sizeStr.includes('MB') && value < 1)) {
      distribution['Small (< 1MB)']++;
    } else if (sizeStr.includes('MB') && value < 10) {
      distribution['Medium (1MB - 10MB)']++;
    } else if (sizeStr.includes('MB') && value < 100) {
      distribution['Large (10MB - 100MB)']++;
    } else if (sizeStr.includes('MB') || sizeStr.includes('GB') || sizeStr.includes('TB')) {
      distribution['Very Large (> 100MB)']++;
    } else {
      distribution['Unknown']++;
    }
  });

  return distribution;
}

/**
 * Format folder tree structure
 * @param {FormattedFile[]} files - Array of files and folders
 * @returns {Object} Formatted folder tree
 */
export function formatFolderTree(files) {
  const folders = files.filter(file => file.type === 'Folder');
  const regularFiles = files.filter(file => file.type !== 'Folder');

  const tree = {
    folders: folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      path: folder.name,
      childCount: regularFiles.filter(file => file.parents.includes(folder.id)).length,
      modifiedTime: folder.modifiedTime
    })),
    files: regularFiles.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      modifiedTime: file.modifiedTime,
      parentFolders: file.parents
    }))
  };

  return tree;
}