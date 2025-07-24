/**
 * Dropbox MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { DropboxAPI } from '../api/dropbox-api.js';
import '../types/dropbox-types.js';
import '../types/serviceTypes.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class DropboxMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
		this.api = new DropboxAPI(bearerToken);
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
	 * Helper function to check API response for errors
	 * @param {any} data - API response data
	 * @throws {Error} If API error is found
	 */
	checkAPIError(data) {
		if (data.error_summary || data.error) {
			throw new Error(`Dropbox API error: ${data.error_summary || data.error.message || 'Unknown error'}`);
		}
	}

	/**
	 * Setup MCP tools using Zod schemas
	 */
	setupTools() {
		// Tool 1: list_files
		this.server.tool(
			'list_files',
			'List files and folders in Dropbox',
			{
				path: z.string().optional().default('').describe('Path to list files from (empty for root)'),
				recursive: z.boolean().optional().default(false).describe('Whether to list files recursively'),
				limit: z
					.number()
					.min(1)
					.max(2000)
					.optional()
					.default(10)
					.describe('Maximum number of entries to return'),
			},
			async ({ path, recursive, limit }) => {
				console.log(`🔧 Tool call: list_files for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (path && typeof path !== 'string') {
						throw new Error('Path must be a string');
					}
					if (limit && (typeof limit !== 'number' || limit < 1 || limit > 2000)) {
						throw new Error('Limit must be a number between 1 and 2000');
					}

					// Add safety limits for recursive listing
					if (recursive && limit > 500) {
						console.warn(
							`⚠️ Recursive listing with limit ${limit} may cause performance issues, reducing to 500`
						);
						limit = 500;
					}

					const data = await this.api.listFiles(path || '', recursive, limit);

					// Add safety warning for large recursive results
					if (recursive && data.entries && data.entries.length > 100) {
						console.warn(
							`⚠️ Recursive listing returned ${data.entries.length} entries - consider using pagination for better performance`
						);
					}

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error listing files:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing files: ${error.message}` }],
					};
				}
			}
		);

		// Tool 2: get_file_metadata
		this.server.tool(
			'get_file_metadata',
			'Get metadata for a file or folder',
			{
				path: z.string().describe('Path to the file or folder'),
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: get_file_metadata for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}

					const data = await this.api.getFileMetadata(path);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error getting file metadata:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting file metadata: ${error.message}` }],
					};
				}
			}
		);

		// Tool 3: download_file
		this.server.tool(
			'download_file',
			'Download a file from Dropbox',
			{
				path: z.string().describe('Path to the file to download'),
				localPath: z.string().describe('Local path where the file should be saved'),
			},
			async ({ path, localPath }) => {
				console.log(`🔧 Tool call: download_file for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}
					if (!localPath || typeof localPath !== 'string') {
						throw new Error('Local path is required and must be a string');
					}

					const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/download', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Dropbox-API-Arg': JSON.stringify({ path }),
						},
					});

					if (!response.ok) {
						// Try to get error details from response
						const errorText = await response.text();
						let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
						try {
							const errorData = JSON.parse(errorText);
							if (errorData.error_summary || errorData.error) {
								errorMessage = `Dropbox API error: ${errorData.error_summary || errorData.error.message || 'Unknown error'}`;
							}
						} catch {
							// Use the default error message
						}
						throw new Error(errorMessage);
					}

					const fs = await import('fs/promises');
					const path_module = await import('path');

					// Create directory if it doesn't exist
					await fs.mkdir(path_module.dirname(localPath), { recursive: true });

					// Write file
					const arrayBuffer = await response.arrayBuffer();
					await fs.writeFile(localPath, Buffer.from(arrayBuffer));

					return {
						content: [{ type: 'text', text: `File downloaded successfully to: ${localPath}` }],
					};
				} catch (error) {
					console.error(`❌ Error downloading file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error downloading file: ${error.message}` }],
					};
				}
			}
		);

		// Tool 4: upload_file
		this.server.tool(
			'upload_file',
			'Upload a file to Dropbox',
			{
				localPath: z.string().describe('Local path to the file to upload'),
				dropboxPath: z.string().describe('Dropbox path where the file should be uploaded'),
				overwrite: z.boolean().optional().default(false).describe('Whether to overwrite existing files'),
			},
			async ({ localPath, dropboxPath, overwrite }) => {
				console.log(`🔧 Tool call: upload_file for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!localPath || typeof localPath !== 'string') {
						throw new Error('Local path is required and must be a string');
					}
					if (!dropboxPath || typeof dropboxPath !== 'string') {
						throw new Error('Dropbox path is required and must be a string');
					}

					const fs = await import('fs/promises');

					// Check if file exists and is readable
					try {
						await fs.access(localPath);
					} catch (accessError) {
						throw new Error(`Cannot access file at ${localPath}: ${accessError.message}`);
					}

					const fileContent = await fs.readFile(localPath);

					const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/upload', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/octet-stream',
							'Dropbox-API-Arg': JSON.stringify({
								path: dropboxPath,
								mode: overwrite ? 'overwrite' : 'add',
								autorename: !overwrite,
							}),
						},
						body: fileContent,
					});

					const data = await response.json();

					// Check for API errors in response
					this.checkAPIError(data);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error uploading file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error uploading file: ${error.message}` }],
					};
				}
			}
		);

		// Tool 5: create_folder
		this.server.tool(
			'create_folder',
			'Create a new folder in Dropbox',
			{
				path: z.string().describe('Path of the folder to create'),
				autorename: z.boolean().optional().default(false).describe('Whether to autorename if folder exists'),
			},
			async ({ path, autorename }) => {
				console.log(`🔧 Tool call: create_folder for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}

					const data = await this.api.createFolder(path, autorename);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error creating folder:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating folder: ${error.message}` }],
					};
				}
			}
		);

		// Tool 6: delete_file
		this.server.tool(
			'delete_file',
			'Delete a file or folder from Dropbox',
			{
				path: z.string().describe('Path to the file or folder to delete'),
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: delete_file for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}

					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/delete_v2', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ path }),
					});

					const data = await response.json();

					// Check for API errors in response
					this.checkAPIError(data);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error deleting file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting file: ${error.message}` }],
					};
				}
			}
		);

		// Tool 7: move_file
		this.server.tool(
			'move_file',
			'Move a file or folder in Dropbox',
			{
				fromPath: z.string().describe('Current path of the file or folder'),
				toPath: z.string().describe('New path for the file or folder'),
				autorename: z
					.boolean()
					.optional()
					.default(false)
					.describe('Whether to autorename if destination exists'),
			},
			async ({ fromPath, toPath, autorename }) => {
				console.log(`🔧 Tool call: move_file for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!fromPath || typeof fromPath !== 'string') {
						throw new Error('From path is required and must be a string');
					}
					if (!toPath || typeof toPath !== 'string') {
						throw new Error('To path is required and must be a string');
					}
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/move_v2', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							from_path: fromPath,
							to_path: toPath,
							autorename,
						}),
					});

					const data = await response.json();
					
					// Check for API errors in response
					this.checkAPIError(data);
					
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error moving file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error moving file: ${error.message}` }],
					};
				}
			}
		);

		// Tool 8: copy_file
		this.server.tool(
			'copy_file',
			'Copy a file or folder in Dropbox',
			{
				fromPath: z.string().describe('Path of the file or folder to copy'),
				toPath: z.string().describe('Destination path for the copy'),
				autorename: z
					.boolean()
					.optional()
					.default(false)
					.describe('Whether to autorename if destination exists'),
			},
			async ({ fromPath, toPath, autorename }) => {
				console.log(`🔧 Tool call: copy_file for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!fromPath || typeof fromPath !== 'string') {
						throw new Error('From path is required and must be a string');
					}
					if (!toPath || typeof toPath !== 'string') {
						throw new Error('To path is required and must be a string');
					}
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/copy_v2', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							from_path: fromPath,
							to_path: toPath,
							autorename,
						}),
					});

					const data = await response.json();

					// Check for API errors in response
					this.checkAPIError(data);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error copying file:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error copying file: ${error.message}` }],
					};
				}
			}
		);

		// Tool 9: search_files
		this.server.tool(
			'search_files',
			'Search for files and folders in Dropbox',
			{
				query: z.string().describe('Search query'),
				path: z.string().optional().default('').describe('Path to search within (empty for entire Dropbox)'),
				maxResults: z
					.number()
					.min(1)
					.max(1000)
					.optional()
					.default(10)
					.describe('Maximum number of results to return'),
				fileStatus: z
					.enum(['active', 'deleted'])
					.optional()
					.default('active')
					.describe('Whether to search active or deleted files'),
			},
			async ({ query, path, maxResults, fileStatus }) => {
				console.log(`🔧 Tool call: search_files for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!query || typeof query !== 'string') {
						throw new Error('Query is required and must be a string');
					}

					const data = await this.api.searchFiles(query, path || '', maxResults, fileStatus);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error searching files:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching files: ${error.message}` }],
					};
				}
			}
		);

		// Tool 10: get_shared_links
		this.server.tool(
			'get_shared_links',
			'Get shared links for a file or folder',
			{
				path: z.string().describe('Path to the file or folder'),
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: get_shared_links for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}

					const response = await fetchWithRetry('https://api.dropboxapi.com/2/sharing/list_shared_links', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ path }),
					});

					const data = await response.json();

					// Check for API errors in response
					this.checkAPIError(data);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error getting shared links:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting shared links: ${error.message}` }],
					};
				}
			}
		);

		// Tool 11: create_shared_link
		this.server.tool(
			'create_shared_link',
			'Create a shared link for a file or folder',
			{
				path: z.string().describe('Path to the file or folder'),
				shortUrl: z.boolean().optional().default(false).describe('Whether to create a short URL'),
			},
			async ({ path, shortUrl }) => {
				console.log(`🔧 Tool call: create_shared_link for ${this.serviceConfig.name}`);
				try {
					// Validate inputs
					if (!path || typeof path !== 'string') {
						throw new Error('Path is required and must be a string');
					}

					const response = await fetchWithRetry(
						'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
						{
							method: 'POST',
							headers: {
								Authorization: `Bearer ${this.bearerToken}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								path,
								settings: {
									short_url: shortUrl,
								},
							}),
						}
					);

					const data = await response.json();

					// Check for API errors in response
					this.checkAPIError(data);

					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					console.error(`❌ Error creating shared link:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating shared link: ${error.message}` }],
					};
				}
			}
		);

		// Tool 12: get_space_usage
		this.server.tool('get_space_usage', 'Get current space usage information', {}, async () => {
			console.log(`🔧 Tool call: get_space_usage for ${this.serviceConfig.name}`);
			try {
				const response = await fetchWithRetry('https://api.dropboxapi.com/2/users/get_space_usage', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${this.bearerToken}`,
						'Content-Type': 'application/json',
					},
				});

				const data = await response.json();

				// Check for API errors in response
				this.checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error getting space usage:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting space usage: ${error.message}` }],
				};
			}
		});
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
					onsessioninitialized: newSessionId => {
						console.log(`✅ Dropbox MCP session initialized: ${newSessionId}`);
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
