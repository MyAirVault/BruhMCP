/**
 * Async Utilities
 * Utilities for asynchronous operations, retries, and timing
 */

import { createLogger } from './logger.js';

const logger = createLogger('AsyncUtils');

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise}
 */
export async function retry(fn, options = {}) {
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
				error: error.message
			});

			await sleep(jitterDelay);
		}
	}

	throw lastError;
}

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: any, duration: number}>}
 */
export async function measureExecutionTime(fn) {
	const startTime = Date.now();
	try {
		const result = await fn();
		const duration = Date.now() - startTime;
		return { result, duration };
	} catch (error) {
		const duration = Date.now() - startTime;
		error.duration = duration;
		throw error;
	}
}

/**
 * Execute function with timeout
 * @param {Promise} promise - Promise to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} [timeoutMessage] - Custom timeout message
 * @returns {Promise}
 */
export async function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
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
export function debounce(func, wait, immediate = false) {
	let timeout;
	
	return function executedFunction(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(this, args);
		};
		
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		
		if (callNow) func.apply(this, args);
	};
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
	let inThrottle;
	
	return function executedFunction(...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Execute functions in parallel with concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} fn - Function to execute for each item
 * @param {number} [concurrency] - Maximum concurrent executions
 * @returns {Promise<Array>} Results array
 */
export async function parallelLimit(items, fn, concurrency = 5) {
	const results = [];
	const executing = [];

	for (const item of items) {
		const promise = fn(item).then(result => {
			results.push(result);
			executing.splice(executing.indexOf(promise), 1);
			return result;
		});

		results.push(promise);
		executing.push(promise);

		if (executing.length >= concurrency) {
			await Promise.race(executing);
		}
	}

	await Promise.all(executing);
	return Promise.all(results);
}

/**
 * Create a circuit breaker
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Circuit breaker options
 * @returns {Function} Circuit breaker wrapped function
 */
export function circuitBreaker(fn, options = {}) {
	const {
		failureThreshold = 5,
		resetTimeout = 60000,
		monitoringPeriod = 10000
	} = options;

	let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
	let failureCount = 0;
	let lastFailureTime = null;
	let nextAttempt = null;

	return async function circuitBreakerWrapper(...args) {
		if (state === 'OPEN') {
			if (Date.now() > nextAttempt) {
				state = 'HALF_OPEN';
			} else {
				throw new Error('Circuit breaker is OPEN');
			}
		}

		try {
			const result = await fn.apply(this, args);
			
			if (state === 'HALF_OPEN') {
				state = 'CLOSED';
				failureCount = 0;
			}
			
			return result;
		} catch (error) {
			failureCount++;
			lastFailureTime = Date.now();

			if (failureCount >= failureThreshold) {
				state = 'OPEN';
				nextAttempt = Date.now() + resetTimeout;
			}

			throw error;
		}
	};
}