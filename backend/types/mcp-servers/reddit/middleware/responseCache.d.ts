/**
 * Create response caching middleware
 * @param {Object} options - Cache options
 * @returns {Function} Middleware function
 */
export function createResponseCacheMiddleware(options?: Object): Function;
/**
 * Check if operation is private and shouldn't be cached
 * @param {string} toolName - Tool name
 * @returns {boolean} True if private operation
 */
export function isPrivateOperation(toolName: string): boolean;
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