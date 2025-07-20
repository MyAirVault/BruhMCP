/**
 * Health check endpoint for Google Sheets MCP service
 * Provides health status and basic service information
 * Based on Gmail MCP implementation patterns
 */

import { getSessionStatistics } from '../services/handler-sessions.js';
import { getCacheStatistics } from '../services/credential-cache.js';
import { getWatcherStatus } from '../services/credential-watcher.js';

/**
 * Health check endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function healthCheck(req, res) {
  const { instanceId } = req.params;
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'sheets-mcp',
      instanceId: instanceId,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };

    // Add detailed health information
    try {
      healthData.details = {
        sessions: getSessionStatistics(),
        cache: getCacheStatistics(),
        watcher: getWatcherStatus(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      };
    } catch (detailError) {
      console.warn('⚠️  Could not fetch health details:', detailError.message);
      healthData.details = { error: 'Could not fetch detailed health information' };
    }

    res.json(healthData);

  } catch (error) {
    console.error('❌ Health check error:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'sheets-mcp',
      instanceId: instanceId,
      error: error.message
    });
  }
}

export default healthCheck;