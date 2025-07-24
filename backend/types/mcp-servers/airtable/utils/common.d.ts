/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function generateUUID(): string;
/**
 * Check if running in development mode
 * @returns {boolean} True if development
 */
export function isDevelopment(): boolean;
/**
 * Check if running in production mode
 * @returns {boolean} True if production
 */
export function isProduction(): boolean;
/**
 * Get environment variable with default
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value
 * @returns {string} Environment variable value or default
 */
export function getEnv(key: string, defaultValue?: string): string;
/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} [decimals] - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms: number): string;
/**
 * @typedef {Object} CacheEntry
 * @property {any} value - Cached value
 * @property {number} expires - Expiration timestamp
 */
/**
 * @typedef {Object} SimpleCache
 * @property {(key: string) => any} get - Get value from cache
 * @property {(key: string, value: any) => void} set - Set value in cache
 * @property {(key: string) => boolean} delete - Delete value from cache
 * @property {() => void} clear - Clear cache
 * @property {() => number} size - Get cache size
 * @property {() => Array<string>} keys - Get cache keys
 */
/**
 * Create a simple cache with TTL
 * @param {number} [ttl] - Time to live in milliseconds
 * @returns {SimpleCache} Cache instance
 */
export function createCache(ttl?: number): SimpleCache;
export type CacheEntry = {
    /**
     * - Cached value
     */
    value: any;
    /**
     * - Expiration timestamp
     */
    expires: number;
};
export type SimpleCache = {
    /**
     * - Get value from cache
     */
    get: (key: string) => any;
    /**
     * - Set value in cache
     */
    set: (key: string, value: any) => void;
    /**
     * - Delete value from cache
     */
    delete: (key: string) => boolean;
    /**
     * - Clear cache
     */
    clear: () => void;
    /**
     * - Get cache size
     */
    size: () => number;
    /**
     * - Get cache keys
     */
    keys: () => Array<string>;
};
export { sleep, retry, measureExecutionTime, withTimeout, debounce, throttle, parallelLimit, circuitBreaker } from "./async.js";
export { deepClone, deepMerge, isObject, chunkArray, flattenArray, uniqueArray, groupBy, multiSort, pick, omit, get, set, transformKeys, camelToSnake, snakeToCamel } from "./data.js";
//# sourceMappingURL=common.d.ts.map