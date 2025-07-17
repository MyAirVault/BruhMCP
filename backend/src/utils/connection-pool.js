/**
 * HTTP Connection Pool Implementation
 * Manages HTTP connections for improved performance and resource management
 */

import { Agent } from 'http';
import { Agent as HttpsAgent } from 'https';

/**
 * HTTP Connection Pool Manager
 */
class ConnectionPool {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.maxSockets = options.maxSockets || 10;
    this.maxFreeSockets = options.maxFreeSockets || 5;
    this.timeout = options.timeout || 10000;
    this.keepAlive = options.keepAlive !== false;
    this.keepAliveMsecs = options.keepAliveMsecs || 1000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Create HTTP and HTTPS agents
    this.httpAgent = new Agent({
      keepAlive: this.keepAlive,
      keepAliveMsecs: this.keepAliveMsecs,
      maxSockets: this.maxSockets,
      maxFreeSockets: this.maxFreeSockets,
      timeout: this.timeout
    });
    
    this.httpsAgent = new HttpsAgent({
      keepAlive: this.keepAlive,
      keepAliveMsecs: this.keepAliveMsecs,
      maxSockets: this.maxSockets,
      maxFreeSockets: this.maxFreeSockets,
      timeout: this.timeout
    });
    
    // Connection metrics
    this.metrics = {
      totalRequests: 0,
      activeConnections: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryCount: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
      createdAt: Date.now()
    };
    
    // Queue for managing concurrent requests
    this.requestQueue = [];
    this.maxConcurrentRequests = options.maxConcurrentRequests || 50;
    this.activeRequests = 0;
    
