/**
 * Create Multiple Records Tool
 * Enhanced with intelligent batching and YAML formatting
 */

const { z  } = require('zod');
const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('CreateMultipleRecordsTool');

/**
 * @typedef {Object} MCPServer
 * @property {Function} tool - Tool registration function
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 */

/**
 * @typedef {Object} CreateMultipleRecordsParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {Array<{fields: Record<string, any>}>} records - Array of record objects
 */

/**
 * Setup create_multiple_records tool
 * @param {MCPServer} server - MCP server instance  
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupCreateMultipleRecordsTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
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
		measurePerformance('create_multiple_records', async (/** @type {CreateMultipleRecordsParams} */ { baseId, tableId, records }) => {
			logger.info(`Tool call: create_multiple_records for ${serviceConfig.name}`, { 
				baseId, tableId, recordCount: records.length 
			});
			
			try {
				const result = await airtableService.createMultipleRecords(baseId, tableId, records);
				
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
			} catch (/** @type {any} */ error) {
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
}

module.exports = setupCreateMultipleRecordsTool;