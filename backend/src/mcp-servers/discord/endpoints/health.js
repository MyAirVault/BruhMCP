/**
 * Discord Health Check Endpoint
 * Provides health status information for the Discord MCP service
 */

import { getCacheStatistics } from '../services/credential-cache.js';
import { getSessionStatistics } from '../services/handler-sessions.js';
import { getWatcherStatistics } from '../services/credential-watcher.js';
import { getServiceHealthStats } from '../services/database.js';

/**
 * Performs health check for Discord service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health check result
 */
export async function healthCheck(serviceConfig) {
	try {
		const now = new Date().toISOString();

		// Get cache, session, and watcher statistics
		const cacheStats = getCacheStatistics();
		const sessionStats = getSessionStatistics();
		const watcherStats = getWatcherStatistics();
		const dbStats = await getServiceHealthStats();

		// Calculate service uptime
		const uptimeMs = Date.now() - (sessionStats.startTime || Date.now());

		return {
			status: 'healthy',
			service: serviceConfig.name,
			displayName: serviceConfig.displayName,
			version: serviceConfig.version,
			description: serviceConfig.description,
			timestamp: now,
			uptime: {
				ms: uptimeMs,
				readable: formatDuration(uptimeMs),
			},
			authentication: {
				type: 'oauth2',
				supportedTypes: ['bearer', 'bot'],
				caching: {
					enabled: true,
					statistics: cacheStats,
				},
				tokenRefresh: {
					enabled: true,
					statistics: watcherStats,
				},
				database: {
					enabled: true,
					statistics: dbStats,
				},
			},
			sessions: {
				enabled: true,
				statistics: sessionStats,
			},
			features: {
				multiTenant: true,
				instanceBased: true,
				tokenCaching: true,
				sessionManagement: true,
				healthChecks: true,
				logging: true,
				databaseIntegration: true,
				oauth2TokenRefresh: true,
				backgroundTokenMaintenance: true,
				usageTracking: true,
				auditLogging: true,
			},
			endpoints: {
				health: {
					global: '/health',
					instance: '/:instanceId/health',
				},
				mcp: {
					instance: '/:instanceId',
					instanceMcp: '/:instanceId/mcp',
				},
				tools: '/tools',
			},
		};
	} catch (error) {
		console.error('Health check error:', error);

		return {
			status: 'unhealthy',
			service: serviceConfig.name,
			displayName: serviceConfig.displayName,
			version: serviceConfig.version,
			timestamp: new Date().toISOString(),
			error: error.message || 'Health check failed',
			details: {
				message: 'Service health check encountered an error',
				error: error.message,
			},
		};
	}
}

/**
 * Performs detailed health check with external dependencies
 * @param {Object} serviceConfig - Service configuration
 * @param {string} instanceId - Instance ID for testing
 * @param {string} token - Token for testing Discord API connectivity
 * @returns {Promise<Object>} Detailed health check result
 */
export async function detailedHealthCheck(serviceConfig, instanceId, token) {
	try {
		const basicHealth = healthCheck(serviceConfig);

		// Test Discord API connectivity if token provided
		let discordApiStatus = 'untested';
		let discordApiError = null;

		if (token) {
			try {
				const { DiscordAPI } = await import('../api/discord-api.js');
				const api = new DiscordAPI(
					token.startsWith('Bot ') ? null : token,
					token.startsWith('Bot ') ? token : null
				);

				const userResult = await api.getCurrentUser();

				if (userResult.success) {
					discordApiStatus = 'connected';
				} else {
					discordApiStatus = 'error';
					discordApiError = userResult.error || 'API call failed';
				}
			} catch (error) {
				discordApiStatus = 'error';
				discordApiError = error.message;
			}
		}

		return {
			...basicHealth,
			detailed: true,
			instanceId,
			externalDependencies: {
				discordApi: {
					status: discordApiStatus,
					error: discordApiError,
					tested: !!token,
				},
			},
			checks: {
				tokenCaching: {
					status: 'operational',
					statistics: getCacheStatistics(),
				},
				sessionManagement: {
					status: 'operational',
					statistics: getSessionStatistics(),
				},
				memoryUsage: {
					status: 'operational',
					usage: process.memoryUsage(),
				},
			},
		};
	} catch (error) {
		console.error('Detailed health check error:', error);

		return {
			status: 'unhealthy',
			service: serviceConfig.name,
			displayName: serviceConfig.displayName,
			version: serviceConfig.version,
			timestamp: new Date().toISOString(),
			detailed: true,
			instanceId,
			error: error.message || 'Detailed health check failed',
			details: {
				message: 'Detailed health check encountered an error',
				error: error.message,
			},
		};
	}
}

/**
 * Formats duration in milliseconds to human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Human-readable duration
 */
function formatDuration(ms) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
	if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
	return `${seconds}s`;
}
