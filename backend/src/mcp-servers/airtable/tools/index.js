/**
 * MCP Tools Index
 * Consolidated tool setup functions
 */

const { setupListBasesTool } = require('./list-bases.js');
const setupGetBaseSchemaTool = require('./get-base-schema.js');
const setupListRecordsTool = require('./listRecords.js');
const setupGetRecordTool = require('./getRecord.js');
const setupCreateRecordTool = require('./createRecord.js');
const setupUpdateRecordTool = require('./updateRecord.js');
const setupDeleteRecordTool = require('./deleteRecord.js');
const setupCreateMultipleRecordsTool = require('./createMultipleRecords.js');
const setupSearchRecordsTool = require('./searchRecords.js');
const setupGetServiceStatsTool = require('./getServiceStats.js');

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
function setupAllTools(server, airtableService, measurePerformance, serviceConfig) {
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

module.exports = { setupAllTools };