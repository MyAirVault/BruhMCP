/**
 * Delete Record Tool
 * Enhanced with confirmation and YAML formatting
 */

const { z  } = require('zod');
const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('DeleteRecordTool');

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
 * @typedef {Object} DeleteRecordParams
 * @property {string} baseId - The ID of the Airtable base
 * @property {string} tableId - The ID or name of the table
 * @property {string} recordId - The ID of the record to delete
 */

/**
 * Setup delete_record tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupDeleteRecordTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'delete_record',
		'Delete a record from an Airtable table',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			tableId: z.string().describe('The ID or name of the table'),
			recordId: z.string().describe('The ID of the record to delete'),
		},
		measurePerformance('delete_record', async (/** @type {DeleteRecordParams} */ { baseId, tableId, recordId }) => {
			logger.info(`Tool call: delete_record for ${serviceConfig.name}`, { 
				baseId, tableId, recordId 
			});
			
			try {
				const result = await airtableService.deleteRecord(baseId, tableId, recordId);
				
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
}

module.exports = setupDeleteRecordTool;