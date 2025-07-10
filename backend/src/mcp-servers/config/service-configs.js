import fetch from 'node-fetch';

/**
 * Service configuration definitions for different MCP types
 */
const serviceConfigs = {
	figma: {
		name: 'Figma',
		baseURL: 'https://api.figma.com/v1',
		authHeader: apiKey => ({ 'X-Figma-Token': apiKey }),
		credentialField: 'api_key',
		endpoints: {
			me: '/me',
			files: '/me/files',
			teams: '/teams',
			fileDetails: fileKey => `/files/${fileKey}`,
			fileComments: fileKey => `/files/${fileKey}/comments`,
			teamProjects: teamId => `/teams/${teamId}/projects`,
			projectFiles: projectId => `/projects/${projectId}/files`,
		},
		customHandlers: {
			files: async (config, apiKey) => {
				const results = {
					user_info: null,
					files: [],
					available_endpoints: [],
					errors: [],
				};

				// Get user info
				try {
					const userResponse = await fetch(`${config.baseURL}/me`, {
						headers: config.authHeader(apiKey),
					});
					if (userResponse.ok) {
						results.user_info = await userResponse.json();
						results.available_endpoints.push('/me - ✅ Available');
					}
				} catch (error) {
					results.errors.push('Failed to get user info: ' + error.message);
				}

				// Try different file endpoints
				const endpoints = [
					{ name: 'Recent Files', url: `${config.baseURL}/me/files` },
					{ name: 'Teams', url: `${config.baseURL}/teams` },
				];

				for (const endpoint of endpoints) {
					try {
						const response = await fetch(endpoint.url, {
							headers: config.authHeader(apiKey),
						});

						if (response.ok) {
							const data = await response.json();
							results.available_endpoints.push(`${endpoint.name} - ✅ Available`);

							if (endpoint.name === 'Recent Files' && data.files) {
								results.files = results.files.concat(data.files);
							}
						} else {
							results.available_endpoints.push(
								`${endpoint.name} - ❌ ${response.status} ${response.statusText}`
							);
						}
					} catch (error) {
						results.errors.push(`${endpoint.name}: ${error.message}`);
					}
				}

				return {
					...results,
					totalFiles: results.files.length,
					note:
						results.files.length === 0
							? 'No files found. This might be due to API token permissions or account having no recent files.'
							: undefined,
				};
			},
		},
	},

	github: {
		name: 'GitHub',
		baseURL: 'https://api.github.com',
		authHeader: token => ({
			Authorization: `token ${token}`,
			'User-Agent': 'MCP-Server',
		}),
		credentialField: 'personal_access_token',
		endpoints: {
			me: '/user',
			repos: '/user/repos',
			issues: '/issues',
			notifications: '/notifications',
			repoDetails: (owner, repo) => `/repos/${owner}/${repo}`,
			repoIssues: (owner, repo) => `/repos/${owner}/${repo}/issues`,
			repoPulls: (owner, repo) => `/repos/${owner}/${repo}/pulls`,
		},
		customHandlers: {
			repos: async (config, token) => {
				const response = await fetch(`${config.baseURL}/user/repos?per_page=100`, {
					headers: config.authHeader(token),
				});

				if (!response.ok) {
					throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
				}

				const repos = await response.json();
				return {
					repositories: repos.map(repo => ({
						id: repo.id,
						name: repo.name,
						full_name: repo.full_name,
						description: repo.description,
						private: repo.private,
						url: repo.html_url,
						clone_url: repo.clone_url,
						language: repo.language,
						stars: repo.stargazers_count,
						forks: repo.forks_count,
						updated_at: repo.updated_at,
					})),
					totalCount: repos.length,
				};
			},
		},
	},

	gmail: {
		name: 'Gmail',
		baseURL: 'https://gmail.googleapis.com/gmail/v1',
		authHeader: apiKey => ({ Authorization: `Bearer ${apiKey}` }),
		credentialField: 'api_key',
		endpoints: {
			profile: '/users/me/profile',
			messages: '/users/me/messages',
			labels: '/users/me/labels',
			messageDetails: messageId => `/users/me/messages/${messageId}`,
		},
		customHandlers: {
			messages: async (_config, _apiKey) => {
				// Gmail requires OAuth2, so this is a placeholder
				return {
					note: 'Gmail API requires OAuth2 authentication flow',
					oauth_required: true,
					setup_url: 'https://developers.google.com/gmail/api/quickstart',
				};
			},
		},
	},
};

export default serviceConfigs;
