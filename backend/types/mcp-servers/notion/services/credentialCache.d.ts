/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache(): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): Object | null;
/**
 * Store credential in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} credentialData - Credential data to cache
 * @param {string} credentialData.bearerToken - OAuth Bearer token
 * @param {string} credentialData.refreshToken - OAuth refresh token
 * @param {string} credentialData.expiresAt - Instance expiration timestamp
 * @param {string} credentialData.user_id - User ID who owns this instance
 */
export function setCachedCredential(instanceId: string, credentialData: {
    bearerToken: string;
    refreshToken: string;
    expiresAt: string;
    user_id: string;
}): Promise<void>;
/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId: string): boolean;
/**
 * Get cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics(): Object;
/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds(): string[];
/**
 * Check if an instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and valid
 */
export function isInstanceCached(instanceId: string): boolean;
/**
 * Clear all cached credentials (for testing/restart)
 */
export function clearCredentialCache(): void;
/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
export function peekCachedCredential(instanceId: string): Object | null;
/**
 * Update cached credential metadata (status, expiration) without changing the credential itself
 * Used for status changes and renewals to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Updates to apply to cache entry
 * @param {string} [updates.status] - New instance status
 * @param {string} [updates.expires_at] - New expiration timestamp
 * @returns {Promise<boolean>} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: {
    status?: string | undefined;
    expires_at?: string | undefined;
}): Promise<boolean>;
/**
 * Remove expired or inactive instances from cache
 * Called by background watcher and status change operations
 * @param {string} reason - Reason for cleanup (expired, inactive, deleted)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason?: string): number;
//# sourceMappingURL=credentialCache.d.ts.map