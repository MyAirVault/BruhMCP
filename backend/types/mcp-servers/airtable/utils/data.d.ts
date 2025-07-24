/**
 * Data Utilities
 * Utilities for data manipulation, formatting, and transformation
 */
/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj: any): any;
/**
 * Deep merge objects
 * @param {Record<string, any>} target - Target object
 * @param {...Record<string, any>} sources - Source objects to merge
 * @returns {Record<string, any>} Merged object
 */
export function deepMerge(target: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any>;
/**
 * Check if value is an object
 * @param {any} item - Item to check
 * @returns {boolean} True if object
 */
export function isObject(item: any): boolean;
/**
 * Chunk array into smaller arrays
 * @template T
 * @param {Array<T>} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array<T>>} Array of chunks
 */
export function chunkArray<T>(array: Array<T>, size: number): Array<Array<T>>;
/**
 * Flatten nested array
 * @template T
 * @param {Array<T | Array<T>>} arr - Array to flatten
 * @param {number} [depth] - Depth to flatten (default: Infinity)
 * @returns {Array<T>} Flattened array
 */
export function flattenArray<T>(arr: Array<T | Array<T>>, depth?: number): Array<T>;
/**
 * Remove duplicates from array
 * @template T
 * @param {Array<T>} array - Array to deduplicate
 * @param {((item: T) => any) | null} [keyFn] - Key function for objects
 * @returns {Array<T>} Array without duplicates
 */
export function uniqueArray<T>(array: Array<T>, keyFn?: ((item: T) => any) | null): Array<T>;
/**
 * Group array items by key
 * @template T
 * @param {Array<T>} array - Array to group
 * @param {((item: T) => string) | string} keyFn - Key function or property name
 * @returns {Record<string, Array<T>>} Grouped object
 */
export function groupBy<T>(array: Array<T>, keyFn: ((item: T) => string) | string): Record<string, Array<T>>;
/**
 * @typedef {Object} SortKey
 * @property {string | ((item: any) => any)} key - Sort key or function
 * @property {'asc' | 'desc'} [direction] - Sort direction
 */
/**
 * Sort array by multiple keys
 * @template T
 * @param {Array<T>} array - Array to sort
 * @param {Array<SortKey>} sortKeys - Array of sort configurations
 * @returns {Array<T>} Sorted array
 */
export function multiSort<T>(array: Array<T>, sortKeys: Array<SortKey>): Array<T>;
/**
 * Pick specific properties from object
 * @template {Record<string, any>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to pick
 * @returns {Pick<T, K>} Object with picked properties
 */
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: Array<K>): Pick<T, K>;
/**
 * Omit specific properties from object
 * @template {Record<string, any>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to omit
 * @returns {Omit<T, K>} Object without omitted properties
 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: Array<K>): Omit<T, K>;
/**
 * Get nested property value safely
 * @param {Record<string, any>} obj - Source object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any} Property value or default
 */
export function get(obj: Record<string, any>, path: string, defaultValue?: any): any;
/**
 * Set nested property value safely
 * @param {Record<string, any>} obj - Target object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {any} value - Value to set
 * @returns {Record<string, any>} Modified object
 */
export function set(obj: Record<string, any>, path: string, value: any): Record<string, any>;
/**
 * Transform object keys
 * @param {any} obj - Source object
 * @param {(key: string) => string} transformFn - Key transformation function
 * @returns {any} Object with transformed keys
 */
export function transformKeys(obj: any, transformFn: (key: string) => string): any;
/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export function camelToSnake(str: string): string;
/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export function snakeToCamel(str: string): string;
export type SortKey = {
    /**
     * - Sort key or function
     */
    key: string | ((item: any) => any);
    /**
     * - Sort direction
     */
    direction?: "asc" | "desc" | undefined;
};
//# sourceMappingURL=data.d.ts.map