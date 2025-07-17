/**
 * Token refresh metrics tracking for Slack MCP service
 * Provides monitoring and analytics for OAuth token operations
 */

// In-memory metrics storage
const tokenMetrics = new Map();

/**
 * Initialize token metrics system
 */
export function initializeTokenMetrics() {
  console.log('=€ Initializing Slack token metrics system');
  tokenMetrics.clear();
  console.log(' Slack token metrics system initialized');
}

/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used (oauth_service, direct_oauth)
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId, method, success, errorType, errorMessage, startTime, endTime) {
  const responseTime = endTime - startTime;
  const timestamp = new Date().toISOString();
  
  if (!tokenMetrics.has(instanceId)) {
    tokenMetrics.set(instanceId, {
      instanceId,
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      averageResponseTime: 0,
      lastRefreshTime: null,
      lastSuccessTime: null,
      lastFailureTime: null,
      methodStats: {
        oauth_service: { attempts: 0, successes: 0, failures: 0 },
        direct_oauth: { attempts: 0, successes: 0, failures: 0 }
      },
      errorStats: new Map(),
      recentRefreshes: []
    });
  }
  
  const metrics = tokenMetrics.get(instanceId);
  
  // Update counters
  metrics.totalRefreshes++;
  metrics.methodStats[method].attempts++;
  
  if (success) {
    metrics.successfulRefreshes++;
    metrics.methodStats[method].successes++;
    metrics.lastSuccessTime = timestamp;
  } else {
    metrics.failedRefreshes++;
    metrics.methodStats[method].failures++;
    metrics.lastFailureTime = timestamp;
    
    // Track error statistics
    const errorKey = errorType || 'UNKNOWN_ERROR';
    const errorStats = metrics.errorStats.get(errorKey) || { count: 0, lastOccurrence: null };
    errorStats.count++;
    errorStats.lastOccurrence = timestamp;
    metrics.errorStats.set(errorKey, errorStats);
  }
  
  // Update average response time
  const totalResponseTime = (metrics.averageResponseTime * (metrics.totalRefreshes - 1)) + responseTime;
  metrics.averageResponseTime = totalResponseTime / metrics.totalRefreshes;
  
  // Update last refresh time
  metrics.lastRefreshTime = timestamp;
  
  // Add to recent refreshes (keep last 10)
  metrics.recentRefreshes.push({
    timestamp,
    method,
    success,
    errorType,
    errorMessage,
    responseTime
  });
  
  if (metrics.recentRefreshes.length > 10) {
    metrics.recentRefreshes.shift();
  }
  
  console.log(`=Ê Recorded Slack token refresh metrics for instance ${instanceId}: ${success ? 'SUCCESS' : 'FAILURE'} (${method}, ${responseTime}ms)`);
}

/**
 * Get token metrics for a specific instance
 * @param {string} instanceId - Instance ID
 * @returns {Object|null} Token metrics or null if not found
 */
export function getTokenMetrics(instanceId) {
  const metrics = tokenMetrics.get(instanceId);
  if (!metrics) return null;
  
  return {
    ...metrics,
    errorStats: Object.fromEntries(metrics.errorStats),
    successRate: metrics.totalRefreshes > 0 
      ? (metrics.successfulRefreshes / metrics.totalRefreshes * 100).toFixed(2) 
      : 0
  };
}

/**
 * Get aggregated token metrics across all instances
 * @returns {Object} Aggregated metrics
 */
