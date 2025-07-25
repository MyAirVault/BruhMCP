/**
 * Dropbox MCP Tool Call Handler
 * Executes Dropbox API operations using OAuth Bearer tokens
 */

import { 
  listFiles,
  getFileMetadata,
  downloadFile,
  uploadFile,
  createFolder,
  deleteFile,
  moveFile,
  copyFile,
  searchFiles,
  getSharedLinks,
  createSharedLink,
  getSpaceUsage
} from '../api/dropboxApi.js';
import { validateToolArguments } from '../utils/validation.js';
import { formatDropboxResponse, formatDropboxError } from '../utils/dropboxFormatting.js';

/**
 * Execute a Dropbox tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {Record<string, unknown>} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Dropbox API
 * @returns {Promise<Record<string, unknown>>} Tool execution result in MCP format
 * @throws {Error} If tool execution fails or validation errors occur
 */
export async function executeToolCall(toolName, args, bearerToken) {
  console.log(`🔧 Executing Dropbox tool: ${toolName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));

  // Validate bearer token
  if (!bearerToken) {
    throw new Error('OAuth Bearer token is required for Dropbox API access');
  }

  // Validate tool arguments against schema
  try {
    validateToolArguments(toolName, args);
  } catch (validationError) {
    const error = validationError instanceof Error ? validationError : new Error(String(validationError));
    const errorMessage = formatDropboxError(`validation for ${toolName}`, error);
    throw new Error(errorMessage);
  }

  try {
    let result;

    switch (toolName) {
      case 'list_files':
        result = await listFiles(args, bearerToken);
        break;

      case 'get_file_metadata':
        result = await getFileMetadata(args, bearerToken);
        break;

      case 'download_file':
        result = await downloadFile(args, bearerToken);
        break;

      case 'upload_file':
        result = await uploadFile(args, bearerToken);
        break;

      case 'create_folder':
        result = await createFolder(args, bearerToken);
        break;

      case 'delete_file':
        result = await deleteFile(args, bearerToken);
        break;

      case 'move_file':
        result = await moveFile(args, bearerToken);
        break;

      case 'copy_file':
        result = await copyFile(args, bearerToken);
        break;

      case 'search_files':
        result = await searchFiles(args, bearerToken);
        break;

      case 'get_shared_links':
        result = await getSharedLinks(args, bearerToken);
        break;

      case 'create_shared_link':
        result = await createSharedLink(args, bearerToken);
        break;

      case 'get_space_usage':
        result = await getSpaceUsage(bearerToken);
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    console.log(`✅ Tool ${toolName} executed successfully`);
    
    // Format response consistently
    let formattedResponse;
    if (typeof result === 'string') {
      formattedResponse = result;
    } else {
      // Transform result to DropboxResponseData format
      const responseData = /** @type {import('../utils/dropboxFormatting.js').DropboxResponseData} */ ({
        action: toolName,
        timestamp: new Date().toISOString(),
        ...result
      });
      formattedResponse = formatDropboxResponse(responseData);
    }
    
    // Return MCP-compliant result format
    return {
      content: [
        {
          type: 'text',
          text: formattedResponse
        }
      ]
    };

  } catch (error) {
    console.error(`❌ Tool ${toolName} execution failed:`, error);
    
    // Format error consistently
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const formattedError = formatDropboxError(toolName, errorObj);
    const enhancedError = new Error(formattedError);
    
    // Preserve original error stack if available
    if (error instanceof Error && error.stack) {
      enhancedError.stack = error.stack;
    }
    
    throw enhancedError;
  }
}

