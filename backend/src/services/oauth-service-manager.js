/**
 * OAuth Service Manager
 * Manages dynamic starting and stopping of OAuth service
 */

import oauthApp from '../oauth-service/index.js';
import loggingService from './logging/loggingService.js';
import circuitBreakerManager from '../utils/circuit-breaker.js';
import connectionPoolManager from '../utils/connection-pool.js';

/**
 * @typedef {Object} HealthStatus
 * @property {'healthy'|'degraded'|'unhealthy'} status - Health status
 * @property {string} [reason] - Reason for status
 * @property {number} uptime - Service uptime in milliseconds
 * @property {Object<string, EndpointResult>} endpoints - Endpoint health results
 * @property {number} [healthRatio] - Ratio of healthy endpoints
 * @property {number} [port] - Service port
 * @property {number} [pid] - Process ID
 */

/**
 * @typedef {Object} EndpointResult
 * @property {'healthy'|'unhealthy'} status - Endpoint status
 * @property {number|null} statusCode - HTTP status code
 * @property {number|null} responseTime - Response time in milliseconds
 * @property {string|null} error - Error message if any
 */

/**
 * @typedef {Object} HealthRecommendation
 * @property {'high'|'medium'|'low'} priority - Recommendation priority
 * @property {string} action - Recommended action
 * @property {string} message - Recommendation message
 * @property {Object} [details] - Additional details
 */

/**
 * @typedef {Object} ServiceStatus
 * @property {boolean} isRunning - Whether service is running
 * @property {number|string} port - Service port
 * @property {string} url - Service URL
 * @property {HealthStatus} health - Health status
 * @property {HealthRecommendation[]} recommendations - Health recommendations
 * @property {Object} circuitBreaker - Circuit breaker status
 * @property {Object} connectionPool - Connection pool status
 * @property {string|null} startTime - Service start time
 * @property {number} uptime - Service uptime
 */

/**
 * @typedef {Error} CustomError
 * @property {number} [status] - HTTP status code
 * @property {Response} [response] - HTTP response object
 */

class OAuthServiceManager {
  constructor() {
    /** @type {import('http').Server|null} */
    this.server = null;
    /** @type {boolean} */
    this.isRunning = false;
    /** @type {number} */
    this.port = Number(process.env.OAUTH_SERVICE_PORT) || 3001;
    /** @type {NodeJS.Timeout|null} */
    this.healthMonitorInterval = null;
    /** @type {number|null} */
    this.startTime = null;
    
    // Initialize circuit breaker for OAuth service calls
    /** @type {import('../utils/circuit-breaker.js').CircuitBreaker} */
    this.circuitBreaker = circuitBreakerManager.getOrCreate('oauth-service', {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      halfOpenMaxCalls: 3,
      successThreshold: 2,
      onStateChange: (prevState, newState) => {
        console.log(`🔄 OAuth service circuit breaker: ${prevState} → ${newState}`);
        loggingService.logError(new Error(`OAuth service circuit breaker state changed: ${prevState} → ${newState}`), {
          operation: 'oauth_service_circuit_breaker_state_change',
          critical: false
        });
      },
      onFailure: (error) => {
        loggingService.logError(error, {
          operation: 'oauth_service_circuit_breaker',
          critical: false
        });
      }
    });

    // Initialize connection pool for OAuth service calls
    /** @type {import('../utils/connection-pool.js').ConnectionPool} */
    this.connectionPool = connectionPoolManager.getOrCreate('oauth-service', {
      maxSockets: 10,
      maxFreeSockets: 5,
      maxConcurrentRequests: 20,
      timeout: 10000,
      keepAlive: true,
      maxRetries: 3,
      retryDelay: 1000
    });
  }

  /**
   * Start OAuth service if not already running
   * @returns {Promise<boolean>} true if started successfully
   */
  async startService() {
    if (this.isRunning) {
      console.log('🔐 OAuth service already running');
      return true;
    }

    try {
      this.server = oauthApp.listen(this.port, () => {
        console.log(`🔐 OAuth service started on port ${this.port}`);
        console.log(`📚 OAuth health check: http://localhost:${this.port}/health`);
        this.isRunning = true;
        this.startTime = Date.now();
      });

      // Start health monitoring
      this.startHealthMonitoring();

      return true;
    } catch (error) {
      console.error('❌ Failed to start OAuth service:', error);
      loggingService.logError(error, {
        operation: 'oauth_service_start',
        critical: false
      });
      return false;
    }
  }

