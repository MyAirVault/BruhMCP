export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export type CircuitBreakerOptions = {
    /**
     * - Circuit breaker name
     */
    name?: string | undefined;
    /**
     * - Number of failures before opening circuit
     */
    failureThreshold?: number | undefined;
    /**
     * - Time to wait before attempting reset
     */
    resetTimeout?: number | undefined;
    /**
     * - Period for monitoring failures
     */
    monitoringPeriod?: number | undefined;
    /**
     * - Maximum calls allowed in half-open state
     */
    halfOpenMaxCalls?: number | undefined;
    /**
     * - Successes needed to close circuit from half-open
     */
    successThreshold?: number | undefined;
    /**
     * - State change callback
     */
    onStateChange?: ((prev: CircuitState, curr: CircuitState) => void) | undefined;
    /**
     * - Success callback
     */
    onSuccess?: (() => void) | undefined;
    /**
     * - Failure callback
     */
    onFailure?: ((error: Error) => void) | undefined;
};
export type CircuitBreakerMetrics = {
    /**
     * - Total number of calls made
     */
    totalCalls: number;
    /**
     * - Number of successful calls
     */
    successfulCalls: number;
    /**
     * - Number of failed calls
     */
    failedCalls: number;
    /**
     * - Number of times circuit has opened
     */
    circuitOpenCount: number;
    /**
     * - Timestamp of last state change
     */
    lastStateChange: number;
};
export type CircuitBreakerStatus = {
    /**
     * - Circuit breaker name
     */
    name: string;
    /**
     * - Current state
     */
    state: CircuitState;
    /**
     * - Current failure count
     */
    failureCount: number;
    /**
     * - Current success count
     */
    successCount: number;
    /**
     * - Current half-open calls count
     */
    halfOpenCalls: number;
    /**
     * - Next attempt timestamp
     */
    nextAttempt: number | null;
    /**
     * - Last failure timestamp
     */
    lastFailureTime: number | null;
    /**
     * - Circuit breaker metrics
     */
    metrics: CircuitBreakerMetrics;
    /**
     * - Circuit breaker configuration
     */
    config: Object;
};
export type HealthAssessment = {
    /**
     * - Whether circuit is healthy
     */
    healthy: boolean;
    /**
     * - Current state
     */
    state: CircuitState;
    /**
     * - Success rate percentage
     */
    successRate: string;
    /**
     * - Uptime in milliseconds
     */
    uptime: number;
    /**
     * - Total calls made
     */
    totalCalls: number;
    /**
     * - Recent failure count
     */
    recentFailures: number;
    /**
     * - Recommendation text
     */
    recommendation: string;
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
export class CircuitBreaker {
    /**
     * @param {CircuitBreakerOptions} [options={}] - Circuit breaker options
     */
    constructor(options?: CircuitBreakerOptions | undefined);
    /** @type {string} */
    name: string;
    /** @type {number} */
    failureThreshold: number;
    /** @type {number} */
    resetTimeout: number;
    /** @type {number} */
    monitoringPeriod: number;
    /** @type {number} */
    halfOpenMaxCalls: number;
    /** @type {number} */
    successThreshold: number;
    /** @type {CircuitState} */
    state: CircuitState;
    /** @type {number} */
    failureCount: number;
    /** @type {number} */
    successCount: number;
    /** @type {number | null} */
    lastFailureTime: number | null;
    /** @type {number | null} */
    nextAttempt: number | null;
    /** @type {number} */
    halfOpenCalls: number;
    /** @type {CircuitBreakerMetrics} */
    metrics: CircuitBreakerMetrics;
    /** @type {(prev: CircuitState, curr: CircuitState) => void} */
    onStateChange: (prev: CircuitState, curr: CircuitState) => void;
    /** @type {() => void} */
    onSuccess: () => void;
    /** @type {(error: Error) => void} */
    onFailure: (error: Error) => void;
    /**
     * Execute a function with circuit breaker protection
     * @template T
     * @param {(...args: unknown[]) => Promise<T>} fn - Function to execute
     * @param {...unknown} args - Arguments to pass to function
     * @returns {Promise<T>} Result of function execution
     */
    execute<T>(fn: (...args: unknown[]) => Promise<T>, ...args: unknown[]): Promise<T>;
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
     * @param {CircuitState} newState - New state to set
     */
    setState(newState: CircuitState): void;
    /**
     * Get current circuit breaker status
     * @returns {CircuitBreakerStatus} Current status
     */
    getStatus(): CircuitBreakerStatus;
    /**
     * Get health assessment
     * @returns {HealthAssessment} Health assessment
     */
    getHealthAssessment(): HealthAssessment;
    /**
     * Get recommendation based on current state
     * @returns {string} Recommendation
     */
    getRecommendation(): string;
    /**
     * Force circuit breaker to specific state (for testing/maintenance)
     * @param {CircuitState} state - State to force
     */
    forceState(state: CircuitState): void;
    /**
     * Reset circuit breaker to initial state
     */
    reset(): void;
}
/**
 * Circuit Breaker Manager for managing multiple circuit breakers
 */
export class CircuitBreakerManager {
    /** @type {Map<string, CircuitBreaker>} */
    breakers: Map<string, CircuitBreaker>;
    /**
     * Create or get a circuit breaker
     * @param {string} name - Circuit breaker name
     * @param {CircuitBreakerOptions} [options={}] - Circuit breaker options
     * @returns {CircuitBreaker} Circuit breaker instance
     */
    getOrCreate(name: string, options?: CircuitBreakerOptions | undefined): CircuitBreaker;
    /**
     * Get circuit breaker by name
     * @param {string} name - Circuit breaker name
     * @returns {CircuitBreaker | null} Circuit breaker instance or null
     */
    get(name: string): CircuitBreaker | null;
    /**
     * Get all circuit breakers
     * @returns {Map<string, CircuitBreaker>} All circuit breakers
     */
    getAll(): Map<string, CircuitBreaker>;
    /**
     * Get status of all circuit breakers
     * @returns {Record<string, CircuitBreakerStatus>} Status of all circuit breakers
     */
    getAllStatus(): Record<string, CircuitBreakerStatus>;
    /**
     * Get health assessment of all circuit breakers
     * @returns {Record<string, HealthAssessment>} Health assessment of all circuit breakers
     */
    getAllHealthAssessments(): Record<string, HealthAssessment>;
    /**
     * Remove circuit breaker
     * @param {string} name - Circuit breaker name
     * @returns {boolean} True if circuit breaker was removed
     */
    remove(name: string): boolean;
    /**
     * Reset all circuit breakers
     */
    resetAll(): void;
}
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
export const CIRCUIT_STATES: Record<string, CircuitState>;
declare const circuitBreakerManager: CircuitBreakerManager;
export { circuitBreakerManager as default };
//# sourceMappingURL=circuitBreaker.d.ts.map