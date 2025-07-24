/**
 * Common Utilities
 * Re-exports utilities from specialized modules for backward compatibility
 */

// Async utilities
export {
	sleep,
	retry,
	measureExecutionTime,
	withTimeout,
	debounce,
	throttle,
	parallelLimit,
	circuitBreaker
} from './async.js';

// Data utilities
export {
	deepClone,
	deepMerge,
	isObject,
	chunkArray,
	flattenArray,
	uniqueArray,
	groupBy,
	multiSort,
	pick,
	omit,
	get,
	set,
	transformKeys,
	camelToSnake,
	snakeToCamel
} from './data.js';

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * Check if running in development mode
 * @returns {boolean} True if development
 */
export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 * @returns {boolean} True if production
 */
export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

/**
 * Get environment variable with default
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value
 * @returns {string} Environment variable value or default
 */
export function getEnv(key, defaultValue = '') {
	return process.env[key] || defaultValue;
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} [decimals] - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
	return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Create a simple cache with TTL
 * @param {number} [ttl] - Time to live in milliseconds
 * @returns {Object} Cache instance
 */
export function createCache(ttl = 300000) { // 5 minutes default
	const cache = new Map();
	
	return {
		get(key) {
			const entry = cache.get(key);
			if (!entry) return undefined;
			
			if (Date.now() > entry.expires) {
				cache.delete(key);
				return undefined;
			}
			
			return entry.value;
		},
		
		set(key, value) {
			cache.set(key, {
				value,
				expires: Date.now() + ttl
			});
		},
		
		delete(key) {
			return cache.delete(key);
		},
		
		clear() {
			cache.clear();
		},
		
		size() {
			return cache.size;
		},
		
		keys() {
			return Array.from(cache.keys());
		}
	};
}