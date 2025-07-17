/**
 * Response Simplifier for GitHub MCP Service
 * Simplifies GitHub API responses by removing unnecessary fields and formatting data
 */

import { createLogger } from '../../utils/logger.js';
import { formatBytes, formatDuration } from '../../utils/common.js';
import yaml from 'js-yaml';

const logger = createLogger('response-simplifier');

export class ResponseSimplifier {
	constructor() {
		this.simplificationStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalSimplifiedSize: 0,
			simplificationRatio: 0
		};
		
		logger.info('ResponseSimplifier initialized');
	}

	/**
	 * Simplify repositories response
	 * @param {Array} repositories - Array of repositories
	 * @returns {Array} Simplified repositories
	 */
	simplifyRepositoriesResponse(repositories) {
		if (!Array.isArray(repositories)) return repositories;

		const originalSize = this.calculateResponseSize(repositories);
		
		const simplified = repositories.map(repo => this.simplifyRepository(repo));
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Repositories response simplified', {
			count: repositories.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify single repository
	 * @param {Object} repo - Repository object
	 * @returns {Object} Simplified repository
	 */
	simplifyRepository(repo) {
		if (!repo) return repo;

		return {
			name: repo.name,
			full_name: repo.full_name,
			owner: repo.owner?.login,
			private: repo.private,
			description: repo.description,
			language: repo.language,
			stars: repo.stargazers_count,
			forks: repo.forks_count,
			issues: repo.open_issues_count,
			created: this.formatDate(repo.created_at),
			updated: this.formatDate(repo.updated_at),
			pushed: this.formatDate(repo.pushed_at),
			url: repo.html_url,
			clone_url: repo.clone_url,
			default_branch: repo.default_branch,
			topics: repo.topics,
			archived: repo.archived,
			disabled: repo.disabled,
			has_wiki: repo.has_wiki,
			has_issues: repo.has_issues,
			has_projects: repo.has_projects,
			has_pages: repo.has_pages,
			license: repo.license?.name,
			visibility: repo.visibility
		};
	}

	/**
	 * Simplify issues response
	 * @param {Array} issues - Array of issues
	 * @returns {Array} Simplified issues
	 */
	simplifyIssuesResponse(issues) {
		if (!Array.isArray(issues)) return issues;

		const originalSize = this.calculateResponseSize(issues);
		
		const simplified = issues.map(issue => this.simplifyIssue(issue));
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Issues response simplified', {
			count: issues.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify single issue
	 * @param {Object} issue - Issue object
	 * @returns {Object} Simplified issue
	 */
	simplifyIssue(issue) {
		if (!issue) return issue;

		return {
			number: issue.number,
			title: issue.title,
			state: issue.state,
			author: issue.user?.login,
			assignee: issue.assignee?.login,
			assignees: issue.assignees?.map(user => user.login),
			labels: issue.labels?.map(label => label.name),
			milestone: issue.milestone?.title,
			comments: issue.comments,
			created: this.formatDate(issue.created_at),
			updated: this.formatDate(issue.updated_at),
			closed: issue.closed_at ? this.formatDate(issue.closed_at) : null,
			url: issue.html_url,
			body: this.truncateText(issue.body, 500),
			is_pull_request: !!issue.pull_request,
			locked: issue.locked,
			repository: issue.repository?.full_name
		};
	}

	/**
	 * Simplify pull requests response
	 * @param {Array} pullRequests - Array of pull requests
	 * @returns {Array} Simplified pull requests
	 */
	simplifyPullRequestsResponse(pullRequests) {
		if (!Array.isArray(pullRequests)) return pullRequests;

		const originalSize = this.calculateResponseSize(pullRequests);
		
		const simplified = pullRequests.map(pr => this.simplifyPullRequest(pr));
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Pull requests response simplified', {
			count: pullRequests.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify single pull request
	 * @param {Object} pr - Pull request object
	 * @returns {Object} Simplified pull request
	 */
	simplifyPullRequest(pr) {
		if (!pr) return pr;

		return {
			number: pr.number,
			title: pr.title,
			state: pr.state,
			author: pr.user?.login,
			assignee: pr.assignee?.login,
			assignees: pr.assignees?.map(user => user.login),
			reviewers: pr.requested_reviewers?.map(user => user.login),
			labels: pr.labels?.map(label => label.name),
			milestone: pr.milestone?.title,
			head_branch: pr.head?.ref,
			base_branch: pr.base?.ref,
			head_sha: pr.head?.sha,
			base_sha: pr.base?.sha,
			draft: pr.draft,
			merged: pr.merged,
			mergeable: pr.mergeable,
			mergeable_state: pr.mergeable_state,
			merged_by: pr.merged_by?.login,
			comments: pr.comments,
			review_comments: pr.review_comments,
			commits: pr.commits,
			additions: pr.additions,
			deletions: pr.deletions,
			changed_files: pr.changed_files,
			created: this.formatDate(pr.created_at),
			updated: this.formatDate(pr.updated_at),
			closed: pr.closed_at ? this.formatDate(pr.closed_at) : null,
			merged_at: pr.merged_at ? this.formatDate(pr.merged_at) : null,
			url: pr.html_url,
			diff_url: pr.diff_url,
			patch_url: pr.patch_url,
			body: this.truncateText(pr.body, 500),
			locked: pr.locked
		};
	}

	/**
	 * Simplify commits response
	 * @param {Array} commits - Array of commits
	 * @returns {Array} Simplified commits
	 */
	simplifyCommitsResponse(commits) {
		if (!Array.isArray(commits)) return commits;

		const originalSize = this.calculateResponseSize(commits);
		
		const simplified = commits.map(commit => this.simplifyCommit(commit));
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Commits response simplified', {
			count: commits.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify single commit
	 * @param {Object} commit - Commit object
	 * @returns {Object} Simplified commit
	 */
	simplifyCommit(commit) {
		if (!commit) return commit;

		return {
			sha: commit.sha,
			message: commit.commit?.message,
			author: commit.commit?.author?.name,
			author_email: commit.commit?.author?.email,
			author_date: this.formatDate(commit.commit?.author?.date),
			committer: commit.commit?.committer?.name,
			committer_email: commit.commit?.committer?.email,
			committer_date: this.formatDate(commit.commit?.committer?.date),
			github_author: commit.author?.login,
			github_committer: commit.committer?.login,
			additions: commit.stats?.additions,
			deletions: commit.stats?.deletions,
			total_changes: commit.stats?.total,
			url: commit.html_url,
			parents: commit.parents?.map(parent => parent.sha)
		};
	}

	/**
	 * Simplify user response
	 * @param {Object} user - User object
	 * @returns {Object} Simplified user
	 */
	simplifyUserResponse(user) {
		if (!user) return user;

		const originalSize = this.calculateResponseSize(user);
		
		const simplified = {
			login: user.login,
			name: user.name,
			email: user.email,
			bio: user.bio,
			location: user.location,
			company: user.company,
			blog: user.blog,
			twitter: user.twitter_username,
			avatar: user.avatar_url,
			type: user.type,
			public_repos: user.public_repos,
			public_gists: user.public_gists,
			followers: user.followers,
			following: user.following,
			created: this.formatDate(user.created_at),
			updated: this.formatDate(user.updated_at),
			url: user.html_url,
			hireable: user.hireable
		};
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('User response simplified', {
			login: user.login,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify search response
	 * @param {Object} searchResult - Search result object
	 * @returns {Object} Simplified search result
	 */
	simplifySearchResponse(searchResult) {
		if (!searchResult) return searchResult;

		const originalSize = this.calculateResponseSize(searchResult);
		
		const simplified = {
			total_count: searchResult.total_count,
			incomplete_results: searchResult.incomplete_results,
			items: searchResult.items?.map(item => {
				if (item.full_name) {
					// Repository
					return this.simplifyRepository(item);
				} else if (item.number !== undefined) {
					// Issue or PR
					return this.simplifyIssue(item);
				} else {
					// Other item type
					return item;
				}
			})
		};
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Search response simplified', {
			totalCount: searchResult.total_count,
			itemCount: searchResult.items?.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify contents response
	 * @param {Object|Array} contents - Contents object or array
	 * @returns {Object|Array} Simplified contents
	 */
	simplifyContentsResponse(contents) {
		if (!contents) return contents;

		const originalSize = this.calculateResponseSize(contents);
		
		let simplified;
		if (Array.isArray(contents)) {
			simplified = contents.map(item => this.simplifyContentItem(item));
		} else {
			simplified = this.simplifyContentItem(contents);
		}
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Contents response simplified', {
			isArray: Array.isArray(contents),
			itemCount: Array.isArray(contents) ? contents.length : 1,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Simplify single content item
	 * @param {Object} item - Content item
	 * @returns {Object} Simplified content item
	 */
	simplifyContentItem(item) {
		if (!item) return item;

		return {
			name: item.name,
			path: item.path,
			type: item.type,
			size: item.size,
			sha: item.sha,
			download_url: item.download_url,
			html_url: item.html_url,
			content: item.content,
			encoding: item.encoding,
			is_binary: item.type === 'file' && !item.content
		};
	}

	/**
	 * Simplify branches response
	 * @param {Array} branches - Array of branches
	 * @returns {Array} Simplified branches
	 */
	simplifyBranchesResponse(branches) {
		if (!Array.isArray(branches)) return branches;

		const originalSize = this.calculateResponseSize(branches);
		
		const simplified = branches.map(branch => ({
			name: branch.name,
			protected: branch.protected,
			commit_sha: branch.commit?.sha,
			commit_url: branch.commit?.url
		}));
		
		this.updateSimplificationStats(originalSize, this.calculateResponseSize(simplified));

		logger.debug('Branches response simplified', {
			count: branches.length,
			originalSize: formatBytes(originalSize),
			simplifiedSize: formatBytes(this.calculateResponseSize(simplified))
		});

		return simplified;
	}

	/**
	 * Format date to readable format
	 * @param {string} dateString - ISO date string
	 * @returns {string} Formatted date
	 */
	formatDate(dateString) {
		if (!dateString) return null;
		
		try {
			const date = new Date(dateString);
			return date.toISOString().split('T')[0]; // YYYY-MM-DD
		} catch (error) {
			logger.warn('Failed to format date', { dateString, error: error.message });
			return dateString;
		}
	}

	/**
	 * Truncate text to specified length
	 * @param {string} text - Text to truncate
	 * @param {number} maxLength - Maximum length
	 * @returns {string} Truncated text
	 */
	truncateText(text, maxLength = 200) {
		if (!text || typeof text !== 'string') return text;
		
		if (text.length <= maxLength) return text;
		
		return text.substring(0, maxLength).trim() + '...';
	}

	/**
	 * Calculate response size
	 * @param {*} response - Response object
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
	 * Update simplification statistics
	 * @param {number} originalSize - Original size
	 * @param {number} simplifiedSize - Simplified size
	 */
	updateSimplificationStats(originalSize, simplifiedSize) {
		this.simplificationStats.totalRequests++;
		this.simplificationStats.totalOriginalSize += originalSize;
		this.simplificationStats.totalSimplifiedSize += simplifiedSize;
		
		if (this.simplificationStats.totalOriginalSize > 0) {
			this.simplificationStats.simplificationRatio = 
				(this.simplificationStats.totalOriginalSize - this.simplificationStats.totalSimplifiedSize) / 
				this.simplificationStats.totalOriginalSize;
		}
	}

	/**
	 * Format response as YAML
	 * @param {*} data - Data to format
	 * @returns {string} YAML formatted string
	 */
	formatAsYAML(data) {
		try {
			return yaml.dump(data, {
				indent: 2,
				lineWidth: 120,
				noRefs: true,
				sortKeys: false,
				quotingType: '"'
			});
		} catch (error) {
			logger.warn('Failed to format as YAML', { error: error.message });
			return JSON.stringify(data, null, 2);
		}
	}

	/**
	 * Simplify response with options
	 * @param {*} data - Data to simplify
	 * @param {string} type - Response type
	 * @param {Object} options - Simplification options
	 * @returns {*} Simplified data
	 */
	simplify(data, type, options = {}) {
		let simplified;

		switch (type) {
			case 'user':
				simplified = this.simplifyUserResponse(data);
				break;
			case 'repository':
				simplified = this.simplifyRepository(data);
				break;
			case 'repositories':
				simplified = this.simplifyRepositoriesResponse(data);
				break;
			case 'issue':
				simplified = this.simplifyIssue(data);
				break;
			case 'issues':
				simplified = this.simplifyIssuesResponse(data);
				break;
			case 'pull_request':
				simplified = this.simplifyPullRequest(data);
				break;
			case 'pull_requests':
				simplified = this.simplifyPullRequestsResponse(data);
				break;
			case 'commit':
				simplified = this.simplifyCommit(data);
				break;
			case 'commits':
				simplified = this.simplifyCommitsResponse(data);
				break;
			case 'search':
				simplified = this.simplifySearchResponse(data);
				break;
			case 'contents':
				simplified = this.simplifyContentsResponse(data);
				break;
			case 'branches':
				simplified = this.simplifyBranchesResponse(data);
				break;
			default:
				simplified = data;
		}

		// Format as YAML if requested
		if (options.format === 'yaml') {
			return this.formatAsYAML(simplified);
		}

		return simplified;
	}

	/**
	 * Get simplification statistics
	 * @returns {Object} Statistics
	 */
	getSimplificationStats() {
		return {
			...this.simplificationStats,
			averageOriginalSize: this.simplificationStats.totalRequests > 0 ? 
				this.simplificationStats.totalOriginalSize / this.simplificationStats.totalRequests : 0,
			averageSimplifiedSize: this.simplificationStats.totalRequests > 0 ? 
				this.simplificationStats.totalSimplifiedSize / this.simplificationStats.totalRequests : 0,
			totalSaved: this.simplificationStats.totalOriginalSize - this.simplificationStats.totalSimplifiedSize,
			simplificationRatioPercent: Math.round(this.simplificationStats.simplificationRatio * 100)
		};
	}

	/**
	 * Clear cache
	 */
	clearCache() {
		// This simplifier doesn't use cache, but method is here for interface consistency
		logger.debug('Response simplifier cache cleared (no-op)');
	}

	/**
	 * Reset statistics
	 */
	resetStats() {
		this.simplificationStats = {
			totalRequests: 0,
			totalOriginalSize: 0,
			totalSimplifiedSize: 0,
			simplificationRatio: 0
		};
		logger.debug('Response simplifier statistics reset');
	}
}

export default ResponseSimplifier;