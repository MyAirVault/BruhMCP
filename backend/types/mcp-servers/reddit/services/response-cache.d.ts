/**
 * Initialize response cache
 */
export function initializeResponseCache(): void;
/**
 * Get cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 * @returns {any|null} Cached response or null if not found/expired
 */
export function getCachedResponse(type: string, instanceId: string, params?: Object): any | null;
/**
 * Set cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 * @param {any} data - Response data to cache
 * @param {number} [customTtl] - Custom TTL in milliseconds
 */
export function setCachedResponse(type: string, instanceId: string, params: Object | undefined, data: any, customTtl?: number): void;
/**
 * Delete cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 */
export function deleteCachedResponse(type: string, instanceId: string, params?: Object): boolean;
/**
 * Clear all cached responses for an instance
 * @param {string} instanceId - Instance ID
 */
export function clearInstanceCache(instanceId: string): number;
/**
 * Clear all cached responses
 */
export function clearAllCache(): number;
/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics(): Object;
/**
 * Stop cleanup interval
 */
export function stopCleanupInterval(): void;
/**
 * Update cache configuration
 * @param {Object} newConfig - New cache configuration
 */
export function updateCacheConfig(newConfig: Object): void;
/**
 * Get cache configuration
 * @returns {Object} Current cache configuration
 */
export function getCacheConfig(): Object;
//# sourceMappingURL=response-cache.d.ts.map