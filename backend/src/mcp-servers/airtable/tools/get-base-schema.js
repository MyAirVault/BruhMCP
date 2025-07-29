/**
 * Get Base Schema Tool
 * Enhanced with caching and YAML formatting
 */

const { z  } = require('zod');
const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('GetBaseSchemaTool');

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
 * @typedef {Object} GetBaseSchemaParams
 * @property {string} baseId - The ID of the Airtable base
 */

/**
 * Setup get_base_schema tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupGetBaseSchemaTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'get_base_schema',
		'Get the schema for a specific Airtable base',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
		},
		measurePerformance('get_base_schema', async (/** @type {GetBaseSchemaParams} */ { baseId }) => {
			logger.info(`Tool call: get_base_schema for ${serviceConfig.name}`, { baseId });
			
			try {
				const result = await airtableService.getBaseSchema(baseId);
				
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
					operation: 'get_base_schema',
					tool: 'get_base_schema',
					baseId
				});
				
				logger.error('get_base_schema failed', { baseId, error: airtableError.message });
				
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting base schema: ${airtableError.message}` }],
				};
			}
		})
	);
}

module.exports = setupGetBaseSchemaTool;