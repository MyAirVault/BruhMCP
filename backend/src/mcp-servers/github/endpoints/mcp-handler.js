/**
 * GitHub MCP Protocol Handler
 * Implements MCP JSON-RPC 2.0 protocol for GitHub service
 */

import { GitHubAPI } from '../api/github-api.js';

/**
 * GitHub MCP Handler class
 */
export class GitHubMCPHandler {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.api = new GitHubAPI(accessToken);
    this.initialized = false;
  }

  /**
   * Handle MCP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object  
   * @param {Object} message - MCP message
   */
  async handleMCPRequest(req, res, message) {
    try {
      const { method, params, id } = message;

      // Handle initialization
      if (method === 'initialize') {
        await this.handleInitialize(id, params, res);
        return;
      }

      // Require initialization for other methods
      if (!this.initialized) {
        res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32002,
            message: 'Server not initialized'
          }
        });
        return;
      }

      // Route to appropriate handler
      switch (method) {
        case 'tools/list':
          await this.handleToolsList(id, res);
          break;
        case 'tools/call':
          await this.handleToolsCall(id, params, res);
          break;
        case 'resources/list':
          await this.handleResourcesList(id, res);
          break;
        case 'resources/read':
          await this.handleResourcesRead(id, params, res);
          break;
        default:
          res.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          });
      }
    } catch (error) {
      console.error('GitHub MCP Handler error:', error);
      res.json({
        jsonrpc: '2.0',
        id: message?.id || null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { details: error.message }
        }
      });
    }
  }

  /**
   * Handle initialize request
   */
  async handleInitialize(id, params, res) {
    try {
      // Test connection
      const connectionTest = await this.api.testConnection();
      
      if (!connectionTest.success) {
        res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: 'Authentication failed',
            data: { details: connectionTest.error }
          }
        });
        return;
      }

      this.initialized = true;
      this.userInfo = connectionTest.user;

      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'github-mcp-server',
            version: '1.0.0'
          },
          user: this.userInfo
        }
      });
    } catch (error) {
      res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Initialization failed',
          data: { details: error.message }
        }
      });
    }
  }

  /**
   * Handle tools/list request
   */
  async handleToolsList(id, res) {
    const tools = [
      {
        name: 'create_issue',
        description: 'Create a new issue in a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue description' }
          },
          required: ['owner', 'repo', 'title']
        }
      },
      {
        name: 'create_pull_request',
        description: 'Create a new pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'Pull request title' },
            head: { type: 'string', description: 'Branch to merge from' },
            base: { type: 'string', description: 'Branch to merge into' },
            body: { type: 'string', description: 'Pull request body' }
          },
          required: ['owner', 'repo', 'title', 'head', 'base']
        }
      },
      {
        name: 'get_pull_request',
        description: 'Get details of a specific pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' },
            pull_number: { type: 'number', description: 'Pull request number' }
          },
          required: ['owner', 'repo', 'pull_number']
        }
      },
      {
        name: 'list_branches',
        description: 'List all branches in a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' }
          },
          required: ['owner', 'repo']
        }
      },
      {
        name: 'list_commits',
        description: 'List commits in a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' }
          },
          required: ['owner', 'repo']
        }
      },
      {
        name: 'get_user_repos',
        description: 'List user repositories',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Repository type (all, owner, member)', default: 'all' },
            sort: { type: 'string', description: 'Sort order (created, updated, pushed, full_name)', default: 'updated' }
          }
        }
      },
      {
        name: 'search_repositories',
        description: 'Search repositories',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            per_page: { type: 'number', description: 'Number of results per page', default: 30 }
          },
          required: ['query']
        }
      },
      {
        name: 'get_issues',
        description: 'Get repository issues',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner username' },
            repo: { type: 'string', description: 'Repository name' },
            state: { type: 'string', description: 'Issue state (open, closed, all)', default: 'open' }
          },
          required: ['owner', 'repo']
        }
      }
    ];

    res.json({
      jsonrpc: '2.0',
      id,
      result: { tools }
    });
  }

  /**
   * Handle tools/call request
   */
  async handleToolsCall(id, params, res) {
    try {
      const { name, arguments: args } = params;

      let result;
      switch (name) {
        case 'create_issue':
          result = await this.api.createIssue(args.owner, args.repo, args.title, args.body);
          break;
        case 'create_pull_request':
          result = await this.api.createPullRequest(args.owner, args.repo, args.title, args.head, args.base, args.body);
          break;
        case 'get_pull_request':
          result = await this.api.getPullRequest(args.owner, args.repo, args.pull_number);
          break;
        case 'list_branches':
          result = await this.api.listBranches(args.owner, args.repo);
          break;
        case 'list_commits':
          result = await this.api.listCommits(args.owner, args.repo);
          break;
        case 'get_user_repos':
          result = await this.api.listUserRepositories(args.type, args.sort);
          break;
        case 'search_repositories':
          result = await this.api.searchRepositories(args.query, args.per_page);
          break;
        case 'get_issues':
          result = await this.api.getIssues(args.owner, args.repo, args.state);
          break;
        default:
          res.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Unknown tool: ${name}`
            }
          });
          return;
      }

      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      });
    } catch (error) {
      res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Tool execution failed',
          data: { details: error.message }
        }
      });
    }
  }

  /**
   * Handle resources/list request
   */
  async handleResourcesList(id, res) {
    const resources = [
      {
        uri: 'github://user/profile',
        name: 'User Profile',
        description: 'Current user profile information',
        mimeType: 'application/json'
      },
      {
        uri: 'github://user/repositories',
        name: 'User Repositories',
        description: 'List of user repositories',
        mimeType: 'application/json'
      }
    ];

    res.json({
      jsonrpc: '2.0',
      id,
      result: { resources }
    });
  }

  /**
   * Handle resources/read request
   */
  async handleResourcesRead(id, params, res) {
    try {
      const { uri } = params;
      let content;

      switch (uri) {
        case 'github://user/profile':
          content = await this.api.getCurrentUser();
          break;
        case 'github://user/repositories':
          content = await this.api.listUserRepositories();
          break;
        default:
          res.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Unknown resource: ${uri}`
            }
          });
          return;
      }

      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(content, null, 2)
            }
          ]
        }
      });
    } catch (error) {
      res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Resource read failed',
          data: { details: error.message }
        }
      });
    }
  }
}