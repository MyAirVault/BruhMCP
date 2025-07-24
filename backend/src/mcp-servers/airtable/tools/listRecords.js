/**
 * List Records Tool
 * Enhanced with optimization and YAML formatting
 */

import { z } from 'zod';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('ListRecordsTool');

/**
 * Setup list_records tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupListRecordsTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
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
		measurePerformance('list_records', async ({ baseId, tableId, view, fields, maxRecords, sort, filterByFormula, getAllRecords }) => {
			logger.info(`Tool call: list_records for ${serviceConfig.name}`, { 
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
					const allRecords = await airtableService.getAllRecords(baseId, tableId, options);
					result = { records: allRecords };
				} else {
					// Get single page of records
					result = await airtableService.listRecords(baseId, tableId, options);
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
}