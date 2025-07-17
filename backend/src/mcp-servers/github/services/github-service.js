/**
 * GitHub Service
 * Core business logic for GitHub operations with response optimization
 */

import { GitHubAPI } from '../api/github-api.js';
import { createLogger } from '../utils/logger.js';
import { GitHubErrorHandler } from '../utils/error-handler.js';
import { validateGitHubOwnerRepo, validateGitHubIssueParams, validateGitHubPRParams } from '../utils/validation.js';
import { sanitizeGitHubParams } from '../utils/sanitization.js';
import { deepClone, chunkArray, measureExecutionTime, withTimeout } from '../utils/common.js';
import { ResponseOptimizer } from './cache/response-optimizer.js';
import { ResponseSimplifier } from './cache/response-simplifier.js';
import { GlobalVariableManager } from './session/global-variable-manager.js';

const logger = createLogger('GitHubService');

export class GitHubService {
	/**
	 * @param {Object} config - Service configuration
	 */
	constructor(config) {
		this.config = {
			bearerToken: config.bearerToken,
			timeout: config.timeout || 30000,
			retryAttempts: config.retryAttempts || 3,
			useOptimization: config.useOptimization !== false,
			useSimplification: config.useSimplification !== false,
			...config
		};

		// Initialize API client
		this.api = new GitHubAPI(this.config.bearerToken, {
			timeout: this.config.timeout,
			retryAttempts: this.config.retryAttempts
		});

		// Initialize optimization services
		this.responseOptimizer = new ResponseOptimizer();
		this.responseSimplifier = new ResponseSimplifier();
		this.globalVariableManager = new GlobalVariableManager();

		// Cache for repositories and users
		this.repositoryCache = new Map();
		this.userCache = new Map();
		this.cacheTimeout = 300000; // 5 minutes

		logger.info('GitHubService initialized', {
			useOptimization: this.config.useOptimization,
			useSimplification: this.config.useSimplification,
			timeout: this.config.timeout
		});
	}

