/**
 * Discord Token Refresh Metrics System
 * Tracks performance and reliability metrics for Discord OAuth token operations
 * Based on Gmail MCP service architecture
 */

/**
 * Metrics storage and management
 */
class TokenMetrics {
	constructor() {
		this.metrics = {
			refreshAttempts: 0,
			refreshSuccesses: 0,
			refreshFailures: 0,
			directOAuthFallbacks: 0,
			serviceUnavailableErrors: 0,
			invalidTokenErrors: 0,
			networkErrors: 0,
			totalLatency: 0,
			maxLatency: 0,
			minLatency: Infinity,
			lastReset: Date.now(),
			errorsByType: {},
			dailyStats: {},
			instanceMetrics: {},
		};
	}

	/**
	 * Record a token refresh attempt
	 * @param {string} instanceId - Instance ID
	 * @param {string} method - Method used ('oauth_service' | 'direct_oauth')
	 * @param {number} startTime - Start timestamp
	 */
	recordRefreshAttempt(instanceId, method, startTime) {
		this.metrics.refreshAttempts++;

		// Initialize instance metrics if needed
		if (!this.metrics.instanceMetrics[instanceId]) {
			this.metrics.instanceMetrics[instanceId] = {
				attempts: 0,
				successes: 0,
				failures: 0,
				lastAttempt: null,
				averageLatency: 0,
			};
		}

		this.metrics.instanceMetrics[instanceId].attempts++;
		this.metrics.instanceMetrics[instanceId].lastAttempt = {
			timestamp: startTime,
			method,
		};

		// Track daily stats
		const today = new Date().toISOString().split('T')[0];
		if (!this.metrics.dailyStats[today]) {
			this.metrics.dailyStats[today] = {
				attempts: 0,
				successes: 0,
				failures: 0,
				directFallbacks: 0,
			};
		}
		this.metrics.dailyStats[today].attempts++;

		if (method === 'direct_oauth') {
			this.metrics.directOAuthFallbacks++;
			this.metrics.dailyStats[today].directFallbacks++;
		}
	}

	/**
	 * Record a successful token refresh
	 * @param {string} instanceId - Instance ID
	 * @param {string} method - Method used
	 * @param {number} startTime - Start timestamp
	 * @param {number} endTime - End timestamp
	 */
	recordRefreshSuccess(instanceId, method, startTime, endTime) {
		const latency = endTime - startTime;

		this.metrics.refreshSuccesses++;
		this.metrics.totalLatency += latency;
		this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);
		this.metrics.minLatency = Math.min(this.metrics.minLatency, latency);

		// Update instance metrics
		if (this.metrics.instanceMetrics[instanceId]) {
			const instanceMetric = this.metrics.instanceMetrics[instanceId];
			instanceMetric.successes++;

			// Calculate rolling average latency
			const totalAttempts = instanceMetric.successes;
			instanceMetric.averageLatency =
				(instanceMetric.averageLatency * (totalAttempts - 1) + latency) / totalAttempts;
		}

		// Update daily stats
		const today = new Date().toISOString().split('T')[0];
		if (this.metrics.dailyStats[today]) {
			this.metrics.dailyStats[today].successes++;
		}

