/**
 * Common utility functions for GitHub MCP service
 * Provides shared utilities for data manipulation, validation, and formatting
 */
/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj: any): any;
/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted bytes string
 */
export function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms: number): string;
/**
 * Check if a string is a valid email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email: string): boolean;
/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url: string): boolean;
/**
 * Check if a string is a valid UUID
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(uuid: string): boolean;
/**
 * Sanitize a string for safe use in URLs
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeForUrl(str: string): string;
/**
 * Generate a random string of specified length
 * @param {number} length - Length of random string
 * @param {string} chars - Characters to use (default: alphanumeric)
 * @returns {string} Random string
 */
export function generateRandomString(length?: number, chars?: string): string;
/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func: Function, wait: number): Function;
/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func: Function, limit: number): Function;
/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
export function sleep(ms: number): Promise<any>;
/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export function retryWithBackoff(fn: Function, maxRetries?: number, baseDelay?: number): Promise<any>;
/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target: Object, ...sources: Object[]): Object;
/**
 * Pick specific properties from an object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} Object with picked properties
 */
export function pick(obj: Object, keys: string[]): Object;
/**
 * Omit specific properties from an object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} Object with omitted properties
 */
export function omit(obj: Object, keys: string[]): Object;
/**
 * Flatten an array of arrays
 * @param {Array} arr - Array to flatten
 * @returns {Array} Flattened array
 */
export function flatten(arr: any[]): any[];
/**
 * Remove duplicates from an array
 * @param {Array} arr - Array to deduplicate
 * @param {Function} keyFn - Function to extract key for comparison
 * @returns {Array} Deduplicated array
 */
export function uniqueBy(arr: any[], keyFn: Function): any[];
/**
 * Group array elements by a key
 * @param {Array} arr - Array to group
 * @param {Function} keyFn - Function to extract key
 * @returns {Object} Grouped object
 */
export function groupBy(arr: any[], keyFn: Function): Object;
/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} Snake case string
 */
export function camelToSnake(str: string): string;
/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} Camel case string
 */
export function snakeToCamel(str: string): string;
/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str: string): string;
/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated string
 */
export function truncate(str: string, length: number, suffix?: string): string;
/**
 * Convert object to query string
 * @param {Object} obj - Object to convert
 * @returns {string} Query string
 */
export function objectToQueryString(obj: Object): string;
/**
 * Parse query string to object
 * @param {string} queryString - Query string to parse
 * @returns {Object} Parsed object
 */
export function queryStringToObject(queryString: string): Object;
/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunkArray(array: any[], size: number): any[];
/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: *, duration: number}>} Result and duration
 */
export function measureExecutionTime(fn: Function): Promise<{
    result: any;
    duration: number;
}>;
/**
 * Add timeout to a promise
 * @param {Promise} promise - Promise to add timeout to
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} message - Timeout error message
 * @returns {Promise} Promise with timeout
 */
export function withTimeout(promise: Promise<any>, timeout: number, message?: string): Promise<any>;
/**
 * Create a simple cache with TTL
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Object} Cache object
 */
export function createCache(ttl?: number): Object;
/**
 * Measure performance of a function with logging
 * @param {Function} fn - Function to measure
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} Wrapped function with performance measurement
 */
export function measurePerformance(fn: Function, operationName?: string): Function;
//# sourceMappingURL=common.d.ts.map