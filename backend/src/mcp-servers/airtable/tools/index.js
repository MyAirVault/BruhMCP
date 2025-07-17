/**
 * MCP Tools Index
 * Consolidated tool setup functions
 */

import { setupListBasesTool } from './list-bases.js';
import { setupGetBaseSchemaTool } from './get-base-schema.js';

/**
 * Setup all MCP tools
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupAllTools(server, airtableService, measurePerformance, serviceConfig) {
	// Setup individual tools
	setupListBasesTool(server, airtableService, measurePerformance, serviceConfig);
	setupGetBaseSchemaTool(server, airtableService, measurePerformance, serviceConfig);
	
	// TODO: Add remaining tools here as they are converted
	// setupListRecordsTool(server, airtableService, measurePerformance, serviceConfig);
	// setupGetRecordTool(server, airtableService, measurePerformance, serviceConfig);
	// setupCreateRecordTool(server, airtableService, measurePerformance, serviceConfig);
	// setupUpdateRecordTool(server, airtableService, measurePerformance, serviceConfig);
	// setupDeleteRecordTool(server, airtableService, measurePerformance, serviceConfig);
	// setupBatchOperationsTool(server, airtableService, measurePerformance, serviceConfig);
	// setupSearchRecordsTool(server, airtableService, measurePerformance, serviceConfig);
	// setupGetStatisticsTool(server, airtableService, measurePerformance, serviceConfig);
}