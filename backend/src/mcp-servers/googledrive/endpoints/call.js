/**
 * Google Drive MCP Tool Call Handler
 * Executes Google Drive API operations using OAuth Bearer tokens
 */

const { listFiles, 
  getFileMetadata, 
  downloadFile, 
  uploadFile, 
  createFolder,
  deleteFile,
  copyFile,
  moveFile,
  shareFile,
  searchFiles,
  getFilePermissions,
  getDriveInfo
 } = require('../api/googledriveApi');

const { validateToolArguments  } = require('../utils/validation');

/**
 * Execute a Google Drive tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Record<string, string | number | boolean | string[] | Record<string, unknown>>} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Google Drive API
 * @returns {Promise<Object>} Tool execution result
 */
async function executeToolCall(toolName, args, bearerToken) {
  console.log(`🔧 Executing Google Drive tool: ${toolName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

  // Validate bearer token
  if (!bearerToken) {
    throw new Error('OAuth Bearer token is required for Google Drive API access');
  }

  // Validate tool arguments against schema
  try {
    validateToolArguments(toolName, args);
  } catch (validationError) {
    throw new Error(`Invalid arguments for ${toolName}: ${validationError instanceof Error ? validationError.message : String(validationError)}`);
  }

  let result;

  try {
    switch (toolName) {
      case 'list_files':
        result = await listFiles(args, bearerToken);
        break;
      
      case 'get_file_metadata':
        result = await getFileMetadata(/** @type {{ fileId: string }} */ (args), bearerToken);
        break;
      
      case 'download_file':
        result = await downloadFile(/** @type {{ fileId: string; localPath: string }} */ (args), bearerToken);
        break;
      
      case 'upload_file':
        result = await uploadFile(/** @type {{ localPath: string; fileName: string; parentFolderId?: string; mimeType?: string }} */ (args), bearerToken);
        break;
      
      case 'create_folder':
        result = await createFolder(/** @type {import('../api/modules/fileManagement.js').CreateFolderArgs} */ (args), bearerToken);
        break;
      
      case 'delete_file':
        result = await deleteFile(/** @type {import('../api/modules/fileManagement.js').DeleteFileArgs} */ (args), bearerToken);
        break;
      
      case 'copy_file':
        result = await copyFile(/** @type {import('../api/modules/fileManagement.js').CopyFileArgs} */ (args), bearerToken);
        break;
      
      case 'move_file':
        result = await moveFile(/** @type {import('../api/modules/fileManagement.js').MoveFileArgs} */ (args), bearerToken);
        break;
      
      case 'share_file':
        result = await shareFile(/** @type {import('../api/modules/permissionOperations.js').ShareFileArgs} */ (args), bearerToken);
        break;
      
      case 'search_files':
        result = await searchFiles(args, bearerToken);
        break;
      
      case 'get_file_permissions':
        result = await getFilePermissions(/** @type {import('../api/modules/permissionOperations.js').GetFilePermissionsArgs} */ (args), bearerToken);
        break;
      
      case 'get_drive_info':
        result = await getDriveInfo(args, bearerToken);
        break;
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    console.log(` Tool executed successfully: ${toolName}`);
    return {
      success: true,
      result: result,
      toolName: toolName,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Tool execution failed: ${toolName}`, error);
    
    // Return structured error response
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        toolName: toolName,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Get list of available Google Drive tools
 * @returns {Array<Object>} List of tool definitions
 */
function getAvailableTools() {
  return [
    {
      name: 'list_files',
      description: 'List files and folders in Google Drive',
      parameters: {
        query: { type: 'string', optional: true, description: 'Search query using Google Drive search syntax' },
        maxResults: { type: 'number', optional: true, description: 'Maximum number of files to return (1-1000)' },
        orderBy: { type: 'string', optional: true, description: 'Field to sort by' },
        folderId: { type: 'string', optional: true, description: 'ID of folder to list files from' },
        includeItemsFromAllDrives: { type: 'boolean', optional: true, description: 'Include items from all drives' }
      }
    },
    {
      name: 'get_file_metadata',
      description: 'Get metadata for a specific file or folder',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file or folder' },
        fields: { type: 'string', optional: true, description: 'Comma-separated list of fields to include' }
      }
    },
    {
      name: 'download_file',
      description: 'Download a file from Google Drive',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file to download' },
        localPath: { type: 'string', required: true, description: 'Local path where the file should be saved' },
        exportFormat: { type: 'string', optional: true, description: 'Export format for Google Workspace files' }
      }
    },
    {
      name: 'upload_file',
      description: 'Upload a file to Google Drive',
      parameters: {
        localPath: { type: 'string', required: true, description: 'Local path to the file to upload' },
        fileName: { type: 'string', required: true, description: 'Name for the file in Google Drive' },
        parentFolderId: { type: 'string', optional: true, description: 'ID of the parent folder' },
        mimeType: { type: 'string', optional: true, description: 'MIME type of the file' }
      }
    },
    {
      name: 'create_folder',
      description: 'Create a new folder in Google Drive',
      parameters: {
        folderName: { type: 'string', required: true, description: 'Name of the folder to create' },
        parentFolderId: { type: 'string', optional: true, description: 'ID of the parent folder' }
      }
    },
    {
      name: 'delete_file',
      description: 'Delete a file or folder from Google Drive',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file or folder to delete' }
      }
    },
    {
      name: 'copy_file',
      description: 'Copy a file in Google Drive',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file to copy' },
        newName: { type: 'string', required: true, description: 'Name for the copied file' },
        parentFolderId: { type: 'string', optional: true, description: 'ID of the parent folder for the copy' }
      }
    },
    {
      name: 'move_file',
      description: 'Move a file to a different folder in Google Drive',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file to move' },
        newParentFolderId: { type: 'string', required: true, description: 'ID of the new parent folder' },
        removeFromParents: { type: 'array', optional: true, description: 'IDs of current parent folders to remove from' }
      }
    },
    {
      name: 'share_file',
      description: 'Share a file or folder with specific users or make it publicly accessible',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file or folder to share' },
        type: { type: 'string', required: true, description: 'Type of permission (user, group, domain, anyone)' },
        role: { type: 'string', required: true, description: 'Role/permission level' },
        emailAddress: { type: 'string', optional: true, description: 'Email address for user/group types' },
        domain: { type: 'string', optional: true, description: 'Domain name for domain type' },
        sendNotificationEmail: { type: 'boolean', optional: true, description: 'Whether to send notification email' }
      }
    },
    {
      name: 'search_files',
      description: 'Search for files in Google Drive using advanced search syntax',
      parameters: {
        query: { type: 'string', required: true, description: 'Search query using Google Drive search syntax' },
        maxResults: { type: 'number', optional: true, description: 'Maximum number of results to return' },
        orderBy: { type: 'string', optional: true, description: 'Field to sort by' }
      }
    },
    {
      name: 'get_file_permissions',
      description: 'Get sharing permissions for a file or folder',
      parameters: {
        fileId: { type: 'string', required: true, description: 'ID of the file or folder' }
      }
    },
    {
      name: 'get_drive_info',
      description: 'Get information about the user\'s Google Drive storage',
      parameters: {}
    }
  ];
}
module.exports = {
  executeToolCall,
  getAvailableTools
};