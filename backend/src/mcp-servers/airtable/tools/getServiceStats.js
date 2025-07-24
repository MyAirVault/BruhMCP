/**
 * Get Service Stats Tool
 * Service statistics and performance monitoring
 */

import * as yaml from 'js-yaml';
import { createLogger } from '../utils/logger.js';
import { AirtableErrorHandler } from '../utils/errorHandler.js';

const logger = createLogger('GetServiceStatsTool');

/**
 * Setup get_service_stats tool
 * @param {Object} server - MCP server instance
 * @param {Object} airtableService - Airtable service instance
 * @param {Function} measurePerformance - Performance measurement function
 * @param {Object} serviceConfig - Service configuration
 */
export function setupGetServiceStatsTool(server, airtableService, measurePerformance, serviceConfig) {
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
			} catch (error) {
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