	/**
	 * Get authenticated user information
	 * @returns {Promise<Object>}
	 */
	async getAuthenticatedUser() {
		logger.info('Getting authenticated user');

		// Check cache first
		const cached = this.userCache.get('authenticated');
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			logger.debug('User cache hit');
			return cached.data;
		}

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getAuthenticatedUser(),
					this.config.timeout,
					'Get authenticated user operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeUserResponse(response);
				}

				return response;
			});

			// Cache the result
			this.userCache.set('authenticated', {
				data: result,
				timestamp: Date.now()
			});

			logger.info('Authenticated user retrieved successfully', {
				duration,
				login: result.login
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'getAuthenticatedUser'
			});
			throw githubError;
		}
	}

	/**
	 * List repositories for authenticated user
	 * @param {Object} options - Query options
	 * @returns {Promise<Array>}
	 */
	async listRepositories(options = {}) {
		const sanitizedOptions = sanitizeGitHubParams(options);
		
		logger.info('Listing repositories', {
			options: sanitizedOptions
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.listRepositories(sanitizedOptions),
					this.config.timeout,
					'List repositories operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeRepositoriesResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyRepositoriesResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Repositories listed successfully', {
				duration,
				repositoryCount: result.length
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'listRepositories',
				options: sanitizedOptions
			});
			throw githubError;
		}
	}

	/**
	 * Get repository information with caching
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @returns {Promise<Object>}
	 */
	async getRepository(owner, repo) {
		validateGitHubOwnerRepo(owner, repo);
		logger.info('Getting repository', { owner, repo });

		// Check cache first
		const cacheKey = `repo:${owner}/${repo}`;
		const cached = this.repositoryCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			logger.debug('Repository cache hit', { owner, repo });
			return cached.data;
		}

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getRepository({ owner, repo }),
					this.config.timeout,
					'Get repository operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeRepositoryResponse(response);
				}

				return response;
			});

			// Cache the result
			this.repositoryCache.set(cacheKey, {
				data: result,
				timestamp: Date.now()
			});

			logger.info('Repository retrieved successfully', {
				owner,
				repo,
				duration,
				stars: result.stargazers_count
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'getRepository',
				owner,
				repo
			});
			throw githubError;
		}
	}

	/**
	 * Create repository with validation
	 * @param {Object} params - Repository parameters
	 * @returns {Promise<Object>}
	 */
	async createRepository(params) {
		const sanitizedParams = sanitizeGitHubParams(params);

		logger.info('Creating repository', {
			name: sanitizedParams.name,
			private: sanitizedParams.private
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.createRepository(sanitizedParams),
					this.config.timeout,
					'Create repository operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeRepositoryResponse(response);
				}

				return response;
			});

			logger.info('Repository created successfully', {
				name: result.name,
				fullName: result.full_name,
				duration
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'createRepository',
				params: sanitizedParams
			});
			throw githubError;
		}
	}

	/**
	 * List issues for repository
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @param {Object} options - Query options
	 * @returns {Promise<Array>}
	 */
	async listIssues(owner, repo, options = {}) {
		validateGitHubOwnerRepo(owner, repo);
		validateGitHubIssueParams(options);

		const sanitizedOptions = sanitizeGitHubParams(options);
		
		logger.info('Listing issues', {
			owner,
			repo,
			options: sanitizedOptions
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.listIssues({ owner, repo, ...sanitizedOptions }),
					this.config.timeout,
					'List issues operation timed out'
				);

				let optimizedResponse = response;

				// Apply optimization if enabled
				if (this.config.useOptimization) {
					optimizedResponse = this.responseOptimizer.optimizeIssuesResponse(optimizedResponse);
				}

				// Apply simplification if enabled
				if (this.config.useSimplification) {
					optimizedResponse = this.responseSimplifier.simplifyIssuesResponse(optimizedResponse);
				}

				return optimizedResponse;
			});

			logger.info('Issues listed successfully', {
				owner,
				repo,
				duration,
				issueCount: result.length
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'listIssues',
				owner,
				repo,
				options: sanitizedOptions
			});
			throw githubError;
		}
	}

	/**
	 * Get specific issue
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @param {number} issueNumber - Issue number
	 * @returns {Promise<Object>}
	 */
	async getIssue(owner, repo, issueNumber) {
		validateGitHubOwnerRepo(owner, repo);
		
		if (!issueNumber || typeof issueNumber !== 'number') {
			throw new Error('Issue number is required and must be a number');
		}

		logger.info('Getting issue', { owner, repo, issueNumber });

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getIssue({ owner, repo, issue_number: issueNumber }),
					this.config.timeout,
					'Get issue operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeIssueResponse(response);
				}

				return response;
			});

			logger.info('Issue retrieved successfully', {
				owner,
				repo,
				issueNumber,
				duration,
				title: result.title
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'getIssue',
				owner,
				repo,
				issueNumber
			});
			throw githubError;
		}
	}

	/**
	 * Create issue with validation
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @param {Object} params - Issue parameters
	 * @returns {Promise<Object>}
	 */
	async createIssue(owner, repo, params) {
		validateGitHubOwnerRepo(owner, repo);
		const sanitizedParams = sanitizeGitHubParams(params);

		logger.info('Creating issue', {
			owner,
			repo,
			title: sanitizedParams.title
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.createIssue({ owner, repo, ...sanitizedParams }),
					this.config.timeout,
					'Create issue operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeIssueResponse(response);
				}

				return response;
			});

			logger.info('Issue created successfully', {
				owner,
				repo,
				issueNumber: result.number,
				title: result.title,
				duration
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'createIssue',
				owner,
				repo,
				params: sanitizedParams
			});
			throw githubError;
		}
	}

	/**
	 * Create pull request with validation
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @param {Object} params - PR parameters
	 * @returns {Promise<Object>}
	 */
	async createPullRequest(owner, repo, params) {
		validateGitHubOwnerRepo(owner, repo);
		validateGitHubPRParams(params);
		const sanitizedParams = sanitizeGitHubParams(params);

		logger.info('Creating pull request', {
			owner,
			repo,
			title: sanitizedParams.title,
			head: sanitizedParams.head,
			base: sanitizedParams.base
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.createPullRequest({ owner, repo, ...sanitizedParams }),
					this.config.timeout,
					'Create pull request operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizePullRequestResponse(response);
				}

				return response;
			});

			logger.info('Pull request created successfully', {
				owner,
				repo,
				prNumber: result.number,
				title: result.title,
				duration
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'createPullRequest',
				owner,
				repo,
				params: sanitizedParams
			});
			throw githubError;
		}
	}

	/**
	 * Search repositories
	 * @param {Object} params - Search parameters
	 * @returns {Promise<Object>}
	 */
	async searchRepositories(params) {
		const sanitizedParams = sanitizeGitHubParams(params);

		logger.info('Searching repositories', {
			query: sanitizedParams.q,
			sort: sanitizedParams.sort
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.searchRepositories(sanitizedParams),
					this.config.timeout,
					'Search repositories operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeSearchResponse(response);
				}

				return response;
			});

			logger.info('Repository search completed successfully', {
				query: sanitizedParams.q,
				duration,
				totalCount: result.total_count,
				itemCount: result.items?.length || 0
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'searchRepositories',
				params: sanitizedParams
			});
			throw githubError;
		}
	}

	/**
	 * Get repository contents
	 * @param {string} owner - Repository owner
	 * @param {string} repo - Repository name
	 * @param {Object} options - Content options
	 * @returns {Promise<Object>}
	 */
	async getRepositoryContents(owner, repo, options = {}) {
		validateGitHubOwnerRepo(owner, repo);
		const sanitizedOptions = sanitizeGitHubParams(options);

		logger.info('Getting repository contents', {
			owner,
			repo,
			path: sanitizedOptions.path || '(root)',
			ref: sanitizedOptions.ref || '(default)'
		});

		try {
			const { result, duration } = await measureExecutionTime(async () => {
				const response = await withTimeout(
					this.api.getRepositoryContents({ owner, repo, ...sanitizedOptions }),
					this.config.timeout,
					'Get repository contents operation timed out'
				);

				if (this.config.useOptimization) {
					return this.responseOptimizer.optimizeContentsResponse(response);
				}

				return response;
			});

			logger.info('Repository contents retrieved successfully', {
				owner,
				repo,
				path: sanitizedOptions.path || '(root)',
				duration,
				itemCount: Array.isArray(result) ? result.length : 1
			});

			return result;
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'getRepositoryContents',
				owner,
				repo,
				options: sanitizedOptions
			});
			throw githubError;
		}
	}

	/**
	 * Get service statistics
	 * @returns {Object}
	 */
	getStatistics() {
		return {
			apiStats: this.api.getCacheStats(),
			repositoryCacheSize: this.repositoryCache.size,
			userCacheSize: this.userCache.size,
			config: {
				useOptimization: this.config.useOptimization,
				useSimplification: this.config.useSimplification,
				timeout: this.config.timeout
			}
		};
	}

	/**
	 * Clear all caches
	 */
	clearCaches() {
		this.api.clearCache();
		this.repositoryCache.clear();
		this.userCache.clear();
		this.responseOptimizer.clearCache();
		this.responseSimplifier.clearCache();
		
		logger.info('All caches cleared');
	}

	/**
	 * Health check
	 * @returns {Promise<Object>}
	 */
	async healthCheck() {
		try {
			const startTime = Date.now();
			await this.api.getAuthenticatedUser();
			const duration = Date.now() - startTime;

			return {
				status: 'healthy',
				apiConnectivity: true,
				responseTime: duration,
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				apiConnectivity: false,
				error: error.message,
				timestamp: new Date().toISOString()
			};
		}
	}
}