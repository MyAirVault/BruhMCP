/**
 * Dropbox MCP Tools Setup
 * Contains all tool definitions for the Dropbox MCP server following Gmail pattern
 */

const { z } = require('zod');
const { fetchWithRetry } = require('../utils/fetchWithRetry.js');

/**
 * Helper function to check API response for errors
 * @param {any} data - API response data
 * @throws {Error} If API error is found
 */
function checkAPIError(data) {
	if (data.error_summary || data.error) {
		throw new Error(`Dropbox API error: ${data.error_summary || data.error.message || 'Unknown error'}`);
	}
}

/**
 * Setup file operations tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {import('../api/dropboxApi.js').DropboxAPI} api - Dropbox API instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
function setupFileOperationsTools(server, api, bearerToken, serviceName) {
	// Tool 1: list_files
	server.tool(
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
			console.log(`🔧 Tool call: list_files for ${serviceName}`);
			try {
				if (path && typeof path !== 'string') {
					throw new Error('Path must be a string');
				}
				if (limit && (typeof limit !== 'number' || limit < 1 || limit > 2000)) {
					throw new Error('Limit must be a number between 1 and 2000');
				}

				if (recursive && limit > 500) {
					console.warn(
						`⚠️ Recursive listing with limit ${limit} may cause performance issues, reducing to 500`
					);
					limit = 500;
				}

				const data = await api.listFiles(path || '', recursive, limit);

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
					content: [{ type: 'text', text: `Error listing files: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 2: get_file_metadata
	server.tool(
		'get_file_metadata',
		'Get metadata for a file or folder',
		{
			path: z.string().describe('Path to the file or folder'),
		},
		async ({ path }) => {
			console.log(`🔧 Tool call: get_file_metadata for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}

				const data = await api.getFileMetadata(path);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error getting file metadata:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting file metadata: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 3: download_file
	server.tool(
		'download_file',
		'Download a file from Dropbox',
		{
			path: z.string().describe('Path to the file to download'),
			localPath: z.string().describe('Local path where the file should be saved'),
		},
		async ({ path, localPath }) => {
			console.log(`🔧 Tool call: download_file for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}
				if (!localPath || typeof localPath !== 'string') {
					throw new Error('Local path is required and must be a string');
				}

				const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/download', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						'Dropbox-API-Arg': JSON.stringify({ path }),
					},
				});

				if (!response.ok) {
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

				const fs = require('fs/promises');
				const path_module = await import('path');

				await fs.mkdir(path_module.dirname(localPath), { recursive: true });

				const arrayBuffer = await response.arrayBuffer();
				await fs.writeFile(localPath, Buffer.from(arrayBuffer));

				return {
					content: [{ type: 'text', text: `File downloaded successfully to: ${localPath}` }],
				};
			} catch (error) {
				console.error(`❌ Error downloading file:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error downloading file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 4: upload_file
	server.tool(
		'upload_file',
		'Upload a file to Dropbox',
		{
			localPath: z.string().describe('Local path to the file to upload'),
			dropboxPath: z.string().describe('Dropbox path where the file should be uploaded'),
			overwrite: z.boolean().optional().default(false).describe('Whether to overwrite existing files'),
		},
		async ({ localPath, dropboxPath, overwrite }) => {
			console.log(`🔧 Tool call: upload_file for ${serviceName}`);
			try {
				if (!localPath || typeof localPath !== 'string') {
					throw new Error('Local path is required and must be a string');
				}
				if (!dropboxPath || typeof dropboxPath !== 'string') {
					throw new Error('Dropbox path is required and must be a string');
				}

				const fs = require('fs/promises');

				try {
					await fs.access(localPath);
				} catch (accessError) {
					throw new Error(`Cannot access file at ${localPath}: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
				}

				const fileContent = await fs.readFile(localPath);

				const response = await fetchWithRetry('https://content.dropboxapi.com/2/files/upload', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
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

				checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error uploading file:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 5: create_folder
	server.tool(
		'create_folder',
		'Create a new folder in Dropbox',
		{
			path: z.string().describe('Path of the folder to create'),
			autorename: z.boolean().optional().default(false).describe('Whether to autorename if folder exists'),
		},
		async ({ path, autorename }) => {
			console.log(`🔧 Tool call: create_folder for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}

				const data = await api.createFolder(path, autorename);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error creating folder:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error creating folder: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);
}

/**
 * Setup file management tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
function setupFileManagementTools(server, bearerToken, serviceName) {
	// Tool 6: delete_file
	server.tool(
		'delete_file',
		'Delete a file or folder from Dropbox',
		{
			path: z.string().describe('Path to the file or folder to delete'),
		},
		async ({ path }) => {
			console.log(`🔧 Tool call: delete_file for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}

				const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/delete_v2', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ path }),
				});

				const data = await response.json();

				checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error deleting file:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error deleting file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 7: move_file
	server.tool(
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
			console.log(`🔧 Tool call: move_file for ${serviceName}`);
			try {
				if (!fromPath || typeof fromPath !== 'string') {
					throw new Error('From path is required and must be a string');
				}
				if (!toPath || typeof toPath !== 'string') {
					throw new Error('To path is required and must be a string');
				}
				const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/move_v2', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						from_path: fromPath,
						to_path: toPath,
						autorename,
					}),
				});

				const data = await response.json();
				
				checkAPIError(data);
				
				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error moving file:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error moving file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 8: copy_file
	server.tool(
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
			console.log(`🔧 Tool call: copy_file for ${serviceName}`);
			try {
				if (!fromPath || typeof fromPath !== 'string') {
					throw new Error('From path is required and must be a string');
				}
				if (!toPath || typeof toPath !== 'string') {
					throw new Error('To path is required and must be a string');
				}
				const response = await fetchWithRetry('https://api.dropboxapi.com/2/files/copy_v2', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						from_path: fromPath,
						to_path: toPath,
						autorename,
					}),
				});

				const data = await response.json();

				checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error copying file:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error copying file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);
}

/**
 * Setup search and sharing tools for the MCP server
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {import('../api/dropboxApi.js').DropboxAPI} api - Dropbox API instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {string} serviceName - Service name for logging
 */
