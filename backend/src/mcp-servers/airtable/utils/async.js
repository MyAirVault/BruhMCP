/**
 * Async Utilities
 * Utilities for asynchronous operations, retries, and timing
 */

const { createLogger  } = require('./logger.js');

const logger = createLogger('AsyncUtils');

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
async function retry(fn, options = {}) {
	const {
		maxAttempts = 3,
		baseDelay = 1000,
		maxDelay = 30000,
		backoffFactor = 2,
		jitter = true
	} = options;

	let lastError;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			
			if (attempt === maxAttempts) {
				throw error;
			}

			const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
			const jitterDelay = jitter ? delay + Math.random() * 0.1 * delay : delay;

			logger.debug('Retry attempt failed, waiting before retry', {
				attempt,
				maxAttempts,
				delay: jitterDelay,
				error: error instanceof Error ? error.message : String(error)
			});

			await sleep(jitterDelay);
		}
	}

	throw lastError;
}

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
async function measureExecutionTime(fn) {
	const startTime = Date.now();
	try {
		const result = await fn();
		const duration = Date.now() - startTime;
		return { result, duration };
	} catch (error) {
		const duration = Date.now() - startTime;
		if (error instanceof Error) {
			// @ts-ignore - adding custom property
			error.duration = duration;
		}
		throw error;
	}
}

/**
 * Execute function with timeout
 * @template T
 * @param {Promise<T>} promise - Promise to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} [timeoutMessage] - Custom timeout message
 * @returns {Promise<T>}
 */
async function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]);
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} [immediate] - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
	/** @type {NodeJS.Timeout | null} */
	let timeout = null;
	
	return function() {
		const args = Array.prototype.slice.call(arguments);
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(null, args);
		};
		
		const callNow = immediate && !timeout;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		
		if (callNow) func.apply(null, args);
	};
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
	/** @type {boolean} */
	let inThrottle = false;
	
	return function() {
		const args = Array.prototype.slice.call(arguments);
		if (!inThrottle) {
			func.apply(null, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Execute functions in parallel with concurrency limit
 * @template T, R
 * @param {Array<T>} items - Items to process
 * @param {(item: T) => Promise<R>} fn - Function to execute for each item
 * @param {number} [concurrency] - Maximum concurrent executions
 * @returns {Promise<Array<R>>} Results array
 */
async function parallelLimit(items, fn, concurrency = 5) {
	/** @type {Array<R>} */
	const results = [];
	/** @type {Array<Promise<R>>} */
	const executing = [];

	for (const item of items) {
		const promise = fn(item).then(result => {
			const index = executing.indexOf(promise);
			if (index > -1) executing.splice(index, 1);
			return result;
		});

		executing.push(promise);

		if (executing.length >= concurrency) {
			await Promise.race(executing);
		}
	}

	await Promise.all(executing);
	return Promise.all(results);
}

/**
 * @typedef {Object} CircuitBreakerOptions
 * @property {number} [failureThreshold] - Number of failures before opening circuit
 * @property {number} [resetTimeout] - Time before attempting to close circuit
 * @property {number} [monitoringPeriod] - Period for monitoring failures
 */

/**
 * Create a circuit breaker
 * @param {Function} fn - Function to wrap
 * @param {CircuitBreakerOptions} [options] - Circuit breaker options
 * @returns {Function} Circuit breaker wrapped function
 */
function circuitBreaker(fn, options = {}) {
	const {
		failureThreshold = 5,
		resetTimeout = 60000
	} = options;

	/** @type {'CLOSED' | 'OPEN' | 'HALF_OPEN'} */
	let state = 'CLOSED';
	let failureCount = 0;
	/** @type {number | null} */
	let nextAttempt = null;

	return async function() {
		const args = Array.prototype.slice.call(arguments);
		if (state === 'OPEN') {
			if (nextAttempt !== null && Date.now() > nextAttempt) {
				state = 'HALF_OPEN';
			} else {
				throw new Error('Circuit breaker is OPEN');
			}
		}

		try {
			const result = await fn.apply(null, args);
			
			if (state === 'HALF_OPEN') {
				state = 'CLOSED';
				failureCount = 0;
			}
			
			return result;
		} catch (error) {
			failureCount++;

			if (failureCount >= failureThreshold) {
				state = 'OPEN';
				nextAttempt = Date.now() + resetTimeout;
			}

			throw error;
		}
	};
}

module.exports = {
	sleep,
	debounce,
	throttle,
	circuitBreaker,
	retry,
	measureExecutionTime,
	withTimeout,
	parallelLimit
};