/**
 * List Bases Tool
 * Enhanced with optimization and YAML formatting
 */

import yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/error-handler.js';

const logger = createLogger('ListBasesTool');

/**
 * Setup list_bases tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupListBasesTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool('list_bases', 'List all accessible Airtable bases', {}, 
		measurePerformance('list_bases', async () => {
			logger.info(`Tool call: list_bases for ${serviceConfig.name}`);
			
			try {
				const result = await airtableService.listBases();
				
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
					operation: 'list_bases',
					tool: 'list_bases'
				});
				
				logger.error('list_bases failed', { error: airtableError.message });
				
				return {
					isError: true,
					content: [{ type: 'text', text: `Error listing bases: ${airtableError.message}` }],
				};
			}
		})
	);
}