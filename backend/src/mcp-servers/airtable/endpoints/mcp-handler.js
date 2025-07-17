/**
 * Airtable MCP JSON-RPC protocol handler using official SDK
 * Enhanced with comprehensive service layer and optimization
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AirtableService } from '../services/airtable-service.js';
import { createLogger, measurePerformance } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';
import yaml from 'js-yaml';
import { setupAllTools } from '../tools/index.js';

const logger = createLogger('AirtableMCPHandler');

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

		// Initialize Airtable service with enhanced configuration
		this.airtableService = new AirtableService({
			airtableApiKey: apiKey,
			useOptimization: true,
			useSimplification: true,
			timeout: 30000,
			retryAttempts: 3
		});

		// Setup performance monitoring
		this.setupPerformanceMonitoring();
		
		// Setup tools
		this.setupTools();

		logger.info('AirtableMCPHandler initialized with enhanced services', {
			serviceConfig,
			optimization: true,
			simplification: true
		});
	}

	/**
	 * Setup performance monitoring
	 */
	setupPerformanceMonitoring() {
		// Wrap tool methods with performance measurement
		this.measurePerformance = measurePerformance;
	}

	/**
	 * Setup MCP tools using direct Zod schemas with enhanced functionality
	 */
	setupTools() {
		// Use the consolidated tool setup function
		setupAllTools(this.server, this.airtableService, this.measurePerformance, this.serviceConfig);
		
		// TODO: The remaining tools need to be extracted to separate files
		// This is a partial implementation - the rest of the tools are still in this function
		// and should be moved to individual files in the tools/ directory

		// Tool 3: list_records - Enhanced with optimization and pagination
		this.server.tool(
			'list_records',
			'List records from a table in an Airtable base',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				view: z.string().optional().describe('The name or ID of a view'),
				fields: z.array(z.string()).optional().describe('Array of field names to retrieve'),
				maxRecords: z
					.number()
					.min(1)
					.max(100)
					.optional()
					.default(100)
					.describe('Maximum number of records to return'),
				sort: z
					.array(
						z.object({
							field: z.string().describe('Field name to sort by'),
							direction: z.enum(['asc', 'desc']).optional().default('asc').describe('Sort direction'),
						})
					)
					.optional()
					.describe('Array of sort objects'),
				filterByFormula: z.string().optional().describe('Formula to filter records'),
				getAllRecords: z.boolean().optional().default(false).describe('Get all records with automatic pagination'),
			},
			this.measurePerformance('list_records', async ({ baseId, tableId, view, fields, maxRecords, sort, filterByFormula, getAllRecords }) => {
				logger.info(`Tool call: list_records for ${this.serviceConfig.name}`, { 
					baseId, tableId, maxRecords, getAllRecords 
				});
				
				try {
					const options = {
						view,
						fields,
						maxRecords,
						sort,
						filterByFormula
					};

					let result;
					if (getAllRecords) {
						// Get all records with pagination
						const allRecords = await this.airtableService.getAllRecords(baseId, tableId, options);
						result = { records: allRecords };
					} else {
						// Get single page of records
						result = await this.airtableService.listRecords(baseId, tableId, options);
					}

					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'list_records',
						tool: 'list_records',
						baseId,
						tableId
					});
					
					logger.error('list_records failed', { 
						baseId, tableId, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error listing records: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 4: get_record - Enhanced with optimization
		this.server.tool(
			'get_record',
			'Get a specific record from an Airtable table',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				recordId: z.string().describe('The ID of the record to retrieve'),
			},
			this.measurePerformance('get_record', async ({ baseId, tableId, recordId }) => {
				logger.info(`Tool call: get_record for ${this.serviceConfig.name}`, { 
					baseId, tableId, recordId 
				});
				
				try {
					const result = await this.airtableService.getRecord(baseId, tableId, recordId);
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'get_record',
						tool: 'get_record',
						baseId,
						tableId,
						recordId
					});
					
					logger.error('get_record failed', { 
						baseId, tableId, recordId, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting record: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 5: create_record - Enhanced with validation
		this.server.tool(
			'create_record',
			'Create a new record in an Airtable table',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				fields: z.record(z.any()).describe('Object containing field names and their values'),
			},
			this.measurePerformance('create_record', async ({ baseId, tableId, fields }) => {
				logger.info(`Tool call: create_record for ${this.serviceConfig.name}`, { 
					baseId, tableId, fieldCount: Object.keys(fields).length 
				});
				
				try {
					const result = await this.airtableService.createRecord(baseId, tableId, fields);
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'create_record',
						tool: 'create_record',
						baseId,
						tableId
					});
					
					logger.error('create_record failed', { 
						baseId, tableId, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating record: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 6: update_record - Enhanced with validation
		this.server.tool(
			'update_record',
			'Update an existing record in an Airtable table',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				recordId: z.string().describe('The ID of the record to update'),
				fields: z.record(z.any()).describe('Object containing field names and their updated values'),
			},
			this.measurePerformance('update_record', async ({ baseId, tableId, recordId, fields }) => {
				logger.info(`Tool call: update_record for ${this.serviceConfig.name}`, { 
					baseId, tableId, recordId, fieldCount: Object.keys(fields).length 
				});
				
				try {
					const result = await this.airtableService.updateRecord(baseId, tableId, recordId, fields);
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'update_record',
						tool: 'update_record',
						baseId,
						tableId,
						recordId
					});
					
					logger.error('update_record failed', { 
						baseId, tableId, recordId, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error updating record: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 7: delete_record - Enhanced with confirmation
		this.server.tool(
			'delete_record',
			'Delete a record from an Airtable table',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				recordId: z.string().describe('The ID of the record to delete'),
			},
			this.measurePerformance('delete_record', async ({ baseId, tableId, recordId }) => {
				logger.info(`Tool call: delete_record for ${this.serviceConfig.name}`, { 
					baseId, tableId, recordId 
				});
				
				try {
					const result = await this.airtableService.deleteRecord(baseId, tableId, recordId);
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'delete_record',
						tool: 'delete_record',
						baseId,
						tableId,
						recordId
					});
					
					logger.error('delete_record failed', { 
						baseId, tableId, recordId, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error deleting record: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 8: create_multiple_records - Enhanced with intelligent batching
		this.server.tool(
			'create_multiple_records',
			'Create multiple records in an Airtable table (supports batching for large datasets)',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				tableId: z.string().describe('The ID or name of the table'),
				records: z
					.array(
						z.object({
							fields: z.record(z.any()).describe('Object containing field names and their values'),
						})
					)
					.max(100)
					.describe('Array of record objects to create (max 100, automatically batched)'),
			},
			this.measurePerformance('create_multiple_records', async ({ baseId, tableId, records }) => {
				logger.info(`Tool call: create_multiple_records for ${this.serviceConfig.name}`, { 
					baseId, tableId, recordCount: records.length 
				});
				
				try {
					const result = await this.airtableService.createMultipleRecords(baseId, tableId, records);
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'create_multiple_records',
						tool: 'create_multiple_records',
						baseId,
						tableId
					});
					
					logger.error('create_multiple_records failed', { 
						baseId, tableId, recordCount: records.length, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error creating multiple records: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 9: search_records - New enhanced search functionality
		this.server.tool(
			'search_records',
			'Search for records across one or more tables in an Airtable base',
			{
				baseId: z.string().describe('The ID of the Airtable base'),
				query: z.string().describe('Search query to find in records'),
				tables: z.array(z.string()).optional().describe('Array of table IDs to search (searches all tables if not specified)'),
				fields: z.array(z.string()).optional().describe('Array of field names to search in (searches all text fields if not specified)'),
				maxRecords: z.number().min(1).max(100).optional().default(50).describe('Maximum number of records to return'),
			},
			this.measurePerformance('search_records', async ({ baseId, query, tables, fields, maxRecords }) => {
				logger.info(`Tool call: search_records for ${this.serviceConfig.name}`, { 
					baseId, query, tableCount: tables?.length || 0, maxRecords 
				});
				
				try {
					const result = await this.airtableService.searchRecords(baseId, query, {
						tables,
						fields,
						maxRecords
					});
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(result, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'search_records',
						tool: 'search_records',
						baseId,
						query
					});
					
					logger.error('search_records failed', { 
						baseId, query, error: airtableError.message 
					});
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error searching records: ${airtableError.message}` }],
					};
				}
			})
		);

		// Tool 10: get_service_stats - New service statistics tool
		this.server.tool(
			'get_service_stats',
			'Get performance and usage statistics for the Airtable service',
			{},
			this.measurePerformance('get_service_stats', async () => {
				logger.info(`Tool call: get_service_stats for ${this.serviceConfig.name}`);
				
				try {
					const stats = this.airtableService.getStatistics();
					
					// Format as YAML for better readability
					const formattedResult = yaml.dump(stats, {
						indent: 2,
						lineWidth: 120,
						noRefs: true,
						sortKeys: false
					});

					return {
						content: [{ type: 'text', text: formattedResult }],
					};
				} catch (error) {
					const airtableError = AirtableErrorHandler.handle(error, {
						operation: 'get_service_stats',
						tool: 'get_service_stats'
					});
					
					logger.error('get_service_stats failed', { error: airtableError.message });
					
					return {
						isError: true,
						content: [{ type: 'text', text: `Error getting service statistics: ${airtableError.message}` }],
					};
				}
			})
		);

		logger.info('Enhanced MCP tools setup completed', { 
			toolCount: 10,
			features: ['optimization', 'validation', 'caching', 'batching', 'search', 'statistics']
		});
	}

	/**
	 * Handle incoming MCP request using session-based transport
	 * @param {any} req - Express request object
	 * @param {any} res - Express response object
	 * @param {any} message - MCP message
	 * @returns {Promise<void>}
	 */
	async handleMCPRequest(req, res, message) {
		const requestId = message?.id || randomUUID();
		const sessionId = req.headers['mcp-session-id'];
		
		logger.info('Processing MCP request', {
			requestId,
			sessionId,
			method: message?.method,
			isInitialize: isInitializeRequest(message)
		});

		try {
			/** @type {StreamableHTTPServerTransport} */
			let transport;

			if (sessionId && this.transports[sessionId]) {
				// Reuse existing transport
				logger.debug('Reusing existing transport', { sessionId });
				transport = this.transports[sessionId];
			} else if (!sessionId && isInitializeRequest(message)) {
				// Create new transport only for initialization requests
				logger.debug('Creating new transport for initialization');
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (newSessionId) => {
						logger.info('Airtable MCP session initialized', { sessionId: newSessionId });
						// Store transport by session ID
						this.transports[newSessionId] = transport;
					},
				});

				// Setup cleanup on transport close
				transport.onclose = () => {
					if (transport.sessionId) {
						delete this.transports[transport.sessionId];
						logger.info('Transport cleaned up', { sessionId: transport.sessionId });
					}
				};

				// Connect server to transport immediately
				await this.server.connect(transport);
				this.initialized = true;
				logger.debug('Server connected to transport');
			} else {
				// Invalid request - no session ID and not an initialize request
				logger.warn('Invalid request: No session ID and not initialize request');
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided and not an initialize request',
					},
					id: requestId,
				});
				return;
			}

			// Handle the request using the appropriate transport
			logger.debug('Handling request with transport');
			await transport.handleRequest(req, res, message);
			
			logger.info('MCP request processed successfully', { requestId, sessionId });
			
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(error, {
				operation: 'handleMCPRequest',
				requestId,
				sessionId,
				method: message?.method
			});

			logger.error('MCP request processing failed', {
				requestId,
				sessionId,
				error: airtableError.message,
				stack: airtableError.stack
			});

			// Return proper JSON-RPC error response
			const mcpError = AirtableErrorHandler.toMCPError(airtableError, requestId);
			res.json(mcpError);
		}
	}

	/**
	 * Get handler statistics
	 * @returns {Object} Handler statistics
	 */
	getStatistics() {
		return {
			handler: {
				initialized: this.initialized,
				activeSessions: Object.keys(this.transports).length,
				serviceConfig: this.serviceConfig
			},
			service: this.airtableService.getStatistics()
		};
	}

	/**
	 * Health check
	 * @returns {Promise<Object>} Health status
	 */
	async healthCheck() {
		return await this.airtableService.healthCheck();
	}

	/**
	 * Shutdown handler
	 */
	async shutdown() {
		logger.info('Shutting down AirtableMCPHandler');
		
		// Close all transports
		for (const [sessionId, transport] of Object.entries(this.transports)) {
			try {
				if (transport.onclose) {
					transport.onclose();
				}
			} catch (error) {
				logger.warn('Error closing transport', { sessionId, error: error.message });
			}
		}
		
		this.transports = {};
		this.initialized = false;
		
		// Clear caches
		this.airtableService.clearCaches();
		
		logger.info('AirtableMCPHandler shutdown completed');
	}
}