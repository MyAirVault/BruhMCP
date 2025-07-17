/**
 * Reddit MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class RedditMCPHandler {
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
		// Tool 1: get_user_info
		this.server.tool(
			"get_user_info",
			"Get information about the current user",
			{},
			async () => {
				console.log(`🔧 Tool call: get_user_info for ${this.serviceConfig.name}`);
				try {
					const response = await fetch('https://oauth.reddit.com/api/v1/me', {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting user info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting user info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: get_subreddit_posts
		this.server.tool(
			"get_subreddit_posts",
			"Get posts from a specific subreddit",
			{
				subreddit: z.string().describe("Name of the subreddit"),
				sort: z.enum(["hot", "new", "rising", "top"]).optional().default("hot").describe("Sort order for posts"),
				limit: z.number().min(1).max(100).optional().default(25).describe("Number of posts to retrieve"),
				timeframe: z.enum(["hour", "day", "week", "month", "year", "all"]).optional().default("day").describe("Time frame for 'top' sort")
			},
			async ({ subreddit, sort, limit, timeframe }) => {
				console.log(`🔧 Tool call: get_subreddit_posts for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('limit', limit.toString());
					if (sort === 'top') {
						params.append('t', timeframe);
					}
					
					const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/${sort}?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting subreddit posts:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting subreddit posts: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: get_post_details
		this.server.tool(
			"get_post_details",
			"Get detailed information about a specific post",
			{
				postId: z.string().describe("ID of the post"),
				subreddit: z.string().describe("Subreddit containing the post")
			},
			async ({ postId, subreddit }) => {
				console.log(`🔧 Tool call: get_post_details for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${postId}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting post details:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting post details: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: submit_post
		this.server.tool(
			"submit_post",
			"Submit a new post to a subreddit",
			{
				subreddit: z.string().describe("Subreddit to submit to"),
				title: z.string().describe("Title of the post"),
				text: z.string().optional().describe("Text content (for text posts)"),
				url: z.string().optional().describe("URL (for link posts)"),
				kind: z.enum(["self", "link"]).optional().default("self").describe("Type of post")
			},
			async ({ subreddit, title, text, url, kind }) => {
				console.log(`🔧 Tool call: submit_post for ${this.serviceConfig.name}`);
				try {
					const formData = new URLSearchParams();
					formData.append('api_type', 'json');
					formData.append('kind', kind);
					formData.append('sr', subreddit);
					formData.append('title', title);
					
					if (kind === 'self' && text) {
						formData.append('text', text);
					} else if (kind === 'link' && url) {
						formData.append('url', url);
					}
					
					const response = await fetch('https://oauth.reddit.com/api/submit', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0',
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: formData
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error submitting post:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error submitting post: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: submit_comment
		this.server.tool(
			"submit_comment",
			"Submit a comment on a post or reply to another comment",
			{
				parentId: z.string().describe("ID of the parent (post or comment) to reply to"),
				text: z.string().describe("Text content of the comment")
			},
			async ({ parentId, text }) => {
				console.log(`🔧 Tool call: submit_comment for ${this.serviceConfig.name}`);
				try {
					const formData = new URLSearchParams();
					formData.append('api_type', 'json');
					formData.append('parent', parentId);
					formData.append('text', text);
					
					const response = await fetch('https://oauth.reddit.com/api/comment', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0',
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: formData
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error submitting comment:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error submitting comment: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: vote
		this.server.tool(
			"vote",
			"Vote on a post or comment",
			{
				thingId: z.string().describe("ID of the thing to vote on (post or comment)"),
				dir: z.enum(["1", "0", "-1"]).describe("Vote direction: 1 for upvote, -1 for downvote, 0 for no vote")
			},
			async ({ thingId, dir }) => {
				console.log(`🔧 Tool call: vote for ${this.serviceConfig.name}`);
				try {
					const formData = new URLSearchParams();
					formData.append('dir', dir);
					formData.append('id', thingId);
					
					const response = await fetch('https://oauth.reddit.com/api/vote', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0',
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: formData
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error voting:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error voting: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: get_user_posts
		this.server.tool(
			"get_user_posts",
			"Get posts from a specific user",
			{
				username: z.string().describe("Username to get posts from"),
				sort: z.enum(["new", "hot", "top"]).optional().default("new").describe("Sort order"),
				limit: z.number().min(1).max(100).optional().default(25).describe("Number of posts to retrieve"),
				timeframe: z.enum(["hour", "day", "week", "month", "year", "all"]).optional().default("all").describe("Time frame for 'top' sort")
			},
			async ({ username, sort, limit, timeframe }) => {
				console.log(`🔧 Tool call: get_user_posts for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('limit', limit.toString());
					if (sort === 'top') {
						params.append('t', timeframe);
					}
					
					const response = await fetch(`https://oauth.reddit.com/user/${username}/submitted/${sort}?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting user posts:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting user posts: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: search_posts
		this.server.tool(
			"search_posts",
			"Search for posts across Reddit",
			{
				query: z.string().describe("Search query"),
				subreddit: z.string().optional().describe("Limit search to specific subreddit"),
				sort: z.enum(["relevance", "hot", "top", "new", "comments"]).optional().default("relevance").describe("Sort order"),
				limit: z.number().min(1).max(100).optional().default(25).describe("Number of results to return"),
				timeframe: z.enum(["hour", "day", "week", "month", "year", "all"]).optional().default("all").describe("Time frame for search")
			},
			async ({ query, subreddit, sort, limit, timeframe }) => {
				console.log(`🔧 Tool call: search_posts for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('q', query);
					params.append('sort', sort);
					params.append('limit', limit.toString());
					params.append('t', timeframe);
					params.append('type', 'link');
					
					if (subreddit) {
						params.append('restrict_sr', 'true');
					}
					
					const endpoint = subreddit ? 
						`https://oauth.reddit.com/r/${subreddit}/search` : 
						'https://oauth.reddit.com/search';
					
					const response = await fetch(`${endpoint}?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching posts:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching posts: ${error.message}` }]
					};
				}
			}
		);

		// Tool 9: get_subreddit_info
		this.server.tool(
			"get_subreddit_info",
			"Get information about a subreddit",
			{
				subreddit: z.string().describe("Name of the subreddit")
			},
			async ({ subreddit }) => {
				console.log(`🔧 Tool call: get_subreddit_info for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/about`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting subreddit info:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting subreddit info: ${error.message}` }]
					};
				}
			}
		);

		// Tool 10: get_inbox
		this.server.tool(
			"get_inbox",
			"Get messages from user's inbox",
			{
				type: z.enum(["inbox", "unread", "sent"]).optional().default("inbox").describe("Type of messages to retrieve"),
				limit: z.number().min(1).max(100).optional().default(25).describe("Number of messages to retrieve")
			},
			async ({ type, limit }) => {
				console.log(`🔧 Tool call: get_inbox for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					params.append('limit', limit.toString());
					
					const response = await fetch(`https://oauth.reddit.com/message/${type}?${params.toString()}`, {
						headers: {
							'Authorization': `Bearer ${this.bearerToken}`,
							'User-Agent': 'MCP-Reddit-Handler/1.0'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting inbox:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting inbox: ${error.message}` }]
					};
				}
			}
		);
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		try {
			const sessionId = req.headers['mcp-session-id'];
			console.log(`🔧 Processing MCP request - Session ID: ${sessionId}`);
			console.log(`📨 Is Initialize Request: ${isInitializeRequest(message)}`);
			
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				console.log(`♻️  Reusing existing transport for session: ${sessionId}`);
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				console.log(`🚀 Creating new transport for initialization request`);
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						console.log(`✅ Reddit MCP session initialized: ${newSessionId}`);
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});
				
				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						console.log(`🧹 Cleaned up transport for session: ${transport.sessionId}`);
					}
				};
				
				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
			} else {
				// Invalid request - no session ID and not an initialize request
				console.log(`❌ Invalid request: No session ID and not initialize request`);
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: message?.id || null,
				});
				return;
			}

			// Handle the request using the appropriate transport
			console.log(`🔄 Handling request with transport`);
			await transport.handleRequest(req, res, message);
			console.log(`✅ Request handled successfully`);
			
		} catch (/** @type {any} */ error) {
			console.error('❌ StreamableHTTP processing error:', error);

			// Return proper JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: message?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	}
}