/**
 * Get Service Stats Tool
 * Service statistics and performance monitoring
 */

const yaml = require('js-yaml');
const { createLogger  } = require('../utils/logger.js');
const { AirtableErrorHandler  } = require('../utils/errorHandler.js');

const logger = createLogger('GetServiceStatsTool');

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
 * Setup get_service_stats tool
 * @param {MCPServer} server - MCP server instance
 * @param {import('../services/airtableService.js').AirtableService} airtableService - Airtable service instance
 * @param {(operation: string, fn: Function) => Function} measurePerformance - Performance measurement function
 * @param {ServiceConfig} serviceConfig - Service configuration
 */
function setupGetServiceStatsTool(server, airtableService, measurePerformance, serviceConfig) {
	server.tool(
		'get_service_stats',
		'Get performance and usage statistics for the Airtable service',
		{},
		measurePerformance('get_service_stats', async () => {
			logger.info(`Tool call: get_service_stats for ${serviceConfig.name}`);
			
			try {
				const stats = airtableService.getStatistics();
				
				// Add additional service stats
				const enhancedStats = {
					...stats,
					service: {
						name: serviceConfig.name,
						displayName: serviceConfig.displayName,
						version: serviceConfig.version,
						uptime: process.uptime(),
						memoryUsage: process.memoryUsage()
					},
					timestamp: new Date().toISOString()
				};
				
				// Format as YAML for better readability
				const formattedResult = yaml.dump(enhancedStats, {
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
					operation: 'get_service_stats',
					tool: 'get_service_stats'
				});
				
				logger.error('get_service_stats failed', { error: airtableError.message });
				
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting service statistics: ${airtableError.message}` }],
				};
			}
		})
	);
}

module.exports = setupGetServiceStatsTool;