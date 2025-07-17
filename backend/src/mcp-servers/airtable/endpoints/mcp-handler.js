/**
 * Airtable MCP JSON-RPC protocol handler using official SDK
 * API Key Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { fetchWithRetry } from '../utils/fetch-with-retry.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 */

export class AirtableMCPHandler {
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
	 * Setup MCP tools using direct Zod schemas
	 */
	setupTools() {
		// Tool 1: list_bases
		this.server.tool(
			"list_bases",
			"List all accessible Airtable bases",
			{},
			async () => {
				console.log(`🔧 Tool call: list_bases for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry('https://api.airtable.com/v0/meta/bases', {
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
					console.error(`❌ Error listing bases:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing bases: ${error.message}` }]
					};
				}
			}
		);

		// Tool 2: get_base_schema
		this.server.tool(
			"get_base_schema",
			"Get the schema for a specific Airtable base",
			{
				baseId: z.string().describe("The ID of the Airtable base")
			},
			async ({ baseId }) => {
				console.log(`🔧 Tool call: get_base_schema for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
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
					console.error(`❌ Error getting base schema:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting base schema: ${error.message}` }]
					};
				}
			}
		);

		// Tool 3: list_records
		this.server.tool(
			"list_records",
			"List records from a table in an Airtable base",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				view: z.string().optional().describe("The name or ID of a view"),
				fields: z.array(z.string()).optional().describe("Array of field names to retrieve"),
				maxRecords: z.number().min(1).max(100).optional().default(100).describe("Maximum number of records to return"),
				sort: z.array(z.object({
					field: z.string().describe("Field name to sort by"),
					direction: z.enum(["asc", "desc"]).optional().default("asc").describe("Sort direction")
				})).optional().describe("Array of sort objects"),
				filterByFormula: z.string().optional().describe("Formula to filter records")
			},
			async ({ baseId, tableId, view, fields, maxRecords, sort, filterByFormula }) => {
				console.log(`🔧 Tool call: list_records for ${this.serviceConfig.name}`);
				try {
					const params = new URLSearchParams();
					if (view) params.append('view', view);
					if (fields) fields.forEach(field => params.append('fields[]', field));
					if (maxRecords) params.append('maxRecords', maxRecords.toString());
					if (sort) params.append('sort', JSON.stringify(sort));
					if (filterByFormula) params.append('filterByFormula', filterByFormula);
					
					const url = `https://api.airtable.com/v0/${baseId}/${tableId}${params.toString() ? '?' + params.toString() : ''}`;
					
					const response = await fetchWithRetry(url, {
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
					console.error(`❌ Error listing records:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing records: ${error.message}` }]
					};
				}
			}
		);

		// Tool 4: get_record
		this.server.tool(
			"get_record",
			"Get a specific record from an Airtable table",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				recordId: z.string().describe("The ID of the record to retrieve")
			},
			async ({ baseId, tableId, recordId }) => {
				console.log(`🔧 Tool call: get_record for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`, {
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
					console.error(`❌ Error getting record:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting record: ${error.message}` }]
					};
				}
			}
		);

		// Tool 5: create_record
		this.server.tool(
			"create_record",
			"Create a new record in an Airtable table",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				fields: z.record(z.any()).describe("Object containing field names and their values")
			},
			async ({ baseId, tableId, fields }) => {
				console.log(`🔧 Tool call: create_record for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ fields })
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating record:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating record: ${error.message}` }]
					};
				}
			}
		);

		// Tool 6: update_record
		this.server.tool(
			"update_record",
			"Update an existing record in an Airtable table",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				recordId: z.string().describe("The ID of the record to update"),
				fields: z.record(z.any()).describe("Object containing field names and their updated values")
			},
			async ({ baseId, tableId, recordId, fields }) => {
				console.log(`🔧 Tool call: update_record for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`, {
						method: 'PATCH',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ fields })
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error updating record:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating record: ${error.message}` }]
					};
				}
			}
		);

		// Tool 7: delete_record
		this.server.tool(
			"delete_record",
			"Delete a record from an Airtable table",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				recordId: z.string().describe("The ID of the record to delete")
			},
			async ({ baseId, tableId, recordId }) => {
				console.log(`🔧 Tool call: delete_record for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`, {
						method: 'DELETE',
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
					console.error(`❌ Error deleting record:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting record: ${error.message}` }]
					};
				}
			}
		);

		// Tool 8: create_multiple_records
		this.server.tool(
			"create_multiple_records",
			"Create multiple records in an Airtable table",
			{
				baseId: z.string().describe("The ID of the Airtable base"),
				tableId: z.string().describe("The ID or name of the table"),
				records: z.array(z.object({
					fields: z.record(z.any()).describe("Object containing field names and their values")
				})).max(10).describe("Array of record objects to create (max 10)")
			},
			async ({ baseId, tableId, records }) => {
				console.log(`🔧 Tool call: create_multiple_records for ${this.serviceConfig.name}`);
				try {
					const response = await fetchWithRetry(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${this.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ records })
					});
					
					const data = await response.json();
					return {
						content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
					};
				} catch (error) {
					console.error(`❌ Error creating multiple records:`, error);
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating multiple records: ${error.message}` }]
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
						console.log(`✅ Airtable MCP session initialized: ${newSessionId}`);
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