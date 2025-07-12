import fetch from 'node-fetch';

/**
 * GitHub Service Configuration
 * Complete configuration for GitHub API integration
 */
export default {
	// Basic service information
	name: 'GitHub',
	displayName: 'GitHub',
	description: 'Web-based version control and collaboration platform',
	category: 'development',
	iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg',

	// API configuration
	api: {
		baseURL: 'https://api.github.com',
		version: 'v3',
		rateLimit: {
			requests: 5000,
			period: 'hour',
		},
		documentation: 'https://docs.github.com/en/rest',
	},

	// Authentication configuration
	auth: {
		type: 'token',
		field: 'personal_access_token',
		header: 'Authorization',
		headerFormat: token => `token ${token}`,
		validation: {
			format: /^ghp_[A-Za-z0-9_]+$/,
			endpoint: '/user',
		},
	},

	// Standard endpoints
	endpoints: {
		me: '/user',
		repos: '/user/repos',
		issues: '/issues',
		notifications: '/notifications',
		starred: '/user/starred',
		following: '/user/following',
		followers: '/user/followers',
		repoDetails: (owner, repo) => `/repos/${owner}/${repo}`,
		repoIssues: (owner, repo) => `/repos/${owner}/${repo}/issues`,
		repoPulls: (owner, repo) => `/repos/${owner}/${repo}/pulls`,
		repoCommits: (owner, repo) => `/repos/${owner}/${repo}/commits`,
	},

	// Custom handlers for complex operations
	customHandlers: {
		// Enhanced repository listing
		repos: async (config, token) => {
			const response = await fetch(`${config.api.baseURL}/user/repos?per_page=100&sort=updated`, {
				headers: {
					Authorization: `token ${token}`,
					'User-Agent': 'MCP-Server',
					Accept: 'application/vnd.github.v3+json',
				},
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
					ssh_url: repo.ssh_url,
					language: repo.language,
					stars: repo.stargazers_count,
					forks: repo.forks_count,
					watchers: repo.watchers_count,
					open_issues: repo.open_issues_count,
					default_branch: repo.default_branch,
					created_at: repo.created_at,
					updated_at: repo.updated_at,
					pushed_at: repo.pushed_at,
				})),
				totalCount: repos.length,
				summary: {
					public: repos.filter(r => !r.private).length,
					private: repos.filter(r => r.private).length,
					languages: [...new Set(repos.map(r => r.language).filter(Boolean))],
					total_stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
				},
			};
		},

		// Get repository details
		repoDetails: async (config, token, owner, repo) => {
			try {
				const response = await fetch(`${config.api.baseURL}/repos/${owner}/${repo}`, {
					headers: {
						Authorization: `token ${token}`,
						'User-Agent': 'MCP-Server',
						Accept: 'application/vnd.github.v3+json',
					},
				});

				if (response.ok) {
					return await response.json();
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get repository details: ${error.message}`);
			}
		},

		// Get user issues
		issues: async (config, token) => {
			try {
				const response = await fetch(`${config.api.baseURL}/issues?filter=assigned&state=open`, {
					headers: {
						Authorization: `token ${token}`,
						'User-Agent': 'MCP-Server',
						Accept: 'application/vnd.github.v3+json',
					},
				});

				if (response.ok) {
					const issues = await response.json();
					return {
						issues: issues.map(issue => ({
							id: issue.id,
							number: issue.number,
							title: issue.title,
							state: issue.state,
							url: issue.html_url,
							repository: issue.repository.full_name,
							labels: issue.labels.map(l => l.name),
							assignees: issue.assignees.map(a => a.login),
							created_at: issue.created_at,
							updated_at: issue.updated_at,
						})),
						total: issues.length,
					};
				} else {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				throw new Error(`Failed to get issues: ${error.message}`);
			}
		},
	},

	// Available tools configuration
	tools: [
		{
			name: 'get_user_info',
			description: 'Get current user information from GitHub',
			endpoint: 'me',
			parameters: {},
		},
		{
			name: 'list_repositories',
			description: 'List repositories from GitHub with detailed information',
			handler: 'repos',
			parameters: {},
		},
		{
			name: 'get_repository_details',
			description: 'Get detailed information about a specific repository',
			handler: 'repoDetails',
			parameters: {
				owner: {
					type: 'string',
					description: 'The repository owner',
					required: true,
				},
				repo: {
					type: 'string',
					description: 'The repository name',
					required: true,
				},
			},
		},
		{
			name: 'list_issues',
			description: 'List assigned issues from GitHub',
			handler: 'issues',
			parameters: {},
		},
	],

	// Available resources configuration
	resources: [
		{
			name: 'user_profile',
			uri: 'user/profile',
			description: "Current user's GitHub profile information",
			endpoint: 'me',
		},
		{
			name: 'repositories_list',
			uri: 'repositories/list',
			description: 'List of repositories in GitHub',
			handler: 'repos',
		},
	],

	// Validation rules
	validation: {
		credentials: async (config, credentials) => {
			if (!credentials.personal_access_token) {
				throw new Error('Personal access token is required');
			}

			if (!config.auth.validation.format.test(credentials.personal_access_token)) {
				throw new Error('Invalid GitHub token format. Should start with "ghp_"');
			}

			// Test the token
			try {
				const response = await fetch(`${config.api.baseURL}${config.auth.validation.endpoint}`, {
					headers: {
						Authorization: `token ${credentials.personal_access_token}`,
						'User-Agent': 'MCP-Server',
						Accept: 'application/vnd.github.v3+json',
					},
				});

				if (!response.ok) {
					throw new Error(`API validation failed: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				return {
					valid: true,
					user: data,
				};
			} catch (error) {
				throw new Error(`Failed to validate token: ${error.message}`);
			}
		},
	},
};
