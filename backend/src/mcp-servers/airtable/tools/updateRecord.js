/**
 * Update Record Tool
 * Enhanced with validation and YAML formatting
 */

import { z } from 'zod';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('UpdateRecordTool');

/**
 * Setup update_record tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupUpdateRecordTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'update_record',
		'Update an existing record in an Airtable table',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			tableId: z.string().describe('The ID or name of the table'),
			recordId: z.string().describe('The ID of the record to update'),
			fields: z.record(z.any()).describe('Object containing field names and their updated values'),
		},
		measurePerformance('update_record', async ({ baseId, tableId, recordId, fields }) => {
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
			} catch (error) {
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