/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring service health and failing fast
 */

/**
 * @typedef {'CLOSED' | 'OPEN' | 'HALF_OPEN'} CircuitState
 */

/**
 * Circuit Breaker States
 * @type {Record<string, CircuitState>}
 */
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Service is down, fail fast
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back
};

/**
 * @typedef {Object} CircuitBreakerOptions
 * @property {string} [name] - Circuit breaker name
 * @property {number} [failureThreshold] - Number of failures before opening circuit
 * @property {number} [resetTimeout] - Time to wait before attempting reset
 * @property {number} [monitoringPeriod] - Period for monitoring failures
 * @property {number} [halfOpenMaxCalls] - Maximum calls allowed in half-open state
 * @property {number} [successThreshold] - Successes needed to close circuit from half-open
 * @property {(prev: CircuitState, curr: CircuitState) => void} [onStateChange] - State change callback
 * @property {() => void} [onSuccess] - Success callback
 * @property {(error: Error) => void} [onFailure] - Failure callback
 */

/**
 * @typedef {Object} CircuitBreakerMetrics
 * @property {number} totalCalls - Total number of calls made
 * @property {number} successfulCalls - Number of successful calls
 * @property {number} failedCalls - Number of failed calls
 * @property {number} circuitOpenCount - Number of times circuit has opened
 * @property {number} lastStateChange - Timestamp of last state change
 */

/**
 * @typedef {Object} CircuitBreakerStatus
 * @property {string} name - Circuit breaker name
 * @property {CircuitState} state - Current state
 * @property {number} failureCount - Current failure count
 * @property {number} successCount - Current success count
 * @property {number} halfOpenCalls - Current half-open calls count
 * @property {number | null} nextAttempt - Next attempt timestamp
 * @property {number | null} lastFailureTime - Last failure timestamp
 * @property {CircuitBreakerMetrics} metrics - Circuit breaker metrics
 * @property {Object} config - Circuit breaker configuration
 */

