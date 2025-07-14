/**
 * Invalidate cached credentials for a deleted instance
 * @param {string} serviceName - Service name (figma, github, slack, etc.)
 * @param {string} instanceId - Instance ID to remove from cache
 * @returns {Promise<boolean>} Success status of cache invalidation
 */
export function invalidateInstanceCache(serviceName: string, instanceId: string): Promise<boolean>;
/**
 * Validate instance cache cleanup
 * Verify that instance was successfully removed from cache
 * @param {string} serviceName - Service name
 * @param {string} instanceId - Instance ID to verify
 * @returns {Promise<boolean>} True if instance is not in cache
 */
export function validateCacheCleanup(serviceName: string, instanceId: string): Promise<boolean>;
/**
 * Get supported services for cache invalidation
 * @returns {string[]} Array of supported service names
 */
export function getSupportedServices(): string[];
/**
 * Check if service supports cache invalidation
 * @param {string} serviceName - Service name to check
 * @returns {boolean} True if service supports cache invalidation
 */
export function isServiceSupported(serviceName: string): boolean;
/**
 * Bulk cache invalidation for multiple instances
 * @param {Array<{serviceName: string, instanceId: string}>} instances - Instances to invalidate
 * @returns {Promise<Array<{instanceId: string, success: boolean}>>} Results for each instance
 */
export function bulkInvalidateCache(instances: Array<{
    serviceName: string;
    instanceId: string;
}>): Promise<Array<{
    instanceId: string;
    success: boolean;
}>>;
/**
 * Emergency cache cleanup for all instances of a service
 * Use with caution - clears entire service cache
 * @param {string} serviceName - Service name to clear completely
 * @returns {Promise<boolean>} Success status
 */
export function emergencyCacheClear(serviceName: string): Promise<boolean>;
/**
 * Update cache metadata for instance status or expiration changes
 * @param {string} serviceName - Service name (figma, github, slack, etc.)
 * @param {string} instanceId - Instance ID to update
 * @param {Object} updates - Metadata updates
 * @param {string} [updates.status] - New instance status
 * @param {string} [updates.expires_at] - New expiration timestamp
 * @returns {Promise<boolean>} Success status of cache update
 */
export function updateInstanceCacheMetadata(serviceName: string, instanceId: string, updates: {
    status?: string | undefined;
    expires_at?: string | undefined;
}): Promise<boolean>;
/**
 * Cleanup invalid cache entries across all services
 * @param {string} reason - Reason for cleanup (scheduled, manual, etc.)
 * @returns {Promise<Object>} Cleanup results by service
 */
export function cleanupInvalidCacheEntries(reason?: string): Promise<Object>;
//# sourceMappingURL=cacheInvalidationService.d.ts.map