/**
 * Google Drive MCP Tool Definitions
 * Defines all available tools for the Google Drive MCP server
 */

/**
 * Get all available tools for Google Drive MCP
 * @returns {{ tools: { name: string, description: string, inputSchema: { type: string, properties?: Record<string, { type?: string, description?: string, enum?: string[], pattern?: string, minLength?: number, maxLength?: number, minimum?: number, maximum?: number, multipleOf?: number, minItems?: number, maxItems?: number, items?: Record<string, string | number | boolean> }>, required?: string[] } }[] }} Tools definition object
 */
export function getTools() {
	return {
		tools: [
			{
				name: "list_files",
				description: "List files and folders in Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "Search query using Google Drive search syntax",
							default: ""
						},
						maxResults: {
							type: "number",
							description: "Maximum number of files to return",
							minimum: 1,
							maximum: 1000,
							default: 10
						},
						orderBy: {
							type: "string",
							enum: ["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"],
							description: "Field to sort by",
							default: "modifiedTime"
						},
						folderId: {
							type: "string",
							description: "ID of folder to list files from (leave empty for root)"
						},
						includeItemsFromAllDrives: {
							type: "boolean",
							description: "Include items from all drives/shared drives",
							default: false
						}
					}
				}
			},
			{
				name: "get_file_metadata",
				description: "Get metadata for a specific file or folder",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file or folder"
						},
						fields: {
							type: "string",
							description: "Comma-separated list of fields to include",
							default: "id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink,permissions,shared,starred,trashed"
						}
					},
					required: ["fileId"]
				}
			},
			{
				name: "download_file",
				description: "Download a file from Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file to download"
						},
						localPath: {
							type: "string",
							description: "Local path where the file should be saved"
						},
						exportFormat: {
							type: "string",
							description: "Export format for Google Workspace files (e.g., 'application/pdf', 'text/plain')"
						}
					},
					required: ["fileId", "localPath"]
				}
			},
			{
				name: "upload_file",
				description: "Upload a file to Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						localPath: {
							type: "string",
							description: "Local path to the file to upload"
						},
						fileName: {
							type: "string",
							description: "Name for the file in Google Drive"
						},
						parentFolderId: {
							type: "string",
							description: "ID of the parent folder (leave empty for root)"
						},
						mimeType: {
							type: "string",
							description: "MIME type of the file (auto-detected if not provided)"
						}
					},
					required: ["localPath", "fileName"]
				}
			},
			{
				name: "create_folder",
				description: "Create a new folder in Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						folderName: {
							type: "string",
							description: "Name of the folder to create"
						},
						parentFolderId: {
							type: "string",
							description: "ID of the parent folder (leave empty for root)"
						}
					},
					required: ["folderName"]
				}
			},
			{
				name: "delete_file",
				description: "Delete a file or folder from Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file or folder to delete"
						}
					},
					required: ["fileId"]
				}
			},
			{
				name: "copy_file",
				description: "Copy a file in Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file to copy"
						},
						newName: {
							type: "string",
							description: "Name for the copied file"
						},
						parentFolderId: {
							type: "string",
							description: "ID of the parent folder for the copy (leave empty for same location)"
						}
					},
					required: ["fileId", "newName"]
				}
			},
			{
				name: "move_file",
				description: "Move a file to a different folder in Google Drive",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file to move"
						},
						newParentFolderId: {
							type: "string",
							description: "ID of the new parent folder"
						},
						removeFromParents: {
							type: "array",
							items: {
								type: "string"
							},
							description: "IDs of current parent folders to remove from"
						}
					},
					required: ["fileId", "newParentFolderId"]
				}
			},
			{
				name: "share_file",
				description: "Share a file or folder with specific users or make it publicly accessible",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file or folder to share"
						},
						type: {
							type: "string",
							enum: ["user", "group", "domain", "anyone"],
							description: "Type of permission"
						},
						role: {
							type: "string",
							enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"],
							description: "Role/permission level"
						},
						emailAddress: {
							type: "string",
							description: "Email address (required for user/group types)"
						},
						domain: {
							type: "string",
							description: "Domain name (required for domain type)"
						},
						sendNotificationEmail: {
							type: "boolean",
							description: "Whether to send notification email",
							default: true
						}
					},
					required: ["fileId", "type", "role"]
				}
			},
			{
				name: "search_files",
				description: "Search for files in Google Drive using advanced search syntax",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "Search query using Google Drive search syntax (e.g., 'name contains \"report\"', 'mimeType=\"application/pdf\"')"
						},
						maxResults: {
							type: "number",
							description: "Maximum number of results to return",
							minimum: 1,
							maximum: 1000,
							default: 10
						},
						orderBy: {
							type: "string",
							enum: ["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"],
							description: "Field to sort by",
							default: "modifiedTime"
						}
					},
					required: ["query"]
				}
			},
			{
				name: "get_file_permissions",
				description: "Get sharing permissions for a file or folder",
				inputSchema: {
					type: "object",
					properties: {
						fileId: {
							type: "string",
							description: "ID of the file or folder"
						}
					},
					required: ["fileId"]
				}
			},
			{
				name: "get_drive_info",
				description: "Get information about the user's Google Drive storage",
				inputSchema: {
					type: "object",
					properties: {}
				}
			}
		]
	};
}

/**
 * Get tool by name
 * @param {string} toolName - Name of the tool
 * @returns {Object|null} Tool definition or null if not found
 */
export function getToolByName(toolName) {
	const toolsData = getTools();
	return toolsData.tools.find(tool => tool.name === toolName) || null;
}

/**
 * Get all tool names
 * @returns {string[]} Array of tool names
 */
export function getToolNames() {
	const toolsData = getTools();
	return toolsData.tools.map(tool => tool.name);
}

/**
 * Validate if a tool name exists
 * @param {string} toolName - Name of the tool to validate
 * @returns {boolean} True if tool exists
 */
export function isValidTool(toolName) {
	const toolNames = getToolNames();
	return toolNames.includes(toolName);
}