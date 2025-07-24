/**
 * Token metrics and performance tracking for Reddit service
 * Tracks token refresh performance and success rates
 */

// In-memory metrics storage
const tokenMetrics = {
  refreshAttempts: 0,
  refreshSuccesses: 0,
  refreshFailures: 0,
  averageRefreshTime: 0,
  lastRefreshTime: null,
  errorsByType: {},
  methodSuccessRates: {
    oauth_service: { attempts: 0, successes: 0 },
    direct_oauth: { attempts: 0, successes: 0 }
  }
};

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method ('oauth_service' or 'direct_oauth')
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
  const duration = endTime - startTime;
  
  // Update overall metrics
  tokenMetrics.refreshAttempts++;
  tokenMetrics.lastRefreshTime = new Date().toISOString();
  
  // Update method-specific metrics
  if (tokenMetrics.methodSuccessRates[method]) {
    tokenMetrics.methodSuccessRates[method].attempts++;
    if (success) {
      tokenMetrics.methodSuccessRates[method].successes++;
    }
  }
  
  if (success) {
    tokenMetrics.refreshSuccesses++;
    
    // Update average refresh time (rolling average)
    if (tokenMetrics.averageRefreshTime === 0) {
      tokenMetrics.averageRefreshTime = duration;
    } else {
      tokenMetrics.averageRefreshTime = (tokenMetrics.averageRefreshTime * 0.9) + (duration * 0.1);
    }
    
    console.log(`✅ Reddit token refresh metrics - Instance: ${instanceId}, Method: ${method}, Duration: ${duration}ms`);
  } else {
    tokenMetrics.refreshFailures++;
    
    // Track error types
    if (errorType) {
      tokenMetrics.errorsByType[errorType] = (tokenMetrics.errorsByType[errorType] || 0) + 1;
    }
    
    console.log(`❌ Reddit token refresh metrics - Instance: ${instanceId}, Method: ${method}, Error: ${errorType}, Duration: ${duration}ms`);
  }
}

/**
 * Get current token metrics
 * @returns {Object} Current metrics
 */
export function getTokenMetrics() {
  const totalAttempts = tokenMetrics.refreshAttempts;
  const successRate = totalAttempts > 0 ? (tokenMetrics.refreshSuccesses / totalAttempts * 100).toFixed(2) : 0;
  
  // Calculate method success rates
  const methodRates = {};
  for (const [method, stats] of Object.entries(tokenMetrics.methodSuccessRates)) {
    methodRates[method] = {
      attempts: stats.attempts,
      successes: stats.successes,
      successRate: stats.attempts > 0 ? (stats.successes / stats.attempts * 100).toFixed(2) : 0
    };
  }
  
  return {
    totalAttempts,
    totalSuccesses: tokenMetrics.refreshSuccesses,
    totalFailures: tokenMetrics.refreshFailures,
    successRate: parseFloat(successRate),
    averageRefreshTimeMs: Math.round(tokenMetrics.averageRefreshTime),
    lastRefreshTime: tokenMetrics.lastRefreshTime,
    errorsByType: { ...tokenMetrics.errorsByType },
    methodSuccessRates: methodRates
  };
}

/**
 * Reset token metrics
 */
export function resetTokenMetrics() {
  tokenMetrics.refreshAttempts = 0;
  tokenMetrics.refreshSuccesses = 0;
  tokenMetrics.refreshFailures = 0;
  tokenMetrics.averageRefreshTime = 0;
  tokenMetrics.lastRefreshTime = null;
  tokenMetrics.errorsByType = {};
  tokenMetrics.methodSuccessRates = {
    oauth_service: { attempts: 0, successes: 0 },
    direct_oauth: { attempts: 0, successes: 0 }
  };
  
  console.log('📊 Reddit token metrics reset');
}

/**
 * Get metrics summary for monitoring
 * @returns {Object} Metrics summary
 */
export function getMetricsSummary() {
  const metrics = getTokenMetrics();
  
  return {
    service: 'reddit',
    healthy: metrics.successRate >= 90,
    successRate: metrics.successRate,
    totalAttempts: metrics.totalAttempts,
    averageResponseTime: metrics.averageRefreshTimeMs,
    lastActivity: metrics.lastRefreshTime,
    topErrors: Object.entries(metrics.errorsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))
  };
}

/**
 * Check if metrics indicate healthy token refresh performance
 * @returns {boolean} True if performance is healthy
 */
export function isTokenRefreshHealthy() {
  const metrics = getTokenMetrics();
  
  // Consider healthy if:
  // - Success rate > 90%
  // - Average response time < 5 seconds
  // - Recent activity (within last hour)
  
  const recentActivity = metrics.lastRefreshTime ? 
    (Date.now() - new Date(metrics.lastRefreshTime).getTime()) < 3600000 : false;
  
  return metrics.successRate > 90 && 
         metrics.averageRefreshTimeMs < 5000 && 
         (metrics.totalAttempts === 0 || recentActivity);
}

/**
 * Log periodic metrics summary
 */
export function logMetricsSummary() {
  const metrics = getTokenMetrics();
  
  if (metrics.totalAttempts === 0) {
    console.log('📊 Reddit token metrics: No refresh attempts recorded');
    return;
  }
  
  console.log(`📊 Reddit token metrics summary:
    - Total attempts: ${metrics.totalAttempts}
    - Success rate: ${metrics.successRate}%
    - Average response time: ${metrics.averageRefreshTimeMs}ms
    - Last refresh: ${metrics.lastRefreshTime || 'Never'}
    - Top errors: ${Object.entries(metrics.errorsByType).map(([error, count]) => `${error}(${count})`).join(', ') || 'None'}
    - OAuth service success rate: ${metrics.methodSuccessRates.oauth_service.successRate}%
    - Direct OAuth success rate: ${metrics.methodSuccessRates.direct_oauth.successRate}%`);
}

/**
 * Start periodic metrics logging
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {Object} Controller with stop method
 */
export function startMetricsLogging(intervalMinutes = 30) {
  const interval = setInterval(logMetricsSummary, intervalMinutes * 60 * 1000);
  
  console.log(`📊 Started Reddit token metrics logging (interval: ${intervalMinutes} minutes)`);
  
  return {
    stop: () => {
      clearInterval(interval);
      console.log('📊 Stopped Reddit token metrics logging');
    }
  };
}