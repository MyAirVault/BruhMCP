/**
 * Google Drive Team Drive Operations
 * Handles operations specific to Team/Shared Drives
 */

/// <reference path="../types.js" />

const { formatFileResponse, formatFileListResponse  } = require('../../utils/googledriveFormatting');
const { validateFileId, validateEmailAddress  } = require('../../utils/validation');

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
 * List available Team Drives/Shared Drives
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{drives: Array<any>, count: number, nextPageToken?: string}>} List of team drives
 */
async function listTeamDrives(bearerToken) {
  const endpoint = '/drives?pageSize=100';
  const data = await makeDriveRequest(endpoint, bearerToken);
  
  return {
    drives: data.drives || [],
    count: (data.drives || []).length,
    nextPageToken: data.nextPageToken
  };
}

/**
 * Get Team Drive information
 * @param {string} driveId - Team Drive ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{id: string, name: string, colorRgb?: string, capabilities?: any, createdTime?: string, hidden?: boolean, restrictions?: any}>} Team drive information
 */
async function getTeamDriveInfo(driveId, bearerToken) {
  if (!driveId) {
    throw new Error('Team Drive ID is required');
  }

  try {
    validateFileId(driveId);
  } catch (error) {
    throw new Error(`Invalid Team Drive ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  const endpoint = `/drives/${driveId}`;
  const data = await makeDriveRequest(endpoint, bearerToken);
  
  return {
    id: data.id,
    name: data.name,
    colorRgb: data.colorRgb,
    capabilities: data.capabilities,
    createdTime: data.createdTime,
    hidden: data.hidden,
    restrictions: data.restrictions
  };
}

/**
 * List files in a Team Drive
 * @param {string} driveId - Team Drive ID
 * @param {import('../types.js').ListOptions} [options={}] - List options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} List of files
 */
async function listTeamDriveFiles(driveId, bearerToken, options = {}) {
  if (!driveId) {
    throw new Error('Team Drive ID is required');
  }

  const { pageSize = 100, pageToken, orderBy = 'modifiedTime desc' } = options;

  const params = new URLSearchParams({
    driveId,
    corpora: 'drive',
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    pageSize: pageSize.toString(),
    orderBy,
    fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,shared,trashed)'
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const endpoint = `/files?${params.toString()}`;
  const data = await makeDriveRequest(endpoint, bearerToken);

  return formatFileListResponse(data);
}

/**
 * Add a member to a Team Drive
 * @param {string} driveId - Team Drive ID
 * @param {string} emailAddress - Email address of the member
 * @param {string} role - Role to assign (organizer, fileOrganizer, writer, commenter, reader)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{success: boolean, driveId: string, permissionId: string, emailAddress: string, role: string, message: string}>} Result
 */
async function addTeamDriveMember(driveId, emailAddress, role, bearerToken) {
  if (!driveId) {
    throw new Error('Team Drive ID is required');
  }

  if (!emailAddress) {
    throw new Error('Email address is required');
  }

  try {
    validateFileId(driveId);
  } catch (error) {
    throw new Error(`Invalid Team Drive ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    validateEmailAddress(emailAddress);
  } catch (error) {
    throw new Error(`Invalid email address: ${error instanceof Error ? error.message : String(error)}`);
  }

  const validRoles = ['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  const permission = {
    type: 'user',
    role,
    emailAddress
  };

  const endpoint = `/files/${driveId}/permissions?supportsAllDrives=true`;
  const data = await makeDriveRequest(endpoint, bearerToken, {
    method: 'POST',
    body: permission
  });

  return {
    success: true,
    driveId,
    permissionId: data.id,
    emailAddress,
    role,
    message: `Member added to Team Drive successfully`
  };
}

/**
 * Move files to a Team Drive
 * @param {string} fileId - File ID to move
 * @param {string} teamDriveId - Target Team Drive ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<any>} Moved file information
 */
async function moveToTeamDrive(fileId, teamDriveId, bearerToken) {
  if (!fileId || !teamDriveId) {
    throw new Error('File ID and Team Drive ID are required');
  }

  try {
    validateFileId(fileId);
    validateFileId(teamDriveId);
  } catch (error) {
    throw new Error(`Invalid ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Get current parents
  const fileMetadata = await makeDriveRequest(
    `/files/${fileId}?fields=parents&supportsAllDrives=true`, 
    bearerToken
  );
  
  const previousParents = fileMetadata.parents ? fileMetadata.parents.join(',') : '';

  // Move to Team Drive root
  const params = new URLSearchParams({
    addParents: teamDriveId,
    removeParents: previousParents,
    supportsAllDrives: 'true',
    fields: 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners,shared'
  });

  const endpoint = `/files/${fileId}?${params.toString()}`;
  const data = await makeDriveRequest(endpoint, bearerToken, {
    method: 'PATCH'
  });

  return formatFileResponse(data);
}
module.exports = {
  listTeamDrives,
  getTeamDriveInfo,
  listTeamDriveFiles,
  addTeamDriveMember,
  moveToTeamDrive
};