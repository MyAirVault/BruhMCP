/**
 * List Bases Tool
 * Enhanced with optimization and YAML formatting
 */

import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('ListBasesTool');

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
 * Setup list_bases tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
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
			} catch (/** @type {any} */ error) {
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