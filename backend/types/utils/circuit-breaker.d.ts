export default circuitBreakerManager;
/**
 * Circuit Breaker class
 */
export class CircuitBreaker {
    constructor(options?: {});
    name: any;
    failureThreshold: any;
    resetTimeout: any;
    monitoringPeriod: any;
    halfOpenMaxCalls: any;
    successThreshold: any;
    state: string;
    failureCount: number;
    successCount: number;
    lastFailureTime: number | null;
    nextAttempt: any;
    halfOpenCalls: number;
    metrics: {
        totalCalls: number;
        successfulCalls: number;
        failedCalls: number;
        circuitOpenCount: number;
        lastStateChange: number;
    };
    onStateChange: any;
    onSuccess: any;
    onFailure: any;
    /**
     * Execute a function with circuit breaker protection
     * @param {Function} fn - Function to execute
     * @param {...any} args - Arguments to pass to function
     * @returns {Promise} Result of function execution
     */
    execute(fn: Function, ...args: any[]): Promise<any>;
    /**
     * Handle successful function call
     */
    onCallSuccess(): void;
    /**
     * Handle failed function call
     * @param {Error} error - The error that occurred
     */
    onCallFailure(error: Error): void;
    /**
     * Set circuit breaker state
     * @param {string} newState - New state to set
     */
    setState(newState: string): void;
    /**
     * Get current circuit breaker status
     * @returns {Object} Current status
     */
    getStatus(): Object;
    /**
     * Get health assessment
     * @returns {Object} Health assessment
     */
    getHealthAssessment(): Object;
    /**
     * Get recommendation based on current state
     * @returns {string} Recommendation
     */
    getRecommendation(): string;
    /**
     * Force circuit breaker to specific state (for testing/maintenance)
     * @param {string} state - State to force
     */
    forceState(state: string): void;
    /**
     * Reset circuit breaker to initial state
     */
    reset(): void;
}
/**
 * Circuit Breaker Manager for managing multiple circuit breakers
 */
export class CircuitBreakerManager {
    breakers: Map<any, any>;
    /**
     * Create or get a circuit breaker
     * @param {string} name - Circuit breaker name
     * @param {Object} options - Circuit breaker options
     * @returns {CircuitBreaker} Circuit breaker instance
     */
    getOrCreate(name: string, options?: Object): CircuitBreaker;
    /**
     * Get circuit breaker by name
     * @param {string} name - Circuit breaker name
     * @returns {CircuitBreaker|null} Circuit breaker instance or null
     */
    get(name: string): CircuitBreaker | null;
    /**
     * Get all circuit breakers
     * @returns {Map} All circuit breakers
     */
    getAll(): Map<any, any>;
    /**
     * Get status of all circuit breakers
     * @returns {Object} Status of all circuit breakers
     */
    getAllStatus(): Object;
    /**
     * Get health assessment of all circuit breakers
     * @returns {Object} Health assessment of all circuit breakers
     */
    getAllHealthAssessments(): Object;
    /**
     * Remove circuit breaker
     * @param {string} name - Circuit breaker name
     */
    remove(name: string): boolean;
    /**
     * Reset all circuit breakers
     */
    resetAll(): void;
}
export namespace CIRCUIT_STATES {
    let CLOSED: string;
    let OPEN: string;
    let HALF_OPEN: string;
}
declare const circuitBreakerManager: CircuitBreakerManager;
//# sourceMappingURL=circuit-breaker.d.ts.map