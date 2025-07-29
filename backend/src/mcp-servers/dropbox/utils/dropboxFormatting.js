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
 * @property {{'.tag': 'filename' | 'content' | 'both'} | string} match_type - Type of match
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
function formatFileEntry(entry) {
  const isFolder = entry['.tag'] === 'folder';
  
  return {
    name: entry.name,
    path: entry.path_display,
    type: isFolder ? 'folder' : 'file',
    id: entry.id,
    ...(isFolder ? {
      // Folder-specific fields
      shared_folder_id: (/** @type {DropboxFolder} */ (entry)).shared_folder_id,
      sharing_info: (/** @type {DropboxFolder} */ (entry)).sharing_info
    } : {
      // File-specific fields
      size: (/** @type {DropboxFileMetadata} */ (entry)).size,
      client_modified: (/** @type {DropboxFileMetadata} */ (entry)).client_modified,
      server_modified: (/** @type {DropboxFileMetadata} */ (entry)).server_modified,
      rev: (/** @type {DropboxFileMetadata} */ (entry)).rev,
      content_hash: (/** @type {DropboxFileMetadata} */ (entry)).content_hash,
      is_downloadable: (/** @type {DropboxFileMetadata} */ (entry)).is_downloadable,
      has_explicit_shared_members: (/** @type {DropboxFileMetadata} */ (entry)).has_explicit_shared_members
    })
  };
}

/**
 * Format file list response
 * @param {DropboxListFolderResponse} response - The Dropbox list folder response
 * @returns {Object} Formatted file list
 */
function formatFileList(response) {
  return {
    entries: response.entries.map(formatFileEntry),
    has_more: response.has_more,
    cursor: response.cursor
  };
}

/**
 * Format search results
 * @param {DropboxSearchResponse} response - The Dropbox search response
 * @returns {Object} Formatted search results
 */
function formatSearchResults(response) {
  return {
    matches: response.matches.map(match => ({
      match_type: match.match_type,
      metadata: formatFileEntry(match.metadata)
    })),
    has_more: response.has_more,
    start: response.start
  };
}

/**
 * Format shared link response
 * @param {DropboxSharedLink} link - The shared link to format
 * @returns {Object} Formatted shared link
 */
function formatSharedLink(link) {
  return {
    url: link.url,
    name: link.name,
    path: link.path_display,
    id: link.id,
    expires: link.expires,
    visibility: link.visibility,
    link_permissions: link.link_permissions,
    team_member_info: link.team_member_info
  };
}

/**
 * Format space usage response
 * @param {DropboxSpaceUsage} usage - The space usage data
 * @returns {Object} Formatted space usage
 */
