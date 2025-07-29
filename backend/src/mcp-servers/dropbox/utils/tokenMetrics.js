/**
 * Token Refresh Metrics System for Dropbox
 * Tracks performance and reliability metrics for OAuth token operations
 */

/**
 * @typedef {Object} LastAttempt
 * @property {number} timestamp - Timestamp of the last attempt
 * @property {'oauth_service' | 'direct_oauth'} method - Method used for the attempt
 */

/**
 * @typedef {Object} InstanceMetric
 * @property {number} attempts - Total number of attempts
 * @property {number} successes - Number of successful attempts
 * @property {number} failures - Number of failed attempts
 * @property {LastAttempt | null} lastAttempt - Details of the last attempt
 * @property {number} averageLatency - Average latency in milliseconds
 */

/**
 * @typedef {Object} DailyStats
 * @property {number} attempts - Number of attempts for the day
 * @property {number} successes - Number of successes for the day
 * @property {number} failures - Number of failures for the day
 * @property {number} directFallbacks - Number of direct fallbacks for the day
 */

/**
 * @typedef {Object} MetricsData
 * @property {number} refreshAttempts - Total refresh attempts
 * @property {number} refreshSuccesses - Total successful refreshes
 * @property {number} refreshFailures - Total failed refreshes
 * @property {number} directOAuthFallbacks - Direct OAuth fallback count
 * @property {number} serviceUnavailableErrors - Service unavailable error count
 * @property {number} invalidTokenErrors - Invalid token error count
 * @property {number} networkErrors - Network error count
 * @property {number} totalLatency - Total latency across all requests
 * @property {number} maxLatency - Maximum latency recorded
 * @property {number} minLatency - Minimum latency recorded
 * @property {number} lastReset - Timestamp of last metrics reset
 * @property {Record<string, number>} errorsByType - Errors grouped by type
 * @property {Record<string, DailyStats>} dailyStats - Daily statistics
 * @property {Record<string, InstanceMetric>} instanceMetrics - Per-instance metrics
 */

/**
 * @typedef {Object} MetricsOverview
 * @property {number} totalAttempts - Total number of attempts
 * @property {number} totalSuccesses - Total number of successes
 * @property {number} totalFailures - Total number of failures
 * @property {string} successRate - Success rate as percentage string
 * @property {string} directFallbackRate - Direct fallback rate as percentage string
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {string} averageLatency - Average latency as string with units
 * @property {string} maxLatency - Maximum latency as string with units
 * @property {string} minLatency - Minimum latency as string with units
 */

/**
 * @typedef {Object} ErrorMetrics
 * @property {number} invalidTokenErrors - Count of invalid token errors
 * @property {number} serviceUnavailableErrors - Count of service unavailable errors
 * @property {number} networkErrors - Count of network errors
 * @property {Record<string, number>} errorsByType - Errors grouped by type
 */

/**
 * @typedef {Object} UptimeMetrics
 * @property {string} metricsStarted - ISO string of when metrics started
 * @property {string} uptimeHours - Uptime in hours as string
 */

/**
 * @typedef {Object} MetricsSummary
 * @property {MetricsOverview} overview - Overview metrics
 * @property {PerformanceMetrics} performance - Performance metrics
 * @property {ErrorMetrics} errors - Error metrics
 * @property {UptimeMetrics} uptime - Uptime metrics
 */

/**
 * @typedef {Object} InstanceMetricsResult
 * @property {string} instanceId - Instance identifier
 * @property {number} totalAttempts - Total attempts for this instance
 * @property {number} totalSuccesses - Total successes for this instance
 * @property {number} totalFailures - Total failures for this instance
 * @property {string} successRate - Success rate as percentage string
 * @property {string} averageLatency - Average latency as string with units
 * @property {LastAttempt | null} lastAttempt - Details of the last attempt
 */

/**
 * @typedef {Object} HealthAssessment
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Overall health status
 * @property {string[]} issues - List of critical issues
 * @property {string[]} warnings - List of warnings
 * @property {MetricsSummary} summary - Current metrics summary
 */

/**
 * @typedef {Object} ExportedMetrics
 * @property {number} timestamp - Export timestamp
 * @property {MetricsSummary} summary - Metrics summary
 * @property {Record<string, DailyStats>} dailyStats - Daily statistics
 * @property {InstanceMetricsResult[]} allInstanceMetrics - All instance metrics
 * @property {MetricsData} rawMetrics - Raw metrics data
 */

/**
 * Metrics storage and management
 */
