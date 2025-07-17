/**
 * GitHub MCP JSON-RPC protocol handler using official SDK
 * Modern implementation with GitHubService, enhanced error handling, and performance monitoring
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { GitHubService } from '../services/github-service.js';
import { GitHubErrorHandler } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';
import { measurePerformance } from '../utils/common.js';
import { GlobalVariableManager } from '../services/session/global-variable-manager.js';

const logger = createLogger('github-mcp-handler');

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class GitHubMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} bearerToken
	 */
	constructor(serviceConfig, bearerToken) {
		this.serviceConfig = serviceConfig;
		this.bearerToken = bearerToken;
		this.server = new McpServer({
			name: `${serviceConfig.displayName} MCP Server`,
			version: serviceConfig.version,
		});
		
		// Initialize services
		this.githubService = new GitHubService({
			bearerToken: this.bearerToken,
			timeout: 30000,
			retryAttempts: 3,
			useOptimization: true,
			useSimplification: true
		});
		
		this.globalVariableManager = new GlobalVariableManager();
		
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;
		
		// Performance and error tracking
		this.stats = {
			totalRequests: 0,
			successfulRequests: 0,
			failedRequests: 0,
			averageResponseTime: 0,
			toolUsage: new Map()
		};
		
		this.setupTools();
		
		logger.info('GitHubMCPHandler initialized', {
			serviceName: serviceConfig.name,
			displayName: serviceConfig.displayName,
			version: serviceConfig.version
		});
	}

	/**
	 * Setup MCP tools using Zod schemas with enhanced error handling
	 */
	setupTools() {
		// Tool 1: get_authenticated_user
		this.server.tool(
			"get_authenticated_user",
			"Get information about the authenticated GitHub user",
			{},
			measurePerformance(async () => {
				logger.info('Tool call: get_authenticated_user', { service: this.serviceConfig.name });
				this.updateToolUsage('get_authenticated_user');
				
				try {
					const result = await this.githubService.getAuthenticatedUser();
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'user')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'get_authenticated_user');
				}
			}, 'get_authenticated_user')
		);

		// Tool 2: list_repositories
		this.server.tool(
			"list_repositories",
			"List repositories for the authenticated user",
			{
				visibility: z.enum(["all", "public", "private"]).optional().default("all").describe("Repository visibility filter"),
				affiliation: z.string().optional().default("owner,collaborator,organization_member").describe("Repository affiliation filter"),
				type: z.enum(["all", "owner", "public", "private", "member"]).optional().default("all").describe("Repository type filter"),
				sort: z.enum(["created", "updated", "pushed", "full_name"]).optional().default("updated").describe("Sort order"),
				direction: z.enum(["asc", "desc"]).optional().default("desc").describe("Sort direction"),
				per_page: z.number().min(1).max(100).optional().default(30).describe("Number of results per page"),
				page: z.number().min(1).optional().default(1).describe("Page number")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: list_repositories', { service: this.serviceConfig.name, params });
				this.updateToolUsage('list_repositories');
				
				try {
					const result = await this.githubService.listRepositories(params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'repositories')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'list_repositories', params);
				}
			}, 'list_repositories')
		);

		// Tool 3: get_repository
		this.server.tool(
			"get_repository",
			"Get information about a specific repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: get_repository', { service: this.serviceConfig.name, params });
				this.updateToolUsage('get_repository');
				
				try {
					const result = await this.githubService.getRepository(params.owner, params.repo);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'repository')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'get_repository', params);
				}
			}, 'get_repository')
		);

		// Tool 4: create_repository
		this.server.tool(
			"create_repository",
			"Create a new repository",
			{
				name: z.string().describe("Repository name"),
				description: z.string().optional().default("").describe("Repository description"),
				private: z.boolean().optional().default(false).describe("Whether the repository is private"),
				has_issues: z.boolean().optional().default(true).describe("Whether to enable issues"),
				has_projects: z.boolean().optional().default(true).describe("Whether to enable projects"),
				has_wiki: z.boolean().optional().default(true).describe("Whether to enable wiki"),
				auto_init: z.boolean().optional().default(false).describe("Whether to initialize with README"),
				gitignore_template: z.string().optional().default("").describe("Gitignore template to use"),
				license_template: z.string().optional().default("").describe("License template to use")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: create_repository', { service: this.serviceConfig.name, params });
				this.updateToolUsage('create_repository');
				
				try {
					const result = await this.githubService.createRepository(params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'repository')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'create_repository', params);
				}
			}, 'create_repository')
		);

		// Tool 5: list_issues
		this.server.tool(
			"list_issues",
			"List issues for a repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				milestone: z.string().optional().default("*").describe("Milestone filter (* for all, none for no milestone)"),
				state: z.enum(["open", "closed", "all"]).optional().default("open").describe("Issue state filter"),
				assignee: z.string().optional().default("*").describe("Assignee filter (* for all, none for unassigned)"),
				creator: z.string().optional().default("").describe("Creator username filter"),
				mentioned: z.string().optional().default("").describe("Mentioned user filter"),
				labels: z.string().optional().default("").describe("Label filter (comma separated)"),
				sort: z.enum(["created", "updated", "comments"]).optional().default("created").describe("Sort order"),
				direction: z.enum(["asc", "desc"]).optional().default("desc").describe("Sort direction"),
				since: z.string().optional().default("").describe("Only issues updated after this time (ISO 8601)"),
				per_page: z.number().min(1).max(100).optional().default(30).describe("Number of results per page"),
				page: z.number().min(1).optional().default(1).describe("Page number")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: list_issues', { service: this.serviceConfig.name, params });
				this.updateToolUsage('list_issues');
				
				try {
					const result = await this.githubService.listIssues(params.owner, params.repo, params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'issues')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'list_issues', params);
				}
			}, 'list_issues')
		);

		// Tool 6: get_issue
		this.server.tool(
			"get_issue",
			"Get information about a specific issue",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				issue_number: z.number().describe("Issue number")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: get_issue', { service: this.serviceConfig.name, params });
				this.updateToolUsage('get_issue');
				
				try {
					const result = await this.githubService.getIssue(params.owner, params.repo, params.issue_number);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'issue')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'get_issue', params);
				}
			}, 'get_issue')
		);

		// Tool 7: create_issue
		this.server.tool(
			"create_issue",
			"Create a new issue in a repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				title: z.string().describe("Issue title"),
				body: z.string().optional().default("").describe("Issue body content"),
				assignees: z.array(z.string()).optional().default([]).describe("Assignee usernames"),
				milestone: z.number().optional().describe("Milestone number"),
				labels: z.array(z.string()).optional().default([]).describe("Label names")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: create_issue', { service: this.serviceConfig.name, params });
				this.updateToolUsage('create_issue');
				
				try {
					const result = await this.githubService.createIssue(params.owner, params.repo, params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'issue')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'create_issue', params);
				}
			}, 'create_issue')
		);

		// Tool 8: create_pull_request
		this.server.tool(
			"create_pull_request",
			"Create a new pull request",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				title: z.string().describe("Pull request title"),
				head: z.string().describe("Head branch (branch to merge from)"),
				base: z.string().describe("Base branch (branch to merge into)"),
				body: z.string().optional().default("").describe("Pull request body content"),
				maintainer_can_modify: z.boolean().optional().default(true).describe("Whether maintainer can modify the pull request"),
				draft: z.boolean().optional().default(false).describe("Whether to create as draft")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: create_pull_request', { service: this.serviceConfig.name, params });
				this.updateToolUsage('create_pull_request');
				
				try {
					const result = await this.githubService.createPullRequest(params.owner, params.repo, params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'pull_request')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'create_pull_request', params);
				}
			}, 'create_pull_request')
		);

		// Tool 9: search_repositories
		this.server.tool(
			"search_repositories",
			"Search for repositories on GitHub",
			{
				q: z.string().describe("Search query (supports GitHub search syntax)"),
				sort: z.enum(["stars", "forks", "help-wanted-issues", "updated"]).optional().default("stars").describe("Sort order"),
				order: z.enum(["asc", "desc"]).optional().default("desc").describe("Sort direction"),
				per_page: z.number().min(1).max(100).optional().default(30).describe("Number of results per page"),
				page: z.number().min(1).optional().default(1).describe("Page number")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: search_repositories', { service: this.serviceConfig.name, params });
				this.updateToolUsage('search_repositories');
				
				try {
					const result = await this.githubService.searchRepositories(params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'search')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'search_repositories', params);
				}
			}, 'search_repositories')
		);

		// Tool 10: fork_repository
		this.server.tool(
			"fork_repository",
			"Fork a repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				organization: z.string().optional().describe("Organization to fork to (optional)")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: fork_repository', { service: this.serviceConfig.name, params });
				this.updateToolUsage('fork_repository');
				
				try {
					const result = await this.githubService.api.forkRepository(params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'repository')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'fork_repository', params);
				}
			}, 'fork_repository')
		);

		// Tool 11: star_repository
		this.server.tool(
			"star_repository",
			"Star a repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: star_repository', { service: this.serviceConfig.name, params });
				this.updateToolUsage('star_repository');
				
				try {
					const result = await this.githubService.api.starRepository(params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'success')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'star_repository', params);
				}
			}, 'star_repository')
		);

		// Tool 12: get_repository_contents
		this.server.tool(
			"get_repository_contents",
			"Get contents of a repository file or directory",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name"),
				path: z.string().optional().default("").describe("Path to file or directory (empty for root)"),
				ref: z.string().optional().default("").describe("Branch, tag, or commit SHA (default: default branch)")
			},
			measurePerformance(async (params) => {
				logger.info('Tool call: get_repository_contents', { service: this.serviceConfig.name, params });
				this.updateToolUsage('get_repository_contents');
				
				try {
					const result = await this.githubService.getRepositoryContents(params.owner, params.repo, params);
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'contents')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'get_repository_contents', params);
				}
			}, 'get_repository_contents')
		);

		// Tool 13: get_service_statistics
		this.server.tool(
			"get_service_statistics",
			"Get service statistics and health information",
			{},
			measurePerformance(async () => {
				logger.info('Tool call: get_service_statistics', { service: this.serviceConfig.name });
				this.updateToolUsage('get_service_statistics');
				
				try {
					const serviceStats = this.githubService.getStatistics();
					const handlerStats = this.getHandlerStatistics();
					
					const result = {
						service: serviceStats,
						handler: handlerStats,
						timestamp: new Date().toISOString()
					};
					
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(result, 'statistics')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'get_service_statistics');
				}
			}, 'get_service_statistics')
		);

		// Tool 14: health_check
		this.server.tool(
			"health_check",
			"Perform a health check on the GitHub service",
			{},
			measurePerformance(async () => {
				logger.info('Tool call: health_check', { service: this.serviceConfig.name });
				this.updateToolUsage('health_check');
				
				try {
					const healthStatus = await this.githubService.healthCheck();
					return {
						content: [{ 
							type: 'text', 
							text: this.formatResponse(healthStatus, 'health')
						}]
					};
				} catch (error) {
					return this.handleToolError(error, 'health_check');
				}
			}, 'health_check')
		);

		logger.info('MCP tools setup completed', { 
			toolCount: 14,
			serviceName: this.serviceConfig.name 
		});
	}

	/**
	 * Format response for MCP output
	 * @param {*} data - Data to format
	 * @param {string} type - Response type
	 * @returns {string} Formatted response
	 */
	formatResponse(data, type) {
		try {
			// Use the service's response optimization and simplification
			let formatted = data;
			
			if (this.githubService.config.useOptimization) {
				formatted = this.githubService.responseOptimizer.optimize(formatted, type, { format: 'yaml' });
			}
			
			if (this.githubService.config.useSimplification) {
				formatted = this.githubService.responseSimplifier.simplify(formatted, type, { format: 'yaml' });
			}
			
			// If it's already a string (YAML), return as is
			if (typeof formatted === 'string') {
				return formatted;
			}
			
			// Otherwise, format as JSON
			return JSON.stringify(formatted, null, 2);
		} catch (error) {
			logger.warn('Failed to format response', { error: error.message, type });
			return JSON.stringify(data, null, 2);
		}
	}

	/**
	 * Handle tool errors with enhanced error information
	 * @param {Error} error - Error object
	 * @param {string} toolName - Tool name
	 * @param {Object} params - Tool parameters
	 * @returns {Object} MCP error response
	 */
	handleToolError(error, toolName, params = {}) {
		const githubError = GitHubErrorHandler.handle(error, {
			tool: toolName,
			params: Object.keys(params),
			service: this.serviceConfig.name
		});

		this.stats.failedRequests++;
		
		logger.error('Tool error handled', {
			tool: toolName,
			error: GitHubErrorHandler.createErrorSummary(githubError),
			params: Object.keys(params)
		});

		return {
			isError: true,
			content: [{ 
				type: 'text', 
				text: `Error in ${toolName}: ${githubError.message}${githubError.details?.githubRequestId ? `\nGitHub Request ID: ${githubError.details.githubRequestId}` : ''}${GitHubErrorHandler.getSuggestedActions(githubError).length > 0 ? `\n\nSuggested actions:\n${GitHubErrorHandler.getSuggestedActions(githubError).map(action => `- ${action}`).join('\n')}` : ''}` 
			}]
		};
	}

	/**
	 * Update tool usage statistics
	 * @param {string} toolName - Tool name
	 */
	updateToolUsage(toolName) {
		this.stats.totalRequests++;
		this.stats.successfulRequests++;
		
		const currentCount = this.stats.toolUsage.get(toolName) || 0;
		this.stats.toolUsage.set(toolName, currentCount + 1);
	}

	/**
	 * Get handler statistics
	 * @returns {Object} Handler statistics
	 */
	getHandlerStatistics() {
		return {
			totalRequests: this.stats.totalRequests,
			successfulRequests: this.stats.successfulRequests,
			failedRequests: this.stats.failedRequests,
			successRate: this.stats.totalRequests > 0 ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 : 0,
			activeTransports: Object.keys(this.transports).length,
			toolUsage: Object.fromEntries(this.stats.toolUsage),
			mostUsedTool: this.stats.toolUsage.size > 0 ? Array.from(this.stats.toolUsage.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0] : null
		};
	}

	/**
	 * Handle MCP JSON-RPC request with enhanced session management
	 * @param {Request} request - HTTP request object
	 * @param {Response} response - HTTP response object
	 * @param {Object} body - Parsed JSON body
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(request, response, body) {
		let sessionId = request.headers['x-session-id'];
		if (!sessionId) {
			sessionId = randomUUID();
			response.setHeader('x-session-id', sessionId);
		}

		// Initialize transport for this session if not exists
		if (!this.transports[sessionId]) {
			logger.info('Creating new transport for session', { sessionId });
			this.transports[sessionId] = new StreamableHTTPServerTransport(request, response);
		}

		const transport = this.transports[sessionId];

		// Handle transport events with enhanced logging
		transport.onclose = () => {
			logger.info('Transport closed for session', { sessionId });
			this.globalVariableManager.clearSessionData(sessionId);
			delete this.transports[sessionId];
		};

		transport.onerror = (error) => {
			logger.error('Transport error for session', { sessionId, error: error.message });
			this.globalVariableManager.clearSessionData(sessionId);
			delete this.transports[sessionId];
		};

		// Initialize server with transport if not already done
		if (!this.initialized) {
			logger.info('Initializing MCP server', { serviceName: this.serviceConfig.displayName });
			await this.server.connect(transport);
			this.initialized = true;
		}

		// Handle the request
		if (isInitializeRequest(body)) {
			logger.info('Initialize request received', { serviceName: this.serviceConfig.displayName });
		}

		try {
			await transport.handleRequest(body);
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, {
				operation: 'handleMCPRequest',
				sessionId,
				requestId: body.id
			});

			logger.error('Error handling MCP request', {
				sessionId,
				requestId: body.id,
				error: GitHubErrorHandler.createErrorSummary(githubError)
			});

			const mcpError = GitHubErrorHandler.toMCPError(githubError, body.id);
			response.status(500).json(mcpError);
		}
	}

	/**
	 * Clean up handler resources with enhanced cleanup
	 */
	cleanup() {
		logger.info('Cleaning up MCP handler', { serviceName: this.serviceConfig.displayName });
		
		// Close all transports
		for (const [sessionId, transport] of Object.entries(this.transports)) {
			try {
				transport.close();
				logger.info('Closed transport for session', { sessionId });
			} catch (error) {
				logger.error('Error closing transport for session', { sessionId, error: error.message });
			}
		}
		
		// Clear all session data
		this.globalVariableManager.clear();
		
		// Clear service caches
		this.githubService.clearCaches();
		
		this.transports = {};
		this.initialized = false;
		
		logger.info('MCP handler cleanup completed', { serviceName: this.serviceConfig.displayName });
	}
}

export default GitHubMCPHandler;