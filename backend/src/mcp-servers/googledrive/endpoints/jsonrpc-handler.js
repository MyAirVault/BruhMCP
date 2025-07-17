/**
 * Google Drive MCP JSON-RPC protocol handler
 * Implements proper JSON-RPC 2.0 message handling for Google Drive MCP server
 */

import { executeToolCall } from './call.js';

export class GoogleDriveMCPJsonRpcHandler {
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
		this.initialized = false;
	}

	/**
	 * Process incoming JSON-RPC message
	 * @param {Object} message - JSON-RPC message
	 * @returns {Object|null} Response object or null for notifications
	 */
	async processMessage(message) {
		// Validate JSON-RPC format
		if (!this.isValidJsonRpc(message)) {
			return this.createErrorResponse(message.id || null, -32600, 'Invalid Request');
		}

		const { method, params, id } = message;

		try {
			// Handle different MCP methods
			switch (method) {
				case 'initialize':
					return await this.handleInitialize(params, id);

				case 'tools/list':
					return await this.handleToolsList(params, id);

				case 'tools/call':
					return await this.handleToolsCall(params, id);

				case 'resources/list':
					return await this.handleResourcesList(params, id);

				case 'resources/read':
					return await this.handleResourcesRead(params, id);

				default:
					return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
			}
		} catch (error) {
			console.error('JSON-RPC handler error:', error);
			return this.createErrorResponse(id, -32603, 'Internal error', { details: error.message });
		}
	}

	/**
	 * Handle initialize request
	 * @param {Object} params - Initialize parameters
	 * @param {string|number} id - Request ID
	 * @returns {Object} Initialize response
	 */
	async handleInitialize(params, id) {
		console.log('🔧 Handling initialize request for Google Drive MCP');
		
		if (!params || !params.protocolVersion) {
			return this.createErrorResponse(id, -32602, 'Invalid params: missing protocolVersion');
		}

		// Validate protocol version - accept common versions
		const supportedVersions = ['2024-11-05', '2025-06-18', '1.0', '0.1.0'];
		if (!supportedVersions.includes(params.protocolVersion)) {
			console.log(`Unsupported protocol version: ${params.protocolVersion}`);
			return this.createErrorResponse(id, -32602, `Unsupported protocol version: ${params.protocolVersion}. Supported: ${supportedVersions.join(', ')}`);
		}
		
		this.initialized = true;
		
		return {
			jsonrpc: '2.0',
			id,
			result: {
				protocolVersion: params.protocolVersion, // Echo back the requested version
				capabilities: {
					tools: {},
					resources: {}
				},
				serverInfo: {
					name: this.serviceConfig.displayName,
					version: this.serviceConfig.version,
					description: this.serviceConfig.description
				}
			}
		};
	}

	/**
	 * Handle tools/list request
	 * @param {Object} params - Parameters
	 * @param {string|number} id - Request ID
	 * @returns {Object} Tools list response
	 */
	async handleToolsList(params, id) {
		console.log('🔧 Handling tools/list request for Google Drive MCP');
		
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		const tools = [
			{
				name: 'list_files',
				description: 'List files and folders in Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Search query using Google Drive search syntax',
							default: ''
						},
						maxResults: {
							type: 'number',
							description: 'Maximum number of files to return',
							minimum: 1,
							maximum: 1000,
							default: 10
						},
						orderBy: {
							type: 'string',
							description: 'Field to sort by',
							enum: ['createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 'name', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', 'viewedByMeTime'],
							default: 'modifiedTime'
						},
						folderId: {
							type: 'string',
							description: 'ID of folder to list files from (leave empty for root)'
						},
						includeItemsFromAllDrives: {
							type: 'boolean',
							description: 'Include items from all drives/shared drives',
							default: false
						}
					}
				}
			},
			{
				name: 'get_file_metadata',
				description: 'Get metadata for a specific file or folder',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file or folder'
						},
						fields: {
							type: 'string',
							description: 'Comma-separated list of fields to include',
							default: 'id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink'
						}
					},
					required: ['fileId']
				}
			},
			{
				name: 'download_file',
				description: 'Download a file from Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file to download'
						},
						localPath: {
							type: 'string',
							description: 'Local path where the file should be saved'
						},
						exportFormat: {
							type: 'string',
							description: 'Export format for Google Workspace files (e.g., "application/pdf", "text/plain")'
						}
					},
					required: ['fileId', 'localPath']
				}
			},
			{
				name: 'upload_file',
				description: 'Upload a file to Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						localPath: {
							type: 'string',
							description: 'Local path to the file to upload'
						},
						fileName: {
							type: 'string',
							description: 'Name for the file in Google Drive'
						},
						parentFolderId: {
							type: 'string',
							description: 'ID of the parent folder (leave empty for root)'
						},
						mimeType: {
							type: 'string',
							description: 'MIME type of the file (auto-detected if not provided)'
						}
					},
					required: ['localPath', 'fileName']
				}
			},
			{
				name: 'create_folder',
				description: 'Create a new folder in Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						folderName: {
							type: 'string',
							description: 'Name of the folder to create'
						},
						parentFolderId: {
							type: 'string',
							description: 'ID of the parent folder (leave empty for root)'
						}
					},
					required: ['folderName']
				}
			},
			{
				name: 'delete_file',
				description: 'Delete a file or folder from Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file or folder to delete'
						}
					},
					required: ['fileId']
				}
			},
			{
				name: 'copy_file',
				description: 'Copy a file in Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file to copy'
						},
						newName: {
							type: 'string',
							description: 'Name for the copied file'
						},
						parentFolderId: {
							type: 'string',
							description: 'ID of the parent folder for the copy (leave empty for same location)'
						}
					},
					required: ['fileId', 'newName']
				}
			},
			{
				name: 'move_file',
				description: 'Move a file to a different folder in Google Drive',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file to move'
						},
						newParentFolderId: {
							type: 'string',
							description: 'ID of the new parent folder'
						},
						removeFromParents: {
							type: 'array',
							description: 'IDs of current parent folders to remove from',
							items: {
								type: 'string'
							}
						}
					},
					required: ['fileId', 'newParentFolderId']
				}
			},
			{
				name: 'share_file',
				description: 'Share a file or folder with specific users or make it publicly accessible',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file or folder to share'
						},
						type: {
							type: 'string',
							description: 'Type of permission',
							enum: ['user', 'group', 'domain', 'anyone']
						},
						role: {
							type: 'string',
							description: 'Role/permission level',
							enum: ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader']
						},
						emailAddress: {
							type: 'string',
							description: 'Email address (required for user/group types)'
						},
						domain: {
							type: 'string',
							description: 'Domain name (required for domain type)'
						},
						sendNotificationEmail: {
							type: 'boolean',
							description: 'Whether to send notification email',
							default: true
						}
					},
					required: ['fileId', 'type', 'role']
				}
			},
			{
				name: 'search_files',
				description: 'Search for files in Google Drive using advanced search syntax',
				inputSchema: {
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description: 'Search query using Google Drive search syntax (e.g., \'name contains "report"\', \'mimeType="application/pdf"\')'
						},
						maxResults: {
							type: 'number',
							description: 'Maximum number of results to return',
							minimum: 1,
							maximum: 1000,
							default: 10
						},
						orderBy: {
							type: 'string',
							description: 'Field to sort by',
							enum: ['createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime', 'name', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', 'viewedByMeTime'],
							default: 'modifiedTime'
						}
					},
					required: ['query']
				}
			},
			{
				name: 'get_file_permissions',
				description: 'Get sharing permissions for a file or folder',
				inputSchema: {
					type: 'object',
					properties: {
						fileId: {
							type: 'string',
							description: 'ID of the file or folder'
						}
					},
					required: ['fileId']
				}
			},
			{
				name: 'get_drive_info',
				description: 'Get information about the user\'s Google Drive storage',
				inputSchema: {
					type: 'object',
					properties: {}
				}
			}
		];
		
		return {
			jsonrpc: '2.0',
			id,
			result: {
				tools: tools
			}
		};
	}

	/**
	 * Handle tools/call request
	 * @param {Object} params - Tool call parameters
	 * @param {string|number} id - Request ID
	 * @returns {Object} Tool call response
	 */
	async handleToolsCall(params, id) {
		console.log('🔧 Handling tools/call request for Google Drive MCP');
		
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		const { name, arguments: args } = params;
		
		if (!name) {
			return this.createErrorResponse(id, -32602, 'Missing tool name');
		}

		try {
			const result = await executeToolCall(name, args || {}, this.bearerToken);
			
			if (result.success) {
				return {
					jsonrpc: '2.0',
					id,
					result: {
						content: [
							{
								type: 'text',
								text: JSON.stringify(result.result, null, 2)
							}
						]
					}
				};
			} else {
				return {
					jsonrpc: '2.0',
					id,
					result: {
						isError: true,
						content: [
							{
								type: 'text',
								text: `Error: ${result.error.message}`
							}
						]
					}
				};
			}
		} catch (error) {
			console.error('Tool execution error:', error);
			return this.createErrorResponse(id, -32603, 'Tool execution failed', { details: error.message });
		}
	}

	/**
	 * Handle resources/list request
	 * @param {Object} params - Parameters
	 * @param {string|number} id - Request ID
	 * @returns {Object} Resources list response
	 */
	async handleResourcesList(params, id) {
		console.log('🔧 Handling resources/list request for Google Drive MCP');
		
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		// Google Drive MCP doesn't expose resources, only tools
		return {
			jsonrpc: '2.0',
			id,
			result: {
				resources: []
			}
		};
	}

	/**
	 * Handle resources/read request
	 * @param {Object} params - Parameters
	 * @param {string|number} id - Request ID
	 * @returns {Object} Resource read response
	 */
	async handleResourcesRead(params, id) {
		console.log('🔧 Handling resources/read request for Google Drive MCP');
		
		if (!this.initialized) {
			return this.createErrorResponse(id, -31000, 'Server not initialized');
		}

		// Google Drive MCP doesn't expose resources
		return this.createErrorResponse(id, -32602, 'Resources not supported');
	}

	/**
	 * Validate JSON-RPC message format
	 * @param {Object} message - Message to validate
	 * @returns {boolean} True if valid JSON-RPC message
	 */
	isValidJsonRpc(message) {
		return (
			message &&
			typeof message === 'object' &&
			message.jsonrpc === '2.0' &&
			typeof message.method === 'string' &&
			(message.id === undefined || typeof message.id === 'string' || typeof message.id === 'number')
		);
	}

	/**
	 * Create JSON-RPC error response
	 * @param {string|number|null} id - Request ID
	 * @param {number} code - Error code
	 * @param {string} message - Error message
	 * @param {Object} data - Additional error data
	 * @returns {Object} Error response
	 */
	createErrorResponse(id, code, message, data = null) {
		const response = {
			jsonrpc: '2.0',
			id,
			error: {
				code,
				message
			}
		};

		if (data) {
			response.error.data = data;
		}

		return response;
	}

	/**
	 * Create JSON-RPC success response
	 * @param {string|number} id - Request ID
	 * @param {Object} result - Response result
	 * @returns {Object} Success response
	 */
	createSuccessResponse(id, result) {
		return {
			jsonrpc: '2.0',
			id,
			result
		};
	}
}