class TokenMetrics {
  constructor() {
    /** @type {MetricsData} */
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
      instanceMetrics: {}
    };
  }

  /**
   * Record a token refresh attempt
   * @param {string} instanceId - Instance ID
   * @param {'oauth_service' | 'direct_oauth'} method - Method used
   * @param {number} startTime - Start timestamp
   */
  recordRefreshAttempt(instanceId, method, startTime) {
    this.metrics.refreshAttempts++;
    
    // Initialize instance metrics if needed
    if (!this.metrics.instanceMetrics[instanceId]) {
      /** @type {InstanceMetric} */
      this.metrics.instanceMetrics[instanceId] = {
        attempts: 0,
        successes: 0,
        failures: 0,
        lastAttempt: null,
        averageLatency: 0
      };
    }
    
    this.metrics.instanceMetrics[instanceId].attempts++;
    this.metrics.instanceMetrics[instanceId].lastAttempt = {
      timestamp: startTime,
      method
    };

    // Track daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!this.metrics.dailyStats[today]) {
      /** @type {DailyStats} */
      this.metrics.dailyStats[today] = {
        attempts: 0,
        successes: 0,
        failures: 0,
        directFallbacks: 0
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
   * @param {'oauth_service' | 'direct_oauth'} method - Method used
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
      /** @type {InstanceMetric} */
      const instanceMetric = this.metrics.instanceMetrics[instanceId];
      instanceMetric.successes++;
      
      // Calculate rolling average latency
      const totalAttempts = instanceMetric.successes;
      instanceMetric.averageLatency = (
        (instanceMetric.averageLatency * (totalAttempts - 1) + latency) / totalAttempts
      );
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    if (this.metrics.dailyStats[today]) {
      this.metrics.dailyStats[today].successes++;
    }

    console.log(`📊 Token refresh success: ${instanceId} via ${method} (${latency}ms)`);
  }

  /**
   * Record a failed token refresh
   * @param {string} instanceId - Instance ID
   * @param {'oauth_service' | 'direct_oauth'} method - Method used
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

    // Track specific error types
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

    console.log(`📊 Token refresh failure: ${instanceId} via ${method} - ${errorType} (${latency}ms)`);
  }

  /**
   * Get current metrics summary
   * @returns {MetricsSummary} Metrics summary
   */
  getMetricsSummary() {
    const successRate = this.metrics.refreshAttempts > 0 
      ? (this.metrics.refreshSuccesses / this.metrics.refreshAttempts * 100).toFixed(2)
      : 0;

    const averageLatency = this.metrics.refreshSuccesses > 0
      ? Math.round(this.metrics.totalLatency / this.metrics.refreshSuccesses)
      : 0;

    const directFallbackRate = this.metrics.refreshAttempts > 0
      ? (this.metrics.directOAuthFallbacks / this.metrics.refreshAttempts * 100).toFixed(2)
      : 0;

    return {
      overview: {
        totalAttempts: this.metrics.refreshAttempts,
        totalSuccesses: this.metrics.refreshSuccesses,
        totalFailures: this.metrics.refreshFailures,
        successRate: `${successRate}%`,
        directFallbackRate: `${directFallbackRate}%`
      },
      performance: {
        averageLatency: `${averageLatency}ms`,
        maxLatency: `${this.metrics.maxLatency}ms`,
        minLatency: this.metrics.minLatency === Infinity ? '0ms' : `${this.metrics.minLatency}ms`
      },
      errors: {
        invalidTokenErrors: this.metrics.invalidTokenErrors,
        serviceUnavailableErrors: this.metrics.serviceUnavailableErrors,
        networkErrors: this.metrics.networkErrors,
        errorsByType: this.metrics.errorsByType
      },
      uptime: {
        metricsStarted: new Date(this.metrics.lastReset).toISOString(),
        uptimeHours: ((Date.now() - this.metrics.lastReset) / (1000 * 60 * 60)).toFixed(2)
      }
    };
  }

  /**
   * Get metrics for a specific instance
   * @param {string} instanceId - Instance ID
   * @returns {InstanceMetricsResult} Instance-specific metrics
   */
  getInstanceMetrics(instanceId) {
    const instanceMetric = this.metrics.instanceMetrics[instanceId];
    
    if (!instanceMetric) {
      return {
        instanceId,
        totalAttempts: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        successRate: '0%',
        averageLatency: '0ms',
        lastAttempt: null
      };
    }

    const successRate = instanceMetric.attempts > 0
      ? (instanceMetric.successes / instanceMetric.attempts * 100).toFixed(2)
      : 0;

    return {
      instanceId,
      totalAttempts: instanceMetric.attempts,
      totalSuccesses: instanceMetric.successes,
      totalFailures: instanceMetric.failures,
      successRate: `${successRate}%`,
      averageLatency: `${Math.round(instanceMetric.averageLatency)}ms`,
      lastAttempt: instanceMetric.lastAttempt
    };
  }

  /**
   * Get daily statistics
   * @param {number} days - Number of days to include (default: 7)
   * @returns {Record<string, DailyStats>} Daily statistics
   */
  getDailyStats(days = 7) {
    const today = new Date();
    /** @type {Record<string, DailyStats>} */
    const stats = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      /** @type {DailyStats} */
      const defaultStats = {
        attempts: 0,
        successes: 0,
        failures: 0,
        directFallbacks: 0
      };
      stats[dateStr] = this.metrics.dailyStats[dateStr] || defaultStats;
    }

    return stats;
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
      instanceMetrics: {}
    };
    
    console.log('📊 Token metrics reset');
  }

  /**
   * Export metrics for external monitoring systems
   * @returns {ExportedMetrics} Exportable metrics
   */
  exportMetrics() {
    return {
      timestamp: Date.now(),
      summary: this.getMetricsSummary(),
      dailyStats: this.getDailyStats(),
      allInstanceMetrics: Object.keys(this.metrics.instanceMetrics).map(
        instanceId => this.getInstanceMetrics(instanceId)
      ),
      rawMetrics: { ...this.metrics }
    };
  }

  /**
   * Check if metrics indicate system health issues
   * @returns {HealthAssessment} Health assessment
   */
  getHealthAssessment() {
    const summary = this.getMetricsSummary();
    /** @type {string[]} */
    const issues = [];
    /** @type {string[]} */
    const warnings = [];

    // Check success rate
    const successRate = parseFloat(summary.overview.successRate);
    if (successRate < 95) {
      issues.push(`Low success rate: ${summary.overview.successRate}`);
    } else if (successRate < 98) {
      warnings.push(`Success rate below target: ${summary.overview.successRate}`);
    }

    // Check direct fallback rate
    const fallbackRate = parseFloat(summary.overview.directFallbackRate);
    if (fallbackRate > 20) {
      issues.push(`High fallback rate: ${summary.overview.directFallbackRate}`);
    } else if (fallbackRate > 10) {
      warnings.push(`Elevated fallback rate: ${summary.overview.directFallbackRate}`);
    }

    // Check latency
    const avgLatency = parseInt(summary.performance.averageLatency);
    if (avgLatency > 5000) {
      issues.push(`High average latency: ${summary.performance.averageLatency}`);
    } else if (avgLatency > 2000) {
      warnings.push(`Elevated latency: ${summary.performance.averageLatency}`);
    }

    // Check error patterns
    if (this.metrics.serviceUnavailableErrors > this.metrics.refreshAttempts * 0.1) {
      issues.push('High service unavailable error rate');
    }

    if (this.metrics.networkErrors > this.metrics.refreshAttempts * 0.05) {
      warnings.push('Elevated network error rate');
    }

    return {
      status: issues.length > 0 ? 'unhealthy' : warnings.length > 0 ? 'degraded' : 'healthy',
      issues,
      warnings,
      summary
    };
  }
}

