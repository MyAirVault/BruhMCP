/**
 * Gmail MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { 
  sendEmail, 
  fetchEmails, 
  fetchMessageById, 
  replyToEmail, 
  createDraft, 
  sendDraft,
  listDrafts,
  deleteMessage,
  moveToTrash,
  searchEmails,
  getThread,
  markAsRead,
  markAsUnread
} from '../api/gmail-api.js';

import { 
  listLabels, 
  createLabel, 
  modifyLabels 
} from '../api/label-operations.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */

export class GmailMCPHandler {
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
		// Tool 1: send_email
		this.server.tool(
			"send_email",
			"Send an email message through Gmail",
			{
				to: z.string().describe("Recipient email address"),
				subject: z.string().describe("Email subject line"),
				body: z.string().describe("Email body content (supports HTML)"),
				cc: z.string().optional().default("").describe("CC email addresses (comma separated)"),
				bcc: z.string().optional().default("").describe("BCC email addresses (comma separated)"),
				format: z.enum(["text", "html"]).optional().default("text").describe("Email format (text or html)")
			},
			async ({ to, subject, body, cc, bcc, format }) => {
				console.log(`🔧 Tool call: send_email for ${this.serviceConfig.name}`);
				try {
					const result = await sendEmail({ to, subject, body, cc, bcc, format }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error sending email:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error sending email: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: fetch_emails
		this.server.tool(
			"fetch_emails",
			"Fetch emails from Gmail inbox or specific folder",
			{
				query: z.string().optional().default("").describe("Gmail search query (supports Gmail search operators)"),
				maxResults: z.number().min(1).max(500).optional().default(10).describe("Maximum number of emails to return"),
				labelIds: z.array(z.string()).optional().default([]).describe("Label IDs to filter by (optional)"),
				includeSpamTrash: z.boolean().optional().default(false).describe("Include spam and trash in results")
			},
			async ({ query, maxResults, labelIds, includeSpamTrash }) => {
				console.log(`🔧 Tool call: fetch_emails for ${this.serviceConfig.name}`);
				try {
					const result = await fetchEmails({ query, maxResults, labelIds, includeSpamTrash }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error fetching emails:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error fetching emails: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: fetch_message_by_id
		this.server.tool(
			"fetch_message_by_id",
			"Fetch a specific email message by its ID",
			{
				messageId: z.string().describe("Gmail message ID to fetch"),
				format: z.enum(["minimal", "full", "raw", "metadata"]).optional().default("full").describe("Message format to return")
			},
			async ({ messageId, format }) => {
				console.log(`🔧 Tool call: fetch_message_by_id for ${this.serviceConfig.name}`);
				try {
					const result = await fetchMessageById({ messageId, format }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error fetching message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error fetching message: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: reply_to_email
		this.server.tool(
			"reply_to_email",
			"Reply to an existing email thread",
			{
				threadId: z.string().describe("Thread ID to reply to"),
				body: z.string().describe("Reply message body"),
				subject: z.string().optional().default("").describe("Reply subject (optional, will use Re: prefix)"),
				format: z.enum(["text", "html"]).optional().default("text").describe("Reply format (text or html)")
			},
			async ({ threadId, body, subject, format }) => {
				console.log(`🔧 Tool call: reply_to_email for ${this.serviceConfig.name}`);
				try {
					const result = await replyToEmail({ threadId, body, subject, format }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error replying to email:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error replying to email: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: create_draft
		this.server.tool(
			"create_draft",
			"Create an email draft",
			{
				to: z.string().describe("Recipient email address"),
				subject: z.string().describe("Email subject line"),
				body: z.string().describe("Email body content"),
				cc: z.string().optional().default("").describe("CC email addresses (comma separated)"),
				bcc: z.string().optional().default("").describe("BCC email addresses (comma separated)"),
				format: z.enum(["text", "html"]).optional().default("text").describe("Email format (text or html)")
			},
			async ({ to, subject, body, cc, bcc, format }) => {
				console.log(`🔧 Tool call: create_draft for ${this.serviceConfig.name}`);
				try {
					const result = await createDraft({ to, subject, body, cc, bcc, format }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating draft:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating draft: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: send_draft
		this.server.tool(
			"send_draft",
			"Send an existing draft email",
			{
				draftId: z.string().describe("Draft ID to send")
			},
			async ({ draftId }) => {
				console.log(`🔧 Tool call: send_draft for ${this.serviceConfig.name}`);
				try {
					const result = await sendDraft({ draftId }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error sending draft:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error sending draft: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: list_drafts
		this.server.tool(
			"list_drafts",
			"List all email drafts",
			{
				maxResults: z.number().min(1).max(500).optional().default(100).describe("Maximum number of drafts to return"),
				query: z.string().optional().default("").describe("Search query for drafts")
			},
			async ({ maxResults, query }) => {
				console.log(`🔧 Tool call: list_drafts for ${this.serviceConfig.name}`);
				try {
					const result = await listDrafts({ maxResults, query }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing drafts:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing drafts: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: delete_message
		this.server.tool(
			"delete_message",
			"Permanently delete a message",
			{
				messageId: z.string().describe("Message ID to delete permanently")
			},
			async ({ messageId }) => {
				console.log(`🔧 Tool call: delete_message for ${this.serviceConfig.name}`);
				try {
					const result = await deleteMessage({ messageId }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error deleting message:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting message: ${error.message}` }]
					};
				}
			}
		);

		// Tool 9: move_to_trash
		this.server.tool(
			"move_to_trash",
			"Move a message to trash",
			{
				messageId: z.string().describe("Message ID to move to trash")
			},
			async ({ messageId }) => {
				console.log(`🔧 Tool call: move_to_trash for ${this.serviceConfig.name}`);
				try {
					const result = await moveToTrash({ messageId }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error moving to trash:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error moving to trash: ${error.message}` }]
					};
				}
			}
		);

		// Tool 10: list_labels
		this.server.tool(
			"list_labels",
			"List all Gmail labels",
			{},
			async () => {
				console.log(`🔧 Tool call: list_labels for ${this.serviceConfig.name}`);
				try {
					const result = await listLabels(this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error listing labels:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing labels: ${error.message}` }]
					};
				}
			}
		);

		// Tool 11: create_label
		this.server.tool(
			"create_label",
			"Create a new Gmail label",
			{
				name: z.string().describe("Label name"),
				messageListVisibility: z.enum(["show", "hide"]).optional().default("show").describe("Whether to show label in message list"),
				labelListVisibility: z.enum(["labelShow", "labelHide"]).optional().default("labelShow").describe("Whether to show label in label list")
			},
			async ({ name, messageListVisibility, labelListVisibility }) => {
				console.log(`🔧 Tool call: create_label for ${this.serviceConfig.name}`);
				try {
					const result = await createLabel({ name, messageListVisibility, labelListVisibility }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
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

		// Tool 12: modify_labels
		this.server.tool(
			"modify_labels",
			"Add or remove labels from a message",
			{
				messageId: z.string().describe("Message ID to modify"),
				addLabelIds: z.array(z.string()).optional().default([]).describe("Label IDs to add to the message"),
				removeLabelIds: z.array(z.string()).optional().default([]).describe("Label IDs to remove from the message")
			},
			async ({ messageId, addLabelIds, removeLabelIds }) => {
				console.log(`🔧 Tool call: modify_labels for ${this.serviceConfig.name}`);
				try {
					const result = await modifyLabels({ messageId, addLabelIds, removeLabelIds }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error modifying labels:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error modifying labels: ${error.message}` }]
					};
				}
			}
		);

		// Tool 13: search_emails
		this.server.tool(
			"search_emails",
			"Advanced email search with Gmail operators",
			{
				query: z.string().describe("Gmail search query using search operators (from:, to:, subject:, has:attachment, etc.)"),
				maxResults: z.number().min(1).max(500).optional().default(50).describe("Maximum number of results to return"),
				newerThan: z.string().optional().default("").describe("Only return emails newer than this date (YYYY-MM-DD format)"),
				olderThan: z.string().optional().default("").describe("Only return emails older than this date (YYYY-MM-DD format)")
			},
			async ({ query, maxResults, newerThan, olderThan }) => {
				console.log(`🔧 Tool call: search_emails for ${this.serviceConfig.name}`);
				try {
					const result = await searchEmails({ query, maxResults, newerThan, olderThan }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error searching emails:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching emails: ${error.message}` }]
					};
				}
			}
		);

		// Tool 14: get_thread
		this.server.tool(
			"get_thread",
			"Get an entire email thread/conversation",
			{
				threadId: z.string().describe("Thread ID to retrieve"),
				format: z.enum(["minimal", "full", "metadata"]).optional().default("full").describe("Format for messages in thread")
			},
			async ({ threadId, format }) => {
				console.log(`🔧 Tool call: get_thread for ${this.serviceConfig.name}`);
				try {
					const result = await getThread({ threadId, format }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error getting thread:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting thread: ${error.message}` }]
					};
				}
			}
		);

		// Tool 15: mark_as_read
		this.server.tool(
			"mark_as_read",
			"Mark message(s) as read",
			{
				messageIds: z.array(z.string()).describe("Array of message IDs to mark as read")
			},
			async ({ messageIds }) => {
				console.log(`🔧 Tool call: mark_as_read for ${this.serviceConfig.name}`);
				try {
					const result = await markAsRead({ messageIds }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error marking as read:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error marking as read: ${error.message}` }]
					};
				}
			}
		);

		// Tool 16: mark_as_unread
		this.server.tool(
			"mark_as_unread",
			"Mark message(s) as unread",
			{
				messageIds: z.array(z.string()).describe("Array of message IDs to mark as unread")
			},
			async ({ messageIds }) => {
				console.log(`🔧 Tool call: mark_as_unread for ${this.serviceConfig.name}`);
				try {
					const result = await markAsUnread({ messageIds }, this.bearerToken);
					return {
						content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error marking as unread:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error marking as unread: ${error.message}` }]
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
						console.log(`✅ Gmail MCP session initialized: ${newSessionId}`);
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