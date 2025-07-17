/**
 * Token Refresh Metrics System for Todoist MCP
 * Tracks performance and reliability metrics for OAuth token operations
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
      errorsByType: /** @type {Record<string, number>} */ ({}),
      dailyStats: /** @type {Record<string, any>} */ ({}),
      instanceMetrics: /** @type {Record<string, any>} */ ({})
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
      instanceMetric.averageLatency = (
        (instanceMetric.averageLatency * (totalAttempts - 1) + latency) / totalAttempts
      );
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    if (this.metrics.dailyStats[today]) {
      this.metrics.dailyStats[today].successes++;
    }

    console.log(`📊 Todoist token refresh success: ${instanceId} via ${method} (${latency}ms)`);
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

    // Track specific error types for Todoist
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

    console.log(`📊 Todoist token refresh failure: ${instanceId} via ${method} - ${errorType} (${latency}ms)`);
  }

  /**
   * Get current metrics summary
   * @returns {Object} Metrics summary
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
   * @returns {Object|null} Instance-specific metrics
   */
  getInstanceMetrics(instanceId) {
    const instanceMetric = this.metrics.instanceMetrics[instanceId];
    
    if (!instanceMetric) {
      return null;
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
   * @returns {Object} Daily statistics
   */
  getDailyStats(days = 7) {
    const today = new Date();
    const stats = /** @type {Record<string, any>} */ ({});

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      stats[dateStr] = this.metrics.dailyStats[dateStr] || {
        attempts: 0,
        successes: 0,
        failures: 0,
        directFallbacks: 0
      };
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
      errorsByType: /** @type {Record<string, number>} */ ({}),
      dailyStats: /** @type {Record<string, any>} */ ({}),
      instanceMetrics: /** @type {Record<string, any>} */ ({})
    };
    
    console.log('📊 Todoist token metrics reset');
  }

  /**
   * Export metrics for external monitoring systems
   * @returns {Object} Exportable metrics
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
   * @returns {Object} Health assessment
   */
  getHealthAssessment() {
    const summary = /** @type {any} */ (this.getMetricsSummary());
    const issues = [];
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
      summary: /** @type {any} */ (summary)
    };
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
 * Get instance-specific metrics
 * @param {string} instanceId - Instance ID
 */
export function getInstanceTokenMetrics(instanceId) {
  return tokenMetrics.getInstanceMetrics(instanceId);
}

/**
 * Get daily statistics
 * @param {number} days - Number of days
 */
export function getDailyTokenStats(days) {
  return tokenMetrics.getDailyStats(days);
}

/**
 * Export all metrics
 */
export function exportTokenMetrics() {
  return tokenMetrics.exportMetrics();
}

/**
 * Get health assessment
 */
export function getTokenSystemHealth() {
  return tokenMetrics.getHealthAssessment();
}

/**
 * Reset metrics (for testing)
 */
export function resetTokenMetrics() {
  tokenMetrics.reset();
}

/**
 * Get aggregated token metrics (alias for exportTokenMetrics)
 * @returns {Object} Aggregated metrics data
 */
export function getAggregatedTokenMetrics() {
  return tokenMetrics.exportMetrics();
}

export default tokenMetrics;