		console.log(`📊 Discord token refresh success: ${instanceId} via ${method} (${latency}ms)`);
	}

	/**
	 * Record a failed token refresh
	 * @param {string} instanceId - Instance ID
	 * @param {string} method - Method used
	 * @param {string} errorType - Type of error
	 * @param {string} errorMessage - Error message
	 * @param {number} startTime - Start timestamp
	 * @param {number} endTime - End timestamp
	 */
	recordRefreshFailure(instanceId, method, errorType, errorMessage, startTime, endTime) {
		const latency = endTime - startTime;

		this.metrics.refreshFailures++;

		// Categorize errors
		if (!this.metrics.errorsByType[errorType]) {
			this.metrics.errorsByType[errorType] = 0;
		}
		this.metrics.errorsByType[errorType]++;

		// Track specific error types for Discord
		if (errorType === 'INVALID_REFRESH_TOKEN' || errorMessage.includes('invalid_grant')) {
			this.metrics.invalidTokenErrors++;
		} else if (errorType === 'SERVICE_UNAVAILABLE' || errorMessage.includes('service')) {
			this.metrics.serviceUnavailableErrors++;
		} else if (errorType === 'NETWORK_ERROR' || errorMessage.includes('ECONNRESET')) {
			this.metrics.networkErrors++;
		}

		// Update instance metrics
		if (this.metrics.instanceMetrics[instanceId]) {
			this.metrics.instanceMetrics[instanceId].failures++;
		}

		// Update daily stats
		const today = new Date().toISOString().split('T')[0];
		if (this.metrics.dailyStats[today]) {
			this.metrics.dailyStats[today].failures++;
		}

		console.log(`📊 Discord token refresh failure: ${instanceId} via ${method} - ${errorType} (${latency}ms)`);
	}

	/**
	 * Get current metrics summary
	 * @returns {Object} Metrics summary
	 */
	getMetricsSummary() {
		const successRate =
			this.metrics.refreshAttempts > 0
				? ((this.metrics.refreshSuccesses / this.metrics.refreshAttempts) * 100).toFixed(2)
				: 0;

		const averageLatency =
			this.metrics.refreshSuccesses > 0
				? Math.round(this.metrics.totalLatency / this.metrics.refreshSuccesses)
				: 0;

		const directFallbackRate =
			this.metrics.refreshAttempts > 0
				? ((this.metrics.directOAuthFallbacks / this.metrics.refreshAttempts) * 100).toFixed(2)
				: 0;

		return {
			overview: {
				totalAttempts: this.metrics.refreshAttempts,
				totalSuccesses: this.metrics.refreshSuccesses,
				totalFailures: this.metrics.refreshFailures,
				successRate: `${successRate}%`,
				directFallbackRate: `${directFallbackRate}%`,
			},
			performance: {
				averageLatency: `${averageLatency}ms`,
				maxLatency: `${this.metrics.maxLatency}ms`,
				minLatency: this.metrics.minLatency === Infinity ? '0ms' : `${this.metrics.minLatency}ms`,
			},
			errors: {
				invalidTokenErrors: this.metrics.invalidTokenErrors,
				serviceUnavailableErrors: this.metrics.serviceUnavailableErrors,
				networkErrors: this.metrics.networkErrors,
				errorsByType: this.metrics.errorsByType,
			},
			uptime: {
				metricsStarted: new Date(this.metrics.lastReset).toISOString(),
				uptimeHours: ((Date.now() - this.metrics.lastReset) / (1000 * 60 * 60)).toFixed(2),
			},
		};
	}

	/**
	 * Reset metrics (for testing or periodic reset)
	 */
	reset() {
		this.metrics = {
			refreshAttempts: 0,
			refreshSuccesses: 0,
			refreshFailures: 0,
			directOAuthFallbacks: 0,
			serviceUnavailableErrors: 0,
			invalidTokenErrors: 0,
			networkErrors: 0,
			totalLatency: 0,
			maxLatency: 0,
			minLatency: Infinity,
			lastReset: Date.now(),
			errorsByType: {},
			dailyStats: {},
			instanceMetrics: {},
		};

		console.log('📊 Discord token metrics reset');
	}
}

// Create singleton instance
const tokenMetrics = new TokenMetrics();

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
	// Record the attempt
	tokenMetrics.recordRefreshAttempt(instanceId, method, startTime);

	// Record success or failure
	if (success) {
		tokenMetrics.recordRefreshSuccess(instanceId, method, startTime, endTime);
	} else {
		tokenMetrics.recordRefreshFailure(instanceId, method, errorType, errorMessage, startTime, endTime);
	}
}

/**
 * Get metrics summary
 */
export function getTokenMetricsSummary() {
	return tokenMetrics.getMetricsSummary();
}

/**
 * Reset metrics (for testing)
 */
export function resetTokenMetrics() {
	tokenMetrics.reset();
}

export default tokenMetrics;
