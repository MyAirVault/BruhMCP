/**
 * Update Record Tool
 * Enhanced with validation and YAML formatting
 */

const { z  } = require('zod');
const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('UpdateRecordTool');

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
 * @typedef {Object} UpdateRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {string} recordId - The ID of the record to update
 * @property {Record<string, any>} fields - Object containing field names and their updated values
 */

/**
 * Setup update_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupUpdateRecordTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'update_record',
		'Update an existing record in an Airtable table',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			tableId: z.string().describe('The ID or name of the table'),
			recordId: z.string().describe('The ID of the record to update'),
			fields: z.record(z.any()).describe('Object containing field names and their updated values'),
		},
		measurePerformance('update_record', async (/** @type {UpdateRecordParams} */ { baseId, tableId, recordId, fields }) => {
			logger.info(`Tool call: update_record for ${serviceConfig.name}`, { 
				baseId, tableId, recordId, fieldCount: Object.keys(fields).length 
			});
			
			try {
				const result = await airtableService.updateRecord(baseId, tableId, recordId, fields);
				
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
}

module.exports = setupUpdateRecordTool;