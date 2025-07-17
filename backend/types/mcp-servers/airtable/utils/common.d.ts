/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
export function sleep(ms: number): Promise<any>;
/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise}
 */
export function retry(fn: Function, options?: Object): Promise<any>;
/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any}
 */
export function deepClone(obj: any): any;
/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object}
 */
export function deepMerge(target: Object, source: Object): Object;
/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean}
 */
export function isEmpty(obj: Object): boolean;
/**
 * Generate UUID v4
 * @returns {string}
 */
export function generateUUID(): string;
/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimals
 * @returns {string}
 */
export function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
export function formatDuration(ms: number): string;
/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function}
 */
export function debounce(func: Function, wait: number, immediate?: boolean): Function;
/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function}
 */
export function throttle(func: Function, limit: number): Function;
/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array}
 */
export function chunkArray(array: any[], size: number): any[];
/**
 * Get nested property from object
 * @param {Object} obj - Object to search
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value if property not found
 * @returns {any}
 */
export function getNestedProperty(obj: Object, path: string, defaultValue?: any): any;
/**
 * Set nested property in object
 * @param {Object} obj - Object to modify
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} value - Value to set
 * @returns {Object}
 */
export function setNestedProperty(obj: Object, path: string, value: any): Object;
/**
 * Remove undefined properties from object
 * @param {Object} obj - Object to clean
 * @returns {Object}
 */
export function removeUndefined(obj: Object): Object;
/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toCamelCase(str: string): string;
/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toSnakeCase(str: string): string;
/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string}
 */
export function toKebabCase(str: string): string;
/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string}
 */
export function truncateString(str: string, maxLength: number, suffix?: string): string;
/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any}
 */
export function safeJsonParse(jsonString: string, defaultValue?: any): any;
/**
 * Stringify JSON safely
 * @param {any} obj - Object to stringify
 * @param {string} defaultValue - Default value if stringifying fails
 * @returns {string}
 */
export function safeJsonStringify(obj: any, defaultValue?: string): string;
/**
 * Create timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Timeout message
 * @returns {Promise}
 */
export function createTimeout(ms: number, message?: string): Promise<any>;
/**
 * Race promise with timeout
 * @param {Promise} promise - Promise to race
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Timeout message
 * @returns {Promise}
 */
export function withTimeout(promise: Promise<any>, timeoutMs: number, timeoutMessage?: string): Promise<any>;
/**
 * Measure execution time
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: any, duration: number}>}
 */
export function measureExecutionTime(fn: Function): Promise<{
    result: any;
    duration: number;
}>;
/**
 * Create rate limiter
 * @param {number} maxRequests - Maximum requests
 * @param {number} windowMs - Window in milliseconds
 * @returns {Function}
 */
export function createRateLimiter(maxRequests: number, windowMs: number): Function;
/**
 * Hash string using simple hash function
 * @param {string} str - String to hash
 * @returns {number}
 */
export function hashString(str: string): number;
/**
 * Create LRU cache
 * @param {number} maxSize - Maximum cache size
 * @returns {Object}
 */
export function createLRUCache(maxSize: number): Object;
declare namespace _default {
    export { sleep };
    export { retry };
    export { deepClone };
    export { deepMerge };
    export { isEmpty };
    export { generateUUID };
    export { formatBytes };
    export { formatDuration };
    export { debounce };
    export { throttle };
    export { chunkArray };
    export { getNestedProperty };
    export { setNestedProperty };
    export { removeUndefined };
    export { toCamelCase };
    export { toSnakeCase };
    export { toKebabCase };
    export { truncateString };
    export { safeJsonParse };
    export { safeJsonStringify };
    export { createTimeout };
    export { withTimeout };
    export { measureExecutionTime };
    export { createRateLimiter };
    export { hashString };
    export { createLRUCache };
}
export default _default;
//# sourceMappingURL=common.d.ts.map