/**
 * @typedef {Object} HealthAssessment
 * @property {boolean} healthy - Whether circuit is healthy
 * @property {CircuitState} state - Current state
 * @property {string} successRate - Success rate percentage
 * @property {number} uptime - Uptime in milliseconds
 * @property {number} totalCalls - Total calls made
 * @property {number} recentFailures - Recent failure count
 * @property {string} recommendation - Recommendation text
 */

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
  /**
   * @param {CircuitBreakerOptions} [options={}] - Circuit breaker options
   */
  constructor(options = {}) {
    /** @type {string} */
    this.name = options.name || 'CircuitBreaker';
    /** @type {number} */
    this.failureThreshold = options.failureThreshold || 5;
    /** @type {number} */
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    /** @type {number} */
    this.monitoringPeriod = options.monitoringPeriod || 30000; // 30 seconds
    /** @type {number} */
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    /** @type {number} */
    this.successThreshold = options.successThreshold || 2;
    
    // State management
    /** @type {CircuitState} */
    this.state = CIRCUIT_STATES.CLOSED;
    /** @type {number} */
    this.failureCount = 0;
    /** @type {number} */
    this.successCount = 0;
    /** @type {number | null} */
    this.lastFailureTime = null;
    /** @type {number | null} */
    this.nextAttempt = null;
    /** @type {number} */
    this.halfOpenCalls = 0;
    
    // Metrics
    /** @type {CircuitBreakerMetrics} */
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      circuitOpenCount: 0,
      lastStateChange: Date.now()
    };
    
    // Callbacks
    /** @type {(prev: CircuitState, curr: CircuitState) => void} */
    this.onStateChange = options.onStateChange || (() => {});
    /** @type {() => void} */
    this.onSuccess = options.onSuccess || (() => {});
    /** @type {(error: Error) => void} */
    this.onFailure = options.onFailure || (() => {});
    
    console.log(`🔌 Circuit breaker initialized: ${this.name}`);
  }
  
  /**
   * Execute a function with circuit breaker protection
   * @template T
   * @param {(...args: unknown[]) => Promise<T>} fn - Function to execute
   * @param {...unknown} args - Arguments to pass to function
   * @returns {Promise<T>} Result of function execution
   */
  async execute(fn, ...args) {
    this.metrics.totalCalls++;
    
    // Check if circuit is open
    if (this.state === CIRCUIT_STATES.OPEN) {
      if (Date.now() < /** @type {number} */ (this.nextAttempt)) {
        const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
        /** @type {Error & {circuitBreakerState: CircuitState}} */ (error).circuitBreakerState = this.state;
        throw error;
      } else {
        // Try to transition to half-open
        this.setState(CIRCUIT_STATES.HALF_OPEN);
      }
    }
    
    // Check half-open call limit
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        const error = new Error(`Circuit breaker is HALF_OPEN and call limit reached for ${this.name}`);
        /** @type {Error & {circuitBreakerState: CircuitState}} */ (error).circuitBreakerState = this.state;
        throw error;
      }
      this.halfOpenCalls++;
    }
    
    try {
      const result = await fn(...args);
      this.onCallSuccess();
      return result;
    } catch (error) {
      this.onCallFailure(/** @type {Error} */ (error));
      throw error;
    }
  }
  
  /**
   * Handle successful function call
   */
  onCallSuccess() {
    this.metrics.successfulCalls++;
    this.failureCount = 0;
    this.successCount++;
    
    this.onSuccess();
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      if (this.successCount >= this.successThreshold) {
        this.setState(CIRCUIT_STATES.CLOSED);
      }
    }
    
    console.log(`✅ Circuit breaker success: ${this.name} (state: ${this.state})`);
  }
  
  /**
   * Handle failed function call
   * @param {Error} error - The error that occurred
   */
  onCallFailure(error) {
    this.metrics.failedCalls++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    this.onFailure(error);
    
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      // Immediately open circuit if half-open call fails
      this.setState(CIRCUIT_STATES.OPEN);
    } else if (this.state === CIRCUIT_STATES.CLOSED) {
      // Check if we should open the circuit
      if (this.failureCount >= this.failureThreshold) {
        this.setState(CIRCUIT_STATES.OPEN);
      }
    }
    
    console.log(`❌ Circuit breaker failure: ${this.name} (state: ${this.state}, failures: ${this.failureCount})`);
  }
  
  /**
   * Set circuit breaker state
   * @param {CircuitState} newState - New state to set
   */
  setState(newState) {
    const previousState = this.state;
    this.state = newState;
    this.metrics.lastStateChange = Date.now();
    
    if (newState === CIRCUIT_STATES.OPEN) {
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.metrics.circuitOpenCount++;
      this.halfOpenCalls = 0;
      this.successCount = 0;
    } else if (newState === CIRCUIT_STATES.HALF_OPEN) {
      this.halfOpenCalls = 0;
      this.successCount = 0;
    } else if (newState === CIRCUIT_STATES.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenCalls = 0;
      this.nextAttempt = null;
    }
    
    if (previousState !== newState) {
      console.log(`🔄 Circuit breaker state change: ${this.name} (${previousState} → ${newState})`);
      this.onStateChange(previousState, newState);
    }
  }
  
  /**
   * Get current circuit breaker status
   * @returns {CircuitBreakerStatus} Current status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      halfOpenCalls: this.halfOpenCalls,
      nextAttempt: this.nextAttempt,
      lastFailureTime: this.lastFailureTime,
      metrics: { ...this.metrics },
      config: {
        failureThreshold: this.failureThreshold,
        resetTimeout: this.resetTimeout,
        monitoringPeriod: this.monitoringPeriod,
        halfOpenMaxCalls: this.halfOpenMaxCalls,
        successThreshold: this.successThreshold
      }
    };
  }
  
  /**
   * Get health assessment
   * @returns {HealthAssessment} Health assessment
   */
  getHealthAssessment() {
    const uptime = Date.now() - this.metrics.lastStateChange;
    const successRate = this.metrics.totalCalls > 0 ? 
      (this.metrics.successfulCalls / this.metrics.totalCalls) * 100 : 0;
    
    return {
      healthy: this.state === CIRCUIT_STATES.CLOSED,
      state: this.state,
      successRate: successRate.toFixed(2) + '%',
      uptime: uptime,
      totalCalls: this.metrics.totalCalls,
      recentFailures: this.failureCount,
      recommendation: this.getRecommendation()
    };
  }
  
  /**
   * Get recommendation based on current state
   * @returns {string} Recommendation
   */
  getRecommendation() {
    switch (this.state) {
      case CIRCUIT_STATES.OPEN:
        return 'Service is unavailable. Check service health and wait for circuit to reset.';
      case CIRCUIT_STATES.HALF_OPEN:
        return 'Service is being tested. Monitor closely for recovery.';
      case CIRCUIT_STATES.CLOSED:
        if (this.failureCount > 0) {
          return 'Service is healthy but has recent failures. Monitor for patterns.';
        }
        return 'Service is healthy and operating normally.';
      default:
        return 'Unknown state. Check circuit breaker configuration.';
    }
  }
  
  /**
   * Force circuit breaker to specific state (for testing/maintenance)
   * @param {CircuitState} state - State to force
   */
  forceState(state) {
    if (Object.values(CIRCUIT_STATES).includes(state)) {
      console.log(`🔧 Forcing circuit breaker ${this.name} to state: ${state}`);
      this.setState(state);
    } else {
      throw new Error(`Invalid circuit breaker state: ${state}`);
    }
  }
  
  /**
   * Reset circuit breaker to initial state
   */
  reset() {
    console.log(`🔄 Resetting circuit breaker: ${this.name}`);
    this.setState(CIRCUIT_STATES.CLOSED);
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      circuitOpenCount: 0,
      lastStateChange: Date.now()
    };
  }
}

