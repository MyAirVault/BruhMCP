/**
 * GitHub API Integration
 * Core GitHub API operations using OAuth Bearer tokens
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
}

/**
 * Get repository information
 * @param {Object} args - Repository arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Repository information
 */
export async function getRepository(args, bearerToken) {
	const { owner, repo } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}`, bearerToken);
	return formatRepositoryResponse(result);
}

/**
 * Create a new repository
 * @param {Object} args - Repository arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created repository
 */
export async function createRepository(args, bearerToken) {
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

	const result = await makeGitHubRequest('/user/repos', bearerToken, {
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
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Issues list
 */
export async function listIssues(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/issues?${params}`, bearerToken);
	return result.map(issue => formatIssueResponse(issue));
}

/**
 * Get issue information
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Issue information
 */
export async function getIssue(args, bearerToken) {
	const { owner, repo, issue_number } = args;

	if (!owner || !repo || !issue_number) {
		throw new Error('Repository owner, name, and issue number are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/issues/${issue_number}`, bearerToken);
	return formatIssueResponse(result);
}

/**
 * Create a new issue
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created issue
 */
export async function createIssue(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/issues`, bearerToken, {
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
 * Create a new pull request
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created pull request
 */
export async function createPullRequest(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls`, bearerToken, {
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
 * List pull requests for a repository
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Pull requests list
 */
export async function listPullRequests(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls?${params}`, bearerToken);
	return result.map(pr => formatPullRequestResponse(pr));
}

/**
 * Search repositories
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export async function searchRepositories(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/search/repositories?${params}`, bearerToken);
	return {
		total_count: result.total_count,
		incomplete_results: result.incomplete_results,
		items: result.items.map(repo => formatRepositoryResponse(repo))
	};
}

/**
 * Search issues
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export async function searchIssues(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/search/issues?${params}`, bearerToken);
	return {
		total_count: result.total_count,
		incomplete_results: result.incomplete_results,
		items: result.items.map(issue => formatIssueResponse(issue))
	};
}

/**
 * Update an issue
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated issue
 */
export async function updateIssue(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/issues/${issue_number}`, bearerToken, {
		method: 'PATCH',
		body: updateData
	});

	return formatIssueResponse(result);
}

/**
 * Get pull request information
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Pull request information
 */
export async function getPullRequest(args, bearerToken) {
	const { owner, repo, pull_number } = args;

	if (!owner || !repo || !pull_number) {
		throw new Error('Repository owner, name, and pull request number are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}`, bearerToken);
	return formatPullRequestResponse(result);
}

/**
 * Update a pull request
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated pull request
 */
export async function updatePullRequest(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/pulls/${pull_number}`, bearerToken, {
		method: 'PATCH',
		body: updateData
	});

	return formatPullRequestResponse(result);
}

/**
 * List commits for a repository
 * @param {Object} args - Commit arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Commits list
 */
export async function listCommits(args, bearerToken) {
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

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/commits?${params}`, bearerToken);
	return result.map(commit => formatCommitResponse(commit));
}

/**
 * Get commit information
 * @param {Object} args - Commit arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Commit information
 */
export async function getCommit(args, bearerToken) {
	const { owner, repo, ref } = args;

	if (!owner || !repo || !ref) {
		throw new Error('Repository owner, name, and commit reference are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/commits/${ref}`, bearerToken);
	return formatCommitResponse(result);
}

/**
 * List branches for a repository
 * @param {Object} args - Branch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Branches list
 */
export async function listBranches(args, bearerToken) {
	const { owner, repo, protected_branches = false, per_page = 30, page = 1 } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	const params = new URLSearchParams({
		per_page: per_page.toString(),
		page: page.toString()
	});

	if (protected_branches) params.append('protected', 'true');

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/branches?${params}`, bearerToken);
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
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Branch information
 */
export async function getBranch(args, bearerToken) {
	const { owner, repo, branch } = args;

	if (!owner || !repo || !branch) {
		throw new Error('Repository owner, name, and branch name are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/branches/${branch}`, bearerToken);
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
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created branch reference
 */
export async function createBranch(args, bearerToken) {
	const { owner, repo, ref, sha } = args;

	if (!owner || !repo || !ref || !sha) {
		throw new Error('Repository owner, name, reference name, and SHA are required');
	}

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/git/refs`, bearerToken, {
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
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Repository contents
 */
export async function getRepositoryContents(args, bearerToken) {
	const { owner, repo, path = '', ref = '' } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	const params = new URLSearchParams();
	if (ref) params.append('ref', ref);

	const endpoint = `/repos/${owner}/${repo}/contents/${path}${params.toString() ? '?' + params.toString() : ''}`;
	const result = await makeGitHubRequest(endpoint, bearerToken);
	
	return formatContentResponse(result);
}

/**
 * Fork a repository
 * @param {Object} args - Fork arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Forked repository
 */
export async function forkRepository(args, bearerToken) {
	const { owner, repo, organization } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	const body = {};
	if (organization) body.organization = organization;

	const result = await makeGitHubRequest(`/repos/${owner}/${repo}/forks`, bearerToken, {
		method: 'POST',
		body: Object.keys(body).length > 0 ? body : undefined
	});

	return formatRepositoryResponse(result);
}

/**
 * Star a repository
 * @param {Object} args - Star arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Success status
 */
export async function starRepository(args, bearerToken) {
	const { owner, repo } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	await makeGitHubRequest(`/user/starred/${owner}/${repo}`, bearerToken, {
		method: 'PUT'
	});

	return { success: true, message: 'Repository starred successfully' };
}

/**
 * Unstar a repository
 * @param {Object} args - Unstar arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Success status
 */
export async function unstarRepository(args, bearerToken) {
	const { owner, repo } = args;

	if (!owner || !repo) {
		throw new Error('Repository owner and name are required');
	}

	await makeGitHubRequest(`/user/starred/${owner}/${repo}`, bearerToken, {
		method: 'DELETE'
	});

	return { success: true, message: 'Repository unstarred successfully' };
}