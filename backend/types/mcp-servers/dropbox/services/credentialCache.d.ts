export type CachedCredential = {
    /**
     * - OAuth Bearer access token
     */
    bearerToken: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
    /**
     * - ISO timestamp of last usage
     */
    last_used: string;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - ISO timestamp when cached
     */
    cached_at: string;
    /**
     * - Instance status
     */
    status?: string | undefined;
    /**
     * - ISO timestamp of last modification
     */
    last_modified?: string | undefined;
    /**
     * - ISO timestamp of last refresh attempt
     */
    last_refresh_attempt?: string | undefined;
    /**
     * - ISO timestamp of last successful refresh
     */
    last_successful_refresh?: string | undefined;
    /**
     * - OAuth scope
     */
    scope?: string | undefined;
};
export type TokenData = {
    /**
     * - OAuth Bearer access token
     */
    bearerToken: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
};
export type CacheStatistics = {
    /**
     * - Total number of cached entries
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
    cache_hit_rate_last_hour: string | number;
    /**
     * - Average expiry time in minutes
     */
    average_expiry_minutes: number;
    /**
     * - Memory usage in MB
     */
    memory_usage_mb: string;
};
export type CredentialUpdate = {
    /**
     * - New instance status
     */
    status?: string | undefined;
    /**
     * - New token expiration timestamp
     */
    expiresAt?: number | undefined;
    /**
     * - New bearer token
     */
    bearerToken?: string | undefined;
    /**
     * - New refresh token
     */
    refreshToken?: string | undefined;
};
export type SyncOptions = {
    /**
     * - Force refresh from database
     */
    forceRefresh?: boolean | undefined;
    /**
     * - Update database if cache is newer
     */
    updateDatabase?: boolean | undefined;
};
export type BackgroundSyncOptions = {
    /**
     * - Maximum instances to sync per run
     */
    maxInstances?: number | undefined;
    /**
     * - Remove orphaned cache entries
     */
    removeOrphaned?: boolean | undefined;
};
export type SyncResults = {
    /**
     * - Total instances processed
     */
    total: number;
    /**
     * - Successfully synced instances
     */
    synced: number;
    /**
     * - Number of errors
     */
    errors: number;
    /**
     * - Number of orphaned instances
     */
    orphaned: number;
    /**
     * - Number of skipped instances
     */
    skipped: number;
};
export type SyncController = {
    /**
     * - Function to stop the sync service
     */
    stop: () => void;
    /**
     * - Function to run sync manually
     */
    runSync: () => Promise<SyncResults>;
};
export type InstanceCredentials = {
    /**
     * - Unique instance identifier
     */
    instance_id: string;
    /**
     * - User ID who owns the instance
     */
    user_id: string;
    /**
     * - OAuth status (pending, completed, failed, expired)
     */
    oauth_status: string;
    /**
     * - Instance status (active, inactive, expired)
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string | null;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Custom name for the instance
     */
    custom_name: string | null;
    /**
     * - Last usage timestamp
     */
    last_used_at: string | null;
    /**
     * - MCP service name
     */
    mcp_service_name: string;
    /**
     * - Service display name
     */
    display_name: string;
    /**
     * - Service type ('api_key' or 'oauth')
     */
    auth_type: string;
    /**
     * - Whether the service is active
     */
    service_active: boolean;
    /**
     * - Service port
     */
    port: number;
    /**
     * - API key (only for api_key type services)
     */
    api_key: string | null;
    /**
     * - OAuth client ID
     */
    client_id: string | null;
    /**
     * - OAuth client secret
     */
    client_secret: string | null;
    /**
     * - OAuth access token
     */
    access_token: string | null;
    /**
     * - OAuth refresh token
     */
    refresh_token: string | null;
    /**
     * - Token expiration timestamp
     */
    token_expires_at: string | null;
    /**
     * - OAuth completion timestamp
     */
    oauth_completed_at: string | null;
};
/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache(): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {CachedCredential|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): CachedCredential | null;
/**
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {TokenData} tokenData - Token data to cache
 */
export function setCachedCredential(instanceId: string, tokenData: TokenData): void;
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
 * @returns {CachedCredential|null} Cache entry or null
 */
export function peekCachedCredential(instanceId: string): CachedCredential | null;
/**
 * Update cached token metadata without changing the tokens themselves
 * Used for status changes and token refresh to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {CredentialUpdate} updates - Updates to apply to cache entry
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: CredentialUpdate): boolean;
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
/**
 * Synchronize cache with database for consistency
 * This function ensures cache and database are in sync during failure scenarios
 * @param {string} instanceId - UUID of the service instance
 * @param {SyncOptions} [options] - Sync options
 * @returns {Promise<boolean>} True if sync was successful
 */
export function syncCacheWithDatabase(instanceId: string, options?: SyncOptions): Promise<boolean>;
/**
 * Background synchronization for all cached instances
 * This function runs periodically to ensure cache-database consistency
 * @param {BackgroundSyncOptions} [options] - Sync options
 * @returns {Promise<SyncResults>} Sync results
 */
export function backgroundCacheSync(options?: BackgroundSyncOptions): Promise<SyncResults>;
/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {SyncController} Sync service controller
 */
export function startBackgroundCacheSync(intervalMinutes?: number): SyncController;
//# sourceMappingURL=credentialCache.d.ts.map