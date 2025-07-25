/**
 * Token Metrics utilities for Notion MCP Service
 * Tracks token refresh performance and success/failure rates
 */

/**
 * @typedef {Object} TokenMetric
 * @property {string} instanceId - Instance ID
 * @property {string} method - Method used for refresh
 * @property {boolean} success - Whether the refresh was successful
 * @property {string|null} errorType - Type of error if failed
 * @property {string|null} errorMessage - Error message if failed
 * @property {number} duration - Duration in milliseconds
 * @property {string} timestamp - ISO timestamp
 * @property {number} startTime - Start timestamp
 * @property {number} endTime - End timestamp
 */

/**
 * @typedef {Object} MethodStats
 * @property {number} total - Total requests for this method
 * @property {number} successful - Successful requests
 * @property {number} failed - Failed requests
 */

/**
 * @typedef {Object} TokenRefreshStats
 * @property {number} totalRequests - Total number of requests
 * @property {number} successRate - Success rate percentage
 * @property {number} averageDuration - Average duration in ms
 * @property {Record<string, MethodStats>} methodBreakdown - Breakdown by method
 * @property {Record<string, number>} errorBreakdown - Breakdown by error type
 * @property {Object} timeRange - Time range of metrics
 * @property {string|undefined} timeRange.earliest - Earliest timestamp
 * @property {string|undefined} timeRange.latest - Latest timestamp
 */

/**
 * In-memory metrics store (in production, this would be replaced with a proper metrics system)
 * @type {Map<string, TokenMetric>}
 */
const metricsStore = new Map();

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used for refresh (oauth_service, direct_oauth)
 * @param {boolean} success - Whether the refresh was successful
 * @param {string|null} errorType - Type of error if failed
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
	const duration = endTime - startTime;
	const timestamp = new Date().toISOString();

	const metric = {
		instanceId,
		method,
		success,
		errorType,
		errorMessage,
		duration,
		timestamp,
		startTime,
		endTime,
	};

	// Store in memory (in production, send to metrics system)
	const key = `${instanceId}_${timestamp}`;
	metricsStore.set(key, metric);

	// Log metrics for monitoring
	if (success) {
		console.log(`✅ Token refresh successful for ${instanceId} via ${method} in ${duration}ms`);
	} else {
		console.log(
			`❌ Token refresh failed for ${instanceId} via ${method} in ${duration}ms - ${errorType}: ${errorMessage}`
		);
	}

	// Clean up old metrics (keep only last 100 per instance)
	cleanupMetrics(instanceId);
}

/**
 * Get token refresh metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {TokenMetric[]} Array of metrics
 */
export function getTokenRefreshMetrics(instanceId) {
	const metrics = [];

	for (const [, metric] of metricsStore.entries()) {
		if (metric.instanceId === instanceId) {
			metrics.push(metric);
		}
	}

	return metrics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get aggregated token refresh statistics
 * @param {string|null} instanceId - Instance ID (optional)
 * @returns {TokenRefreshStats} Aggregated statistics
 */
export function getTokenRefreshStats(instanceId = null) {
	const relevantMetrics = instanceId ? getTokenRefreshMetrics(instanceId) : Array.from(metricsStore.values());

	if (relevantMetrics.length === 0) {
		return {
			totalRequests: 0,
			successRate: 0,
			averageDuration: 0,
			methodBreakdown: {},
			errorBreakdown: {},
			timeRange: {
				earliest: undefined,
				latest: undefined,
			},
		};
	}

	const successful = relevantMetrics.filter(m => m.success);

	/** @type {Record<string, MethodStats>} */
	const methodBreakdown = {};
	/** @type {Record<string, number>} */
	const errorBreakdown = {};

	relevantMetrics.forEach(metric => {
		// Method breakdown
		const method = metric.method;
		if (!methodBreakdown[method]) {
			methodBreakdown[method] = { total: 0, successful: 0, failed: 0 };
		}
		methodBreakdown[method].total++;
		if (metric.success) {
			methodBreakdown[method].successful++;
		} else {
			methodBreakdown[method].failed++;
		}

		// Error breakdown
		if (!metric.success && metric.errorType) {
			const errorType = metric.errorType;
			if (!errorBreakdown[errorType]) {
				errorBreakdown[errorType] = 0;
			}
			errorBreakdown[errorType]++;
		}
	});

	return {
		totalRequests: relevantMetrics.length,
		successRate: (successful.length / relevantMetrics.length) * 100,
		averageDuration: relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length,
		methodBreakdown,
		errorBreakdown,
		timeRange: {
			earliest: relevantMetrics[relevantMetrics.length - 1]?.timestamp,
			latest: relevantMetrics[0]?.timestamp,
		},
	};
}

/**
 * Clean up old metrics to prevent memory leaks
 * @param {string} instanceId - Instance ID
 */
function cleanupMetrics(instanceId) {
	const instanceMetrics = getTokenRefreshMetrics(instanceId);

	// Keep only the 100 most recent metrics per instance
	if (instanceMetrics.length > 100) {
		const toDelete = instanceMetrics.slice(100);

		toDelete.forEach(metric => {
			const key = `${metric.instanceId}_${metric.timestamp}`;
			metricsStore.delete(key);
		});
	}
}

/**
 * Clear all metrics (for testing)
 */
export function clearAllMetrics() {
	metricsStore.clear();
}

/**
 * Export metrics for external monitoring systems
 * @returns {TokenMetric[]} All metrics
 */
export function exportMetrics() {
	return Array.from(metricsStore.values());
}
