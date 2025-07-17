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
			"List files and folders in Dropbox",
			{
				path: z.string().optional().default("").describe("Path to list files from (empty for root)"),
				recursive: z.boolean().optional().default(false).describe("Whether to list files recursively"),
				limit: z.number().min(1).max(2000).optional().default(10).describe("Maximum number of entries to return")
			},
			async ({ path, recursive, limit }) => {
				console.log(`🔧 Tool call: list_files for ${this.serviceConfig.name}`);
				try {
					const endpoint = recursive ? 'https://api.dropboxapi.com/2/files/list_folder' : 'https://api.dropboxapi.com/2/files/list_folder';
					const response = await fetchWithRetry(endpoint, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							path: path || "",
							recursive: recursive,
							limit: limit
						})
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
			"Get metadata for a file or folder",
			{
				path: z.string().describe("Path to the file or folder")
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: get_file_metadata for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/get_metadata', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ path })
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
			"Download a file from Dropbox",
			{
				path: z.string().describe("Path to the file to download"),
				localPath: z.string().describe("Local path where the file should be saved")
			},
			async ({ path, localPath }) => {
				console.log(`🔧 Tool call: download_file for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/download', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Dropbox-API-Arg': JSON.stringify({ path })
						}
					});
					
					if (!response.ok) {
						throw new Error(`HTTP ${response.status}: ${response.statusText}`);
					}
					
					const fs = await import('fs/promises');
					const path_module = await import('path');
					
					// Create directory if it doesn't exist
					await fs.mkdir(path_module.dirname(localPath), { recursive: true });
					
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
			"Upload a file to Dropbox",
			{
				localPath: z.string().describe("Local path to the file to upload"),
				dropboxPath: z.string().describe("Dropbox path where the file should be uploaded"),
				overwrite: z.boolean().optional().default(false).describe("Whether to overwrite existing files")
			},
			async ({ localPath, dropboxPath, overwrite }) => {
				console.log(`🔧 Tool call: upload_file for ${this.serviceConfig.name}`);
				try {
					const fs = await import('fs/promises');
					const fileContent = await fs.readFile(localPath);
					
					const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/upload', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/octet-stream',
							'Dropbox-API-Arg': JSON.stringify({
								path: dropboxPath,
								mode: overwrite ? 'overwrite' : 'add',
								autorename: !overwrite
							})
						},
						body: fileContent
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
			"Create a new folder in Dropbox",
			{
				path: z.string().describe("Path of the folder to create"),
				autorename: z.boolean().optional().default(false).describe("Whether to autorename if folder exists")
			},
			async ({ path, autorename }) => {
				console.log(`🔧 Tool call: create_folder for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/create_folder_v2', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							path,
							autorename
						})
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
			"Delete a file or folder from Dropbox",
			{
				path: z.string().describe("Path to the file or folder to delete")
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: delete_file for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/delete_v2', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ path })
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
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

		// Tool 7: move_file
		this.server.tool(
			"move_file",
			"Move a file or folder in Dropbox",
			{
				fromPath: z.string().describe("Current path of the file or folder"),
				toPath: z.string().describe("New path for the file or folder"),
				autorename: z.boolean().optional().default(false).describe("Whether to autorename if destination exists")
			},
			async ({ fromPath, toPath, autorename }) => {
				console.log(`🔧 Tool call: move_file for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/move_v2', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							from_path: fromPath,
							to_path: toPath,
							autorename
						})
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

		// Tool 8: copy_file
		this.server.tool(
			"copy_file",
			"Copy a file or folder in Dropbox",
			{
				fromPath: z.string().describe("Path of the file or folder to copy"),
				toPath: z.string().describe("Destination path for the copy"),
				autorename: z.boolean().optional().default(false).describe("Whether to autorename if destination exists")
			},
			async ({ fromPath, toPath, autorename }) => {
				console.log(`🔧 Tool call: copy_file for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/copy_v2', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							from_path: fromPath,
							to_path: toPath,
							autorename
						})
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

		// Tool 9: search_files
		this.server.tool(
			"search_files",
			"Search for files and folders in Dropbox",
			{
				query: z.string().describe("Search query"),
				path: z.string().optional().default("").describe("Path to search within (empty for entire Dropbox)"),
				maxResults: z.number().min(1).max(1000).optional().default(10).describe("Maximum number of results to return"),
				fileStatus: z.enum(["active", "deleted"]).optional().default("active").describe("Whether to search active or deleted files")
			},
			async ({ query, path, maxResults, fileStatus }) => {
				console.log(`🔧 Tool call: search_files for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/search_v2', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							query,
							options: {
								path: path || "",
								max_results: maxResults,
								file_status: fileStatus
							}
						})
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

		// Tool 10: get_shared_links
		this.server.tool(
			"get_shared_links",
			"Get shared links for a file or folder",
			{
				path: z.string().describe("Path to the file or folder")
			},
			async ({ path }) => {
				console.log(`🔧 Tool call: get_shared_links for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/sharing/list_shared_links', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ path })
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting shared links:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting shared links: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: create_shared_link
		this.server.tool(
			"create_shared_link",
			"Create a shared link for a file or folder",
			{
				path: z.string().describe("Path to the file or folder"),
				shortUrl: z.boolean().optional().default(false).describe("Whether to create a short URL")
			},
			async ({ path, shortUrl }) => {
				console.log(`🔧 Tool call: create_shared_link for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							path,
							settings: {
								short_url: shortUrl
							}
						})
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating shared link:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating shared link: ${error.message}` }]
					};
				}
			}
		);

		// Tool 12: get_space_usage
		this.server.tool(
			"get_space_usage",
			"Get current space usage information",
			{},
			async () => {
				console.log(`🔧 Tool call: get_space_usage for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.dropboxapi.com/2/users/get_space_usage', {
						method: 'POST',
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
					console.error(`❌ Error getting space usage:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting space usage: ${error.message}` }]
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