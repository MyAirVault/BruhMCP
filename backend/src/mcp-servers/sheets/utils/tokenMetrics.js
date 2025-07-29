/**
 * @fileoverview Token refresh metrics for Google Sheets
 * Tracks and reports token refresh operations
 */

// Metrics storage
const tokenRefreshMetrics = new Map();

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used
 * @param {boolean} success - Whether refresh succeeded
 * @param {string|null} errorType - Error type if failed
 * @param {string|null} _errorMessage - Error message if failed (unused)
 * @param {number} startTime - Operation start time
 * @param {number} endTime - Operation end time
 */
function recordTokenRefreshMetrics(
	instanceId, 
	method, 
	success, 
	errorType, 
	_errorMessage, 
	startTime, 
	endTime
) {
	const duration = endTime - startTime;
	
	// Get or create metrics for this instance
	let instanceMetrics = tokenRefreshMetrics.get(instanceId);
	if (!instanceMetrics) {
		instanceMetrics = {
			totalAttempts: 0,
			successCount: 0,
			failureCount: 0,
			averageDuration: 0,
			lastAttempt: null,
			lastSuccess: null,
			lastFailure: null,
			errorTypes: {}
		};
		tokenRefreshMetrics.set(instanceId, instanceMetrics);
	}
	
	// Update metrics
	instanceMetrics.totalAttempts++;
	instanceMetrics.lastAttempt = new Date().toISOString();
	
	if (success) {
		instanceMetrics.successCount++;
		instanceMetrics.lastSuccess = new Date().toISOString();
	} else {
		instanceMetrics.failureCount++;
		instanceMetrics.lastFailure = new Date().toISOString();
		
		// Track error types
		if (errorType) {
			instanceMetrics.errorTypes[errorType] = (instanceMetrics.errorTypes[errorType] || 0) + 1;
		}
	}
	
	// Update average duration
	instanceMetrics.averageDuration = 
		(instanceMetrics.averageDuration * (instanceMetrics.totalAttempts - 1) + duration) / 
		instanceMetrics.totalAttempts;
	
	console.log(`📊 Token refresh metrics recorded for ${instanceId}:`, {
		method,
		success,
		duration,
		errorType,
		totalAttempts: instanceMetrics.totalAttempts
	});
}

/**
 * Get token refresh metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {Object|null} Metrics or null if not found
 */
function getTokenRefreshMetrics(instanceId) {
	return tokenRefreshMetrics.get(instanceId) || null;
}

/**
 * Get all token refresh metrics
 * @returns {Object} All metrics by instance
 */
function getAllTokenRefreshMetrics() {
	/** @type {Record<string, any>} */
	const metrics = {};
	
	for (const [instanceId, data] of tokenRefreshMetrics.entries()) {
		metrics[instanceId] = { ...data };
	}
	
	return metrics;
}

/**
 * Clear metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {boolean} Whether metrics were cleared
 */
function clearTokenRefreshMetrics(instanceId) {
	return tokenRefreshMetrics.delete(instanceId);
}

/**
 * Get aggregated metrics summary
 * @returns {Object} Aggregated metrics
 */
function getMetricsSummary() {
	let totalAttempts = 0;
	let totalSuccess = 0;
	let totalFailure = 0;
	let totalDuration = 0;
	/** @type {Record<string, number>} */
	const allErrorTypes = {};
	
	for (const metrics of tokenRefreshMetrics.values()) {
		totalAttempts += metrics.totalAttempts;
		totalSuccess += metrics.successCount;
		totalFailure += metrics.failureCount;
		totalDuration += metrics.averageDuration * metrics.totalAttempts;
		
		// Aggregate error types
		for (const [errorType, count] of Object.entries(metrics.errorTypes)) {
			allErrorTypes[errorType] = (allErrorTypes[errorType] || 0) + count;
		}
	}
	
	return {
		totalInstances: tokenRefreshMetrics.size,
		totalAttempts,
		totalSuccess,
		totalFailure,
		successRate: totalAttempts > 0 ? (totalSuccess / totalAttempts) * 100 : 0,
		averageDuration: totalAttempts > 0 ? totalDuration / totalAttempts : 0,
		errorTypes: allErrorTypes
	};
}

module.exports = {
	recordTokenRefreshMetrics,
	getTokenRefreshMetrics,
	getAllTokenRefreshMetrics,
	clearTokenRefreshMetrics,
	getMetricsSummary
};