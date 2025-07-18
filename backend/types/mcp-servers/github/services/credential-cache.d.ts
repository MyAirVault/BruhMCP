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
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - OAuth Bearer access token
 * @param {string} tokenData.refreshToken - OAuth refresh token
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {string} tokenData.user_id - User ID who owns this instance
 */
export function setCachedCredential(instanceId: string, tokenData: {
    bearerToken: string;
    refreshToken: string;
    expiresAt: number;
    user_id: string;
}): void;
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
 * Check if an instance is cached and token is valid
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and token is valid
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
 * Update cached token metadata without changing the tokens themselves
 * Used for status changes and token refresh to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Updates to apply to cache entry
 * @param {string} [updates.status] - New instance status
 * @param {number} [updates.expiresAt] - New token expiration timestamp
 * @param {string} [updates.bearerToken] - New bearer token
 * @param {string} [updates.refreshToken] - New refresh token
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: {
    status?: string | undefined;
    expiresAt?: number | undefined;
    bearerToken?: string | undefined;
    refreshToken?: string | undefined;
}): boolean;
/**
 * Remove expired or inactive instances from cache
 * Called by background watcher and status change operations
 * @param {string} reason - Reason for cleanup (expired, inactive, deleted)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason?: string): number;
/**
 * Update refresh attempt count for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} Current refresh attempt count
 */
export function incrementRefreshAttempts(instanceId: string): number;
/**
 * Reset refresh attempt count (after successful refresh)
 * @param {string} instanceId - UUID of the service instance
 */
export function resetRefreshAttempts(instanceId: string): void;
//# sourceMappingURL=credential-cache.d.ts.map