/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms: number): Promise<void>;
/**
 * @typedef {Object} RetryOptions
 * @property {number} [maxAttempts] - Maximum number of attempts
 * @property {number} [baseDelay] - Base delay in milliseconds
 * @property {number} [maxDelay] - Maximum delay in milliseconds
 * @property {number} [backoffFactor] - Backoff multiplier
 * @property {boolean} [jitter] - Add jitter to delays
 */
/**
 * Retry function with exponential backoff
 * @template T
 * @param {() => Promise<T>} fn - Function to retry
 * @param {RetryOptions} [options] - Retry options
 * @returns {Promise<T>}
 */
export function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * @template T
 * @typedef {Object} ExecutionResult
 * @property {T} result - Function result
 * @property {number} duration - Execution duration in milliseconds
 */
/**
 * Measure execution time of a function
 * @template T
 * @param {() => Promise<T>} fn - Function to measure
 * @returns {Promise<ExecutionResult<T>>}
 */
export function measureExecutionTime<T>(fn: () => Promise<T>): Promise<ExecutionResult<T>>;
/**
 * Execute function with timeout
 * @template T
 * @param {Promise<T>} promise - Promise to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} [timeoutMessage] - Custom timeout message
 * @returns {Promise<T>}
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
/**
 * Debounce function execution
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} [immediate] - Execute immediately on first call
 * @returns {T} Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number, immediate?: boolean): T;
/**
 * Throttle function execution
 * @template {(...args: unknown[]) => unknown} T
 * @param {T} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {T} Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): T;
/**
 * Execute functions in parallel with concurrency limit
 * @template T, R
 * @param {Array<T>} items - Items to process
 * @param {(item: T) => Promise<R>} fn - Function to execute for each item
 * @param {number} [concurrency] - Maximum concurrent executions
 * @returns {Promise<Array<R>>} Results array
 */
export function parallelLimit<T, R>(items: Array<T>, fn: (item: T) => Promise<R>, concurrency?: number): Promise<Array<R>>;
/**
 * @typedef {Object} CircuitBreakerOptions
 * @property {number} [failureThreshold] - Number of failures before opening circuit
 * @property {number} [resetTimeout] - Time before attempting to close circuit
 * @property {number} [monitoringPeriod] - Period for monitoring failures
 */
/**
 * Create a circuit breaker
 * @template {(...args: unknown[]) => Promise<unknown>} T
 * @param {T} fn - Function to wrap
 * @param {CircuitBreakerOptions} [options] - Circuit breaker options
 * @returns {T} Circuit breaker wrapped function
 */
export function circuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(fn: T, options?: CircuitBreakerOptions): T;
export type RetryOptions = {
    /**
     * - Maximum number of attempts
     */
    maxAttempts?: number | undefined;
    /**
     * - Base delay in milliseconds
     */
    baseDelay?: number | undefined;
    /**
     * - Maximum delay in milliseconds
     */
    maxDelay?: number | undefined;
    /**
     * - Backoff multiplier
     */
    backoffFactor?: number | undefined;
    /**
     * - Add jitter to delays
     */
    jitter?: boolean | undefined;
};
export type ExecutionResult<T> = {
    /**
     * - Function result
     */
    result: T;
    /**
     * - Execution duration in milliseconds
     */
    duration: number;
};
export type CircuitBreakerOptions = {
    /**
     * - Number of failures before opening circuit
     */
    failureThreshold?: number | undefined;
    /**
     * - Time before attempting to close circuit
     */
    resetTimeout?: number | undefined;
    /**
     * - Period for monitoring failures
     */
    monitoringPeriod?: number | undefined;
};
//# sourceMappingURL=async.d.ts.map