function formatSpaceUsage(usage) {
  const usedBytes = usage.used;
  const allocatedBytes = usage.allocation?.allocated || 0;
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const allocatedGB = (allocatedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const usagePercent = allocatedBytes > 0 ? ((usedBytes / allocatedBytes) * 100).toFixed(1) : '0';
  
  return {
    used_bytes: usedBytes,
    allocated_bytes: allocatedBytes,
    used_gb: usedGB,
    allocated_gb: allocatedGB,
    usage_percent: usagePercent,
    allocation_type: usage.allocation?.['.tag'] || 'unknown'
  };
}

/**
 * Format error response
 * @param {Error} error - The error object
 * @returns {Object} Formatted error response
 */
function formatError(error) {
  return {
    error: true,
    message: error.message,
    type: error.name || 'DropboxError',
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response with standard structure
 * @param {string} message - Success message
 * @param {Object|null} [data=null] - Optional data to include
 * @returns {FormattedSuccessResponse} Formatted success response
 */
function formatSuccessResponse(message, data = null) {
  /** @type {FormattedSuccessResponse} */
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}

/**
 * Format file metadata for display
 * @param {DropboxFileMetadata | DropboxFolder} metadata - The file or folder metadata
 * @returns {FormattedFileEntry} Formatted metadata
 */
function formatFileMetadata(metadata) {
  const isFolder = metadata['.tag'] === 'folder';
  
  /** @type {FormattedFileEntry} */
  const formatted = {
    name: metadata.name,
    path: metadata.path_display,
    type: isFolder ? 'folder' : 'file',
    id: metadata.id
  };
  
  if (!isFolder) {
    const fileMetadata = /** @type {DropboxFileMetadata} */ (metadata);
    if (fileMetadata.size !== undefined) {
      formatted.size = fileMetadata.size;
      formatted.size_readable = formatFileSize(fileMetadata.size);
    }
    formatted.client_modified = fileMetadata.client_modified;
    formatted.server_modified = fileMetadata.server_modified;
    formatted.rev = fileMetadata.rev;
    formatted.content_hash = fileMetadata.content_hash;
    formatted.is_downloadable = fileMetadata.is_downloadable;
    formatted.media_info = fileMetadata.media_info;
    formatted.sharing_info = fileMetadata.sharing_info;
    formatted.property_groups = fileMetadata.property_groups;
    formatted.has_explicit_shared_members = fileMetadata.has_explicit_shared_members;
    formatted.content_ownership = fileMetadata.content_ownership;
  } else {
    const folderMetadata = /** @type {DropboxFolder} */ (metadata);
    formatted.shared_folder_id = folderMetadata.shared_folder_id;
    formatted.sharing_info = folderMetadata.sharing_info;
    formatted.property_groups = folderMetadata.property_groups;
  }
  
  return formatted;
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Human-readable size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date for display
 * @param {string|null|undefined} dateString - ISO date string
 * @returns {Object|null} Formatted date object or null
 */
function formatDate(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return {
    iso: date.toISOString(),
    readable: date.toLocaleString(),
    timestamp: date.getTime()
  };
}

/**
 * Create standardized tool response
 * @param {string} toolName - Name of the tool
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {Object|null} [data=null] - Optional data to include
 * @returns {FormattedToolResponse} Standardized tool response
 */
function createToolResponse(toolName, success, message, data = null) {
  /** @type {FormattedToolResponse} */
  const response = {
    tool: toolName,
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}

/**
 * Format operation summary
 * @param {string} operation - The operation that was performed
 * @param {string} path - The path the operation was performed on
 * @param {OperationResult} result - The result of the operation
 * @returns {FormattedOperationSummary} Formatted operation summary
 */
function formatOperationSummary(operation, path, result) {
  /** @type {FormattedOperationSummary} */
  const summary = {
    operation,
    path,
    success: true,
    timestamp: new Date().toISOString()
  };
  
  // Add operation-specific details
  switch (operation) {
    case 'list':
      summary.items_count = result.entries?.length || 0;
      summary.has_more = result.has_more;
      break;
      
    case 'search':
      summary.matches_count = result.matches?.length || 0;
      summary.has_more = result.has_more;
      break;
      
    case 'upload':
    case 'download':
      if (result.size !== undefined) {
        summary.size = result.size;
        summary.size_readable = formatFileSize(result.size);
      }
      break;
      
    case 'create_folder':
    case 'move':
    case 'copy':
    case 'delete':
      if (result.metadata) {
        summary.metadata = formatFileMetadata(result.metadata);
      }
      break;
      
    case 'share':
      summary.url = result.url;
      summary.expires = result.expires;
      break;
  }
  
  return summary;
}

/**
 * Format Dropbox tool response similar to Gmail formatting
 * @param {DropboxResponseData} data - Response data to format
 * @returns {string} Formatted response string
 */
function formatDropboxResponse(data) {
  const timestamp = data.timestamp || new Date().toISOString();
  
  switch (data.action) {
    case 'list_files':
      if (!data.files) {
        return `📁 No files found in "${data.path || 'unknown path'}"`;
      }
      
      const fileList = data.files.map((/** @type {FormattedFileEntry} */ file, /** @type {number} */ index) => {
        const typeIcon = file.type === 'folder' ? '📁' : '📄';
        const sizeInfo = file.size ? ` (${formatFileSize(file.size)})` : '';
        const modifiedInfo = file.server_modified ? ` - Modified: ${new Date(file.server_modified).toLocaleDateString()}` : '';
        
        return `${index + 1}. ${typeIcon} ${file.name}${sizeInfo}
   Path: ${file.path}
   ID: ${file.id}${modifiedInfo}`;
      }).join('\n\n');

      return `📁 Retrieved ${data.count || 0} item(s) from "${data.path || 'unknown path'}"

${data.has_more ? `Showing ${data.count || 0} items (more available)\n` : ''}${fileList || 'No files found.'}`;

    case 'upload_file':
      return `✅ File uploaded successfully!

File Details:
- Name: ${data.name || 'Unknown'}
- Path: ${data.path || 'Unknown'}
- Size: ${data.size ? formatFileSize(data.size) : 'Unknown'}
- ID: ${data.id || 'Unknown'}
- Uploaded at: ${timestamp}

The file has been saved to your Dropbox.`;

    case 'download_file':
      return `📥 File downloaded successfully!

File Details:
- Name: ${data.name || 'Unknown'}
- Path: ${data.path || 'Unknown'}
- Size: ${data.size ? formatFileSize(data.size) : 'Unknown'}
- Downloaded at: ${timestamp}

The file content is available in base64 format.`;

    case 'create_folder':
      return `📁 Folder created successfully!

Folder Details:
- Name: ${data.name}
- Path: ${data.path}
- ID: ${data.id}
- Created at: ${timestamp}

The folder is now available in your Dropbox.`;

    case 'delete_file':
      return `🗑️ File deleted successfully!

- Name: ${data.name}
- Path: ${data.path}
- Deleted at: ${timestamp}

The file has been permanently removed from your Dropbox.`;

    case 'move_file':
      return `📦 File moved successfully!

Move Details:
- From: ${data.from_path}
- To: ${data.to_path}
- Name: ${data.name}
- ID: ${data.id}
- Moved at: ${timestamp}

The file has been moved to its new location.`;

    case 'copy_file':
      return `📋 File copied successfully!

Copy Details:
- From: ${data.from_path}
- To: ${data.to_path}
- Name: ${data.name}
- ID: ${data.id}
- Copied at: ${timestamp}

A copy of the file has been created at the new location.`;

    case 'share_file':
      return `🔗 Share link created successfully!

Share Details:
- File: ${data.name}
- Path: ${data.path}
- Share URL: ${data.url}
- Visibility: ${data.visibility}
${data.expires ? `- Expires: ${new Date(data.expires).toLocaleDateString()}` : '- No expiration'}
- Created at: ${timestamp}

The share link is now active and can be used to access the file.`;

    case 'search_files':
      if (!data.matches || data.matches.length === 0) {
        return `🔍 No files found matching "${data.query || 'unknown query'}"

Try adjusting your search terms or searching in different folders.`;
      }

      const searchResults = data.matches.map((/** @type {FormattedSearchMatch} */ match, /** @type {number} */ index) => {
        const file = match.metadata;
        const typeIcon = file.type === 'folder' ? '📁' : '📄';
        const sizeInfo = file.size ? ` (${formatFileSize(file.size)})` : '';
        
        return `${index + 1}. ${typeIcon} ${file.name}${sizeInfo}
   Path: ${file.path}
   Match Type: ${match.match_type}`;
      }).join('\n\n');

      return `🔍 Found ${data.matches.length} item(s) matching "${data.query || 'unknown query'}"

${searchResults}`;

    case 'get_space_usage':
      return `💾 Dropbox Storage Usage

📊 Used: ${data.used_gb || 'Unknown'} GB of ${data.allocated_gb || 'Unknown'} GB (${data.usage_percent || 'Unknown'}%)
📈 Allocation Type: ${data.allocation_type || 'Unknown'}
📅 Retrieved at: ${timestamp}

Storage information updated successfully.`;

    case 'get_file_metadata':
      const metaTypeIcon = data.type === 'folder' ? '📁' : '📄';
      const metaSizeInfo = data.size ? `\n- Size: ${formatFileSize(data.size)}` : '';
      const metaModifiedInfo = data.server_modified ? `\n- Modified: ${new Date(data.server_modified).toLocaleDateString()}` : '';
      
      return `${metaTypeIcon} File Metadata Retrieved

File Details:
- Name: ${data.name || 'Unknown'}
- Path: ${data.path || 'Unknown'}
- Type: ${data.type || 'Unknown'}
- ID: ${data.id || 'Unknown'}${metaSizeInfo}${metaModifiedInfo}
- Retrieved at: ${timestamp}

Metadata information updated successfully.`;

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Format error messages for Dropbox operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
function formatDropboxError(operation, error) {
  const timestamp = new Date().toISOString();
  
  let errorType = 'Unknown error';
  let suggestion = 'Please try again or contact support.';
  
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    errorType = 'Authentication failed';
    suggestion = 'Please check your OAuth credentials and try again.';
  } else if (error.message.includes('403') || error.message.includes('forbidden')) {
    errorType = 'Permission denied';
    suggestion = 'Please ensure your OAuth credentials have the required Dropbox permissions.';
  } else if (error.message.includes('404') || error.message.includes('not found')) {
    errorType = 'File or folder not found';
    suggestion = 'The requested file or folder may have been moved or deleted.';
  } else if (error.message.includes('400') || error.message.includes('bad request')) {
    errorType = 'Invalid request';
    suggestion = 'Please check your input parameters and try again.';
  } else if (error.message.includes('429') || error.message.includes('rate limit')) {
    errorType = 'Rate limit exceeded';
    suggestion = 'Please wait a moment before trying again.';
  } else if (error.message.includes('insufficient_space')) {
    errorType = 'Insufficient storage space';
    suggestion = 'Please free up space in your Dropbox account.';
  } else if (error.message.includes('malformed_path')) {
    errorType = 'Invalid file path';
    suggestion = 'Please check the file path format and try again.';
  }

  return `❌ Dropbox ${operation} failed

Error Type: ${errorType}
Error Message: ${error.message}
Timestamp: ${timestamp}

Suggestion: ${suggestion}`;
}

module.exports = {
  formatFileEntry,
  formatFileList,
  formatSearchResults,
  formatSharedLink,
  formatSpaceUsage,
  formatError,
  formatSuccessResponse,
  formatFileMetadata,
  formatFileSize,
  formatDate,
  createToolResponse,
  formatOperationSummary,
  formatDropboxResponse,
  formatDropboxError
};