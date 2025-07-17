/**
 * Dropbox response formatting utilities
 * Standardizes response formats for Dropbox API operations to match Gmail patterns
 */

/**
 * Format file entry for display
 */
export function formatFileEntry(entry) {
  const isFolder = entry['.tag'] === 'folder';
  
  return {
    name: entry.name,
    path: entry.path_display,
    type: isFolder ? 'folder' : 'file',
    id: entry.id,
    ...(isFolder ? {
      // Folder-specific fields
      shared_folder_id: entry.shared_folder_id,
      sharing_info: entry.sharing_info
    } : {
      // File-specific fields
      size: entry.size,
      client_modified: entry.client_modified,
      server_modified: entry.server_modified,
      rev: entry.rev,
      content_hash: entry.content_hash,
      is_downloadable: entry.is_downloadable,
      has_explicit_shared_members: entry.has_explicit_shared_members
    })
  };
}

/**
 * Format file list response
 */
export function formatFileList(response) {
  return {
    entries: response.entries.map(formatFileEntry),
    has_more: response.has_more,
    cursor: response.cursor
  };
}

/**
 * Format search results
 */
export function formatSearchResults(response) {
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
 */
export function formatSharedLink(link) {
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
 */
export function formatSpaceUsage(usage) {
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
 */
export function formatError(error) {
  return {
    error: true,
    message: error.message,
    type: error.name || 'DropboxError',
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response with standard structure
 */
export function formatSuccessResponse(message, data = null) {
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
 */
export function formatFileMetadata(metadata) {
  const isFolder = metadata['.tag'] === 'folder';
  
  const formatted = {
    name: metadata.name,
    path: metadata.path_display,
    type: isFolder ? 'folder' : 'file',
    id: metadata.id
  };
  
  if (!isFolder) {
    formatted.size = metadata.size;
    formatted.size_readable = formatFileSize(metadata.size);
    formatted.client_modified = metadata.client_modified;
    formatted.server_modified = metadata.server_modified;
    formatted.rev = metadata.rev;
    formatted.content_hash = metadata.content_hash;
    formatted.is_downloadable = metadata.is_downloadable;
    formatted.media_info = metadata.media_info;
    formatted.sharing_info = metadata.sharing_info;
    formatted.property_groups = metadata.property_groups;
    formatted.has_explicit_shared_members = metadata.has_explicit_shared_members;
    formatted.content_ownership = metadata.content_ownership;
  } else {
    formatted.shared_folder_id = metadata.shared_folder_id;
    formatted.sharing_info = metadata.sharing_info;
    formatted.property_groups = metadata.property_groups;
  }
  
  return formatted;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
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
 */
export function createToolResponse(toolName, success, message, data = null) {
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
 */
export function formatOperationSummary(operation, path, result) {
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
      summary.size = result.size;
      summary.size_readable = formatFileSize(result.size);
      break;
      
    case 'create_folder':
    case 'move':
    case 'copy':
    case 'delete':
      summary.metadata = formatFileMetadata(result.metadata || result);
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
 * @param {Object} data - Response data to format
 * @returns {string} Formatted response string
 */
export function formatDropboxResponse(data) {
  const timestamp = data.timestamp || new Date().toISOString();
  
  switch (data.action) {
    case 'list_files':
      const fileList = data.files.map((file, index) => {
        const typeIcon = file.type === 'folder' ? '📁' : '📄';
        const sizeInfo = file.size ? ` (${formatFileSize(file.size)})` : '';
        const modifiedInfo = file.server_modified ? ` - Modified: ${new Date(file.server_modified).toLocaleDateString()}` : '';
        
        return `${index + 1}. ${typeIcon} ${file.name}${sizeInfo}
   Path: ${file.path}
   ID: ${file.id}${modifiedInfo}`;
      }).join('\n\n');

      return `📁 Retrieved ${data.count} item(s) from "${data.path}"

${data.has_more ? `Showing ${data.count} items (more available)\n` : ''}${fileList || 'No files found.'}`;

    case 'upload_file':
      return `✅ File uploaded successfully!

File Details:
- Name: ${data.name}
- Path: ${data.path}
- Size: ${formatFileSize(data.size)}
- ID: ${data.id}
- Uploaded at: ${timestamp}

The file has been saved to your Dropbox.`;

    case 'download_file':
      return `📥 File downloaded successfully!

File Details:
- Name: ${data.name}
- Path: ${data.path}
- Size: ${formatFileSize(data.size)}
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
      if (data.matches.length === 0) {
        return `🔍 No files found matching "${data.query}"

Try adjusting your search terms or searching in different folders.`;
      }

      const searchResults = data.matches.map((match, index) => {
        const file = match.metadata;
        const typeIcon = file.type === 'folder' ? '📁' : '📄';
        const sizeInfo = file.size ? ` (${formatFileSize(file.size)})` : '';
        
        return `${index + 1}. ${typeIcon} ${file.name}${sizeInfo}
   Path: ${file.path}
   Match Type: ${match.match_type}`;
      }).join('\n\n');

      return `🔍 Found ${data.matches.length} item(s) matching "${data.query}"

${searchResults}`;

    case 'get_space_usage':
      return `💾 Dropbox Storage Usage

📊 Used: ${data.used_gb} GB of ${data.allocated_gb} GB (${data.usage_percent}%)
📈 Allocation Type: ${data.allocation_type}
📅 Retrieved at: ${timestamp}

Storage information updated successfully.`;

    case 'get_file_metadata':
      const metaTypeIcon = data.type === 'folder' ? '📁' : '📄';
      const metaSizeInfo = data.size ? `\n- Size: ${formatFileSize(data.size)}` : '';
      const metaModifiedInfo = data.server_modified ? `\n- Modified: ${new Date(data.server_modified).toLocaleDateString()}` : '';
      
      return `${metaTypeIcon} File Metadata Retrieved

File Details:
- Name: ${data.name}
- Path: ${data.path}
- Type: ${data.type}
- ID: ${data.id}${metaSizeInfo}${metaModifiedInfo}
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
export function formatDropboxError(operation, error) {
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