    console.log(`🔗 Connection pool initialized: ${this.name} (max: ${this.maxSockets} sockets)`);
  }
  
  /**
   * Execute HTTP request with connection pooling
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Response>} HTTP response
   */
  async fetch(url, options = {}) {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = Date.now();
    
    // Check if we're at max concurrent requests
    if (this.activeRequests >= this.maxConcurrentRequests) {
      await this.waitForAvailableSlot();
    }
    
    this.activeRequests++;
    this.metrics.activeConnections++;
    
    const startTime = Date.now();
    
    try {
      // Determine which agent to use
      const isHttps = url.startsWith('https:');
      const agent = isHttps ? this.httpsAgent : this.httpAgent;
      
      // Set up request options with connection pooling
      const requestOptions = {
        ...options,
        agent,
        timeout: options.timeout || this.timeout
      };
      
      // Execute request with retries
      const response = await this.executeWithRetries(url, requestOptions);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      return response;
      
    } catch (error) {
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      throw error;
    } finally {
      this.activeRequests--;
      this.metrics.activeConnections--;
      
      // Process next request in queue
      this.processNextRequest();
    }
  }
  
  /**
   * Execute request with retry logic
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Response>} HTTP response
   */
  async executeWithRetries(url, options) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Check if response is OK or if we should retry
        if (response.ok || !this.shouldRetry(response.status, attempt)) {
          return response;
        }
        
        // Treat non-2xx responses as errors for retry logic
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        lastError.response = response;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain errors
        if (!this.shouldRetryError(error, attempt)) {
          throw error;
        }
      }
      
      // Wait before retrying
      if (attempt < this.maxRetries) {
        this.metrics.retryCount++;
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`🔄 Retrying request to ${url} (attempt ${attempt + 1}/${this.maxRetries})`);
      }
    }
    
    throw lastError;
  }
  
  /**
   * Determine if request should be retried based on status code
   * @param {number} statusCode - HTTP status code
   * @param {number} attempt - Current attempt number
   * @returns {boolean} True if should retry
   */
  shouldRetry(statusCode, attempt) {
    if (attempt >= this.maxRetries) return false;
    
    // Retry on server errors and rate limits
    return statusCode >= 500 || statusCode === 429;
  }
  
  /**
   * Determine if request should be retried based on error
   * @param {Error} error - Request error
   * @param {number} attempt - Current attempt number
   * @returns {boolean} True if should retry
   */
  shouldRetryError(error, attempt) {
    if (attempt >= this.maxRetries) return false;
    
    // Retry on network errors
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.name === 'AbortError'
    );
  }
  
  /**
   * Wait for available request slot
   * @returns {Promise<void>}
   */
  async waitForAvailableSlot() {
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
    });
  }
  
  /**
   * Process next request in queue
   */
  processNextRequest() {
    if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const resolve = this.requestQueue.shift();
      resolve();
    }
  }
  
  /**
   * Update connection metrics
   * @param {boolean} success - Whether request was successful
   * @param {number} responseTime - Response time in milliseconds
   */
  updateMetrics(success, responseTime) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update average response time
    const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests
    );
  }
  
  /**
   * Get connection pool status
   * @returns {Object} Pool status
   */
  getStatus() {
    return {
      name: this.name,
      config: {
        maxSockets: this.maxSockets,
        maxFreeSockets: this.maxFreeSockets,
        maxConcurrentRequests: this.maxConcurrentRequests,
        timeout: this.timeout,
        keepAlive: this.keepAlive,
        maxRetries: this.maxRetries
      },
      metrics: { ...this.metrics },
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      httpAgent: {
        sockets: Object.keys(this.httpAgent.sockets).length,
        freeSockets: Object.keys(this.httpAgent.freeSockets).length,
        requests: Object.keys(this.httpAgent.requests).length
      },
      httpsAgent: {
        sockets: Object.keys(this.httpsAgent.sockets).length,
        freeSockets: Object.keys(this.httpsAgent.freeSockets).length,
        requests: Object.keys(this.httpsAgent.requests).length
      }
    };
  }
  
  /**
   * Get health assessment
   * @returns {Object} Health assessment
   */
  getHealthAssessment() {
    const status = this.getStatus();
    const uptime = Date.now() - this.metrics.createdAt;
    const successRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 0;
    
    const issues = [];
    const warnings = [];
    
    // Check success rate
    if (successRate < 95) {
      issues.push(`Low success rate: ${successRate.toFixed(2)}%`);
    } else if (successRate < 98) {
      warnings.push(`Success rate below optimal: ${successRate.toFixed(2)}%`);
    }
    
    // Check queue length
    if (this.requestQueue.length > 10) {
      issues.push(`High queue length: ${this.requestQueue.length} requests`);
    } else if (this.requestQueue.length > 5) {
      warnings.push(`Elevated queue length: ${this.requestQueue.length} requests`);
    }
    
    // Check retry rate
    const retryRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.retryCount / this.metrics.totalRequests) * 100 : 0;
    
    if (retryRate > 10) {
      issues.push(`High retry rate: ${retryRate.toFixed(2)}%`);
    } else if (retryRate > 5) {
      warnings.push(`Elevated retry rate: ${retryRate.toFixed(2)}%`);
    }
    
    // Check response time
    if (this.metrics.averageResponseTime > 5000) {
      issues.push(`High response time: ${this.metrics.averageResponseTime.toFixed(0)}ms`);
    } else if (this.metrics.averageResponseTime > 2000) {
      warnings.push(`Elevated response time: ${this.metrics.averageResponseTime.toFixed(0)}ms`);
    }
    
    return {
      healthy: issues.length === 0,
      status: issues.length > 0 ? 'unhealthy' : warnings.length > 0 ? 'degraded' : 'healthy',
      uptime,
      successRate: `${successRate.toFixed(2)}%`,
      retryRate: `${retryRate.toFixed(2)}%`,
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`,
      activeConnections: this.activeRequests,
      queuedRequests: this.requestQueue.length,
      issues,
      warnings
    };
  }
  
  /**
   * Reset connection pool metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      activeConnections: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retryCount: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
      createdAt: Date.now()
    };
    
    console.log(`🔄 Connection pool metrics reset: ${this.name}`);
  }
  
  /**
   * Close connection pool and cleanup resources
   */
  async close() {
    console.log(`🔚 Closing connection pool: ${this.name}`);
    
    // Wait for active requests to complete
    while (this.activeRequests > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Destroy agents
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    
    // Clear queue
    this.requestQueue.forEach(resolve => resolve());
    this.requestQueue = [];
    
    console.log(`✅ Connection pool closed: ${this.name}`);
  }
}

/**
 * Connection Pool Manager for managing multiple connection pools
 */
class ConnectionPoolManager {
  constructor() {
    this.pools = new Map();
  }
  
  /**
   * Get or create connection pool
   * @param {string} name - Pool name
   * @param {Object} options - Pool options
   * @returns {ConnectionPool} Connection pool instance
   */
  getOrCreate(name, options = {}) {
    if (!this.pools.has(name)) {
      this.pools.set(name, new ConnectionPool({ ...options, name }));
    }
    return this.pools.get(name);
  }
  
  /**
   * Get connection pool by name
   * @param {string} name - Pool name
   * @returns {ConnectionPool|null} Connection pool instance or null
   */
  get(name) {
    return this.pools.get(name) || null;
  }
  
  /**
   * Get all connection pools
   * @returns {Map} All connection pools
   */
  getAll() {
    return new Map(this.pools);
  }
  
  /**
   * Get status of all connection pools
   * @returns {Object} Status of all pools
   */
  getAllStatus() {
    const status = {};
    for (const [name, pool] of this.pools) {
      status[name] = pool.getStatus();
    }
    return status;
  }
  
  /**
   * Get health assessment of all connection pools
   * @returns {Object} Health assessment of all pools
   */
  getAllHealthAssessments() {
    const assessments = {};
    for (const [name, pool] of this.pools) {
      assessments[name] = pool.getHealthAssessment();
    }
    return assessments;
  }
  
  /**
   * Close and remove connection pool
   * @param {string} name - Pool name
   */
  async close(name) {
    const pool = this.pools.get(name);
    if (pool) {
      await pool.close();
      this.pools.delete(name);
    }
  }
  
  /**
   * Close all connection pools
   */
  async closeAll() {
    const closePromises = Array.from(this.pools.values()).map(pool => pool.close());
    await Promise.all(closePromises);
    this.pools.clear();
  }
}

// Export singleton instance
const connectionPoolManager = new ConnectionPoolManager();

export { ConnectionPool, ConnectionPoolManager };
export default connectionPoolManager;