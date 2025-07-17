/**
 * Airtable Common Utilities
 * Shared utility functions for Airtable MCP service
 */

import { createLogger } from './logger.js';

const logger = createLogger('CommonUtils');

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
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any}
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime());
	}

	if (obj instanceof Array) {
		return obj.map(item => deepClone(item));
	}

	if (typeof obj === 'object') {
		const cloned = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				cloned[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object}
 */
export function deepMerge(target, source) {
	const result = deepClone(target);

	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
				result[key] = deepMerge(result[key] || {}, source[key]);
			} else {
				result[key] = source[key];
			}
		}
	}

	return result;
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean}
 */
export function isEmpty(obj) {
	if (obj === null || obj === undefined) {
		return true;
	}

	if (Array.isArray(obj)) {
		return obj.length === 0;
	}

	if (typeof obj === 'object') {
		return Object.keys(obj).length === 0;
	}

	if (typeof obj === 'string') {
		return obj.trim().length === 0;
	}

	return false;
}

/**
 * Generate UUID v4
 * @returns {string}
 */
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimals
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
export function formatDuration(ms) {
	if (ms < 1000) {
		return `${ms}ms`;
	}

	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
	}

	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	}

	return `${seconds}s`;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function}
 */
export function debounce(func, wait, immediate = false) {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (callNow) func(...args);
	};
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function}
 */
export function throttle(func, limit) {
	let inThrottle;

	return function(...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array}
 */
export function chunkArray(array, size) {
	if (!Array.isArray(array)) {
		throw new Error('First argument must be an array');
	}

	if (size <= 0) {
		throw new Error('Chunk size must be greater than 0');
	}

	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}

	return chunks;
}

/**
 * Get nested property from object
 * @param {Object} obj - Object to search
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value if property not found
 * @returns {any}
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
	if (!obj || typeof obj !== 'object') {
		return defaultValue;
	}

	const keys = path.split('.');
	let current = obj;

	for (const key of keys) {
		if (current === null || current === undefined || !(key in current)) {
			return defaultValue;
		}
		current = current[key];
	}

	return current;
}

/**
 * Set nested property in object
 * @param {Object} obj - Object to modify
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} value - Value to set
 * @returns {Object}
 */
export function setNestedProperty(obj, path, value) {
	if (!obj || typeof obj !== 'object') {
		throw new Error('Object is required');
	}

	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		
		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}
		
		current = current[key];
	}

	current[keys[keys.length - 1]] = value;
	return obj;
}

/**
 * Remove undefined properties from object
 * @param {Object} obj - Object to clean
 * @returns {Object}
 */
export function removeUndefined(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	const cleaned = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined) {
			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				cleaned[key] = removeUndefined(value);
			} else {
				cleaned[key] = value;
			}
		}
	}

	return cleaned;
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toCamelCase(str) {
	if (typeof str !== 'string') {
		return str;
	}

	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, '');
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toSnakeCase(str) {
	if (typeof str !== 'string') {
		return str;
	}

	return str
		.replace(/\W+/g, ' ')
		.split(/ |\B(?=[A-Z])/)
		.map(word => word.toLowerCase())
		.join('_');
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toKebabCase(str) {
	if (typeof str !== 'string') {
		return str;
	}

	return str
		.replace(/\W+/g, ' ')
		.split(/ |\B(?=[A-Z])/)
		.map(word => word.toLowerCase())
		.join('-');
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string}
 */
export function truncateString(str, maxLength, suffix = '...') {
	if (typeof str !== 'string') {
		return str;
	}

	if (str.length <= maxLength) {
		return str;
	}

	return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any}
 */
export function safeJsonParse(jsonString, defaultValue = null) {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		logger.warn('Failed to parse JSON', { error: error.message });
		return defaultValue;
	}
}

/**
 * Stringify JSON safely
 * @param {any} obj - Object to stringify
 * @param {string} defaultValue - Default value if stringifying fails
 * @returns {string}
 */
export function safeJsonStringify(obj, defaultValue = '{}') {
	try {
		return JSON.stringify(obj);
	} catch (error) {
		logger.warn('Failed to stringify JSON', { error: error.message });
		return defaultValue;
	}
}

/**
 * Create timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Timeout message
 * @returns {Promise}
 */
export function createTimeout(ms, message = 'Operation timed out') {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(message)), ms);
	});
}

/**
 * Race promise with timeout
 * @param {Promise} promise - Promise to race
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Timeout message
 * @returns {Promise}
 */
export function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
	return Promise.race([
		promise,
		createTimeout(timeoutMs, timeoutMessage)
	]);
}

/**
 * Measure execution time
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
		throw Object.assign(error, { duration });
	}
}

/**
 * Create rate limiter
 * @param {number} maxRequests - Maximum requests
 * @param {number} windowMs - Window in milliseconds
 * @returns {Function}
 */
export function createRateLimiter(maxRequests, windowMs) {
	const requests = [];

	return function() {
		const now = Date.now();
		const windowStart = now - windowMs;

		// Remove old requests
		while (requests.length > 0 && requests[0] < windowStart) {
			requests.shift();
		}

		// Check if limit exceeded
		if (requests.length >= maxRequests) {
			throw new Error(`Rate limit exceeded: ${maxRequests} requests per ${windowMs}ms`);
		}

		// Add current request
		requests.push(now);
	};
}

/**
 * Hash string using simple hash function
 * @param {string} str - String to hash
 * @returns {number}
 */
export function hashString(str) {
	let hash = 0;
	
	if (str.length === 0) {
		return hash;
	}

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return hash;
}

/**
 * Create LRU cache
 * @param {number} maxSize - Maximum cache size
 * @returns {Object}
 */
export function createLRUCache(maxSize) {
	const cache = new Map();

	return {
		get(key) {
			if (cache.has(key)) {
				const value = cache.get(key);
				cache.delete(key);
				cache.set(key, value);
				return value;
			}
			return undefined;
		},

		set(key, value) {
			if (cache.has(key)) {
				cache.delete(key);
			} else if (cache.size >= maxSize) {
				const firstKey = cache.keys().next().value;
				cache.delete(firstKey);
			}
			cache.set(key, value);
		},

		has(key) {
			return cache.has(key);
		},

		delete(key) {
			return cache.delete(key);
		},

		clear() {
			cache.clear();
		},

		size() {
			return cache.size;
		}
	};
}

/**
 * Default export
 */
export default {
	sleep,
	retry,
	deepClone,
	deepMerge,
	isEmpty,
	generateUUID,
	formatBytes,
	formatDuration,
	debounce,
	throttle,
	chunkArray,
	getNestedProperty,
	setNestedProperty,
	removeUndefined,
	toCamelCase,
	toSnakeCase,
	toKebabCase,
	truncateString,
	safeJsonParse,
	safeJsonStringify,
	createTimeout,
	withTimeout,
	measureExecutionTime,
	createRateLimiter,
	hashString,
	createLRUCache
};