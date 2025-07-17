/**
 * GitHub API Integration
 * Modern class-based GitHub API client with caching and error handling
 */

import { formatRepositoryResponse, formatIssueResponse, formatPullRequestResponse, formatCommitResponse, formatUserResponse, formatContentResponse } from '../utils/github-formatting.js';
import { createLogger } from '../utils/logger.js';
import { withErrorRecovery } from '../utils/error-handler.js';
import { createCache } from '../utils/common.js';

const logger = createLogger('github-api');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub API client class
 */
export class GitHubAPI {
	/**
	 * @param {string} bearerToken - OAuth Bearer token
	 * @param {Object} options - API client options
	 */
	constructor(bearerToken, options = {}) {
		this.bearerToken = bearerToken;
		this.options = {
			timeout: options.timeout || 30000,
			retryAttempts: options.retryAttempts || 3,
			baseURL: options.baseURL || GITHUB_API_BASE,
			userAgent: options.userAgent || 'GitHub-MCP-Server',
			...options
		};
		
		this.cache = createCache(300000); // 5 minutes cache
		this.cacheStats = {
			hits: 0,
			misses: 0,
			sets: 0
		};
		
		logger.info('GitHubAPI initialized', {
			timeout: this.options.timeout,
			retryAttempts: this.options.retryAttempts
		});
	}

	/**
	 * Make authenticated request to GitHub API
	 * @param {string} endpoint - API endpoint
	 * @param {Object} options - Request options
	 * @returns {Object} API response
	 */
	async makeRequest(endpoint, options = {}) {
		const url = `${this.options.baseURL}${endpoint}`;

		const requestOptions = {
			method: options.method || 'GET',
			headers: {
				Authorization: `Bearer ${this.bearerToken}`,
				'Content-Type': 'application/json',
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': this.options.userAgent,
				...options.headers,
			},
			...options,
		};

		if (options.body && typeof options.body === 'object') {
			requestOptions.body = JSON.stringify(options.body);
		}

		logger.apiRequest(requestOptions.method, url);

		const response = await fetch(url, requestOptions);

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;

			try {
				const errorData = JSON.parse(errorText);
				if (errorData.message) {
					errorMessage = `GitHub API error: ${errorData.message}`;
				}
			} catch (parseError) {
				// Use the default error message if JSON parsing fails
			}

			logger.apiResponse(response.status, url, { error: errorMessage });
			throw new Error(errorMessage);
		}

		const data = await response.json();
		logger.apiResponse(response.status, url);

