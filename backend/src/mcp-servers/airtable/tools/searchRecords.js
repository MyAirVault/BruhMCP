/**
 * Search Records Tool
 * Enhanced search functionality across tables
 */

import { z } from 'zod';
import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('SearchRecordsTool');

/**
 * Setup search_records tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupSearchRecordsTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'search_records',
		'Search for records across one or more tables in an Airtable base',
		{
			baseId: z.string().describe('The ID of the Airtable base'),
			query: z.string().describe('Search query to find in records'),
			tables: z.array(z.string()).optional().describe('Array of table IDs to search (searches all tables if not specified)'),
			fields: z.array(z.string()).optional().describe('Array of field names to search in (searches all text fields if not specified)'),
			maxRecords: z.number().min(1).max(100).optional().default(50).describe('Maximum number of records to return'),
		},
		measurePerformance('search_records', async ({ baseId, query, tables, fields, maxRecords }) => {
			logger.info(`Tool call: search_records for ${serviceConfig.name}`, { 
				baseId, query, tableCount: tables?.length || 0, maxRecords 
			});
			
			try {
				// For now, we'll implement a simple search using the existing service methods
				// In a full implementation, we would add a searchRecords method to AirtableService
				const schema = await airtableService.getBaseSchema(baseId);
				const tablesToSearch = tables || schema.tables.map(t => t.id);
				
				const searchResults = [];
				
				for (const tableId of tablesToSearch) {
					try {
						// Build a simple search formula
						const tableSchema = schema.tables.find(t => t.id === tableId);
						if (!tableSchema) continue;
						
						const searchFields = fields || 
							tableSchema.fields
								.filter(f => ['singleLineText', 'multilineText', 'richText'].includes(f.type))
								.map(f => f.name);
						
						if (searchFields.length === 0) continue;
						
						const searchConditions = searchFields.map(field => 
							`SEARCH(LOWER("${query}"), LOWER({${field}}))`
						).join(', ');
						
						const formula = `OR(${searchConditions})`;
						
						const records = await airtableService.listRecords(baseId, tableId, {
							filterByFormula: formula,
							maxRecords: Math.ceil(maxRecords / tablesToSearch.length)
						});

						if (records.records && records.records.length > 0) {
							searchResults.push({
								tableId,
								tableName: tableSchema.name,
								records: records.records
							});
						}
					} catch (error) {
						logger.warn('Search failed for table', { tableId, error: error.message });
					}
				}
				
				const result = {
					query,
					baseId,
					results: searchResults,
					totalRecords: searchResults.reduce((total, result) => total + result.records.length, 0)
				};
				
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
					operation: 'search_records',
					tool: 'search_records',
					baseId,
					query
				});
				
				logger.error('search_records failed', { 
					baseId, query, error: airtableError.message 
				});
				
				return {
					isError: true,
					content: [{ type: 'text', text: `Error searching records: ${airtableError.message}` }],
				};
			}
		})
	);
}