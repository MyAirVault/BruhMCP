/**
 * Response Optimizer for GitHub
 * Optimizes GitHub API responses for better performance and reduced payload size
 */

import { createLogger } from '../../utils/logger.js';
import { deepClone, formatBytes } from '../../utils/common.js';

const logger = createLogger('ResponseOptimizer');

export class ResponseOptimizer {
	constructor() {
		this.cache = new Map();
		this.compressionStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalOptimizedSize: 0,
			compressionRatio: 0
		};
	}

	/**
	 * Optimize repositories response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeRepositoriesResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizeResponse(response, {
			removeEmptyFields: true,
			compressArrays: true,
			optimizeMetadata: true
		});

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Repositories response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize repository response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeRepositoryResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		// Create optimized repository with essential information only
		const optimized = {
			id: response.id,
			name: response.name,
			full_name: response.full_name,
			owner: response.owner ? {
				id: response.owner.id,
				login: response.owner.login,
				avatar_url: response.owner.avatar_url,
				type: response.owner.type
			} : null,
			private: response.private,
			html_url: response.html_url,
			description: response.description,
			fork: response.fork,
			created_at: response.created_at,
			updated_at: response.updated_at,
			pushed_at: response.pushed_at,
			clone_url: response.clone_url,
			ssh_url: response.ssh_url,
			homepage: response.homepage,
			size: response.size,
			stargazers_count: response.stargazers_count,
			watchers_count: response.watchers_count,
			language: response.language,
			has_issues: response.has_issues,
			has_projects: response.has_projects,
			has_wiki: response.has_wiki,
			has_pages: response.has_pages,
			forks_count: response.forks_count,
			archived: response.archived,
			disabled: response.disabled,
			open_issues_count: response.open_issues_count,
			license: response.license ? {
				key: response.license.key,
				name: response.license.name,
				spdx_id: response.license.spdx_id
			} : null,
			forks: response.forks,
			open_issues: response.open_issues,
			watchers: response.watchers,
			default_branch: response.default_branch,
			permissions: response.permissions,
			visibility: response.visibility
		};

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Repository response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize issues response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeIssuesResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = Array.isArray(response) 
			? response.map(issue => this.optimizeIssue(issue))
			: this.optimizeIssue(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Issues response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			issueCount: Array.isArray(optimized) ? optimized.length : 1
		});

		return optimized;
	}

	/**
	 * Optimize single issue
	 * @param {Object} issue - Issue object
	 * @returns {Object} Optimized issue
	 */
	optimizeIssue(issue) {
		if (!issue) return issue;

		return {
			id: issue.id,
			number: issue.number,
			title: issue.title,
			user: this.optimizeUser(issue.user),
			labels: issue.labels ? issue.labels.map(label => ({
				id: label.id,
				name: label.name,
				color: label.color,
				description: label.description
			})) : [],
			state: issue.state,
			assignee: this.optimizeUser(issue.assignee),
			assignees: issue.assignees ? issue.assignees.map(user => this.optimizeUser(user)) : [],
			milestone: issue.milestone ? {
				id: issue.milestone.id,
				number: issue.milestone.number,
				title: issue.milestone.title,
				description: issue.milestone.description,
				state: issue.milestone.state,
				created_at: issue.milestone.created_at,
				updated_at: issue.milestone.updated_at,
				due_on: issue.milestone.due_on,
				closed_at: issue.milestone.closed_at
			} : null,
			comments: issue.comments,
			created_at: issue.created_at,
			updated_at: issue.updated_at,
			closed_at: issue.closed_at,
			body: issue.body,
			html_url: issue.html_url,
			pull_request: issue.pull_request ? {
				url: issue.pull_request.url,
				html_url: issue.pull_request.html_url,
				diff_url: issue.pull_request.diff_url,
				patch_url: issue.pull_request.patch_url
			} : null,
			repository: issue.repository ? {
				id: issue.repository.id,
				name: issue.repository.name,
				full_name: issue.repository.full_name,
				owner: this.optimizeUser(issue.repository.owner)
			} : null
		};
	}

	/**
	 * Optimize pull requests response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizePullRequestsResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = Array.isArray(response) 
			? response.map(pr => this.optimizePullRequest(pr))
			: this.optimizePullRequest(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Pull requests response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			prCount: Array.isArray(optimized) ? optimized.length : 1
		});

		return optimized;
	}

	/**
	 * Optimize single pull request
	 * @param {Object} pr - Pull request object
	 * @returns {Object} Optimized pull request
	 */
	optimizePullRequest(pr) {
		if (!pr) return pr;

		return {
			id: pr.id,
			number: pr.number,
			title: pr.title,
			user: this.optimizeUser(pr.user),
			labels: pr.labels ? pr.labels.map(label => ({
				id: label.id,
				name: label.name,
				color: label.color,
				description: label.description
			})) : [],
			state: pr.state,
			assignee: this.optimizeUser(pr.assignee),
			assignees: pr.assignees ? pr.assignees.map(user => this.optimizeUser(user)) : [],
			requested_reviewers: pr.requested_reviewers ? pr.requested_reviewers.map(user => this.optimizeUser(user)) : [],
			milestone: pr.milestone ? {
				id: pr.milestone.id,
				number: pr.milestone.number,
				title: pr.milestone.title,
				state: pr.milestone.state
			} : null,
			head: pr.head ? {
				label: pr.head.label,
				ref: pr.head.ref,
				sha: pr.head.sha,
				user: this.optimizeUser(pr.head.user),
				repo: pr.head.repo ? {
					id: pr.head.repo.id,
					name: pr.head.repo.name,
					full_name: pr.head.repo.full_name,
					owner: this.optimizeUser(pr.head.repo.owner)
				} : null
			} : null,
			base: pr.base ? {
				label: pr.base.label,
				ref: pr.base.ref,
				sha: pr.base.sha,
				user: this.optimizeUser(pr.base.user),
				repo: pr.base.repo ? {
					id: pr.base.repo.id,
					name: pr.base.repo.name,
					full_name: pr.base.repo.full_name,
					owner: this.optimizeUser(pr.base.repo.owner)
				} : null
			} : null,
			body: pr.body,
			created_at: pr.created_at,
			updated_at: pr.updated_at,
			closed_at: pr.closed_at,
			merged_at: pr.merged_at,
			merge_commit_sha: pr.merge_commit_sha,
			draft: pr.draft,
			html_url: pr.html_url,
			diff_url: pr.diff_url,
			patch_url: pr.patch_url,
			mergeable: pr.mergeable,
			mergeable_state: pr.mergeable_state,
			merged: pr.merged,
			merged_by: this.optimizeUser(pr.merged_by),
			comments: pr.comments,
			review_comments: pr.review_comments,
			commits: pr.commits,
			additions: pr.additions,
			deletions: pr.deletions,
			changed_files: pr.changed_files
		};
	}

	/**
	 * Optimize user object
	 * @param {Object} user - User object
	 * @returns {Object} Optimized user
	 */
	optimizeUser(user) {
		if (!user) return user;

		return {
			id: user.id,
			login: user.login,
			avatar_url: user.avatar_url,
			html_url: user.html_url,
			type: user.type,
			name: user.name,
			email: user.email,
			bio: user.bio,
			location: user.location,
			blog: user.blog,
			company: user.company,
			public_repos: user.public_repos,
			public_gists: user.public_gists,
			followers: user.followers,
			following: user.following,
			created_at: user.created_at,
			updated_at: user.updated_at
		};
	}

	/**
	 * Optimize commits response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeCommitsResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = Array.isArray(response) 
			? response.map(commit => this.optimizeCommit(commit))
			: this.optimizeCommit(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Commits response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			commitCount: Array.isArray(optimized) ? optimized.length : 1
		});

		return optimized;
	}

	/**
	 * Optimize user response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeUserResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizeUser(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('User response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize issue response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeIssueResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizeIssue(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Issue response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize pull request response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizePullRequestResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		const optimized = this.optimizePullRequest(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Pull request response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized))
		});

		return optimized;
	}

	/**
	 * Optimize search response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeSearchResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = {
			...response,
			items: response.items ? response.items.map(item => this.optimizeRepositoryResponse(item)) : []
		};

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Search response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			itemCount: optimized.items.length
		});

		return optimized;
	}

	/**
	 * Optimize contents response
	 * @param {Object} response - Original response
	 * @returns {Object} Optimized response
	 */
	optimizeContentsResponse(response) {
		const originalSize = this.calculateResponseSize(response);
		
		const optimized = Array.isArray(response) 
			? response.map(item => this.optimizeContentItem(item))
			: this.optimizeContentItem(response);

		this.updateCompressionStats(originalSize, this.calculateResponseSize(optimized));

		logger.debug('Contents response optimized', {
			originalSize: formatBytes(originalSize),
			optimizedSize: formatBytes(this.calculateResponseSize(optimized)),
			itemCount: Array.isArray(optimized) ? optimized.length : 1
		});

		return optimized;
	}

	/**
	 * Optimize content item
	 * @param {Object} item - Content item
	 * @returns {Object} Optimized content item
	 */
	optimizeContentItem(item) {
		if (!item) return item;

		return {
			type: item.type,
			name: item.name,
			path: item.path,
			sha: item.sha,
			size: item.size,
			url: item.url,
			html_url: item.html_url,
			git_url: item.git_url,
			download_url: item.download_url,
			content: item.content,
			encoding: item.encoding,
			_links: item._links
		};
	}

	/**
	 * Generic optimize method that routes to specific optimizers
	 * @param {Object} response - Response to optimize
	 * @param {string} type - Response type
	 * @param {Object} options - Optimization options
	 * @returns {Object} Optimized response
	 */
	optimize(response, type, options = {}) {
		switch (type) {
			case 'user':
				return this.optimizeUserResponse(response);
			case 'repositories':
				return this.optimizeRepositoriesResponse(response);
			case 'repository':
				return this.optimizeRepositoryResponse(response);
			case 'issues':
				return this.optimizeIssuesResponse(response);
			case 'issue':
				return this.optimizeIssueResponse(response);
			case 'pull_request':
				return this.optimizePullRequestResponse(response);
			case 'pull_requests':
				return this.optimizePullRequestsResponse(response);
			case 'commits':
				return this.optimizeCommitsResponse(response);
			case 'search':
				return this.optimizeSearchResponse(response);
			case 'contents':
				return this.optimizeContentsResponse(response);
			default:
				return this.optimizeResponse(response, options);
		}
	}

	/**
	 * Optimize single commit
	 * @param {Object} commit - Commit object
	 * @returns {Object} Optimized commit
	 */
	optimizeCommit(commit) {
		if (!commit) return commit;

		return {
			sha: commit.sha,
			commit: commit.commit ? {
				message: commit.commit.message,
				author: commit.commit.author ? {
					name: commit.commit.author.name,
					email: commit.commit.author.email,
					date: commit.commit.author.date
				} : null,
				committer: commit.commit.committer ? {
					name: commit.commit.committer.name,
					email: commit.commit.committer.email,
					date: commit.commit.committer.date
				} : null,
				tree: commit.commit.tree ? {
					sha: commit.commit.tree.sha
				} : null
			} : null,
			author: this.optimizeUser(commit.author),
			committer: this.optimizeUser(commit.committer),
			parents: commit.parents ? commit.parents.map(parent => ({
				sha: parent.sha
			})) : [],
			html_url: commit.html_url,
			stats: commit.stats ? {
				additions: commit.stats.additions,
				deletions: commit.stats.deletions,
				total: commit.stats.total
			} : null
		};
	}

	/**
	 * Generic response optimization
	 * @param {Object} response - Response to optimize
	 * @param {Object} options - Optimization options
	 * @returns {Object} Optimized response
	 */
	optimizeResponse(response, options = {}) {
		const {
			removeEmptyFields = false,
			compressArrays = false,
			optimizeMetadata = false
		} = options;

		if (!response || typeof response !== 'object') {
			return response;
		}

		const optimized = Array.isArray(response) ? [] : {};

		for (const [key, value] of Object.entries(response)) {
			// Skip empty fields if requested
			if (removeEmptyFields && this.isEmpty(value)) {
				continue;
			}

			// Optimize metadata fields
			if (optimizeMetadata && this.isMetadataField(key)) {
				continue;
			}

			// Handle arrays
			if (Array.isArray(value)) {
				if (compressArrays && value.length === 0) {
					continue; // Skip empty arrays
				}
				optimized[key] = value.map(item => 
					typeof item === 'object' ? this.optimizeResponse(item, options) : item
				);
			}
			// Handle objects
			else if (typeof value === 'object' && value !== null) {
				optimized[key] = this.optimizeResponse(value, options);
			}
			// Handle primitive values
			else {
				optimized[key] = value;
			}
		}

		return optimized;
	}

	/**
	 * Check if value is empty
	 * @param {any} value - Value to check
	 * @returns {boolean}
	 */
	isEmpty(value) {
		if (value === null || value === undefined) return true;
		if (typeof value === 'string') return value.trim().length === 0;
		if (Array.isArray(value)) return value.length === 0;
		if (typeof value === 'object') return Object.keys(value).length === 0;
		return false;
	}

	/**
	 * Check if field is metadata
	 * @param {string} fieldName - Field name
	 * @returns {boolean}
	 */
	isMetadataField(fieldName) {
		const metadataFields = [
			'_links',
			'node_id',
			'gravatar_id',
			'url',
			'followers_url',
			'following_url',
			'gists_url',
			'starred_url',
			'subscriptions_url',
			'organizations_url',
			'repos_url',
			'events_url',
			'received_events_url',
			'site_admin'
		];
		return metadataFields.includes(fieldName);
	}

	/**
	 * Calculate response size (rough estimate)
	 * @param {any} response - Response object
	 * @returns {number} Size in bytes
	 */
	calculateResponseSize(response) {
		try {
			return JSON.stringify(response).length;
		} catch (error) {
			logger.warn('Failed to calculate response size', { error: error.message });
			return 0;
		}
	}

	/**
	 * Update compression statistics
	 * @param {number} originalSize - Original size
	 * @param {number} optimizedSize - Optimized size
	 */
	updateCompressionStats(originalSize, optimizedSize) {
		this.compressionStats.totalRequests++;
		this.compressionStats.totalOriginalSize += originalSize;
		this.compressionStats.totalOptimizedSize += optimizedSize;
		
		if (this.compressionStats.totalOriginalSize > 0) {
			this.compressionStats.compressionRatio = 
				(this.compressionStats.totalOriginalSize - this.compressionStats.totalOptimizedSize) / 
				this.compressionStats.totalOriginalSize;
		}
	}

	/**
	 * Get compression statistics
	 * @returns {Object}
	 */
	getCompressionStats() {
		return {
			...this.compressionStats,
			averageOriginalSize: this.compressionStats.totalRequests > 0 ? 
				this.compressionStats.totalOriginalSize / this.compressionStats.totalRequests : 0,
			averageOptimizedSize: this.compressionStats.totalRequests > 0 ? 
				this.compressionStats.totalOptimizedSize / this.compressionStats.totalRequests : 0,
			totalSaved: this.compressionStats.totalOriginalSize - this.compressionStats.totalOptimizedSize,
			compressionRatioPercent: Math.round(this.compressionStats.compressionRatio * 100)
		};
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		this.cache.clear();
		logger.debug('GitHub response optimizer cache cleared');
	}

	/**
	 * Reset statistics
	 */
	resetStats() {
		this.compressionStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalOptimizedSize: 0,
			compressionRatio: 0
		};
		logger.debug('GitHub response optimizer statistics reset');
	}
}