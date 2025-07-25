/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj: any): any;
/**
 * Deep merge objects
 * @template T
 * @param {Record<string, T>} target - Target object
 * @param {...Record<string, T>} sources - Source objects to merge
 * @returns {Record<string, T>} Merged object
 */
export function deepMerge<T>(target: Record<string, T>, ...sources: Record<string, T>[]): Record<string, T>;
/**
 * Check if value is an object
 * @param {Object | null | undefined | string | number | boolean} item - Item to check
 * @returns {boolean} True if object
 */
export function isObject(item: Object | null | undefined | string | number | boolean): boolean;
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
 * @param {Object[]} arr - Array to flatten
 * @param {number} [depth] - Depth to flatten (default: Infinity)
 * @returns {Object[]} Flattened array
 */
export function flattenArray(arr: Object[], depth?: number): Object[];
/**
 * Remove duplicates from array
 * @template T
 * @param {Array<T>} array - Array to deduplicate
 * @param {((item: T) => string | number) | null} [keyFn] - Key function for objects
 * @returns {Array<T>} Array without duplicates
 */
export function uniqueArray<T>(array: Array<T>, keyFn?: ((item: T) => string | number) | null): Array<T>;
/**
 * Group array items by key
 * @param {Object[]} array - Array to group
 * @param {((item: Object) => string) | string} keyFn - Key function or property name
 * @returns {Record<string, Object[]>} Grouped object
 */
export function groupBy(array: Object[], keyFn: ((item: Object) => string) | string): Record<string, Object[]>;
/**
 * @typedef {Object} SortKey
 * @property {string | ((item: Object) => string | number)} key - Sort key or function
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
 * @template {Record<string, string | number | boolean | Object>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to pick
 * @returns {Pick<T, K>} Object with picked properties
 */
export function pick<T extends Record<string, string | number | boolean | Object>, K extends keyof T>(obj: T, keys: Array<K>): Pick<T, K>;
/**
 * Omit specific properties from object
 * @template {Record<string, string | number | boolean | Object>} T
 * @template {keyof T} K
 * @param {T} obj - Source object
 * @param {Array<K>} keys - Keys to omit
 * @returns {Omit<T, K>} Object without omitted properties
 */
export function omit<T extends Record<string, string | number | boolean | Object>, K extends keyof T>(obj: T, keys: Array<K>): Omit<T, K>;
/**
 * Get nested property value safely
 * @param {Record<string, Object>} obj - Source object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {Object | null} [defaultValue] - Default value if path not found
 * @returns {Object | null | undefined} Property value or default
 */
export function get(obj: Record<string, Object>, path: string, defaultValue?: Object | null): Object | null | undefined;
/**
 * Set nested property value safely
 * @param {Record<string, Object>} obj - Target object
 * @param {string} path - Property path (e.g., 'a.b.c')
 * @param {Object} value - Value to set
 * @returns {Record<string, Object>} Modified object
 */
export function set(obj: Record<string, Object>, path: string, value: Object): Record<string, Object>;
/**
 * Transform object keys
 * @param {Object | Object[]} obj - Source object
 * @param {(key: string) => string} transformFn - Key transformation function
 * @returns {Object | Object[]} Object with transformed keys
 */
export function transformKeys(obj: Object | Object[], transformFn: (key: string) => string): Object | Object[];
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
    key: string | ((item: Object) => string | number);
    /**
     * - Sort direction
     */
    direction?: "asc" | "desc" | undefined;
};
//# sourceMappingURL=data.d.ts.map