  /**
   * Stop OAuth service if running
   * @returns {Promise<boolean>} true if stopped successfully
   */
  async stopService() {
    if (!this.isRunning || !this.server) {
      console.log('🔐 OAuth service not running');
      return true;
    }

    try {
      // Stop health monitoring
      this.stopHealthMonitoring();

      await new Promise((resolve) => {
        this.server?.close(() => {
          console.log('✅ OAuth service stopped');
          this.isRunning = false;
          this.server = null;
          this.startTime = null;
          resolve(undefined);
        });
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to stop OAuth service:', error);
      loggingService.logError(error, {
        operation: 'oauth_service_stop',
        critical: false
      });
      return false;
    }
  }

  /**
   * Check if OAuth service is running
   * @returns {boolean} true if running
   */
  isServiceRunning() {
    return this.isRunning;
  }

  /**
   * Get OAuth service URL
   * @returns {string} OAuth service URL
   */
  getServiceUrl() {
    return `http://localhost:${this.port}`;
  }

  /**
   * Execute OAuth service call through circuit breaker
   * @param {(...args: unknown[]) => Promise<unknown>} fn - Function to execute
   * @param {...unknown} args - Arguments to pass to function
   * @returns {Promise<unknown>} Result of function execution
   */
  async executeWithCircuitBreaker(fn, ...args) {
    return this.circuitBreaker.execute(fn, ...args);
  }

  /**
   * Make HTTP request to OAuth service with circuit breaker and connection pooling
   * @param {string} path - API path
   * @param {RequestInit} options - Request options
   * @returns {Promise<Response>} HTTP response
   */
  async makeOAuthServiceRequest(path, options = {}) {
    const url = `${this.getServiceUrl()}${path}`;
    
    return /** @type {Promise<Response>} */ (this.executeWithCircuitBreaker(async () => {
      // Use connection pool for the request
      const response = await this.connectionPool.fetch(url, {
        ...options
      });
      
      if (!response.ok) {
        const error = new Error(`OAuth service request failed: ${response.status} ${response.statusText}`);
        // Add custom properties to the error
        Object.assign(error, {
          status: response.status,
          response: response
        });
        throw /** @type {CustomError} */ (error);
      }
      
      return response;
    }));
  }

  /**
   * Ensure OAuth service is running for an operation
   * @returns {Promise<boolean>} true if service is available
   */
  async ensureServiceRunning() {
    if (this.isRunning) {
      return true;
    }

    console.log('🔐 Starting OAuth service for operation...');
    return await this.startService();
  }

  /**
   * Check service health by testing endpoints
   * @returns {Promise<HealthStatus>} Health status
   */
  async checkServiceHealth() {
    if (!this.isRunning) {
      return {
        status: 'unhealthy',
        reason: 'Service not running',
        uptime: 0,
        endpoints: {}
      };
    }

    const serviceUrl = this.getServiceUrl();
    const endpoints = {
      health: `${serviceUrl}/health`
    };

    /** @type {Object<string, EndpointResult>} */
    const endpointResults = {};
    let healthyEndpoints = 0;
    
    // Test each endpoint
    for (const [name, url] of Object.entries(endpoints)) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, {
          method: 'GET'
        });
        const responseTime = Date.now() - startTime;
        
        endpointResults[name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          responseTime,
          error: null
        };
        
        if (response.ok) {
          healthyEndpoints++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        endpointResults[name] = {
          status: 'unhealthy',
          statusCode: null,
          responseTime: null,
          error: errorMessage
        };
      }
    }

    const totalEndpoints = Object.keys(endpoints).length;
    const healthRatio = healthyEndpoints / totalEndpoints;
    const uptime = this.startTime ? Date.now() - this.startTime : 0;

    return {
      status: healthRatio >= 0.8 ? 'healthy' : healthRatio >= 0.5 ? 'degraded' : 'unhealthy',
      uptime,
      endpoints: endpointResults,
      healthRatio,
      port: this.port,
      pid: process.pid
    };
  }

  /**
   * Restart service if unhealthy
   * @returns {Promise<boolean>} true if restart was successful
   */
  async restartIfUnhealthy() {
    const health = await this.checkServiceHealth();
    
    if (health.status === 'unhealthy') {
      console.log('🔄 OAuth service unhealthy, attempting restart...');
      
      const stopSuccess = await this.stopService();
      if (!stopSuccess) {
        console.error('❌ Failed to stop unhealthy OAuth service');
        return false;
      }
      
      // Wait a moment before restart
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const startSuccess = await this.startService();
      if (startSuccess) {
        console.log('✅ OAuth service restarted successfully');
        return true;
      } else {
        console.error('❌ Failed to restart OAuth service');
        return false;
      }
    }
    
    return true; // Service was healthy, no restart needed
  }

  /**
   * Start health monitoring with periodic checks
   */
  startHealthMonitoring() {
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
    }
    
