/**
 * Google Drive Specialized Operations
 * Advanced operations for Google Drive that extend beyond basic CRUD
 * Similar to Gmail's label-operations.js
 */

import { formatFileResponse, formatFileListResponse } from '../utils/googledrive-formatting.js';
import { validateFileId, validateFileName, validateEmailAddress } from '../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
  const url = `${DRIVE_API_BASE}${endpoint}`;

  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Google Drive API error: ${response.status} ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error && errorData.error.message) {
        errorMessage = `Google Drive API error: ${errorData.error.message}`;
      }
    } catch (parseError) {
      // Use the default error message if JSON parsing fails
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Validate response data
  if (!data || (typeof data !== 'object' && typeof data !== 'string')) {
    throw new Error('Invalid response data from Google Drive API');
  }

  return data;
}

/**
 * Batch file operations
 * @param {Object} args - Batch operation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Batch operation result
 */
export async function batchFileOperations(args, bearerToken) {
  const { operations } = args;

  if (!operations || !Array.isArray(operations)) {
    throw new Error('Operations array is required');
  }

  if (operations.length === 0) {
    throw new Error('At least one operation is required');
  }

  if (operations.length > 10) {
    throw new Error(`Maximum 10 operations allowed in batch`);
  }

  const results = [];
  const errors = [];

  for (const [index, operation] of operations.entries()) {
    try {
      if (!operation.type || !operation.params) {
        throw new Error('Operation must have type and params');
      }

      let result;
      switch (operation.type) {
        case 'create_folder':
          result = await createFolderOperation(operation.params, bearerToken);
          break;
        case 'move_file':
          result = await moveFileOperation(operation.params, bearerToken);
          break;
        case 'copy_file':
          result = await copyFileOperation(operation.params, bearerToken);
          break;
        case 'delete_file':
          result = await deleteFileOperation(operation.params, bearerToken);
          break;
        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }

      results.push({
        index,
        operation: operation.type,
        success: true,
        result
      });
    } catch (error) {
      errors.push({
        index,
        operation: operation.type,
        success: false,
        error: error.message
      });
    }
  }

  return {
    total: operations.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * Advanced folder management operations
 * @param {Object} args - Folder operation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Folder operation result
 */
export async function advancedFolderOperations(args, bearerToken) {
  const { operation, folderId, params } = args;

  if (!operation) {
    throw new Error('Operation type is required');
  }

  if (!folderId) {
    throw new Error('Folder ID is required');
  }

  try {
    validateFileId(folderId);
  } catch (error) {
    throw new Error(`Invalid folder ID: ${error.message}`);
  }

  switch (operation) {
    case 'get_folder_structure':
      return await getFolderStructure(folderId, bearerToken, params);
    case 'bulk_move_to_folder':
      return await bulkMoveToFolder(folderId, bearerToken, params);
    case 'get_folder_permissions':
      return await getFolderPermissions(folderId, bearerToken);
    case 'sync_folder_permissions':
      return await syncFolderPermissions(folderId, bearerToken, params);
    default:
      throw new Error(`Unsupported folder operation: ${operation}`);
  }
}

/**
 * Get complete folder structure with nested files and subfolders
 * @param {string} folderId - Folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} params - Additional parameters
 * @returns {Object} Folder structure
 */
async function getFolderStructure(folderId, bearerToken, params = {}) {
  const { maxDepth = 5, includeFiles = true, includePermissions = false } = params;

  if (maxDepth > 20) {
    throw new Error(`Maximum folder depth is 20`);
  }

  async function getFolderContents(currentFolderId, currentDepth) {
    if (currentDepth >= maxDepth) {
      return { files: [], folders: [], truncated: true };
    }

    const query = `'${currentFolderId}' in parents and trashed=false`;
    const fields = includePermissions
      ? 'files(id,name,mimeType,parents,createdTime,modifiedTime,size,permissions,shared)'
      : 'files(id,name,mimeType,parents,createdTime,modifiedTime,size,shared)';

    const endpoint = `/files?q=${encodeURIComponent(query)}&fields=${fields}&supportsAllDrives=true`;
    const result = await makeDriveRequest(endpoint, bearerToken);

    const files = [];
    const folders = [];

    if (result.files) {
      for (const item of result.files) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          const folderContents = await getFolderContents(item.id, currentDepth + 1);
          folders.push({
            ...formatFileResponse(item),
            contents: folderContents
          });
        } else if (includeFiles) {
          files.push(formatFileResponse(item));
        }
      }
    }

    return { files, folders, truncated: false };
  }

  const structure = await getFolderContents(folderId, 0);
  
  return {
    folderId,
    structure,
    maxDepth,
    includeFiles,
    includePermissions,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Bulk move files to a folder
 * @param {string} targetFolderId - Target folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} params - Parameters including file IDs
 * @returns {Object} Bulk move result
 */
async function bulkMoveToFolder(targetFolderId, bearerToken, params) {
  const { fileIds, removeFromCurrentParents = true } = params;

  if (!fileIds || !Array.isArray(fileIds)) {
    throw new Error('File IDs array is required');
  }

  if (fileIds.length === 0) {
    throw new Error('At least one file ID is required');
  }

  if (fileIds.length > 10) {
    throw new Error(`Maximum 10 files allowed in bulk move`);
  }

  const results = [];
  const errors = [];

  for (const [index, fileId] of fileIds.entries()) {
    try {
      validateFileId(fileId);

      // Get current parents if we need to remove them
      let removeParents = [];
      if (removeFromCurrentParents) {
        const fileInfo = await makeDriveRequest(`/files/${fileId}?fields=parents&supportsAllDrives=true`, bearerToken);
        removeParents = fileInfo.parents || [];
      }

      const params = new URLSearchParams();
      params.append('addParents', targetFolderId);
      params.append('supportsAllDrives', 'true');

      if (removeParents.length > 0) {
        params.append('removeParents', removeParents.join(','));
      }

      const endpoint = `/files/${fileId}?${params.toString()}`;
      const result = await makeDriveRequest(endpoint, bearerToken, { method: 'PATCH' });

      results.push({
        index,
        fileId,
        success: true,
        result: formatFileResponse(result)
      });
    } catch (error) {
      errors.push({
        index,
        fileId,
        success: false,
        error: error.message
      });
    }
  }

  return {
    targetFolderId,
    total: fileIds.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * Get folder permissions with inheritance info
 * @param {string} folderId - Folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Folder permissions
 */
async function getFolderPermissions(folderId, bearerToken) {
  const endpoint = `/files/${folderId}/permissions?supportsAllDrives=true`;
  const result = await makeDriveRequest(endpoint, bearerToken);

  const permissions = result.permissions || [];
  const summary = {
    total: permissions.length,
    byRole: {},
    byType: {},
    isPublic: permissions.some(p => p.type === 'anyone'),
    hasInheritedPermissions: permissions.some(p => p.inheritedFrom)
  };

  permissions.forEach(permission => {
    summary.byRole[permission.role] = (summary.byRole[permission.role] || 0) + 1;
    summary.byType[permission.type] = (summary.byType[permission.type] || 0) + 1;
  });

  return {
    folderId,
    permissions,
    summary,
    retrievedAt: new Date().toISOString()
  };
}

/**
 * Sync folder permissions to all contents
 * @param {string} folderId - Folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} params - Sync parameters
 * @returns {Object} Sync result
 */
async function syncFolderPermissions(folderId, bearerToken, params) {
  const { recursive = false, applyToFiles = true, applyToFolders = true } = params;

  // Get folder permissions
  const folderPermissions = await getFolderPermissions(folderId, bearerToken);
  const targetPermissions = folderPermissions.permissions.filter(p => p.type !== 'owner');

  // Get folder contents
  const query = `'${folderId}' in parents and trashed=false`;
  const endpoint = `/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&supportsAllDrives=true`;
  const contents = await makeDriveRequest(endpoint, bearerToken);

  const results = [];
  const errors = [];

  if (contents.files) {
    for (const item of contents.files) {
      const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
      
      if ((isFolder && applyToFolders) || (!isFolder && applyToFiles)) {
        try {
          // Apply permissions to this item
          for (const permission of targetPermissions) {
            const permissionData = {
              type: permission.type,
              role: permission.role
            };

            if (permission.emailAddress) permissionData.emailAddress = permission.emailAddress;
            if (permission.domain) permissionData.domain = permission.domain;

            await makeDriveRequest(`/files/${item.id}/permissions?supportsAllDrives=true`, bearerToken, {
              method: 'POST',
              body: permissionData
            });
          }

          results.push({
            fileId: item.id,
            fileName: item.name,
            isFolder,
            permissionsApplied: targetPermissions.length,
            success: true
          });

          // Recursively apply to subfolders
          if (recursive && isFolder) {
            const subResult = await syncFolderPermissions(item.id, bearerToken, params);
            results.push(...subResult.results);
            errors.push(...subResult.errors);
          }
        } catch (error) {
          errors.push({
            fileId: item.id,
            fileName: item.name,
            isFolder,
            success: false,
            error: error.message
          });
        }
      }
    }
  }

  return {
    folderId,
    recursive,
    applyToFiles,
    applyToFolders,
    total: results.length + errors.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * Helper functions for batch operations
 */
async function createFolderOperation(params, bearerToken) {
  const { folderName, parentFolderId } = params;

  if (!folderName) {
    throw new Error('Folder name is required');
  }

  validateFileName(folderName);

  if (parentFolderId) {
    validateFileId(parentFolderId);
  }

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const endpoint = '/files?supportsAllDrives=true';
  const result = await makeDriveRequest(endpoint, bearerToken, {
    method: 'POST',
    body: metadata
  });

  return formatFileResponse(result);
}

async function moveFileOperation(params, bearerToken) {
  const { fileId, newParentFolderId, removeFromParents } = params;

  if (!fileId) {
    throw new Error('File ID is required');
  }

  if (!newParentFolderId) {
    throw new Error('New parent folder ID is required');
  }

  validateFileId(fileId);
  validateFileId(newParentFolderId);

  const urlParams = new URLSearchParams();
  urlParams.append('addParents', newParentFolderId);
  urlParams.append('supportsAllDrives', 'true');

  if (removeFromParents && Array.isArray(removeFromParents)) {
    for (const parentId of removeFromParents) {
      validateFileId(parentId);
    }
    urlParams.append('removeParents', removeFromParents.join(','));
  }

  const endpoint = `/files/${fileId}?${urlParams.toString()}`;
  const result = await makeDriveRequest(endpoint, bearerToken, { method: 'PATCH' });

  return formatFileResponse(result);
}

async function copyFileOperation(params, bearerToken) {
  const { fileId, newName, parentFolderId } = params;

  if (!fileId) {
    throw new Error('File ID is required');
  }

  if (!newName) {
    throw new Error('New name is required');
  }

  validateFileId(fileId);
  validateFileName(newName);

  if (parentFolderId) {
    validateFileId(parentFolderId);
  }

  const metadata = { name: newName };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const endpoint = `/files/${fileId}/copy?supportsAllDrives=true`;
  const result = await makeDriveRequest(endpoint, bearerToken, {
    method: 'POST',
    body: metadata
  });

  return formatFileResponse(result);
}

async function deleteFileOperation(params, bearerToken) {
  const { fileId } = params;

  if (!fileId) {
    throw new Error('File ID is required');
  }

  validateFileId(fileId);

  const endpoint = `/files/${fileId}?supportsAllDrives=true`;
  
  const url = `${DRIVE_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${bearerToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete file: ${errorText}`);
  }

  return {
    success: true,
    message: 'File deleted successfully',
    fileId
  };
}

/**
 * Advanced search operations
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Advanced search results
 */
export async function advancedSearch(args, bearerToken) {
  const { 
    query,
    fileTypes = [],
    modifiedAfter,
    modifiedBefore,
    owners = [],
    shared,
    starred,
    trashed = false,
    maxResults = 100,
    orderBy = 'modifiedTime'
  } = args;

  if (!query) {
    throw new Error('Search query is required');
  }

  // Build advanced search query
  let searchQuery = query;
  
  // Add file type filters
  if (fileTypes.length > 0) {
    const mimeTypeQueries = fileTypes.map(type => {
      const mimeTypeMap = {
        'document': 'application/vnd.google-apps.document',
        'spreadsheet': 'application/vnd.google-apps.spreadsheet',
        'presentation': 'application/vnd.google-apps.presentation',
        'pdf': 'application/pdf',
        'image': 'image/',
        'video': 'video/',
        'audio': 'audio/',
        'folder': 'application/vnd.google-apps.folder'
      };
      
      return mimeTypeMap[type] 
        ? `mimeType='${mimeTypeMap[type]}'` 
        : `mimeType contains '${type}'`;
    });
    
    searchQuery += ` and (${mimeTypeQueries.join(' or ')})`;
  }

  // Add date filters
  if (modifiedAfter) {
    searchQuery += ` and modifiedTime > '${new Date(modifiedAfter).toISOString()}'`;
  }
  
  if (modifiedBefore) {
    searchQuery += ` and modifiedTime < '${new Date(modifiedBefore).toISOString()}'`;
  }

  // Add owner filters
  if (owners.length > 0) {
    const ownerQueries = owners.map(owner => {
      validateEmailAddress(owner);
      return `'${owner}' in owners`;
    });
    searchQuery += ` and (${ownerQueries.join(' or ')})`;
  }

  // Add sharing filters
  if (shared !== undefined) {
    searchQuery += ` and shared=${shared}`;
  }

  if (starred !== undefined) {
    searchQuery += ` and starred=${starred}`;
  }

  searchQuery += ` and trashed=${trashed}`;

  const params = new URLSearchParams();
  params.append('q', searchQuery);
  params.append('pageSize', Math.min(maxResults, 1000).toString());
  params.append('orderBy', orderBy);
  params.append('supportsAllDrives', 'true');
  params.append('includeItemsFromAllDrives', 'true');
  params.append('fields', 'nextPageToken, files(id, name, mimeType, parents, createdTime, modifiedTime, size, webViewLink, owners, shared, starred, trashed)');

  const endpoint = `/files?${params.toString()}`;
  const result = await makeDriveRequest(endpoint, bearerToken);

  const searchResults = formatFileListResponse(result, query);

  return {
    originalQuery: query,
    searchQuery,
    filters: {
      fileTypes,
      modifiedAfter,
      modifiedBefore,
      owners,
      shared,
      starred,
      trashed
    },
    results: searchResults.files,
    totalResults: searchResults.totalCount,
    nextPageToken: searchResults.nextPageToken,
    hasMore: searchResults.hasMore,
    searchTime: new Date().toISOString()
  };
}