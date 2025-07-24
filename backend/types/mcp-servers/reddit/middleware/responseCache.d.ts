/**
 * Create response caching middleware
 * @param {Object} options - Cache options
 * @returns {Function} Middleware function
 */
export function createResponseCacheMiddleware(options?: Object): Function;
/**
 * Create cache invalidation middleware
 * Invalidates cache entries when data changes
 * @returns {Function} Middleware function
 */
export function createCacheInvalidationMiddleware(): Function;
/**
 * Get cache mappings configuration
 * @returns {Object} Cache mappings
 */
export function getCacheMappings(): Object;
/**
 * Update cache mappings
 * @param {Object} newMappings - New cache mappings
 */
export function updateCacheMappings(newMappings: Object): void;
//# sourceMappingURL=responseCache.d.ts.map