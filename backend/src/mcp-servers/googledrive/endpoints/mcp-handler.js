/**
 * Google Drive MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// Import API functions
import { 
  listFiles, 
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
} from '../api/googledrive-api.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class GoogleDriveMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;
		
		this.setupTools();
	}

	/**
	 * Setup MCP tools using Zod schemas
	 */
	setupTools() {
		// Tool 1: list_files
		this.server.tool(
			"list_files",
			"List files and folders in Google Drive",
			{
				query: z.string().optional().default("").describe("Search query using Google Drive search syntax"),
				maxResults: z.number().min(1).max(1000).optional().default(10).describe("Maximum number of files to return"),
				orderBy: z.enum(["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"]).optional().default("modifiedTime").describe("Field to sort by"),
				folderId: z.string().optional().describe("ID of folder to list files from (leave empty for root)"),
				includeItemsFromAllDrives: z.boolean().optional().default(false).describe("Include items from all drives/shared drives")
			},
			async (args) => {
				console.log(`🔧 Tool call: list_files for ${this.serviceConfig.name}`);
				try {
					const result = await listFiles(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing files:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing files: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: get_file_metadata
		this.server.tool(
			"get_file_metadata",
			"Get metadata for a specific file or folder",
			{
				fileId: z.string().describe("ID of the file or folder"),
				fields: z.string().optional().default("id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink,permissions,shared,starred,trashed").describe("Comma-separated list of fields to include")
			},
			async (args) => {
				console.log(`🔧 Tool call: get_file_metadata for ${this.serviceConfig.name}`);
				try {
					const result = await getFileMetadata(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting file metadata:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting file metadata: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: download_file
		this.server.tool(
			"download_file",
			"Download a file from Google Drive",
			{
				fileId: z.string().describe("ID of the file to download"),
				localPath: z.string().describe("Local path where the file should be saved"),
				exportFormat: z.string().optional().describe("Export format for Google Workspace files (e.g., 'application/pdf', 'text/plain')")
			},
			async (args) => {
				console.log(`🔧 Tool call: download_file for ${this.serviceConfig.name}`);
				try {
					const result = await downloadFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error downloading file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error downloading file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: upload_file
		this.server.tool(
			"upload_file",
			"Upload a file to Google Drive",
			{
				localPath: z.string().describe("Local path to the file to upload"),
				fileName: z.string().describe("Name for the file in Google Drive"),
				parentFolderId: z.string().optional().describe("ID of the parent folder (leave empty for root)"),
				mimeType: z.string().optional().describe("MIME type of the file (auto-detected if not provided)")
			},
			async (args) => {
				console.log(`🔧 Tool call: upload_file for ${this.serviceConfig.name}`);
				try {
					const result = await uploadFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error uploading file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error uploading file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: create_folder
		this.server.tool(
			"create_folder",
			"Create a new folder in Google Drive",
			{
				folderName: z.string().describe("Name of the folder to create"),
				parentFolderId: z.string().optional().describe("ID of the parent folder (leave empty for root)")
			},
			async (args) => {
				console.log(`🔧 Tool call: create_folder for ${this.serviceConfig.name}`);
				try {
					const result = await createFolder(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating folder:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating folder: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: delete_file
		this.server.tool(
			"delete_file",
			"Delete a file or folder from Google Drive",
			{
				fileId: z.string().describe("ID of the file or folder to delete")
			},
			async (args) => {
				console.log(`🔧 Tool call: delete_file for ${this.serviceConfig.name}`);
				try {
					const result = await deleteFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error deleting file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: copy_file
		this.server.tool(
			"copy_file",
			"Copy a file in Google Drive",
			{
				fileId: z.string().describe("ID of the file to copy"),
				newName: z.string().describe("Name for the copied file"),
				parentFolderId: z.string().optional().describe("ID of the parent folder for the copy (leave empty for same location)")
			},
			async (args) => {
				console.log(`🔧 Tool call: copy_file for ${this.serviceConfig.name}`);
				try {
					const result = await copyFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error copying file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error copying file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: move_file
		this.server.tool(
			"move_file",
			"Move a file to a different folder in Google Drive",
			{
				fileId: z.string().describe("ID of the file to move"),
				newParentFolderId: z.string().describe("ID of the new parent folder"),
				removeFromParents: z.array(z.string()).optional().describe("IDs of current parent folders to remove from")
			},
			async (args) => {
				console.log(`🔧 Tool call: move_file for ${this.serviceConfig.name}`);
				try {
					const result = await moveFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error moving file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error moving file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 9: share_file
		this.server.tool(
			"share_file",
			"Share a file or folder with specific users or make it publicly accessible",
			{
				fileId: z.string().describe("ID of the file or folder to share"),
				type: z.enum(["user", "group", "domain", "anyone"]).describe("Type of permission"),
				role: z.enum(["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]).describe("Role/permission level"),
				emailAddress: z.string().optional().describe("Email address (required for user/group types)"),
				domain: z.string().optional().describe("Domain name (required for domain type)"),
				sendNotificationEmail: z.boolean().optional().default(true).describe("Whether to send notification email")
			},
			async (args) => {
				console.log(`🔧 Tool call: share_file for ${this.serviceConfig.name}`);
				try {
					const result = await shareFile(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error sharing file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error sharing file: ${error.message}` }]
					};
				}
			}
		);

		// Tool 10: search_files
		this.server.tool(
			"search_files",
			"Search for files in Google Drive using advanced search syntax",
			{
				query: z.string().describe("Search query using Google Drive search syntax (e.g., 'name contains \"report\"', 'mimeType=\"application/pdf\"')"),
				maxResults: z.number().min(1).max(1000).optional().default(10).describe("Maximum number of results to return"),
				orderBy: z.enum(["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"]).optional().default("modifiedTime").describe("Field to sort by")
			},
			async (args) => {
				console.log(`🔧 Tool call: search_files for ${this.serviceConfig.name}`);
				try {
					const result = await searchFiles(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching files:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching files: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: get_file_permissions
		this.server.tool(
			"get_file_permissions",
			"Get sharing permissions for a file or folder",
			{
				fileId: z.string().describe("ID of the file or folder")
			},
			async (args) => {
				console.log(`🔧 Tool call: get_file_permissions for ${this.serviceConfig.name}`);
				try {
					const result = await getFilePermissions(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting file permissions:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting file permissions: ${error.message}` }]
					};
				}
			}
		);

		// Tool 12: get_drive_info
		this.server.tool(
			"get_drive_info",
			"Get information about the user's Google Drive storage",
			{},
			async (args) => {
				console.log(`🔧 Tool call: get_drive_info for ${this.serviceConfig.name}`);
				try {
					const result = await getDriveInfo(args, this.bearerToken);
					return {
						content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting drive info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting drive info: ${error.message}` }]
					};
				}
			}
		);
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Google Drive MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});
				
				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};
				
				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: message?.id || null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (/** @type {any} */ error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	}
}