/**
 * Circuit Breaker Manager for managing multiple circuit breakers
 */
class CircuitBreakerManager {
  constructor() {
    /** @type {Map<string, CircuitBreaker>} */
    this.breakers = new Map();
  }
  
  /**
   * Create or get a circuit breaker
   * @param {string} name - Circuit breaker name
   * @param {CircuitBreakerOptions} [options={}] - Circuit breaker options
   * @returns {CircuitBreaker} Circuit breaker instance
   */
  getOrCreate(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ ...options, name }));
    }
    // TypeScript knows this exists because we just set it above if it didn't exist
    return /** @type {CircuitBreaker} */ (this.breakers.get(name));
  }
  
  /**
   * Get circuit breaker by name
   * @param {string} name - Circuit breaker name
   * @returns {CircuitBreaker | null} Circuit breaker instance or null
   */
  get(name) {
    return this.breakers.get(name) || null;
  }
  
  /**
   * Get all circuit breakers
   * @returns {Map<string, CircuitBreaker>} All circuit breakers
   */
  getAll() {
    return new Map(this.breakers);
  }
  
  /**
   * Get status of all circuit breakers
   * @returns {Record<string, CircuitBreakerStatus>} Status of all circuit breakers
   */
  getAllStatus() {
    /** @type {Record<string, CircuitBreakerStatus>} */
    const status = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }
  
  /**
   * Get health assessment of all circuit breakers
   * @returns {Record<string, HealthAssessment>} Health assessment of all circuit breakers
   */
  getAllHealthAssessments() {
    /** @type {Record<string, HealthAssessment>} */
    const assessments = {};
    for (const [name, breaker] of this.breakers) {
      assessments[name] = breaker.getHealthAssessment();
    }
    return assessments;
  }
  
  /**
   * Remove circuit breaker
   * @param {string} name - Circuit breaker name
   * @returns {boolean} True if circuit breaker was removed
   */
  remove(name) {
    return this.breakers.delete(name);
  }
  
  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Export singleton instance
const circuitBreakerManager = new CircuitBreakerManager();

export { CircuitBreaker, CircuitBreakerManager, CIRCUIT_STATES };
export default circuitBreakerManager;