function setupSearchAndSharingTools(server, api, bearerToken, serviceName) {
	// Tool 9: search_files
	server.tool(
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
			console.log(`🔧 Tool call: search_files for ${serviceName}`);
			try {
				if (!query || typeof query !== 'string') {
					throw new Error('Query is required and must be a string');
				}

				const data = await api.searchFiles(query, path || '', maxResults, fileStatus);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error searching files:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error searching files: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 10: get_shared_links
	server.tool(
		'get_shared_links',
		'Get shared links for a file or folder',
		{
			path: z.string().describe('Path to the file or folder'),
		},
		async ({ path }) => {
			console.log(`🔧 Tool call: get_shared_links for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}

				const response = await fetchWithRetry('https://api.dropboxapi.com/2/sharing/list_shared_links', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ path }),
				});

				const data = await response.json();

				checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error getting shared links:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting shared links: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 11: create_shared_link
	server.tool(
		'create_shared_link',
		'Create a shared link for a file or folder',
		{
			path: z.string().describe('Path to the file or folder'),
			shortUrl: z.boolean().optional().default(false).describe('Whether to create a short URL'),
		},
		async ({ path, shortUrl }) => {
			console.log(`🔧 Tool call: create_shared_link for ${serviceName}`);
			try {
				if (!path || typeof path !== 'string') {
					throw new Error('Path is required and must be a string');
				}

				const response = await fetchWithRetry(
					'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${bearerToken}`,
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

				checkAPIError(data);

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (error) {
				console.error(`❌ Error creating shared link:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error creating shared link: ${error instanceof Error ? error.message : 'Unknown error'}` }],
				};
			}
		}
	);

	// Tool 12: get_space_usage
	server.tool('get_space_usage', 'Get current space usage information', {}, async () => {
		console.log(`🔧 Tool call: get_space_usage for ${serviceName}`);
		try {
			const response = await fetchWithRetry('https://api.dropboxapi.com/2/users/get_space_usage', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${bearerToken}`,
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			checkAPIError(data);

			return {
				content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
			};
		} catch (error) {
			console.error(`❌ Error getting space usage:`, error);
			return {
				isError: true,
				content: [{ type: 'text', text: `Error getting space usage: ${error instanceof Error ? error.message : 'Unknown error'}` }],
			};
		}
	});
}

module.exports = { setupFileOperationsTools, setupFileManagementTools, setupSearchAndSharingTools };