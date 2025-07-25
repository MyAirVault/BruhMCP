/**
 * Google Drive Batch Operations
 * Handles batch processing and folder synchronization
 */

/// <reference path="../types.js" />

import { validateFileId, validateFileName } from '../../utils/validation.js';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Make authenticated request to Google Drive API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {import('../types.js').RequestOptions} [options={}] - Request options
 * @returns {Promise<any>} API response
 */
async function makeDriveRequest(endpoint, bearerToken, options = {}) {
  const url = `${DRIVE_API_BASE}${endpoint}`;

  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object' && !options.raw) {
    requestOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, /** @type {RequestInit} */ (requestOptions));

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Drive API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error && errorJson.error.message) {
          errorMessage = `Drive API error: ${errorJson.error.message}`;
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to access Google Drive API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Batch delete multiple files
 * @param {string[]} fileIds - Array of file IDs to delete
 * @param {boolean} permanent - Whether to permanently delete (vs trash)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Batch operation results
 */
export async function batchDeleteFiles(fileIds, permanent = false, bearerToken) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error('File IDs array is required');
  }

  const results = [];
  const errors = [];

  for (const fileId of fileIds) {
    try {
      validateFileId(fileId);
      
      if (permanent) {
        await makeDriveRequest(`/files/${fileId}`, bearerToken, {
          method: 'DELETE'
        });
        
        results.push({
          fileId,
          success: true,
          action: 'deleted'
        });
      } else {
        await makeDriveRequest(`/files/${fileId}`, bearerToken, {
          method: 'PATCH',
          body: { trashed: true }
        });
        
        results.push({
          fileId,
          success: true,
          action: 'trashed'
        });
      }
    } catch (error) {
      errors.push({
        fileId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    processed: fileIds.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * Batch update file metadata
 * @param {Array<import('../types.js').UpdateMetadata>} updates - Array of {fileId, metadata} objects
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Batch operation results
 */
export async function batchUpdateMetadata(updates, bearerToken) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('Updates array is required');
  }

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const { fileId, metadata } = /** @type {{fileId: string, metadata: import('../types.js').DriveMetadata}} */ (update);
      
      if (!fileId) throw new Error('File ID is required');
      validateFileId(fileId);

      if (!metadata || typeof metadata !== 'object') {
        throw new Error('Metadata object is required');
      }

      // Validate metadata fields if present
      if (metadata.name) {
        validateFileName(metadata.name);
      }

      const data = await makeDriveRequest(`/files/${fileId}`, bearerToken, {
        method: 'PATCH',
        body: metadata
      });

      results.push({
        fileId,
        success: true,
        updatedFields: Object.keys(metadata),
        file: data
      });
    } catch (error) {
      errors.push({
        fileId: update.fileId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    processed: updates.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

/**
 * Sync folder permissions recursively
 * @param {string} folderId - Source folder ID
 * @param {string} bearerToken - OAuth Bearer token
 * @param {import('../types.js').SyncParams} [params={}] - Sync parameters
 * @returns {Promise<{folderId: string, folderPermissions: number, processed: number, successful: number, failed: number, results: Array<any>, errors: Array<any>}>} Sync results
 */
export async function syncFolderPermissions(folderId, bearerToken, params = {}) {
  const { recursive = true, applyToFiles = true, applyToFolders = true } = params;

  if (!folderId) {
    throw new Error('Folder ID is required');
  }

  try {
    validateFileId(folderId);
  } catch (error) {
    throw new Error(`Invalid folder ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Get folder permissions
  const folderPermissions = await makeDriveRequest(
    `/files/${folderId}/permissions?fields=permissions(id,type,role,emailAddress,domain)&supportsAllDrives=true`,
    bearerToken
  );

  // Filter out owner permissions (can't be transferred)
  const targetPermissions = folderPermissions.permissions.filter(/** @param {import('../types.js').DrivePermission} p */ (p) => p.type !== 'owner');

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
            const permissionData = /** @type {Record<string, string>} */ ({
              type: permission.type,
              role: permission.role
            });

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
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  return {
    folderId,
    folderPermissions: targetPermissions.length,
    processed: results.length + errors.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}