/**
 * GitHub MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { 
  getAuthenticatedUser,
  listRepositories,
  getRepository,
  createRepository,
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  listPullRequests,
  getPullRequest,
  createPullRequest,
  updatePullRequest,
  listCommits,
  getCommit,
  listBranches,
  getBranch,
  createBranch,
  searchRepositories,
  searchIssues,
  getRepositoryContents,
  forkRepository,
  starRepository,
  unstarRepository
} from '../api/github-api.js';

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
		// Store transports by session
		/** @type {Record<string, StreamableHTTPServerTransport>} */
		this.transports = {};
		this.initialized = false;
		
		this.setupTools();
	}

	/**
	 * Setup MCP tools using Zod schemas
	 */
	setupTools() {
		// Tool 1: get_authenticated_user
		this.server.tool(
			"get_authenticated_user",
			"Get information about the authenticated GitHub user",
			{},
			async () => {
				console.log(`🔧 Tool call: get_authenticated_user for ${this.serviceConfig.name}`);
				try {
					const result = await getAuthenticatedUser(this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting authenticated user:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting authenticated user: ${error.message}` }]
					};
				}
			}
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
			async ({ visibility, affiliation, type, sort, direction, per_page, page }) => {
				console.log(`🔧 Tool call: list_repositories for ${this.serviceConfig.name}`);
				try {
					const result = await listRepositories({ visibility, affiliation, type, sort, direction, per_page, page }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing repositories:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing repositories: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: get_repository
		this.server.tool(
			"get_repository",
			"Get information about a specific repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name")
			},
			async ({ owner, repo }) => {
				console.log(`🔧 Tool call: get_repository for ${this.serviceConfig.name}`);
				try {
					const result = await getRepository({ owner, repo }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting repository:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting repository: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: create_repository
		this.server.tool(
			"create_repository",
			"Create a new repository",
			{
				name: z.string().describe("Repository name"),
				description: z.string().optional().default("").describe("Repository description"),
				'private': z.boolean().optional().default(false).describe("Whether the repository is private"),
				has_issues: z.boolean().optional().default(true).describe("Whether to enable issues"),
				has_projects: z.boolean().optional().default(true).describe("Whether to enable projects"),
				has_wiki: z.boolean().optional().default(true).describe("Whether to enable wiki"),
				auto_init: z.boolean().optional().default(false).describe("Whether to initialize with README"),
				gitignore_template: z.string().optional().default("").describe("Gitignore template to use"),
				license_template: z.string().optional().default("").describe("License template to use")
			},
			async ({ name, description, 'private': isPrivate, has_issues, has_projects, has_wiki, auto_init, gitignore_template, license_template }) => {
				console.log(`🔧 Tool call: create_repository for ${this.serviceConfig.name}`);
				try {
					const result = await createRepository({ 
						name, 
						description, 
						'private': isPrivate, 
						has_issues, 
						has_projects, 
						has_wiki, 
						auto_init, 
						gitignore_template, 
						license_template 
					}, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating repository:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating repository: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, milestone, state, assignee, creator, mentioned, labels, sort, direction, since, per_page, page }) => {
				console.log(`🔧 Tool call: list_issues for ${this.serviceConfig.name}`);
				try {
					const result = await listIssues({ 
						owner, repo, milestone, state, assignee, creator, mentioned, labels, sort, direction, since, per_page, page 
					}, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing issues:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing issues: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, issue_number }) => {
				console.log(`🔧 Tool call: get_issue for ${this.serviceConfig.name}`);
				try {
					const result = await getIssue({ owner, repo, issue_number }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting issue:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting issue: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, title, body, assignees, milestone, labels }) => {
				console.log(`🔧 Tool call: create_issue for ${this.serviceConfig.name}`);
				try {
					const result = await createIssue({ owner, repo, title, body, assignees, milestone, labels }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating issue:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating issue: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, title, head, base, body, maintainer_can_modify, draft }) => {
				console.log(`🔧 Tool call: create_pull_request for ${this.serviceConfig.name}`);
				try {
					const result = await createPullRequest({ owner, repo, title, head, base, body, maintainer_can_modify, draft }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating pull request:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating pull request: ${error.message}` }]
					};
				}
			}
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
			async ({ q, sort, order, per_page, page }) => {
				console.log(`🔧 Tool call: search_repositories for ${this.serviceConfig.name}`);
				try {
					const result = await searchRepositories({ q, sort, order, per_page, page }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching repositories:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching repositories: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, organization }) => {
				console.log(`🔧 Tool call: fork_repository for ${this.serviceConfig.name}`);
				try {
					const result = await forkRepository({ owner, repo, organization }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error forking repository:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error forking repository: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: star_repository
		this.server.tool(
			"star_repository",
			"Star a repository",
			{
				owner: z.string().describe("Repository owner username"),
				repo: z.string().describe("Repository name")
			},
			async ({ owner, repo }) => {
				console.log(`🔧 Tool call: star_repository for ${this.serviceConfig.name}`);
				try {
					const result = await starRepository({ owner, repo }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error starring repository:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error starring repository: ${error.message}` }]
					};
				}
			}
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
			async ({ owner, repo, path, ref }) => {
				console.log(`🔧 Tool call: get_repository_contents for ${this.serviceConfig.name}`);
				try {
					const result = await getRepositoryContents({ owner, repo, path, ref }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting repository contents:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting repository contents: ${error.message}` }]
					};
				}
			}
		);
	}

	/**
	 * Handle MCP JSON-RPC request
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
			console.log(`🔧 Creating new transport for session: ${sessionId}`);
			this.transports[sessionId] = new StreamableHTTPServerTransport(request, response);
		}

		const transport = this.transports[sessionId];

		// Handle transport events
		transport.onclose = () => {
			console.log(`🔒 Transport closed for session: ${sessionId}`);
			delete this.transports[sessionId];
		};

		transport.onerror = (error) => {
			console.error(`❌ Transport error for session ${sessionId}:`, error);
			delete this.transports[sessionId];
		};

		// Initialize server with transport if not already done
		if (!this.initialized) {
			console.log(`🚀 Initializing ${this.serviceConfig.displayName} MCP server`);
			await this.server.connect(transport);
			this.initialized = true;
		}

		// Handle the request
		if (isInitializeRequest(body)) {
			console.log(`🔧 Initialize request for ${this.serviceConfig.displayName} MCP server`);
		}

		try {
			await transport.handleRequest(body);
		} catch (error) {
			console.error(`❌ Error handling MCP request:`, error);
			response.status(500).json({
				jsonrpc: '2.0',
				error: {
					code: -32603,
					message: 'Internal error',
					data: error.message
				},
				id: body.id || null
			});
		}
	}

	/**
	 * Clean up handler resources
	 */
	cleanup() {
		console.log(`🧹 Cleaning up ${this.serviceConfig.displayName} MCP handler`);
		
		// Close all transports
		for (const [sessionId, transport] of Object.entries(this.transports)) {
			try {
				transport.close();
				console.log(`🔒 Closed transport for session: ${sessionId}`);
			} catch (error) {
				console.error(`❌ Error closing transport for session ${sessionId}:`, error);
			}
		}
		
		this.transports = {};
		this.initialized = false;
	}
}