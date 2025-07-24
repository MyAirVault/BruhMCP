/**
 * Create Multiple Records Tool
 * Enhanced with intelligent batching and YAML formatting
 */

import { z } from 'zod';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('CreateMultipleRecordsTool');

/**
 * Setup create_multiple_records tool
 * @param {Object} server - MCP server instance  
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupCreateMultipleRecordsTool(server, airtableService, measurePerformance, serviceConfig) {
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
		measurePerformance('create_multiple_records', async ({ baseId, tableId, records }) => {
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
}