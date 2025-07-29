/**
 * Health check endpoint for Slack MCP service
 * Provides service health status and metrics
 */

const { getCacheStatistics } = require('../services/credentialCache');
const { getAggregatedTokenMetrics } = require('../utils/tokenMetrics');
const { getActiveSlackInstances } = require('../services/database');

/**
 * Basic health check function for Slack MCP service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health status object
 */
function healthCheck(serviceConfig) {
  const config = /** @type {Record<string, any>} */ (serviceConfig);
  return {
    status: 'healthy',
    service: config['name'],
    displayName: config['displayName'],
    version: config['version'],
    timestamp: new Date().toISOString(),
    authType: config['authType'],
    scopes: config['scopes'] || []
  };
}

/**
 * Get detailed health status for Slack MCP service
 * @returns {Promise<Object>} Health status object
 */
async function getHealthStatus() {
  try {
    // Get cache statistics - cast to allow property access
    const cacheStats = /** @type {Record<string, any>} */ (getCacheStatistics());
    
    // Get token metrics - cast to allow property access
    const tokenMetrics = /** @type {Record<string, any>} */ (getAggregatedTokenMetrics());
    
    // Get active instances count
    const activeInstances = await getActiveSlackInstances();
    
    // Calculate health score
    const healthScore = calculateHealthScore(cacheStats, tokenMetrics, activeInstances);
    
    return {
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'degraded' : 'unhealthy',
      service: 'slack',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      healthScore,
      metrics: {
        activeInstances: activeInstances.length,
        cacheStats: {
          totalEntries: cacheStats['total_entries'] || 0,
          expiredEntries: cacheStats['expired_entries'] || 0,
          hitRate: cacheStats['cache_hit_rate_last_hour'] || 0,
          memoryUsage: cacheStats['memory_usage_mb'] || 0
        },
        tokenMetrics: {
          totalRefreshes: tokenMetrics['summary']?.['overview']?.['totalAttempts'] || 0,
          successRate: parseFloat(tokenMetrics['summary']?.['overview']?.['successRate'] || '0'),
          averageResponseTime: parseInt(tokenMetrics['summary']?.['performance']?.['averageLatency'] || '0'),
          methodStats: tokenMetrics['summary']?.['errors']?.['errorsByType'] || {}
        }
      },
      checks: {
        cache: {
          status: (cacheStats['total_entries'] || 0) >= 0 ? 'pass' : 'fail',
          message: `${cacheStats['total_entries'] || 0} cached credentials`
        },
        tokenRefresh: {
          status: parseFloat(tokenMetrics['summary']?.['overview']?.['successRate'] || '0') >= 90 ? 'pass' : 'warn',
          message: `${tokenMetrics['summary']?.['overview']?.['successRate'] || '0%'} success rate`
        },
        database: {
          status: 'pass',
          message: `${activeInstances.length} active instances`
        }
      }
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      service: 'slack',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      error: /** @type {Error} */ (error).message,
      healthScore: 0
    };
  }
}

/**
 * Calculate overall health score
 * @param {Object} cacheStats - Cache statistics
 * @param {Object} tokenMetrics - Token metrics
 * @param {Array<Object>} activeInstances - Active instances
 * @returns {number} Health score (0-100)
 */
function calculateHealthScore(cacheStats, tokenMetrics, activeInstances) {
  // Cast parameters to allow property access
  const cache = /** @type {Record<string, any>} */ (cacheStats);
  const metrics = /** @type {Record<string, any>} */ (tokenMetrics);
  let score = 100;
  
  // Deduct points for cache issues
  if ((cache['expired_entries'] || 0) > (cache['total_entries'] || 0) * 0.1) {
    score -= 10; // Too many expired entries
  }
  
  // Deduct points for low token success rate
  const successRate = parseFloat(metrics['summary']?.['overview']?.['successRate'] || '0');
  if (successRate < 90) {
    score -= 20;
  } else if (successRate < 95) {
    score -= 10;
  }
  
  // Deduct points for high response time
  const avgResponseTime = parseInt(metrics['summary']?.['performance']?.['averageLatency'] || '0');
  if (avgResponseTime > 5000) {
    score -= 15;
  } else if (avgResponseTime > 3000) {
    score -= 5;
  }
  
  // Deduct points for no active instances (if this is unexpected)
  if (activeInstances.length === 0) {
    score -= 5;
  }
  
  return Math.max(0, score);
}

/**
 * Get basic health status (lightweight)
 * @returns {Object} Basic health status
 */
function getBasicHealthStatus() {
  return {
    status: 'healthy',
    service: 'slack',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  healthCheck,
  getHealthStatus,
  getBasicHealthStatus
};