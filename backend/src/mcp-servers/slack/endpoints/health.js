/**
 * Health check endpoint for Slack MCP service
 * Provides service health status and metrics
 */

import { getCacheStatistics } from '../services/credentialCache.js';
import { getAggregatedTokenMetrics } from '../utils/tokenMetrics.js';
import { getActiveSlackInstances } from '../services/database.js';

/**
 * Basic health check function for Slack MCP service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health status object
 */
export function healthCheck(serviceConfig) {
  return {
    status: 'healthy',
    service: serviceConfig.name,
    displayName: serviceConfig.displayName,
    version: serviceConfig.version,
    timestamp: new Date().toISOString(),
    authType: serviceConfig.authType,
    scopes: serviceConfig.scopes || []
  };
}

/**
 * Get detailed health status for Slack MCP service
 * @returns {Object} Health status object
 */
export async function getHealthStatus() {
  try {
    // Get cache statistics
    const cacheStats = getCacheStatistics();
    
    // Get token metrics
    const tokenMetrics = getAggregatedTokenMetrics();
    
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
          totalEntries: cacheStats.total_entries,
          expiredEntries: cacheStats.expired_entries,
          hitRate: cacheStats.cache_hit_rate_last_hour,
          memoryUsage: cacheStats.memory_usage_mb
        },
        tokenMetrics: {
          totalRefreshes: tokenMetrics.totalRefreshes,
          successRate: tokenMetrics.successRate,
          averageResponseTime: tokenMetrics.averageResponseTime,
          methodStats: tokenMetrics.methodStats
        }
      },
      checks: {
        cache: {
          status: cacheStats.total_entries >= 0 ? 'pass' : 'fail',
          message: `${cacheStats.total_entries} cached credentials`
        },
        tokenRefresh: {
          status: tokenMetrics.successRate >= 90 ? 'pass' : 'warn',
          message: `${tokenMetrics.successRate}% success rate`
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
      error: error.message,
      healthScore: 0
    };
  }
}

/**
 * Calculate overall health score
 * @param {Object} cacheStats - Cache statistics
 * @param {Object} tokenMetrics - Token metrics
 * @param {Array} activeInstances - Active instances
 * @returns {number} Health score (0-100)
 */
function calculateHealthScore(cacheStats, tokenMetrics, activeInstances) {
  let score = 100;
  
  // Deduct points for cache issues
  if (cacheStats.expired_entries > cacheStats.total_entries * 0.1) {
    score -= 10; // Too many expired entries
  }
  
  // Deduct points for low token success rate
  if (tokenMetrics.successRate < 90) {
    score -= 20;
  } else if (tokenMetrics.successRate < 95) {
    score -= 10;
  }
  
  // Deduct points for high response time
  if (tokenMetrics.averageResponseTime > 5000) {
    score -= 15;
  } else if (tokenMetrics.averageResponseTime > 3000) {
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
export function getBasicHealthStatus() {
  return {
    status: 'healthy',
    service: 'slack',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
}