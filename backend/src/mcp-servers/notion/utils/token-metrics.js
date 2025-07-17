/**
 * Token Metrics utilities for Notion MCP Service
 * Tracks token refresh performance and success/failure rates
 */

/**
 * In-memory metrics store (in production, this would be replaced with a proper metrics system)
 */
const metricsStore = new Map();

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used for refresh (oauth_service, direct_oauth)
 * @param {boolean} success - Whether the refresh was successful
 * @param {string} errorType - Type of error if failed
 * @param {string} errorMessage - Error message if failed
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
 * @returns {Array} Array of metrics
 */
export function getTokenRefreshMetrics(instanceId) {
	const metrics = [];

	for (const [key, metric] of metricsStore.entries()) {
		if (metric.instanceId === instanceId) {
			metrics.push(metric);
		}
	}

	return metrics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get aggregated token refresh statistics
 * @param {string} instanceId - Instance ID (optional)
 * @returns {Object} Aggregated statistics
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
		};
	}

	const successful = relevantMetrics.filter(m => m.success);
	const failed = relevantMetrics.filter(m => !m.success);

	const methodBreakdown = {};
	const errorBreakdown = {};

	relevantMetrics.forEach(metric => {
		// Method breakdown
		if (!methodBreakdown[metric.method]) {
			methodBreakdown[metric.method] = { total: 0, successful: 0, failed: 0 };
		}
		methodBreakdown[metric.method].total++;
		if (metric.success) {
			methodBreakdown[metric.method].successful++;
		} else {
			methodBreakdown[metric.method].failed++;
		}

		// Error breakdown
		if (!metric.success && metric.errorType) {
			if (!errorBreakdown[metric.errorType]) {
				errorBreakdown[metric.errorType] = 0;
			}
			errorBreakdown[metric.errorType]++;
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
 * @returns {Array} All metrics
 */
export function exportMetrics() {
	return Array.from(metricsStore.values());
}
