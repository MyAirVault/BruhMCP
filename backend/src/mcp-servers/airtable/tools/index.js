/**
 * MCP Tools Index
 * Consolidated tool setup functions
 */

import { setupListBasesTool } from './list-bases.js';
import { setupGetBaseSchemaTool } from './get-base-schema.js';
import { setupListRecordsTool } from './listRecords.js';
import { setupGetRecordTool } from './getRecord.js';
import { setupCreateRecordTool } from './createRecord.js';
import { setupUpdateRecordTool } from './updateRecord.js';
import { setupDeleteRecordTool } from './deleteRecord.js';
import { setupCreateMultipleRecordsTool } from './createMultipleRecords.js';
import { setupSearchRecordsTool } from './searchRecords.js';
import { setupGetServiceStatsTool } from './getServiceStats.js';

/**
 * @typedef {Object} MCPServer
 * @property {Function} tool - Tool registration function
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} [version] - Service version
 */

/**
 * Setup all MCP tools
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
export function setupAllTools(server, airtableService, measurePerformance, serviceConfig) {
	// Base operations
	setupListBasesTool(server, airtableService, measurePerformance, serviceConfig);
	setupGetBaseSchemaTool(server, airtableService, measurePerformance, serviceConfig);
	
	// Record operations
	setupListRecordsTool(server, airtableService, measurePerformance, serviceConfig);
	setupGetRecordTool(server, airtableService, measurePerformance, serviceConfig);
	setupCreateRecordTool(server, airtableService, measurePerformance, serviceConfig);
	setupUpdateRecordTool(server, airtableService, measurePerformance, serviceConfig);
	setupDeleteRecordTool(server, airtableService, measurePerformance, serviceConfig);
	setupCreateMultipleRecordsTool(server, airtableService, measurePerformance, serviceConfig);
	
	// Advanced operations
	setupSearchRecordsTool(server, airtableService, measurePerformance, serviceConfig);
	setupGetServiceStatsTool(server, airtableService, measurePerformance, serviceConfig);
}