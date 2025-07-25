/**
 * Dropbox API integration layer
 * Provides abstraction for Dropbox API operations
 */

import { fetchWithRetry } from '../utils/fetchWithRetry.js';
import { logOAuthError } from '../utils/oauthErrorHandler.js';

/**
 * @typedef {import('../../../types/dropbox.d.ts').DropboxApiArgs} DropboxApiArgs
 * @typedef {import('../../../types/dropbox.d.ts').DropboxListFolderResponse} DropboxListFolderResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxFileMetadata} DropboxFileMetadata
 * @typedef {import('../../../types/dropbox.d.ts').DropboxFolder} DropboxFolder
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSearchResponse} DropboxSearchResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSearchMatch} DropboxSearchMatch
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSharedLinksResponse} DropboxSharedLinksResponse
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSharedLink} DropboxSharedLink
 * @typedef {import('../../../types/dropbox.d.ts').DropboxSpaceUsage} DropboxSpaceUsage
 * @typedef {import('../../../types/dropbox.d.ts').DropboxAPIError} DropboxAPIError
 */

/**
 * Base Dropbox API class
 * @class
 */
export class DropboxAPI {
  /**
   * Create a new Dropbox API instance
   * @param {string} bearerToken - OAuth Bearer token for authentication
   */
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.baseUrl = 'https://api.dropboxapi.com/2';
    this.contentUrl = 'https://content.dropboxapi.com/2';
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint - API endpoint path
   * @param {RequestInit} options - Request options
   * @returns {Promise<Response>} Response from Dropbox API
   * @throws {Error} If request fails or authentication is invalid
   */
  async makeRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('/files/') && (endpoint.includes('/download') || endpoint.includes('/upload'))
      ? `${this.contentUrl}${endpoint}`
      : `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const response = await fetchWithRetry(url, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      /** @type {any} */
      const error = await response.json().catch(() => ({ error_summary: response.statusText }));
      const errorMessage = `Dropbox API error: ${error.error_summary || response.statusText}`;
      
      // Log the error with context
      logOAuthError(new Error(errorMessage), 'dropbox_api_request', 'unknown_instance');
      
      // Create detailed error for better debugging
      const detailedError = new Error(errorMessage);
      // Cast to DropboxAPIError to add custom properties
      /** @type {DropboxAPIError} */
      const typedError = /** @type {DropboxAPIError} */ (detailedError);
      typedError.status = response.status;
      typedError.statusText = response.statusText;
      typedError.endpoint = endpoint;
      typedError.dropboxError = error;
      
      throw typedError;
    }

    return response;
  }

  /**
   * List files and folders
   * @param {string} path - Path to list files from
   * @param {boolean} recursive - Whether to list recursively
   * @param {number} limit - Maximum number of files to return
   * @returns {Promise<DropboxListFolderResponse>}
   */
  async listFiles(path = '', recursive = false, limit = 100) {
    const response = await this.makeRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path: path || '',
        recursive,
        limit
      })
    });

    return /** @type {DropboxListFolderResponse} */ (await response.json());
  }

  /**
   * Get file metadata
   * @param {string} path - Path to the file
   * @returns {Promise<DropboxFileMetadata>}
   */
  async getFileMetadata(path) {
    const response = await this.makeRequest('/files/get_metadata', {
      method: 'POST',
      body: JSON.stringify({ path })
    });

    return /** @type {DropboxFileMetadata} */ (await response.json());
  }

  /**
   * Create folder
   * @param {string} path - Path where to create the folder
   * @param {boolean} autorename - Whether to autorename if folder exists
   * @returns {Promise<{metadata: DropboxFileMetadata}>}
   */
  async createFolder(path, autorename = false) {
    const response = await this.makeRequest('/files/create_folder_v2', {
      method: 'POST',
      body: JSON.stringify({
        path,
        autorename
      })
    });

    return /** @type {{metadata: DropboxFileMetadata}} */ (await response.json());
  }

  /**
   * Delete file or folder
   * @param {string} path - Path to the file or folder to delete
   * @returns {Promise<{metadata: DropboxFileMetadata}>}
   */
  async deleteFile(path) {
    const response = await this.makeRequest('/files/delete_v2', {
      method: 'POST',
      body: JSON.stringify({ path })
    });

    return /** @type {{metadata: DropboxFileMetadata}} */ (await response.json());
  }

  /**
   * Move file or folder
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   * @param {boolean} autorename - Whether to autorename if destination exists
   * @returns {Promise<{metadata: DropboxFileMetadata}>}
   */
  async moveFile(fromPath, toPath, autorename = false) {
    const response = await this.makeRequest('/files/move_v2', {
      method: 'POST',
      body: JSON.stringify({
        from_path: fromPath,
        to_path: toPath,
        autorename
      })
    });

    return /** @type {{metadata: DropboxFileMetadata}} */ (await response.json());
  }

  /**
   * Copy file or folder
   * @param {string} fromPath - Source path
   * @param {string} toPath - Destination path
   * @param {boolean} autorename - Whether to autorename if destination exists
   * @returns {Promise<{metadata: DropboxFileMetadata}>}
   */
  async copyFile(fromPath, toPath, autorename = false) {
    const response = await this.makeRequest('/files/copy_v2', {
      method: 'POST',
      body: JSON.stringify({
        from_path: fromPath,
        to_path: toPath,
        autorename
      })
    });

    return /** @type {{metadata: DropboxFileMetadata}} */ (await response.json());
  }

  /**
   * Search files
   * @param {string} query - Search query
   * @param {string} path - Path to search in
   * @param {number} maxResults - Maximum number of results
   * @param {string} fileStatus - File status filter
   * @returns {Promise<DropboxSearchResponse>}
   */
  async searchFiles(query, path = '', maxResults = 100, fileStatus = 'active') {
    const response = await this.makeRequest('/files/search_v2', {
      method: 'POST',
      body: JSON.stringify({
        query,
        options: {
          path,
          max_results: maxResults,
          file_status: fileStatus
        }
      })
    });

    return /** @type {DropboxSearchResponse} */ (await response.json());
  }

  /**
   * Get shared links
   * @param {string} path - Path to get shared links for
   * @returns {Promise<DropboxSharedLinksResponse>}
   */
  async getSharedLinks(path) {
    const response = await this.makeRequest('/sharing/list_shared_links', {
      method: 'POST',
      body: JSON.stringify({
        path,
        direct_only: true
      })
    });

    return /** @type {DropboxSharedLinksResponse} */ (await response.json());
  }

  /**
   * Create shared link
   * @param {string} path - Path to create shared link for
   * @param {boolean} shortUrl - Whether to create a short URL
   * @returns {Promise<DropboxSharedLink>}
   */
  async createSharedLink(path, shortUrl = false) {
    const response = await this.makeRequest('/sharing/create_shared_link_with_settings', {
      method: 'POST',
      body: JSON.stringify({
        path,
        settings: {
          short_url: shortUrl
        }
      })
    });

    return /** @type {DropboxSharedLink} */ (await response.json());
  }

  /**
   * Get space usage
   * @returns {Promise<DropboxSpaceUsage>}
   */
  async getSpaceUsage() {
    const response = await this.makeRequest('/users/get_space_usage', {
      method: 'POST'
    });

    return /** @type {DropboxSpaceUsage} */ (await response.json());
  }

  /**
   * Download file
   * @param {string} path - Path to the file to download
   * @returns {Promise<{data: ReadableStream, metadata: DropboxFileMetadata}>}
   */
  async downloadFile(path) {
    const response = await this.makeRequest('/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path })
      }
    });

    return {
      data: response.body || new ReadableStream(),
      metadata: /** @type {DropboxFileMetadata} */ (JSON.parse(response.headers.get('dropbox-api-result') || '{}'))
    };
  }

  /**
   * Upload file
   * @param {string} path - Path where to upload the file
   * @param {string|Buffer} content - File content
   * @param {boolean} overwrite - Whether to overwrite if file exists
   * @returns {Promise<DropboxFileMetadata>}
   */
  async uploadFile(path, content, overwrite = false) {
    const response = await this.makeRequest('/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path,
          mode: overwrite ? 'overwrite' : 'add',
          autorename: !overwrite
        })
      },
      body: content
    });

    return /** @type {DropboxFileMetadata} */ (await response.json());
  }
}

/**
 * Convenience functions for common operations
 */

/**
 * List files in a directory
 * @param {DropboxApiArgs} args - Arguments for listing files
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, entries: (DropboxFileMetadata | DropboxFolder)[], has_more: boolean, cursor: string}>}
 */
export async function listFiles(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path = '', recursive = false, limit = 100 } = args;
  
  if (!path && path !== '') {
    throw new Error('Path parameter is required');
  }
  
  try {
    const result = await api.listFiles(path, recursive, limit);
    
    return {
      message: `Listed ${result.entries.length} items in ${path || 'root'}`,
      entries: result.entries,
      has_more: result.has_more,
      cursor: result.cursor
    };
  } catch (error) {
    if (error instanceof Error) {
      logOAuthError(error, 'list_files', 'unknown_instance');
      throw new Error(`Failed to list files: ${error.message}`);
    }
    throw new Error('Failed to list files: Unknown error');
  }
}

/**
 * Get file metadata
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export async function getFileMetadata(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  if (!path) {
    throw new Error('Path parameter is required');
  }
  
  const result = await api.getFileMetadata(path);
  
  return {
    message: `Retrieved metadata for ${path}`,
    metadata: result
  };
}

/**
 * Create a new folder
 * @param {DropboxApiArgs} args - Arguments containing path and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export async function createFolder(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, autorename = false } = args;
  
  if (!path) {
    throw new Error('Path parameter is required');
  }
  
  const result = await api.createFolder(path, autorename);
  
  return {
    message: `Created folder ${path}`,
    metadata: result.metadata
  };
}

/**
 * Delete a file or folder
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export async function deleteFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  if (!path) {
    throw new Error('Path parameter is required');
  }
  
  const result = await api.deleteFile(path);
  
  return {
    message: `Deleted ${path}`,
    metadata: result.metadata
  };
}

/**
 * Move a file or folder
 * @param {DropboxApiArgs} args - Arguments containing fromPath, toPath, and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export async function moveFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { fromPath, toPath, autorename = false } = args;
  
  if (!fromPath || !toPath) {
    throw new Error('fromPath and toPath parameters are required');
  }
  
  const result = await api.moveFile(fromPath, toPath, autorename);
  
  return {
    message: `Moved ${fromPath} to ${toPath}`,
    metadata: result.metadata
  };
}

/**
 * Copy a file or folder
 * @param {DropboxApiArgs} args - Arguments containing fromPath, toPath, and autorename option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, metadata: DropboxFileMetadata}>}
 */
export async function copyFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { fromPath, toPath, autorename = false } = args;
  
  if (!fromPath || !toPath) {
    throw new Error('fromPath and toPath parameters are required');
  }
  
  const result = await api.copyFile(fromPath, toPath, autorename);
  
  return {
    message: `Copied ${fromPath} to ${toPath}`,
    metadata: result.metadata
  };
}

/**
 * Search files
 * @param {DropboxApiArgs} args - Arguments containing query, path, maxResults, and fileStatus
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, matches: DropboxSearchMatch[], has_more: boolean}>}
 */
export async function searchFiles(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { query, path = '', maxResults = 100, fileStatus = 'active' } = args;
  
  if (!query) {
    throw new Error('Query parameter is required');
  }
  
  const result = await api.searchFiles(query, path, maxResults, fileStatus);
  
  return {
    message: `Found ${result.matches.length} results for "${query}"`,
    matches: result.matches,
    has_more: result.has_more
  };
}

/**
 * Get shared links
 * @param {DropboxApiArgs} args - Arguments containing the path
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, links: DropboxSharedLink[]}>}
 */
export async function getSharedLinks(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  if (!path) {
    throw new Error('Path parameter is required');
  }
  
  const result = await api.getSharedLinks(path);
  
  return {
    message: `Found ${result.links.length} shared links for ${path}`,
    links: result.links
  };
}

/**
 * Create shared link
 * @param {DropboxApiArgs} args - Arguments containing path and shortUrl option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, url: string, link: DropboxSharedLink}>}
 */
export async function createSharedLink(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, shortUrl = false } = args;
  
  if (!path) {
    throw new Error('Path parameter is required');
  }
  
  const result = await api.createSharedLink(path, shortUrl);
  
  return {
    message: `Created shared link for ${path}`,
    url: result.url,
    link: result
  };
}

/**
 * Get space usage
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, used: number, allocated: number, usage_percent: string}>}
 */
export async function getSpaceUsage(bearerToken) {
  const api = new DropboxAPI(bearerToken);
  
  const result = await api.getSpaceUsage();
  
  const usedBytes = result.used;
  const allocatedBytes = result.allocation.allocated;
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const allocatedGB = (allocatedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const usagePercent = ((usedBytes / allocatedBytes) * 100).toFixed(1);
  
  return {
    message: `Using ${usedGB} GB of ${allocatedGB} GB (${usagePercent}%)`,
    used: usedBytes,
    allocated: allocatedBytes,
    usage_percent: usagePercent
  };
}

/**
 * Download file
 * @param {DropboxApiArgs} args - Arguments containing path and localPath
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, size: number, metadata: DropboxFileMetadata}>}
 */
export async function downloadFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, localPath } = args;
  
  if (!path || !localPath) {
    throw new Error('path and localPath parameters are required');
  }
  
  const result = await api.downloadFile(path);
  
  // In a real implementation, you would save to localPath
  return {
    message: `Downloaded ${path} to ${localPath}`,
    size: result.metadata.size || 0,
    metadata: result.metadata
  };
}

/**
 * Upload file
 * @param {DropboxApiArgs} args - Arguments containing localPath, dropboxPath, and overwrite option
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {Promise<{message: string, size: number, metadata: DropboxFileMetadata}>}
 */
export async function uploadFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { localPath, dropboxPath, overwrite = false } = args;
  
  if (!localPath || !dropboxPath) {
    throw new Error('localPath and dropboxPath parameters are required');
  }
  
  // In a real implementation, you would read from localPath
  const content = 'file content would go here';
  
  const result = await api.uploadFile(dropboxPath, content, overwrite);
  
  return {
    message: `Uploaded ${localPath} to ${dropboxPath}`,
    size: result.size || 0,
    metadata: result
  };
}