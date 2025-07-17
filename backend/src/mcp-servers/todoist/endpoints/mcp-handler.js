/**
 * Todoist MCP JSON-RPC protocol handler using official SDK
 * API Key Implementation following Multi-Tenant Architecture
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
 */

export class TodoistMCPHandler {
	/**
	 * @param {ServiceConfig} serviceConfig
	 * @param {string} apiKey
	 */
	constructor(serviceConfig, apiKey) {
		this.serviceConfig = serviceConfig;
		this.apiKey = apiKey;
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
		// Tool 1: get_projects
		this.server.tool(
			"get_projects",
			"Get all projects",
			{},
			async () => {
				console.log(`🔧 Tool call: get_projects for ${this.serviceConfig.name}`);
				try {
					const response = await fetch('https://api.todoist.com/rest/v2/projects', {
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting projects:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting projects: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: create_project
		this.server.tool(
			"create_project",
			"Create a new project",
			{
				name: z.string().describe("Name of the project"),
				parent_id: z.string().optional().describe("Parent project ID (for sub-projects)"),
				color: z.string().optional().describe("Color of the project"),
				is_favorite: z.boolean().optional().default(false).describe("Whether to mark as favorite")
			},
			async ({ name, parent_id, color, is_favorite }) => {
				console.log(`🔧 Tool call: create_project for ${this.serviceConfig.name}`);
				try {
					const projectData = {
						name,
						is_favorite
					};
					
					if (parent_id) projectData.parent_id = parent_id;
					if (color) projectData.color = color;
					
					const response = await fetch('https://api.todoist.com/rest/v2/projects', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(projectData)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating project:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating project: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: get_tasks
		this.server.tool(
			"get_tasks",
			"Get tasks with optional filtering",
			{
				project_id: z.string().optional().describe("Filter by project ID"),
				section_id: z.string().optional().describe("Filter by section ID"),
				label: z.string().optional().describe("Filter by label"),
				filter: z.string().optional().describe("Filter expression"),
				lang: z.string().optional().default("en").describe("Language for dates")
			},
			async ({ project_id, section_id, label, filter, lang }) => {
				console.log(`🔧 Tool call: get_tasks for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					if (project_id) params.append('project_id', project_id);
					if (section_id) params.append('section_id', section_id);
					if (label) params.append('label', label);
					if (filter) params.append('filter', filter);
					if (lang) params.append('lang', lang);
					
					const url = `https://api.todoist.com/rest/v2/tasks${params.toString() ? '?' + params.toString() : ''}`;
					
					const response = await fetch(url, {
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting tasks:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting tasks: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: create_task
		this.server.tool(
			"create_task",
			"Create a new task",
			{
				content: z.string().describe("Task content"),
				description: z.string().optional().describe("Task description"),
				project_id: z.string().optional().describe("Project ID"),
				section_id: z.string().optional().describe("Section ID"),
				parent_id: z.string().optional().describe("Parent task ID (for sub-tasks)"),
				order: z.number().optional().describe("Task order"),
				labels: z.array(z.string()).optional().describe("Array of label names"),
				priority: z.number().min(1).max(4).optional().default(1).describe("Priority (1-4, 4 being highest)"),
				due_string: z.string().optional().describe("Due date in natural language"),
				due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
				due_datetime: z.string().optional().describe("Due datetime in RFC3339 format"),
				due_lang: z.string().optional().default("en").describe("Language for due date parsing")
			},
			async ({ content, description, project_id, section_id, parent_id, order, labels, priority, due_string, due_date, due_datetime, due_lang }) => {
				console.log(`🔧 Tool call: create_task for ${this.serviceConfig.name}`);
				try {
					const taskData = {
						content,
						priority
					};
					
					if (description) taskData.description = description;
					if (project_id) taskData.project_id = project_id;
					if (section_id) taskData.section_id = section_id;
					if (parent_id) taskData.parent_id = parent_id;
					if (order !== undefined) taskData.order = order;
					if (labels) taskData.labels = labels;
					if (due_string) taskData.due_string = due_string;
					if (due_date) taskData.due_date = due_date;
					if (due_datetime) taskData.due_datetime = due_datetime;
					if (due_lang) taskData.due_lang = due_lang;
					
					const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(taskData)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating task:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating task: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: update_task
		this.server.tool(
			"update_task",
			"Update an existing task",
			{
				task_id: z.string().describe("ID of the task to update"),
				content: z.string().optional().describe("New task content"),
				description: z.string().optional().describe("New task description"),
				labels: z.array(z.string()).optional().describe("Array of label names"),
				priority: z.number().min(1).max(4).optional().describe("Priority (1-4, 4 being highest)"),
				due_string: z.string().optional().describe("Due date in natural language"),
				due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
				due_datetime: z.string().optional().describe("Due datetime in RFC3339 format"),
				due_lang: z.string().optional().default("en").describe("Language for due date parsing")
			},
			async ({ task_id, content, description, labels, priority, due_string, due_date, due_datetime, due_lang }) => {
				console.log(`🔧 Tool call: update_task for ${this.serviceConfig.name}`);
				try {
					const taskData = {};
					
					if (content) taskData.content = content;
					if (description) taskData.description = description;
					if (labels) taskData.labels = labels;
					if (priority !== undefined) taskData.priority = priority;
					if (due_string) taskData.due_string = due_string;
					if (due_date) taskData.due_date = due_date;
					if (due_datetime) taskData.due_datetime = due_datetime;
					if (due_lang) taskData.due_lang = due_lang;
					
					const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${task_id}`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(taskData)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating task:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating task: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: close_task
		this.server.tool(
			"close_task",
			"Close (complete) a task",
			{
				task_id: z.string().describe("ID of the task to close")
			},
			async ({ task_id }) => {
				console.log(`🔧 Tool call: close_task for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${task_id}/close`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (response.ok) {
						return {
							content: [{ type: 'text', text: 'Task closed successfully' }]
						};
					} else {
						const error = await response.json();
						throw new Error(JSON.stringify(error));
					}
				} catch (error) {
					console.error(`❌ Error closing task:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error closing task: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: reopen_task
		this.server.tool(
			"reopen_task",
			"Reopen a completed task",
			{
				task_id: z.string().describe("ID of the task to reopen")
			},
			async ({ task_id }) => {
				console.log(`🔧 Tool call: reopen_task for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${task_id}/reopen`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (response.ok) {
						return {
							content: [{ type: 'text', text: 'Task reopened successfully' }]
						};
					} else {
						const error = await response.json();
						throw new Error(JSON.stringify(error));
					}
				} catch (error) {
					console.error(`❌ Error reopening task:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error reopening task: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: delete_task
		this.server.tool(
			"delete_task",
			"Delete a task",
			{
				task_id: z.string().describe("ID of the task to delete")
			},
			async ({ task_id }) => {
				console.log(`🔧 Tool call: delete_task for ${this.serviceConfig.name}`);
				try {
					const response = await fetch(`https://api.todoist.com/rest/v2/tasks/${task_id}`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (response.ok) {
						return {
							content: [{ type: 'text', text: 'Task deleted successfully' }]
						};
					} else {
						const error = await response.json();
						throw new Error(JSON.stringify(error));
					}
				} catch (error) {
					console.error(`❌ Error deleting task:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting task: ${error.message}` }]
					};
				}
			}
		);

		// Tool 9: get_labels
		this.server.tool(
			"get_labels",
			"Get all labels",
			{},
			async () => {
				console.log(`🔧 Tool call: get_labels for ${this.serviceConfig.name}`);
				try {
					const response = await fetch('https://api.todoist.com/rest/v2/labels', {
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting labels:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting labels: ${error.message}` }]
					};
				}
			}
		);

		// Tool 10: create_label
		this.server.tool(
			"create_label",
			"Create a new label",
			{
				name: z.string().describe("Name of the label"),
				order: z.number().optional().describe("Label order"),
				color: z.string().optional().describe("Color of the label"),
				is_favorite: z.boolean().optional().default(false).describe("Whether to mark as favorite")
			},
			async ({ name, order, color, is_favorite }) => {
				console.log(`🔧 Tool call: create_label for ${this.serviceConfig.name}`);
				try {
					const labelData = {
						name,
						is_favorite
					};
					
					if (order !== undefined) labelData.order = order;
					if (color) labelData.color = color;
					
					const response = await fetch('https://api.todoist.com/rest/v2/labels', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(labelData)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating label:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating label: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: get_comments
		this.server.tool(
			"get_comments",
			"Get comments for a task or project",
			{
				task_id: z.string().optional().describe("Task ID to get comments for"),
				project_id: z.string().optional().describe("Project ID to get comments for")
			},
			async ({ task_id, project_id }) => {
				console.log(`🔧 Tool call: get_comments for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					if (task_id) params.append('task_id', task_id);
					if (project_id) params.append('project_id', project_id);
					
					const url = `https://api.todoist.com/rest/v2/comments${params.toString() ? '?' + params.toString() : ''}`;
					
					const response = await fetch(url, {
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						}
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting comments:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting comments: ${error.message}` }]
					};
				}
			}
		);

		// Tool 12: create_comment
		this.server.tool(
			"create_comment",
			"Create a comment on a task or project",
			{
				content: z.string().describe("Comment content"),
				task_id: z.string().optional().describe("Task ID to comment on"),
				project_id: z.string().optional().describe("Project ID to comment on")
			},
			async ({ content, task_id, project_id }) => {
				console.log(`🔧 Tool call: create_comment for ${this.serviceConfig.name}`);
				try {
					const commentData = {
						content
					};
					
					if (task_id) commentData.task_id = task_id;
					if (project_id) commentData.project_id = project_id;
					
					const response = await fetch('https://api.todoist.com/rest/v2/comments', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(commentData)
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating comment:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating comment: ${error.message}` }]
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
						console.log(`✅ Todoist MCP session initialized: ${newSessionId}`);
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