export type CacheEntry = {
    /**
     * - The cached data
     */
    data: any;
    /**
     * - Timestamp when entry was created
     */
    createdAt: number;
    /**
     * - Timestamp when entry expires
     */
    expiresAt: number;
    /**
     * - Timestamp when entry was last accessed
     */
    lastAccessed: number;
    /**
     * - Cache type
     */
    type: string;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Request parameters
     */
    params: Record<string, any>;
};
export type CacheStats = {
    /**
     * - Number of cache hits
     */
    hits: number;
    /**
     * - Number of cache misses
     */
    misses: number;
    /**
     * - Number of cache sets
     */
    sets: number;
    /**
     * - Number of cache deletes
     */
    deletes: number;
    /**
     * - Number of cleanups performed
     */
    cleanups: number;
    /**
     * - Number of errors encountered
     */
    errors: number;
};
export type CacheConfig = {
    /**
     * - TTL values for different cache types
     */
    ttl: Record<string, number>;
    /**
     * - Maximum number of cached items
     */
    maxSize: number;
    /**
     * - Cleanup interval in milliseconds
     */
    cleanupInterval: number;
};
export type CacheStatistics = {
    /**
     * - Current cache size
     */
    size: number;
    /**
     * - Maximum cache size
     */
    maxSize: number;
    /**
     * - Number of expired entries
     */
    expiredCount: number;
    /**
     * - Hit rate percentage
     */
    hitRate: string;
    /**
     * - Cache statistics
     */
    statistics: CacheStats;
    /**
     * - Breakdown by cache type
     */
    typeBreakdown: Record<string, number>;
    /**
     * - Memory usage information
     */
    memoryUsage: {
        bytes: number;
        mb: string;
    };
};
/**
 * Initialize response cache
 */
export function initializeResponseCache(): void;
/**
 * Generate cache key
 * @param {string} type - Cache type (subreddit_info, user_posts, etc.)
 * @param {string} instanceId - Instance ID
 * @param {Record<string, *>} params - Request parameters
 * @returns {string} Cache key
 */
export function generateCacheKey(type: string, instanceId: string, params: Record<string, any>): string;
/**
 * Get cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Record<string, *>} params - Request parameters
 * @returns {*|null} Cached response or null if not found/expired
 */
export function getCachedResponse(type: string, instanceId: string, params?: Record<string, any>): any | null;
/**
 * Set cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Record<string, *>} params - Request parameters
 * @param {*} data - Response data to cache
 * @param {number|undefined} [customTtl] - Custom TTL in milliseconds
 */
export function setCachedResponse(type: string, instanceId: string, params: Record<string, any> | undefined, data: any, customTtl?: number | undefined): void;
/**
 * Delete cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Record<string, *>} params - Request parameters
 */
export function deleteCachedResponse(type: string, instanceId: string, params?: Record<string, any>): boolean;
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
 * @returns {CacheStatistics} Cache statistics
 */
export function getCacheStatistics(): CacheStatistics;
/**
 * Start cleanup interval
 */
export function startCleanupInterval(): void;
/**
 * Stop cleanup interval
 */
export function stopCleanupInterval(): void;
/**
 * Get cache configuration
 * @returns {CacheConfig} Current cache configuration
 */
export function getCacheConfig(): CacheConfig;
//# sourceMappingURL=responseCache.d.ts.map