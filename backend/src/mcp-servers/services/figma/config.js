import fetch from 'node-fetch';

/**
 * Figma Service Configuration
 * Complete configuration for Figma API integration
 */
export default {
	// Basic service information
	name: 'Figma',
	displayName: 'Figma',
	description: 'Design collaboration platform with vector graphics editor',
	category: 'design',
	iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg',
	
	// API configuration
	api: {
		baseURL: 'https://api.figma.com/v1',
		version: 'v1',
		rateLimit: {
			requests: 2000,
			period: 'hour'
		},
		documentation: 'https://www.figma.com/developers/api'
	},

	// Authentication configuration
	auth: {
		type: 'api_key',
		field: 'api_key',
		header: 'X-Figma-Token',
		headerFormat: token => token,
		validation: {
			format: /^figd_[A-Za-z0-9_-]+$/,
			endpoint: '/me'
		}
	},

	// Standard endpoints
	endpoints: {
		me: '/me',
		files: '/me/files',
		teams: '/teams',
		fileDetails: fileKey => `/files/${fileKey}`,
		fileComments: fileKey => `/files/${fileKey}/comments`,
		teamProjects: teamId => `/teams/${teamId}/projects`,
		projectFiles: projectId => `/projects/${projectId}/files`,
		versions: fileKey => `/files/${fileKey}/versions`,
		createComment: fileKey => `/files/${fileKey}/comments`,
		updateFile: fileKey => `/files/${fileKey}`,
		createWebhook: teamId => `/teams/${teamId}/webhooks`
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Enhanced file listing with comprehensive API exploration
		files: async (config, apiKey) => {
			// Log access attempt
			if (global.logFileManager && global.mcpId) {
				global.logFileManager.writeLog(global.mcpId, 'info', 
					`API Access: GET ${config.api.baseURL}/me/files`, 'access', {
						action: 'list_files'
					});
			}

			const results = {
				user_info: null,
				files: [],
				teams: [],
				projects: [],
				available_endpoints: [],
				errors: [],
			};

			// Get user info
			try {
				const userResponse = await fetch(`${config.api.baseURL}/me`, {
					headers: { [config.auth.header]: apiKey },
				});
				if (userResponse.ok) {
					results.user_info = await userResponse.json();
					results.available_endpoints.push('/me - ✅ Available');
				} else {
					results.available_endpoints.push(`/me - ❌ ${userResponse.status} ${userResponse.statusText}`);
					
					// Log API error
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'error', 
							`API Error: GET /me failed - ${userResponse.status} ${userResponse.statusText}`, 'error', {
								action: 'list_files',
								statusCode: userResponse.status,
								endpoint: '/me'
							});
					}
				}
			} catch (error) {
				results.errors.push('Failed to get user info: ' + error.message);
				
				// Log unexpected error
				if (global.logFileManager && global.mcpId) {
					global.logFileManager.writeLog(global.mcpId, 'error', 
						`User info fetch failed: ${error.message}`, 'error', {
							action: 'list_files',
							error: error.message,
							endpoint: '/me'
						});
				}
			}

			// Try different file discovery endpoints
			const endpoints = [
				{ name: 'Recent Files', url: `${config.api.baseURL}/me/files` },
				{ name: 'Teams Listing', url: `${config.api.baseURL}/teams` },
				{ name: 'Version Info', url: `${config.api.baseURL}/version` },
			];

			for (const endpoint of endpoints) {
				try {
					const response = await fetch(endpoint.url, {
						headers: { [config.auth.header]: apiKey },
					});

					if (response.ok) {
						const data = await response.json();
						results.available_endpoints.push(`${endpoint.name} - ✅ Available`);

						if (endpoint.name === 'Recent Files' && data.files) {
							results.files = results.files.concat(data.files);
						} else if (endpoint.name === 'Teams Listing' && data.teams) {
							results.teams = data.teams;
						}
					} else {
						results.available_endpoints.push(
							`${endpoint.name} - ❌ ${response.status} ${response.statusText}`
						);
						if (response.status === 403) {
							results.errors.push(`${endpoint.name}: Access forbidden - may require team membership or different token permissions`);
						}

						// Log API errors
						if (global.logFileManager && global.mcpId) {
							global.logFileManager.writeLog(global.mcpId, 'error', 
								`API Error: ${endpoint.name} failed - ${response.status} ${response.statusText}`, 'error', {
									action: 'list_files',
									statusCode: response.status,
									endpoint: endpoint.name,
									url: endpoint.url
								});
						}
					}
				} catch (error) {
					results.errors.push(`${endpoint.name}: ${error.message}`);
					
					// Log network errors
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'error', 
							`Network error for ${endpoint.name}: ${error.message}`, 'error', {
								action: 'list_files',
								error: error.message,
								endpoint: endpoint.name,
								url: endpoint.url
							});
					}
				}
			}

			// Log successful completion
			if (global.logFileManager && global.mcpId) {
				global.logFileManager.writeLog(global.mcpId, 'info', 
					`Files listed successfully: ${results.files.length} files, ${results.teams.length} teams`, 'access', {
						action: 'list_files',
						fileCount: results.files.length,
						teamCount: results.teams.length,
						errorCount: results.errors.length
					});
			}

			return {
				...results,
				totalFiles: results.files.length,
				totalTeams: results.teams.length,
				api_limitations: 'Figma API requires team IDs to access most endpoints. Your token has full permissions but team discovery is limited.',
				note: results.files.length === 0 && results.teams.length === 0
					? 'No files or teams found. Figma API design requires team IDs for most operations. Consider checking if you have teams in your Figma account.'
					: undefined,
			};
		},

		// Get team projects
		teamProjects: async (config, apiKey, teamId) => {
			const url = `${config.api.baseURL}/teams/${teamId}/projects`;

			// Log access attempt
			if (global.logFileManager && global.mcpId) {
				global.logFileManager.writeLog(global.mcpId, 'info', 
					`API Access: GET ${url}`, 'access', {
						action: 'get_team_projects',
						teamId: teamId
					});
			}

			try {
				const response = await fetch(url, {
					headers: { [config.auth.header]: apiKey },
				});
				
				if (response.ok) {
					const data = await response.json();

					// Log successful retrieval
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'info', 
							`Team projects retrieved successfully: ${data.projects?.length || 0} projects`, 'access', {
								action: 'get_team_projects',
								teamId: teamId,
								projectCount: data.projects?.length || 0
							});
					}

					return data;
				} else {
					// Log API error
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'error', 
							`API Error: GET team projects failed - ${response.status} ${response.statusText}`, 'error', {
								action: 'get_team_projects',
								statusCode: response.status,
								teamId: teamId,
								url: url
							});
					}
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				// Log unexpected error
				if (global.logFileManager && global.mcpId) {
					global.logFileManager.writeLog(global.mcpId, 'error', 
						`Get team projects failed: ${error.message}`, 'error', {
							action: 'get_team_projects',
							error: error.message,
							teamId: teamId,
							url: url
						});
				}
				throw new Error(`Failed to get team projects: ${error.message}`);
			}
		},

		// Get file details
		fileDetails: async (config, apiKey, fileKey) => {
			const url = `${config.api.baseURL}/files/${fileKey}`;

			// Log access attempt
			if (global.logFileManager && global.mcpId) {
				global.logFileManager.writeLog(global.mcpId, 'info', 
					`API Access: GET ${url}`, 'access', {
						action: 'get_file_details',
						fileKey: fileKey
					});
			}

			try {
				const response = await fetch(url, {
					headers: { [config.auth.header]: apiKey },
				});
				
				if (response.ok) {
					const data = await response.json();

					// Log successful retrieval
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'info', 
							`File details retrieved successfully: ${data.name || 'Unknown file'}`, 'access', {
								action: 'get_file_details',
								fileKey: fileKey,
								fileName: data.name,
								fileVersion: data.version
							});
					}

					return data;
				} else {
					// Log API error
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'error', 
							`API Error: GET file details failed - ${response.status} ${response.statusText}`, 'error', {
								action: 'get_file_details',
								statusCode: response.status,
								fileKey: fileKey,
								url: url
							});
					}
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				// Log unexpected error
				if (global.logFileManager && global.mcpId) {
					global.logFileManager.writeLog(global.mcpId, 'error', 
						`Get file details failed: ${error.message}`, 'error', {
							action: 'get_file_details',
							error: error.message,
							fileKey: fileKey,
							url: url
						});
				}
				throw new Error(`Failed to get file details: ${error.message}`);
			}
		},

		// Create comment on file
		createComment: async (config, apiKey, fileKey, message) => {
			const url = `${config.api.baseURL}/files/${fileKey}/comments`;

			// Log access attempt
			if (global.logFileManager && global.mcpId) {
				global.logFileManager.writeLog(global.mcpId, 'info', 
					`API Access: POST ${url}`, 'access', {
						action: 'create_comment',
						fileKey: fileKey
					});
			}

			try {
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						[config.auth.header]: apiKey,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ message })
				});

				if (response.ok) {
					const data = await response.json();

					// Log successful creation
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'info', 
							`Comment created successfully on file ${fileKey}`, 'access', {
								action: 'create_comment',
								fileKey: fileKey,
								commentId: data.id
							});
					}

					return {
						success: true,
						comment: data,
						message: 'Comment created successfully'
					};
				} else {
					// Log API error
					if (global.logFileManager && global.mcpId) {
						global.logFileManager.writeLog(global.mcpId, 'error', 
							`API Error: POST comment failed - ${response.status} ${response.statusText}`, 'error', {
								action: 'create_comment',
								statusCode: response.status,
								fileKey: fileKey,
								url: url
							});
					}
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				// Log unexpected error
				if (global.logFileManager && global.mcpId) {
					global.logFileManager.writeLog(global.mcpId, 'error', 
						`Create comment failed: ${error.message}`, 'error', {
							action: 'create_comment',
							error: error.message,
							fileKey: fileKey,
							url: url
						});
				}
				throw new Error(`Failed to create comment: ${error.message}`);
			}
		}
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_user_info',
			description: 'Get current user information from Figma',
			endpoint: 'me',
			parameters: {}
		},
		{
			name: 'list_files',
			description: 'List files from Figma with comprehensive API exploration',
			handler: 'files',
			parameters: {}
		},
		{
			name: 'get_team_projects',
			description: 'Get projects for a specific team from Figma',
			handler: 'teamProjects',
			parameters: {
				teamId: {
					type: 'string',
					description: 'The team ID to get projects for',
					required: true
				}
			}
		},
		{
			name: 'get_file_details',
			description: 'Get detailed information about a specific file from Figma',
			handler: 'fileDetails',
			parameters: {
				fileKey: {
					type: 'string',
					description: 'The file key to get details for',
					required: true
				}
			}
		},
		{
			name: 'create_comment',
			description: 'Create a comment on a Figma file',
			handler: 'createComment',
			parameters: {
				fileKey: {
					type: 'string',
					description: 'The file key to comment on',
					required: true
				},
				message: {
					type: 'string',
					description: 'The comment message',
					required: true
				}
			}
		}
	],

	// Available resources configuration
	resources: [
		{
			name: 'user_profile',
			uri: 'figma://user/profile',
			description: 'Current user\'s Figma profile information',
			endpoint: 'me'
		},
		{
			name: 'files_list',
			uri: 'figma://files/list',
			description: 'List of files in Figma',
			handler: 'files'
		}
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			if (!credentials.api_key) {
				throw new Error('API key is required');
			}
			
			if (!config.auth.validation.format.test(credentials.api_key)) {
				throw new Error('Invalid Figma API key format. Should start with "figd_"');
			}

			// Test the API key
			try {
				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers: { [config.auth.header]: credentials.api_key },
				});

				if (!response.ok) {
					throw new Error(`API validation failed: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				return {
					valid: true,
					user: data
				};
			} catch (error) {
				throw new Error(`Failed to validate API key: ${error.message}`);
			}
		}
	}
};