		return data;
	}

	/**
	 * Get authenticated user information
	 * @returns {Object} User information
	 */
	async getAuthenticatedUser() {
		const result = await this.makeRequest('/user');
		return formatUserResponse(result);
	}

	/**
	 * List repositories for the authenticated user
	 * @param {Object} args - Repository arguments
	 * @returns {Object} Repositories list
	 */
	async listRepositories(args = {}) {
		const { 
			visibility = 'all', 
			affiliation = 'owner,collaborator,organization_member',
			type = 'all',
			sort = 'updated',
			direction = 'desc',
			per_page = 30,
			page = 1
		} = args;

		const params = new URLSearchParams({
			visibility,
			affiliation,
			type,
			sort,
			direction,
			per_page: per_page.toString(),
			page: page.toString()
		});

		const result = await this.makeRequest(`/user/repos?${params}`);
		return result.map(repo => formatRepositoryResponse(repo));
	}

	/**
	 * Get repository information
	 * @param {Object} args - Repository arguments
	 * @returns {Object} Repository information
	 */
	async getRepository(args) {
		const { owner, repo } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}`);
		return formatRepositoryResponse(result);
	}

	/**
	 * Create a new repository
	 * @param {Object} args - Repository arguments
	 * @returns {Object} Created repository
	 */
	async createRepository(args) {
		const { 
			name, 
			description = '', 
			private = false, 
			has_issues = true, 
			has_projects = true, 
			has_wiki = true,
			auto_init = false,
			gitignore_template = '',
			license_template = '',
			allow_squash_merge = true,
			allow_merge_commit = true,
			allow_rebase_merge = true,
			delete_branch_on_merge = false
		} = args;

		if (!name) {
			throw new Error('Repository name is required');
		}

		const result = await this.makeRequest('/user/repos', {
			method: 'POST',
			body: {
				name,
				description,
				private,
				has_issues,
				has_projects,
				has_wiki,
				auto_init,
				gitignore_template,
				license_template,
				allow_squash_merge,
				allow_merge_commit,
				allow_rebase_merge,
				delete_branch_on_merge
			}
		});

		return formatRepositoryResponse(result);
	}

	/**
	 * List issues for a repository
	 * @param {Object} args - Issue arguments
	 * @returns {Object} Issues list
	 */
	async listIssues(args) {
		const { 
			owner, 
			repo, 
			milestone = '*', 
			state = 'open', 
			assignee = '*', 
			creator = '', 
			mentioned = '', 
			labels = '', 
			sort = 'created', 
			direction = 'desc',
			since = '',
			per_page = 30,
			page = 1
		} = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const params = new URLSearchParams({
			milestone,
			state,
			assignee,
			sort,
			direction,
			per_page: per_page.toString(),
			page: page.toString()
		});

		if (creator) params.append('creator', creator);
		if (mentioned) params.append('mentioned', mentioned);
		if (labels) params.append('labels', labels);
		if (since) params.append('since', since);

		const result = await this.makeRequest(`/repos/${owner}/${repo}/issues?${params}`);
		return result.map(issue => formatIssueResponse(issue));
	}

	/**
	 * Get issue information
	 * @param {Object} args - Issue arguments
	 * @returns {Object} Issue information
	 */
	async getIssue(args) {
		const { owner, repo, issue_number } = args;

		if (!owner || !repo || !issue_number) {
			throw new Error('Repository owner, name, and issue number are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/issues/${issue_number}`);
		return formatIssueResponse(result);
	}

	/**
	 * Create a new issue
	 * @param {Object} args - Issue arguments
	 * @returns {Object} Created issue
	 */
	async createIssue(args) {
		const { 
			owner, 
			repo, 
			title, 
			body = '', 
			assignees = [], 
			milestone = null, 
			labels = [] 
		} = args;

		if (!owner || !repo || !title) {
			throw new Error('Repository owner, name, and issue title are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/issues`, {
			method: 'POST',
			body: {
				title,
				body,
				assignees,
				milestone,
				labels
			}
		});

		return formatIssueResponse(result);
	}

	/**
	 * Update an issue
	 * @param {Object} args - Issue arguments
	 * @returns {Object} Updated issue
	 */
	async updateIssue(args) {
		const { 
			owner, 
			repo, 
			issue_number, 
			title, 
			body, 
			state, 
			assignees, 
			milestone, 
			labels 
		} = args;

		if (!owner || !repo || !issue_number) {
			throw new Error('Repository owner, name, and issue number are required');
		}

		const updateData = {};
		if (title !== undefined) updateData.title = title;
		if (body !== undefined) updateData.body = body;
		if (state !== undefined) updateData.state = state;
		if (assignees !== undefined) updateData.assignees = assignees;
		if (milestone !== undefined) updateData.milestone = milestone;
		if (labels !== undefined) updateData.labels = labels;

		const result = await this.makeRequest(`/repos/${owner}/${repo}/issues/${issue_number}`, {
			method: 'PATCH',
			body: updateData
		});

		return formatIssueResponse(result);
	}

	/**
	 * List pull requests for a repository
	 * @param {Object} args - Pull request arguments
	 * @returns {Object} Pull requests list
	 */
	async listPullRequests(args) {
		const { 
			owner, 
			repo, 
			state = 'open', 
			head = '', 
			base = '', 
			sort = 'created', 
			direction = 'desc',
			per_page = 30,
			page = 1
		} = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const params = new URLSearchParams({
			state,
			sort,
			direction,
			per_page: per_page.toString(),
			page: page.toString()
		});

		if (head) params.append('head', head);
		if (base) params.append('base', base);

		const result = await this.makeRequest(`/repos/${owner}/${repo}/pulls?${params}`);
		return result.map(pr => formatPullRequestResponse(pr));
	}

	/**
	 * Get pull request information
	 * @param {Object} args - Pull request arguments
	 * @returns {Object} Pull request information
	 */
	async getPullRequest(args) {
		const { owner, repo, pull_number } = args;

		if (!owner || !repo || !pull_number) {
			throw new Error('Repository owner, name, and pull request number are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/pulls/${pull_number}`);
		return formatPullRequestResponse(result);
	}

	/**
	 * Create a new pull request
	 * @param {Object} args - Pull request arguments
	 * @returns {Object} Created pull request
	 */
	async createPullRequest(args) {
		const { 
			owner, 
			repo, 
			title, 
			head, 
			base, 
			body = '', 
			maintainer_can_modify = true, 
			draft = false 
		} = args;

		if (!owner || !repo || !title || !head || !base) {
			throw new Error('Repository owner, name, title, head, and base are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
			method: 'POST',
			body: {
				title,
				head,
				base,
				body,
				maintainer_can_modify,
				draft
			}
		});

		return formatPullRequestResponse(result);
	}

	/**
	 * Update a pull request
	 * @param {Object} args - Pull request arguments
	 * @returns {Object} Updated pull request
	 */
	async updatePullRequest(args) {
		const { 
			owner, 
			repo, 
			pull_number, 
			title, 
			body, 
			state, 
			base, 
			maintainer_can_modify 
		} = args;

		if (!owner || !repo || !pull_number) {
			throw new Error('Repository owner, name, and pull request number are required');
		}

		const updateData = {};
		if (title !== undefined) updateData.title = title;
		if (body !== undefined) updateData.body = body;
		if (state !== undefined) updateData.state = state;
		if (base !== undefined) updateData.base = base;
		if (maintainer_can_modify !== undefined) updateData.maintainer_can_modify = maintainer_can_modify;

		const result = await this.makeRequest(`/repos/${owner}/${repo}/pulls/${pull_number}`, {
			method: 'PATCH',
			body: updateData
		});

		return formatPullRequestResponse(result);
	}

	/**
	 * Search repositories
	 * @param {Object} args - Search arguments
	 * @returns {Object} Search results
	 */
	async searchRepositories(args) {
		const { 
			q, 
			sort = 'stars', 
			order = 'desc', 
			per_page = 30, 
			page = 1 
		} = args;

		if (!q) {
			throw new Error('Search query is required');
		}

		const params = new URLSearchParams({
			q,
			sort,
			order,
			per_page: per_page.toString(),
			page: page.toString()
		});

		const result = await this.makeRequest(`/search/repositories?${params}`);
		return {
			total_count: result.total_count,
			incomplete_results: result.incomplete_results,
			items: result.items.map(repo => formatRepositoryResponse(repo))
		};
	}

	/**
	 * Search issues
	 * @param {Object} args - Search arguments
	 * @returns {Object} Search results
	 */
	async searchIssues(args) {
		const { 
			q, 
			sort = 'created', 
			order = 'desc', 
			per_page = 30, 
			page = 1 
		} = args;

		if (!q) {
			throw new Error('Search query is required');
		}

		const params = new URLSearchParams({
			q,
			sort,
			order,
			per_page: per_page.toString(),
			page: page.toString()
		});

		const result = await this.makeRequest(`/search/issues?${params}`);
		return {
			total_count: result.total_count,
			incomplete_results: result.incomplete_results,
			items: result.items.map(issue => formatIssueResponse(issue))
		};
	}

	/**
	 * List commits for a repository
	 * @param {Object} args - Commit arguments
	 * @returns {Object} Commits list
	 */
	async listCommits(args) {
		const { 
			owner, 
			repo, 
			sha = '', 
			path = '', 
			author = '', 
			since = '', 
			until = '', 
			per_page = 30, 
			page = 1 
		} = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const params = new URLSearchParams({
			per_page: per_page.toString(),
			page: page.toString()
		});

		if (sha) params.append('sha', sha);
		if (path) params.append('path', path);
		if (author) params.append('author', author);
		if (since) params.append('since', since);
		if (until) params.append('until', until);

		const result = await this.makeRequest(`/repos/${owner}/${repo}/commits?${params}`);
		return result.map(commit => formatCommitResponse(commit));
	}

	/**
	 * Get commit information
	 * @param {Object} args - Commit arguments
	 * @returns {Object} Commit information
	 */
	async getCommit(args) {
		const { owner, repo, ref } = args;

		if (!owner || !repo || !ref) {
			throw new Error('Repository owner, name, and commit reference are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/commits/${ref}`);
		return formatCommitResponse(result);
	}

	/**
	 * List branches for a repository
	 * @param {Object} args - Branch arguments
	 * @returns {Object} Branches list
	 */
	async listBranches(args) {
		const { owner, repo, protected_branches = false, per_page = 30, page = 1 } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const params = new URLSearchParams({
			per_page: per_page.toString(),
			page: page.toString()
		});

		if (protected_branches) params.append('protected', 'true');

		const result = await this.makeRequest(`/repos/${owner}/${repo}/branches?${params}`);
		return result.map(branch => ({
			name: branch.name,
			commit: {
				sha: branch.commit?.sha,
				url: branch.commit?.url
			},
			protected: branch.protected
		}));
	}

	/**
	 * Get branch information
	 * @param {Object} args - Branch arguments
	 * @returns {Object} Branch information
	 */
	async getBranch(args) {
		const { owner, repo, branch } = args;

		if (!owner || !repo || !branch) {
			throw new Error('Repository owner, name, and branch name are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/branches/${branch}`);
		return {
			name: result.name,
			commit: {
				sha: result.commit?.sha,
				url: result.commit?.url
			},
			protected: result.protected,
			protection: result.protection,
			protection_url: result.protection_url
		};
	}

	/**
	 * Create a new branch
	 * @param {Object} args - Branch arguments
	 * @returns {Object} Created branch reference
	 */
	async createBranch(args) {
		const { owner, repo, ref, sha } = args;

		if (!owner || !repo || !ref || !sha) {
			throw new Error('Repository owner, name, reference name, and SHA are required');
		}

		const result = await this.makeRequest(`/repos/${owner}/${repo}/git/refs`, {
			method: 'POST',
			body: {
				ref: `refs/heads/${ref}`,
				sha
			}
		});

		return {
			ref: result.ref,
			url: result.url,
			object: {
				sha: result.object?.sha,
				type: result.object?.type,
				url: result.object?.url
			}
		};
	}

	/**
	 * Get repository contents
	 * @param {Object} args - Content arguments
	 * @returns {Object} Repository contents
	 */
	async getRepositoryContents(args) {
		const { owner, repo, path = '', ref = '' } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const params = new URLSearchParams();
		if (ref) params.append('ref', ref);

		const endpoint = `/repos/${owner}/${repo}/contents/${path}${params.toString() ? '?' + params.toString() : ''}`;
		const result = await this.makeRequest(endpoint);
		
		return formatContentResponse(result);
	}

	/**
	 * Fork a repository
	 * @param {Object} args - Fork arguments
	 * @returns {Object} Forked repository
	 */
	async forkRepository(args) {
		const { owner, repo, organization } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		const body = {};
		if (organization) body.organization = organization;

		const result = await this.makeRequest(`/repos/${owner}/${repo}/forks`, {
			method: 'POST',
			body: Object.keys(body).length > 0 ? body : undefined
		});

		return formatRepositoryResponse(result);
	}

	/**
	 * Star a repository
	 * @param {Object} args - Star arguments
	 * @returns {Object} Success status
	 */
	async starRepository(args) {
		const { owner, repo } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		await this.makeRequest(`/user/starred/${owner}/${repo}`, {
			method: 'PUT'
		});

		return { success: true, message: 'Repository starred successfully' };
	}

	/**
	 * Unstar a repository
	 * @param {Object} args - Unstar arguments
	 * @returns {Object} Success status
	 */
	async unstarRepository(args) {
		const { owner, repo } = args;

		if (!owner || !repo) {
			throw new Error('Repository owner and name are required');
		}

		await this.makeRequest(`/user/starred/${owner}/${repo}`, {
			method: 'DELETE'
		});

		return { success: true, message: 'Repository unstarred successfully' };
	}

	/**
	 * Get cache statistics
	 * @returns {Object} Cache statistics
	 */
	getCacheStats() {
		return {
			...this.cacheStats,
			size: this.cache.size(),
			hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
		};
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		this.cache.clear();
		logger.debug('GitHub API cache cleared');
	}
}

// Export all the individual functions as well for backward compatibility
export async function getAuthenticatedUser(bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getAuthenticatedUser();
}

export async function listRepositories(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.listRepositories(args);
}

export async function getRepository(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getRepository(args);
}

export async function createRepository(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.createRepository(args);
}

export async function listIssues(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.listIssues(args);
}

export async function getIssue(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getIssue(args);
}

export async function createIssue(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.createIssue(args);
}

export async function updateIssue(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.updateIssue(args);
}

export async function listPullRequests(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.listPullRequests(args);
}

export async function getPullRequest(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getPullRequest(args);
}

export async function createPullRequest(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.createPullRequest(args);
}

export async function updatePullRequest(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.updatePullRequest(args);
}

export async function listCommits(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.listCommits(args);
}

export async function getCommit(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getCommit(args);
}

export async function listBranches(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.listBranches(args);
}

export async function getBranch(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getBranch(args);
}

export async function createBranch(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.createBranch(args);
}

export async function searchRepositories(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.searchRepositories(args);
}

export async function searchIssues(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.searchIssues(args);
}

export async function getRepositoryContents(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.getRepositoryContents(args);
}

export async function forkRepository(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.forkRepository(args);
}

export async function starRepository(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.starRepository(args);
}

export async function unstarRepository(args, bearerToken) {
	const api = new GitHubAPI(bearerToken);
	return await api.unstarRepository(args);
}

export default GitHubAPI;