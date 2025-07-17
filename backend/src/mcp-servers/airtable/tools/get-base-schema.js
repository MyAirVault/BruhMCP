/**
 * Get Base Schema Tool
 * Enhanced with caching and YAML formatting
 */

import { z } from 'zod';
import yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';

const logger = createLogger('GetBaseSchemaTool');

/**
 * Setup get_base_schema tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupGetBaseSchemaTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'get_base_schema',
		'Get the schema for a specific Airtable base',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
		},
		measurePerformance('get_base_schema', async ({ baseId }) => {
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
			} catch (error) {
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