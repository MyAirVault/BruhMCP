/**
 * Google Drive MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

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
			async ({ query, maxResults, orderBy, folderId, includeItemsFromAllDrives }) => {
				console.log(`🔧 Tool call: list_files for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					if (query) params.append('q', query);
					if (folderId) params.append('q', `'${folderId}' in parents`);
					params.append('pageSize', maxResults.toString());
					params.append('orderBy', orderBy);
					params.append('includeItemsFromAllDrives', includeItemsFromAllDrives.toString());
					params.append('supportsAllDrives', 'true');
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
				fields: z.string().optional().default("id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink").describe("Comma-separated list of fields to include")
			},
			async ({ fileId, fields }) => {
				console.log(`🔧 Tool call: get_file_metadata for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('fields', fields);
					params.append('supportsAllDrives', 'true');
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ fileId, localPath, exportFormat }) => {
				console.log(`🔧 Tool call: download_file for ${this.serviceConfig.name}`);
				try {
					let url;
					if (exportFormat) {
						url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportFormat)}`;
					} else {
						url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
					}
					
					const response = await fetch(url, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`
						}
					});
					
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					const fs = await import('fs/promises');
					const path = await import('path');
					
					// Create directory if it doesn't exist
					await fs.mkdir(path.dirname(localPath), { recursive: true });
					
					// Write file
					const arrayBuffer = await response.arrayBuffer();
					await fs.writeFile(localPath, Buffer.from(arrayBuffer));
					
					return {
						content: [{ type: 'text', text: `File downloaded successfully to: ${localPath}` }]
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
			async ({ localPath, fileName, parentFolderId, mimeType }) => {
				console.log(`🔧 Tool call: upload_file for ${this.serviceConfig.name}`);
				try {
					const fs = await import('fs/promises');
					const path = await import('path');
					
					const fileContent = await fs.readFile(localPath);
					
					// Auto-detect MIME type if not provided
					if (!mimeType) {
						const extension = path.extname(localPath).toLowerCase();
						const mimeTypes = {
							'.pdf': 'application/pdf',
							'.txt': 'text/plain',
							'.doc': 'application/msword',
							'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
							'.xls': 'application/vnd.ms-excel',
							'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
							'.ppt': 'application/vnd.ms-powerpoint',
							'.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
							'.jpg': 'image/jpeg',
							'.jpeg': 'image/jpeg',
							'.png': 'image/png',
							'.gif': 'image/gif',
							'.mp4': 'video/mp4',
							'.mp3': 'audio/mpeg',
							'.zip': 'application/zip',
							'.json': 'application/json',
							'.html': 'text/html',
							'.css': 'text/css',
							'.js': 'text/javascript'
						};
						mimeType = mimeTypes[extension] || 'application/octet-stream';
					}
					
					const metadata = {
						name: fileName
					};
					
					if (parentFolderId) {
						metadata.parents = [parentFolderId];
					}
					
					const formData = new FormData();
					formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
					formData.append('file', new Blob([fileContent], { type: mimeType }));
					
					const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`
						},
						body: formData
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ folderName, parentFolderId }) => {
				console.log(`🔧 Tool call: create_folder for ${this.serviceConfig.name}`);
				try {
					const metadata = {
						name: folderName,
						mimeType: 'application/vnd.google-apps.folder'
					};
					
					if (parentFolderId) {
						metadata.parents = [parentFolderId];
					}
					
					const response = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(metadata)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ fileId }) => {
				console.log(`🔧 Tool call: delete_file for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`
						}
					});
					
					if (response.ok) {
						return {
							content: [{ type: 'text', text: `File deleted successfully` }]
						};
					} else {
						const error = await response.json();
						throw new Error(JSON.stringify(error));
					}
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
			async ({ fileId, newName, parentFolderId }) => {
				console.log(`🔧 Tool call: copy_file for ${this.serviceConfig.name}`);
				try {
					const metadata = {
						name: newName
					};
					
					if (parentFolderId) {
						metadata.parents = [parentFolderId];
					}
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/copy?supportsAllDrives=true`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(metadata)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ fileId, newParentFolderId, removeFromParents }) => {
				console.log(`🔧 Tool call: move_file for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('addParents', newParentFolderId);
					params.append('supportsAllDrives', 'true');
					
					if (removeFromParents && removeFromParents.length > 0) {
						params.append('removeParents', removeFromParents.join(','));
					}
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`, {
						method: 'PATCH',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ fileId, type, role, emailAddress, domain, sendNotificationEmail }) => {
				console.log(`🔧 Tool call: share_file for ${this.serviceConfig.name}`);
				try {
					const permission = {
						type,
						role
					};
					
					if (emailAddress) permission.emailAddress = emailAddress;
					if (domain) permission.domain = domain;
					
					const params = new URLSearchParams();
					params.append('supportsAllDrives', 'true');
					params.append('sendNotificationEmail', sendNotificationEmail.toString());
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?${params.toString()}`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(permission)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ query, maxResults, orderBy }) => {
				console.log(`🔧 Tool call: search_files for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('q', query);
					params.append('pageSize', maxResults.toString());
					params.append('orderBy', orderBy);
					params.append('supportsAllDrives', 'true');
					params.append('includeItemsFromAllDrives', 'true');
					
					const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async ({ fileId }) => {
				console.log(`🔧 Tool call: get_file_permissions for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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
			async () => {
				console.log(`🔧 Tool call: get_drive_info for ${this.serviceConfig.name}`);
				try {
					const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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