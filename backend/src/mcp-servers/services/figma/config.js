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
		versions: fileKey => `/files/${fileKey}/versions`
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Enhanced file listing with comprehensive API exploration
		files: async (config, apiKey) => {
			// Debug: Log the config structure to understand the issue
			console.log('🔍 Debug config structure:', JSON.stringify(config, null, 2));
			console.log('🔍 config.api:', config.api);
			console.log('🔍 config.baseURL:', config.baseURL);
			
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
				}
			} catch (error) {
				results.errors.push('Failed to get user info: ' + error.message);
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
					}
				} catch (error) {
					results.errors.push(`${endpoint.name}: ${error.message}`);
				}
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
			try {
				const response = await fetch(`${config.api.baseURL}/teams/${teamId}/projects`, {
					headers: { [config.auth.header]: apiKey },
				});
				
				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get team projects: ${error.message}`);
			}
		},

		// Get file details
		fileDetails: async (config, apiKey, fileKey) => {
			try {
				const response = await fetch(`${config.api.baseURL}/files/${fileKey}`, {
					headers: { [config.auth.header]: apiKey },
				});
				
				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get file details: ${error.message}`);
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
		}
	],

	// Available resources configuration
	resources: [
		{
			name: 'user_profile',
			uri: 'user/profile',
			description: 'Current user\'s Figma profile information',
			endpoint: 'me'
		},
		{
			name: 'files_list',
			uri: 'files/list',
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