// Create singleton instance
/** @type {TokenMetrics} */
const tokenMetrics = new TokenMetrics();

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {'oauth_service' | 'direct_oauth'} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {string | null} errorType - Error type if failed
 * @param {string | null} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
function recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
  // Record the attempt
  tokenMetrics.recordRefreshAttempt(instanceId, method, startTime);

  // Record success or failure
  if (success) {
    tokenMetrics.recordRefreshSuccess(instanceId, method, startTime, endTime);
  } else {
    tokenMetrics.recordRefreshFailure(instanceId, method, errorType || 'UNKNOWN_ERROR', errorMessage || 'Unknown error occurred', startTime, endTime);
  }
}

/**
 * Get metrics summary
 * @returns {MetricsSummary} Current metrics summary
 */
function getTokenMetricsSummary() {
  return tokenMetrics.getMetricsSummary();
}

/**
 * Get instance-specific metrics
 * @param {string} instanceId - Instance ID to get metrics for
 * @returns {InstanceMetricsResult} Instance-specific metrics
 */
function getInstanceTokenMetrics(instanceId) {
  return tokenMetrics.getInstanceMetrics(instanceId);
}

/**
 * Get daily statistics
 * @param {number} [days] - Number of days to include (default: 7)
 * @returns {Record<string, DailyStats>} Daily statistics
 */
function getDailyTokenStats(days) {
  return tokenMetrics.getDailyStats(days);
}

/**
 * Export all metrics
 * @returns {ExportedMetrics} All metrics data for export
 */
function exportTokenMetrics() {
  return tokenMetrics.exportMetrics();
}

/**
 * Get health assessment
 * @returns {HealthAssessment} System health assessment
 */
function getTokenSystemHealth() {
  return tokenMetrics.getHealthAssessment();
}

/**
 * Reset metrics (for testing)
 * @returns {void}
 */
function resetTokenMetrics() {
  tokenMetrics.reset();
}

module.exports = {
  recordTokenRefreshMetrics,
  getTokenMetricsSummary,
  getInstanceTokenMetrics,
  getDailyTokenStats,
  exportTokenMetrics,
  getTokenSystemHealth,
  resetTokenMetrics,
  tokenMetrics
};