export function getAggregatedTokenMetrics() {
  const allMetrics = Array.from(tokenMetrics.values());
  
  if (allMetrics.length === 0) {
    return {
      totalInstances: 0,
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      averageResponseTime: 0,
      successRate: 0,
      methodStats: {
        oauth_service: { attempts: 0, successes: 0, failures: 0 },
        direct_oauth: { attempts: 0, successes: 0, failures: 0 }
      },
      topErrors: [],
      recentActivity: []
    };
  }
  
  const totals = allMetrics.reduce((acc, metrics) => {
    acc.totalRefreshes += metrics.totalRefreshes;
    acc.successfulRefreshes += metrics.successfulRefreshes;
    acc.failedRefreshes += metrics.failedRefreshes;
    acc.totalResponseTime += metrics.averageResponseTime * metrics.totalRefreshes;
    
    // Aggregate method stats
    Object.keys(metrics.methodStats).forEach(method => {
      acc.methodStats[method].attempts += metrics.methodStats[method].attempts;
      acc.methodStats[method].successes += metrics.methodStats[method].successes;
      acc.methodStats[method].failures += metrics.methodStats[method].failures;
    });
    
    // Aggregate error stats
    metrics.errorStats.forEach((errorStats, errorType) => {
      if (!acc.errorStats.has(errorType)) {
        acc.errorStats.set(errorType, { count: 0, instances: [] });
      }
      const aggErrorStats = acc.errorStats.get(errorType);
      aggErrorStats.count += errorStats.count;
      aggErrorStats.instances.push(metrics.instanceId);
    });
    
    // Collect recent activity
    metrics.recentRefreshes.forEach(refresh => {
      acc.recentActivity.push({
        instanceId: metrics.instanceId,
        ...refresh
      });
    });
    
    return acc;
  }, {
    totalRefreshes: 0,
    successfulRefreshes: 0,
    failedRefreshes: 0,
    totalResponseTime: 0,
    methodStats: {
      oauth_service: { attempts: 0, successes: 0, failures: 0 },
      direct_oauth: { attempts: 0, successes: 0, failures: 0 }
    },
    errorStats: new Map(),
    recentActivity: []
  });
  
  // Sort recent activity by timestamp
  totals.recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  totals.recentActivity = totals.recentActivity.slice(0, 20); // Keep last 20
  
  // Get top errors
  const topErrors = Array.from(totals.errorStats.entries())
    .map(([errorType, stats]) => ({
      errorType,
      count: stats.count,
      affectedInstances: stats.instances.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalInstances: allMetrics.length,
    totalRefreshes: totals.totalRefreshes,
    successfulRefreshes: totals.successfulRefreshes,
    failedRefreshes: totals.failedRefreshes,
    averageResponseTime: totals.totalRefreshes > 0 
      ? Math.round(totals.totalResponseTime / totals.totalRefreshes) 
      : 0,
    successRate: totals.totalRefreshes > 0 
      ? (totals.successfulRefreshes / totals.totalRefreshes * 100).toFixed(2) 
      : 0,
    methodStats: totals.methodStats,
    topErrors,
    recentActivity: totals.recentActivity
  };
}

/**
 * Get token metrics for instances with recent failures
 * @param {number} hoursBack - Hours to look back for failures
 * @returns {Array} Array of instances with recent failures
 */
export function getInstancesWithRecentFailures(hoursBack = 24) {
  const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
  const instancesWithFailures = [];
  
  for (const [instanceId, metrics] of tokenMetrics.entries()) {
    const recentFailures = metrics.recentRefreshes.filter(refresh => {
      return !refresh.success && new Date(refresh.timestamp) > cutoffTime;
    });
    
    if (recentFailures.length > 0) {
      instancesWithFailures.push({
        instanceId,
        recentFailures: recentFailures.length,
        lastFailureTime: metrics.lastFailureTime,
        mostRecentError: recentFailures[recentFailures.length - 1]?.errorType,
        successRate: metrics.totalRefreshes > 0 
          ? (metrics.successfulRefreshes / metrics.totalRefreshes * 100).toFixed(2) 
          : 0
      });
    }
  }
  
  return instancesWithFailures.sort((a, b) => b.recentFailures - a.recentFailures);
}

/**
 * Reset metrics for a specific instance
 * @param {string} instanceId - Instance ID
 */
export function resetInstanceMetrics(instanceId) {
  tokenMetrics.delete(instanceId);
  console.log(`>ù Reset token metrics for Slack instance: ${instanceId}`);
}

/**
 * Clear all token metrics
 */
export function clearAllTokenMetrics() {
  const count = tokenMetrics.size;
  tokenMetrics.clear();
  console.log(`>ù Cleared all Slack token metrics (${count} instances)`);
}

/**
 * Get performance insights based on metrics
 * @returns {Object} Performance insights
 */
export function getPerformanceInsights() {
  const aggregated = getAggregatedTokenMetrics();
  const insights = [];
  
  // Success rate insights
  if (aggregated.successRate < 90) {
    insights.push({
      type: 'warning',
      category: 'reliability',
      message: `Low success rate: ${aggregated.successRate}% (target: >90%)`,
      recommendation: 'Investigate common failure patterns and improve error handling'
    });
  } else if (aggregated.successRate >= 95) {
    insights.push({
      type: 'success',
      category: 'reliability',
      message: `Excellent success rate: ${aggregated.successRate}%`,
      recommendation: 'Current reliability is performing well'
    });
  }
  
  // Response time insights
  if (aggregated.averageResponseTime > 5000) {
    insights.push({
      type: 'warning',
      category: 'performance',
      message: `High average response time: ${aggregated.averageResponseTime}ms`,
      recommendation: 'Consider optimizing token refresh process or checking network conditions'
    });
  } else if (aggregated.averageResponseTime < 1000) {
    insights.push({
      type: 'success',
      category: 'performance',
      message: `Fast response time: ${aggregated.averageResponseTime}ms`,
      recommendation: 'Response time is performing well'
    });
  }
  
  // Method performance insights
  const oauthServiceStats = aggregated.methodStats.oauth_service;
  const directOauthStats = aggregated.methodStats.direct_oauth;
  
  if (oauthServiceStats.attempts > 0 && directOauthStats.attempts > 0) {
    const oauthServiceRate = (oauthServiceStats.successes / oauthServiceStats.attempts * 100).toFixed(2);
    const directOauthRate = (directOauthStats.successes / directOauthStats.attempts * 100).toFixed(2);
    
    if (oauthServiceRate < directOauthRate) {
      insights.push({
        type: 'info',
        category: 'methods',
        message: `Direct OAuth performing better than OAuth service (${directOauthRate}% vs ${oauthServiceRate}%)`,
        recommendation: 'Consider investigating OAuth service reliability'
      });
    }
  }
  
  // Error pattern insights
  if (aggregated.topErrors.length > 0) {
    const topError = aggregated.topErrors[0];
    insights.push({
      type: 'warning',
      category: 'errors',
      message: `Most common error: ${topError.errorType} (${topError.count} occurrences)`,
      recommendation: 'Focus on resolving this error pattern to improve overall reliability'
    });
  }
  
  return {
    insights,
    summary: {
      totalInstances: aggregated.totalInstances,
      healthScore: Math.round(aggregated.successRate),
      performanceScore: aggregated.averageResponseTime < 2000 ? 'Good' : 
                       aggregated.averageResponseTime < 5000 ? 'Fair' : 'Poor'
    }
  };
}

/**
 * Export metrics data for external monitoring
 * @returns {Object} Exportable metrics data
 */
export function exportMetricsData() {
  return {
    timestamp: new Date().toISOString(),
    service: 'slack',
    aggregated: getAggregatedTokenMetrics(),
    instances: Array.from(tokenMetrics.entries()).map(([instanceId, metrics]) => ({
      instanceId,
      ...getTokenMetrics(instanceId)
    })),
    insights: getPerformanceInsights()
  };
}