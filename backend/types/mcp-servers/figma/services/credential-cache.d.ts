/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache(): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {CacheEntry|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): CacheEntry | null;
/**
 * Store credential in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {CredentialData} credentialData - Credential data to cache
 */
export function setCachedCredential(instanceId: string, credentialData: CredentialData): void;
/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId: string): boolean;
/**
 * Get cache statistics for monitoring
 * @returns {CacheStatistics} Cache statistics
 */
export function getCacheStatistics(): CacheStatistics;
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
 * @returns {CacheEntry|null} Cache entry or null
 */
export function peekCachedCredential(instanceId: string): CacheEntry | null;
/**
 * Update cached credential metadata (status, expiration) without changing the credential itself
 * Used for status changes and renewals to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {MetadataUpdates} updates - Updates to apply to cache entry
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: MetadataUpdates): boolean;
/**
 * Remove expired or inactive instances from cache
 * Called by background watcher and status change operations
 * @param {string} reason - Reason for cleanup (expired, inactive, deleted)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason?: string): number;
export type CacheEntry = {
    /**
     * - The cached credential (API key)
     */
    credential: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
    /**
     * - Last used timestamp
     */
    last_used: string;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - When the credential was cached
     */
    cached_at: string;
    /**
     * - Instance status
     */
    status?: string | undefined;
    /**
     * - Last modified timestamp
     */
    last_modified?: string | undefined;
};
export type CacheStatistics = {
    /**
     * - Total number of cache entries
     */
    total_entries: number;
    /**
     * - Number of expired entries
     */
    expired_entries: number;
    /**
     * - Number of recently used entries
     */
    recently_used: number;
    /**
     * - Cache hit rate percentage
     */
    cache_hit_rate_last_hour: string;
    /**
     * - Memory usage in MB
     */
    memory_usage_mb: string;
};
export type CredentialData = {
    /**
     * - Figma Personal Access Token
     */
    api_key: string;
    /**
     * - Instance expiration timestamp
     */
    expires_at: string;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
};
export type MetadataUpdates = {
    /**
     * - New instance status
     */
    status?: string | undefined;
    /**
     * - New expiration timestamp
     */
    expires_at?: string | undefined;
};
//# sourceMappingURL=credential-cache.d.ts.map