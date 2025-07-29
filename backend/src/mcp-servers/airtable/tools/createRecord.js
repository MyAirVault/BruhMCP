/**
 * Create Record Tool
 * Enhanced with validation and YAML formatting
 */

const { z  } = require('zod');
const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('CreateRecordTool');

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
 * @typedef {Object} CreateRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {Record<string, any>} fields - Object containing field names and their values
 */

/**
 * Setup create_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupCreateRecordTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'create_record',
		'Create a new record in an Airtable table',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			tableId: z.string().describe('The ID or name of the table'),
			fields: z.record(z.any()).describe('Object containing field names and their values'),
		},
		measurePerformance('create_record', async (/** @type {CreateRecordParams} */ { baseId, tableId, fields }) => {
			logger.info(`Tool call: create_record for ${serviceConfig.name}`, { 
				baseId, tableId, fieldCount: Object.keys(fields).length 
			});
			
			try {
				const result = await airtableService.createRecord(baseId, tableId, fields);
				
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
}

module.exports = setupCreateRecordTool;