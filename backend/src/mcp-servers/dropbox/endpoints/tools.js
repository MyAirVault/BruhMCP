/**
 * Dropbox MCP Tools Definition
 * Defines all available tools for Dropbox API integration
 */

/**
 * Get available Dropbox tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools() {
  return {
    tools: [
      {
        name: 'list_files',
        description: 'List files and folders in a directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path to list (default: "" for root)',
              default: ''
            },
            recursive: {
              type: 'boolean',
              description: 'Include subdirectories',
              default: false
            },
            limit: {
              type: 'number',
              description: 'Maximum number of entries to return',
              minimum: 1,
              maximum: 2000,
              default: 100
            }
          },
          required: []
        }
      },
      {
        name: 'get_file_metadata',
        description: 'Get metadata for a specific file or folder',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or folder'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'download_file',
        description: 'Download a file from Dropbox to local storage',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Dropbox path to the file'
            },
            localPath: {
              type: 'string',
              description: 'Local path to save the file'
            }
          },
          required: ['path', 'localPath']
        }
      },
      {
        name: 'upload_file',
        description: 'Upload a file from local storage to Dropbox',
        inputSchema: {
          type: 'object',
          properties: {
            localPath: {
              type: 'string',
              description: 'Local path to the file'
            },
            dropboxPath: {
              type: 'string',
              description: 'Destination path in Dropbox'
            },
            overwrite: {
              type: 'boolean',
              description: 'Whether to overwrite existing files',
              default: false
            }
          },
          required: ['localPath', 'dropboxPath']
        }
      },
      {
        name: 'create_folder',
        description: 'Create a new folder in Dropbox',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path for the new folder'
            },
            autorename: {
              type: 'boolean',
              description: 'Auto-rename if folder exists',
              default: false
            }
          },
          required: ['path']
        }
      },
      {
        name: 'delete_file',
        description: 'Delete a file or folder from Dropbox',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or folder to delete'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'move_file',
        description: 'Move or rename a file or folder',
        inputSchema: {
          type: 'object',
          properties: {
            fromPath: {
              type: 'string',
              description: 'Current path of the file/folder'
            },
            toPath: {
              type: 'string',
              description: 'New path for the file/folder'
            },
            autorename: {
              type: 'boolean',
              description: 'Auto-rename if destination exists',
              default: false
            }
          },
          required: ['fromPath', 'toPath']
        }
      },
      {
        name: 'copy_file',
        description: 'Copy a file or folder to a new location',
        inputSchema: {
          type: 'object',
          properties: {
            fromPath: {
              type: 'string',
              description: 'Source path of the file/folder'
            },
            toPath: {
              type: 'string',
              description: 'Destination path for the copy'
            },
            autorename: {
              type: 'boolean',
              description: 'Auto-rename if destination exists',
              default: false
            }
          },
          required: ['fromPath', 'toPath']
        }
      },
      {
        name: 'search_files',
        description: 'Search for files and folders in Dropbox',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            path: {
              type: 'string',
              description: 'Path to search within (default: "" for all)',
              default: ''
            },
            maxResults: {
              type: 'number',
              description: 'Maximum results to return',
              minimum: 1,
              maximum: 1000,
              default: 100
            },
            fileStatus: {
              type: 'string',
              enum: ['active', 'deleted', 'both'],
              description: 'Filter by file status',
              default: 'active'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_shared_links',
        description: 'Get existing shared links for a file or folder',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or folder'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'create_shared_link',
        description: 'Create a new shared link for a file or folder',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or folder'
            },
            shortUrl: {
              type: 'boolean',
              description: 'Create a short URL',
              default: false
            }
          },
          required: ['path']
        }
      },
      {
        name: 'get_space_usage',
        description: 'Get account space usage information',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ]
  };
}