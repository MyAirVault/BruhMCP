/**
 * Delete Record Tool
 * Enhanced with confirmation and YAML formatting
 */

import { z } from 'zod';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('DeleteRecordTool');

/**
 * Setup delete_record tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupDeleteRecordTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'delete_record',
		'Delete a record from an Airtable table',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			tableId: z.string().describe('The ID or name of the table'),
			recordId: z.string().describe('The ID of the record to delete'),
		},
		measurePerformance('delete_record', async ({ baseId, tableId, recordId }) => {
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
			} catch (error) {
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