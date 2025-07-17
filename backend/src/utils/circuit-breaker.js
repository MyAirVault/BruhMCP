/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring service health and failing fast
 */

/**
 * Circuit Breaker States
 */
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Service is down, fail fast
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back
};

/**
 * Circuit Breaker class
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 30000; // 30 seconds
    this.halfOpenMaxCalls = options.halfOpenMaxCalls || 3;
    this.successThreshold = options.successThreshold || 2;
    
    // State management
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    this.halfOpenCalls = 0;
    
    // Metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      circuitOpenCount: 0,
      lastStateChange: Date.now()
    };
    
    // Callbacks
    this.onStateChange = options.onStateChange || (() => {});
    this.onSuccess = options.onSuccess || (() => {});
    this.onFailure = options.onFailure || (() => {});
    
    console.log(`🔌 Circuit breaker initialized: ${this.name}`);
  }
  
  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @param {...any} args - Arguments to pass to function
   * @returns {Promise} Result of function execution
   */
  async execute(fn, ...args) {
    this.metrics.totalCalls++;
    
    // Check if circuit is open
    if (this.state === CIRCUIT_STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
        error.circuitBreakerState = this.state;
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
        error.circuitBreakerState = this.state;
        throw error;
      }
      this.halfOpenCalls++;
    }
    
    try {
      const result = await fn(...args);
      this.onCallSuccess();
      return result;
    } catch (error) {
      this.onCallFailure(error);
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
   * @param {string} newState - New state to set
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
   * @returns {Object} Current status
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
   * @returns {Object} Health assessment
   */
  getHealthAssessment() {
    const status = this.getStatus();
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
   * @param {string} state - State to force
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
    this.breakers = new Map();
  }
  
  /**
   * Create or get a circuit breaker
   * @param {string} name - Circuit breaker name
   * @param {Object} options - Circuit breaker options
   * @returns {CircuitBreaker} Circuit breaker instance
   */
  getOrCreate(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ ...options, name }));
    }
    return this.breakers.get(name);
  }
  
  /**
   * Get circuit breaker by name
   * @param {string} name - Circuit breaker name
   * @returns {CircuitBreaker|null} Circuit breaker instance or null
   */
  get(name) {
    return this.breakers.get(name) || null;
  }
  
  /**
   * Get all circuit breakers
   * @returns {Map} All circuit breakers
   */
  getAll() {
    return new Map(this.breakers);
  }
  
  /**
   * Get status of all circuit breakers
   * @returns {Object} Status of all circuit breakers
   */
  getAllStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }
  
  /**
   * Get health assessment of all circuit breakers
   * @returns {Object} Health assessment of all circuit breakers
   */
  getAllHealthAssessments() {
    const assessments = {};
    for (const [name, breaker] of this.breakers) {
      assessments[name] = breaker.getHealthAssessment();
    }
    return assessments;
  }
  
  /**
   * Remove circuit breaker
   * @param {string} name - Circuit breaker name
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