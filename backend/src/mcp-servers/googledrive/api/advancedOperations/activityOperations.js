/**
 * Google Drive Activity and Revision Operations
 * Handles file activity tracking and revision management
 */

/// <reference path="../types.js" />

import { validateFileId } from '../../utils/validation.js';

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
    headers: /** @type {HeadersInit} */ ({
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }),
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
 * Get file revisions
 * @param {string} fileId - File ID
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{fileId: string, revisions: Array<any>, count: number}>} File revisions
 */
export async function getFileRevisions(fileId, bearerToken) {
  if (!fileId) {
    throw new Error('File ID is required');
  }

  try {
    validateFileId(fileId);
  } catch (error) {
    throw new Error(`Invalid file ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  const endpoint = `/files/${fileId}/revisions`;
  const data = await makeDriveRequest(endpoint, bearerToken);

  return {
    fileId,
    revisions: (data.revisions || []).map((rev) => ({
      id: rev.id,
      modifiedTime: rev.modifiedTime,
      keepForever: rev.keepForever,
      published: rev.published,
      publishAuto: rev.publishAuto,
      publishedOutsideDomain: rev.publishedOutsideDomain,
      lastModifyingUser: rev.lastModifyingUser,
      originalFilename: rev.originalFilename,
      md5Checksum: rev.md5Checksum,
      size: rev.size
    })),
    count: (data.revisions || []).length
  };
}

/**
 * Get recent activity for the user's Drive
 * @param {import('../types.js').ActivityOptions} [options={}] - Activity options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{files: Array<any>, count: number}>} Recent activity
 */
export async function getRecentActivity(bearerToken, options = {}) {
  const { pageSize = 50, filterByMe = false } = options;

  // Build query for recent files
  const queryParts = ['trashed = false'];
  
  if (filterByMe) {
    queryParts.push("'me' in owners");
  }

  const query = queryParts.join(' and ');
  
  const params = new URLSearchParams({
    q: query,
    pageSize: pageSize.toString(),
    orderBy: 'viewedByMeTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,viewedByMeTime,modifiedByMeTime,lastModifyingUser,owners)'
  });

  const endpoint = `/files?${params.toString()}`;
  const data = await makeDriveRequest(endpoint, bearerToken);

  return {
    files: (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      viewedByMeTime: file.viewedByMeTime,
      modifiedByMeTime: file.modifiedByMeTime,
      lastModifyingUser: file.lastModifyingUser,
      owners: file.owners,
      activityType: file.modifiedByMeTime ? 'modified' : 'viewed'
    })),
    count: (data.files || []).length
  };
}

/**
 * Get comments on a file
 * @param {string} fileId - File ID
 * @param {import('../types.js').CommentOptions} [options={}] - Comment options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{fileId: string, comments: Array<any>, count: number}>} File comments
 */
export async function getFileComments(fileId, bearerToken, options = {}) {
  if (!fileId) {
    throw new Error('File ID is required');
  }

  try {
    validateFileId(fileId);
  } catch (error) {
    throw new Error(`Invalid file ID: ${error instanceof Error ? error.message : String(error)}`);
  }

  const { includeDeleted = false, pageSize = 100 } = options;

  const params = new URLSearchParams({
    includeDeleted: includeDeleted.toString(),
    pageSize: pageSize.toString(),
    fields: 'comments(id,content,createdTime,modifiedTime,author,resolved,replies)'
  });

  const endpoint = `/files/${fileId}/comments?${params.toString()}`;
  const data = await makeDriveRequest(endpoint, bearerToken);

  return {
    fileId,
    comments: (data.comments || []).map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdTime: comment.createdTime,
      modifiedTime: comment.modifiedTime,
      author: comment.author,
      resolved: comment.resolved,
      replies: (comment.replies || []).map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdTime: reply.createdTime,
        modifiedTime: reply.modifiedTime,
        author: reply.author
      })),
      replyCount: (comment.replies || []).length
    })),
    count: (data.comments || []).length
  };
}

/**
 * Track file changes in real-time (via changes API)
 * @param {import('../types.js').ChangeTrackingOptions} [options={}] - Change tracking options
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<{startPageToken?: string, message?: string, changes?: Array<any>, changeCount?: number, nextPageToken?: string, newStartPageToken?: string}>} Changes and next page token
 */
export async function trackFileChanges(bearerToken, options = {}) {
  const { pageToken, pageSize = 100, includeRemoved = true, restrictToMyDrive = false } = options;

  // If no pageToken, get the starting token
  if (!pageToken) {
    const startTokenResponse = await makeDriveRequest('/changes/startPageToken', bearerToken);
    const startToken = startTokenResponse.startPageToken;
    
    return {
      startPageToken: startToken,
      message: 'Use this startPageToken to begin tracking changes'
    };
  }

  // Get changes since the pageToken
  const params = new URLSearchParams({
    pageToken,
    pageSize: pageSize.toString(),
    includeRemoved: includeRemoved.toString(),
    restrictToMyDrive: restrictToMyDrive.toString(),
    fields: 'nextPageToken,newStartPageToken,changes(file(id,name,mimeType,modifiedTime),removed,changeType,time)'
  });

  const endpoint = `/changes?${params.toString()}`;
  const data = await makeDriveRequest(endpoint, bearerToken);

  return {
    changes: (data.changes || []).map((change) => ({
      removed: change.removed,
      changeType: change.changeType,
      time: change.time,
      file: change.file ? {
        id: change.file.id,
        name: change.file.name,
        mimeType: change.file.mimeType,
        modifiedTime: change.file.modifiedTime
      } : null
    })),
    changeCount: (data.changes || []).length,
    nextPageToken: data.nextPageToken,
    newStartPageToken: data.newStartPageToken
  };
}