    // Check health every 2 minutes
    this.healthMonitorInterval = setInterval(async () => {
      try {
        await this.monitorServiceHealth();
      } catch (error) {
        console.error('❌ Health monitoring error:', error);
        loggingService.logError(error, {
          operation: 'oauth_service_health_monitor',
          critical: false
        });
      }
    }, 2 * 60 * 1000);
    
    console.log('📊 OAuth service health monitoring started');
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
      this.healthMonitorInterval = null;
      console.log('📊 OAuth service health monitoring stopped');
    }
  }

  /**
   * Perform health monitoring check
   */
  async monitorServiceHealth() {
    const health = await this.checkServiceHealth();
    
    // Log health status
    const uptimeHours = (health.uptime / (1000 * 60 * 60)).toFixed(2);
    console.log(`📊 OAuth service health: ${health.status} (uptime: ${uptimeHours}h)`);
    
    // Check for issues
    if (health.status === 'unhealthy') {
      console.warn('⚠️  OAuth service unhealthy:', health);
      
      // Attempt restart
      const restartSuccess = await this.restartIfUnhealthy();
      if (!restartSuccess) {
        loggingService.logError(new Error('OAuth service restart failed'), {
          operation: 'oauth_service_restart',
          critical: true,
          details: health
        });
      }
    } else if (health.status === 'degraded') {
      console.warn('⚠️  OAuth service degraded:', health);
      loggingService.logError(new Error('OAuth service performance degraded'), {
        operation: 'oauth_service_degraded',
        critical: false,
        details: health
      });
    }
  }

  /**
   * Get health recommendations based on current status
   * @returns {Promise<HealthRecommendation[]>} Array of recommendations
   */
  async getHealthRecommendations() {
    const health = await this.checkServiceHealth();
    /** @type {HealthRecommendation[]} */
    const recommendations = [];
    
    if (!this.isRunning) {
      recommendations.push({
        priority: 'high',
        action: 'start_service',
        message: 'OAuth service is not running and should be started'
      });
      return recommendations;
    }
    
    if (health.status === 'unhealthy') {
      recommendations.push({
        priority: 'high',
        action: 'restart_service',
        message: 'Service is unhealthy and requires restart'
      });
    }
    
    // Check endpoint-specific issues
    for (const [endpoint, result] of Object.entries(health.endpoints)) {
      if (result.status === 'unhealthy') {
        recommendations.push({
          priority: 'medium',
          action: 'check_endpoint',
          message: `Endpoint ${endpoint} is not responding properly`,
          details: result
        });
      } else if (result.responseTime && result.responseTime > 3000) {
        recommendations.push({
          priority: 'low',
          action: 'optimize_performance',
          message: `Endpoint ${endpoint} has high response time (${result.responseTime ?? 0}ms)`,
          details: result
        });
      }
    }
    
    // Check uptime
    const uptimeHours = health.uptime / (1000 * 60 * 60);
    if (uptimeHours > 24 * 7) { // Running for more than a week
      recommendations.push({
        priority: 'low',
        action: 'scheduled_restart',
        message: `Service has been running for ${uptimeHours.toFixed(1)} hours, consider scheduled restart`
      });
    }
    
    return recommendations;
  }

  /**
   * Get comprehensive service status
   * @returns {Promise<ServiceStatus>} Complete service status
   */
  async getServiceStatus() {
    const health = await this.checkServiceHealth();
    const recommendations = await this.getHealthRecommendations();
    const circuitBreakerStatus = this.circuitBreaker.getStatus();
    const circuitBreakerHealth = this.circuitBreaker.getHealthAssessment();
    const connectionPoolStatus = this.connectionPool.getStatus();
    const connectionPoolHealth = this.connectionPool.getHealthAssessment();
    
    return {
      isRunning: this.isRunning,
      port: this.port,
      url: this.getServiceUrl(),
      health,
      recommendations,
      circuitBreaker: {
        status: circuitBreakerStatus,
        health: circuitBreakerHealth
      },
      connectionPool: {
        status: connectionPoolStatus,
        health: connectionPoolHealth
      },
      startTime: this.startTime ? new Date(this.startTime).toISOString() : null,
      uptime: health.uptime
    };
  }

  /**
   * Cleanup resources (connection pool, circuit breaker, etc.)
   */
  async cleanup() {
    console.log('🧹 Cleaning up OAuth service manager resources');
    
    // Stop health monitoring
    this.stopHealthMonitoring();
    
    // Close connection pool
    await this.connectionPool.close();
    
    // Reset circuit breaker
    this.circuitBreaker.reset();
    
    console.log('✅ OAuth service manager cleanup completed');
  }
}

// Export singleton instance
export default new OAuthServiceManager();