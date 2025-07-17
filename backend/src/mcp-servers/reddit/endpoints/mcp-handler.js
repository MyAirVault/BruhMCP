/**
 * Reddit MCP JSON-RPC protocol handler using official SDK
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { executeToolCall } from './call.js';
import { getTools } from './tools.js';

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
		const toolsData = getTools();
		
		// Convert JSON schemas to Zod schemas and register tools
		toolsData.tools.forEach(tool => {
			const zodSchema = this.convertJsonSchemaToZod(tool.inputSchema);
			
			this.server.tool(
				tool.name,
				tool.description,
				zodSchema,
				async (args) => {
					console.log(`🔧 Tool call: ${tool.name} for ${this.serviceConfig.name}`);
					try {
						const result = await executeToolCall(tool.name, args, this.bearerToken);
						return result;
					} catch (error) {
						console.error(`❌ Error executing ${tool.name}:`, error);
						return {
							isError: true,
							content: [{ type: 'text', text: `Error executing ${tool.name}: ${error.message}` }]
						};
					}
				}
			);
		});
	}

	/**
	 * Convert JSON schema to Zod schema
	 * @param {Object} jsonSchema - JSON schema object
	 * @returns {Object} Zod schema
	 */
	convertJsonSchemaToZod(jsonSchema) {
		const zodSchema = {};
		
		if (jsonSchema.properties) {
			Object.entries(jsonSchema.properties).forEach(([key, prop]) => {
				let zodType;
				
				switch (prop.type) {
					case 'string':
						zodType = z.string();
						if (prop.enum) {
							zodType = z.enum(prop.enum);
						}
						break;
					case 'number':
						zodType = z.number();
						if (prop.minimum !== undefined) {
							zodType = zodType.min(prop.minimum);
						}
						if (prop.maximum !== undefined) {
							zodType = zodType.max(prop.maximum);
						}
						break;
					case 'boolean':
						zodType = z.boolean();
						break;
					case 'array':
						zodType = z.array(z.string()); // Default to string array
						if (prop.items && prop.items.type === 'string') {
							zodType = z.array(z.string());
						}
						break;
					default:
						zodType = z.any();
				}
				
				// Add description if available
				if (prop.description) {
					zodType = zodType.describe(prop.description);
				}
				
				// Add default value if available
				if (prop.default !== undefined) {
					zodType = zodType.optional().default(prop.default);
				} else if (!jsonSchema.required || !jsonSchema.required.includes(key)) {
					zodType = zodType.optional();
				}
				
				zodSchema[key] = zodType;
			});
		}
		
		return zodSchema;
	}

	/**
	 * Handle incoming HTTP request
	 * @param {import('http').IncomingMessage} req
	 * @param {import('http').ServerResponse} res
	 */
	async handleMCPRequest(req, res) {
		// Enable CORS for cross-origin requests
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		
		// Handle preflight requests
		if (req.method === 'OPTIONS') {
			res.writeHead(200);
			res.end();
			return;
		}
		
		// Only handle POST requests for MCP
		if (req.method !== 'POST') {
			res.writeHead(405, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'Method not allowed' }));
			return;
		}
		
		try {
			// Create new transport for this session
			const sessionId = randomUUID();
			const transport = new StreamableHTTPServerTransport(req, res);
			this.transports[sessionId] = transport;
			
			// Connect server to transport
			await this.server.connect(transport);
			
			// Handle the request
			await new Promise((resolve, reject) => {
				transport.onclose = () => {
					delete this.transports[sessionId];
					resolve();
				};
				
				transport.onerror = (error) => {
					delete this.transports[sessionId];
					reject(error);
				};
				
				// Transport will handle the request automatically
			});
			
		} catch (error) {
			console.error('MCP handler error:', error);
			if (!res.headersSent) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Internal server error' }));
			}
		}
	}

	/**
	 * Update bearer token for all active sessions
	 * @param {string} newBearerToken
	 */
	updateBearerToken(newBearerToken) {
		this.bearerToken = newBearerToken;
		console.log(`🔄 Updated bearer token for ${this.serviceConfig.name} MCP handler`);
	}

	/**
	 * Get handler statistics
	 * @returns {Object} Handler statistics
	 */
	getStatistics() {
		return {
			serviceName: this.serviceConfig.name,
			displayName: this.serviceConfig.displayName,
			version: this.serviceConfig.version,
			activeSessions: Object.keys(this.transports).length,
			initialized: this.initialized,
			availableTools: getTools().tools.length,
			bearerTokenPresent: !!this.bearerToken
		};
	}

	/**
	 * Cleanup handler and close all sessions
	 */
	async cleanup() {
		console.log(`🧹 Cleaning up ${this.serviceConfig.name} MCP handler`);
		
		// Close all active transports
		const cleanupPromises = Object.values(this.transports).map(transport => {
			return new Promise((resolve) => {
				transport.close();
				resolve();
			});
		});
		
		await Promise.all(cleanupPromises);
		this.transports = {};
		
		console.log(`✅ ${this.serviceConfig.name} MCP handler cleanup completed`);
	}
}