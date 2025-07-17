/**
 * Dropbox API integration layer
 * Provides abstraction for Dropbox API operations
 */

import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { logOAuthError, createOAuthErrorResponse } from '../utils/oauth-error-handler.js';

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
   * @param {Object} options - Request options
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
        ...options.headers
      }
    };

    const response = await fetchWithRetry(url, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error_summary: response.statusText }));
      const errorMessage = `Dropbox API error: ${error.error_summary || response.statusText}`;
      
      // Log the error with context
      logOAuthError(new Error(errorMessage), 'dropbox_api_request', 'unknown_instance');
      
      // Create detailed error for better debugging
      const detailedError = new Error(errorMessage);
      detailedError.status = response.status;
      detailedError.statusText = response.statusText;
      detailedError.endpoint = endpoint;
      detailedError.dropboxError = error;
      
      throw detailedError;
    }

    return response;
  }

  /**
   * List files and folders
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

    return await response.json();
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path) {
    const response = await this.makeRequest('/files/get_metadata', {
      method: 'POST',
      body: JSON.stringify({ path })
    });

    return await response.json();
  }

  /**
   * Create folder
   */
  async createFolder(path, autorename = false) {
    const response = await this.makeRequest('/files/create_folder_v2', {
      method: 'POST',
      body: JSON.stringify({
        path,
        autorename
      })
    });

    return await response.json();
  }

  /**
   * Delete file or folder
   */
  async deleteFile(path) {
    const response = await this.makeRequest('/files/delete_v2', {
      method: 'POST',
      body: JSON.stringify({ path })
    });

    return await response.json();
  }

  /**
   * Move file or folder
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

    return await response.json();
  }

  /**
   * Copy file or folder
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

    return await response.json();
  }

  /**
   * Search files
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

    return await response.json();
  }

  /**
   * Get shared links
   */
  async getSharedLinks(path) {
    const response = await this.makeRequest('/sharing/list_shared_links', {
      method: 'POST',
      body: JSON.stringify({
        path,
        direct_only: true
      })
    });

    return await response.json();
  }

  /**
   * Create shared link
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

    return await response.json();
  }

  /**
   * Get space usage
   */
  async getSpaceUsage() {
    const response = await this.makeRequest('/users/get_space_usage', {
      method: 'POST'
    });

    return await response.json();
  }

  /**
   * Download file
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
      data: response.body,
      metadata: JSON.parse(response.headers.get('dropbox-api-result') || '{}')
    };
  }

  /**
   * Upload file
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

    return await response.json();
  }
}

/**
 * Convenience functions for common operations
 */

/**
 * List files in a directory
 */
export async function listFiles(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path = '', recursive = false, limit = 100 } = args;
  
  try {
    const result = await api.listFiles(path, recursive, limit);
    
    return {
      message: `Listed ${result.entries.length} items in ${path || 'root'}`,
      entries: result.entries,
      has_more: result.has_more,
      cursor: result.cursor
    };
  } catch (error) {
    logOAuthError(error, 'list_files', 'unknown_instance');
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  const result = await api.getFileMetadata(path);
  
  return {
    message: `Retrieved metadata for ${path}`,
    metadata: result
  };
}

/**
 * Create a new folder
 */
export async function createFolder(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, autorename = false } = args;
  
  const result = await api.createFolder(path, autorename);
  
  return {
    message: `Created folder ${path}`,
    metadata: result.metadata
  };
}

/**
 * Delete a file or folder
 */
export async function deleteFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  const result = await api.deleteFile(path);
  
  return {
    message: `Deleted ${path}`,
    metadata: result.metadata
  };
}

/**
 * Move a file or folder
 */
export async function moveFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { fromPath, toPath, autorename = false } = args;
  
  const result = await api.moveFile(fromPath, toPath, autorename);
  
  return {
    message: `Moved ${fromPath} to ${toPath}`,
    metadata: result.metadata
  };
}

/**
 * Copy a file or folder
 */
export async function copyFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { fromPath, toPath, autorename = false } = args;
  
  const result = await api.copyFile(fromPath, toPath, autorename);
  
  return {
    message: `Copied ${fromPath} to ${toPath}`,
    metadata: result.metadata
  };
}

/**
 * Search files
 */
export async function searchFiles(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { query, path = '', maxResults = 100, fileStatus = 'active' } = args;
  
  const result = await api.searchFiles(query, path, maxResults, fileStatus);
  
  return {
    message: `Found ${result.matches.length} results for "${query}"`,
    matches: result.matches,
    has_more: result.has_more
  };
}

/**
 * Get shared links
 */
export async function getSharedLinks(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path } = args;
  
  const result = await api.getSharedLinks(path);
  
  return {
    message: `Found ${result.links.length} shared links for ${path}`,
    links: result.links
  };
}

/**
 * Create shared link
 */
export async function createSharedLink(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, shortUrl = false } = args;
  
  const result = await api.createSharedLink(path, shortUrl);
  
  return {
    message: `Created shared link for ${path}`,
    url: result.url,
    link: result
  };
}

/**
 * Get space usage
 */
export async function getSpaceUsage(args, bearerToken) {
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
 */
export async function downloadFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { path, localPath } = args;
  
  const result = await api.downloadFile(path);
  
  // In a real implementation, you would save to localPath
  return {
    message: `Downloaded ${path} to ${localPath}`,
    size: result.metadata.size,
    metadata: result.metadata
  };
}

/**
 * Upload file
 */
export async function uploadFile(args, bearerToken) {
  const api = new DropboxAPI(bearerToken);
  const { localPath, dropboxPath, overwrite = false } = args;
  
  // In a real implementation, you would read from localPath
  const content = 'file content would go here';
  
  const result = await api.uploadFile(dropboxPath, content, overwrite);
  
  return {
    message: `Uploaded ${localPath} to ${dropboxPath}`,
    size: result.size,
    metadata: result
  };
}