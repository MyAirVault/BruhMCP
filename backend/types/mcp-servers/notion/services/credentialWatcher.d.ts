/**
 * Start the credential watcher background process
 * Runs every 30 seconds to maintain cache health
 * @returns {void}
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher background process
 * @returns {void}
 */
export function stopCredentialWatcher(): void;
/**
 * Check if credential watcher is running
 * @returns {boolean} True if watcher is active
 */
export function isCredentialWatcherRunning(): boolean;
/**
 * Force immediate cache maintenance check (for testing/manual triggers)
 * @returns {Promise<void>}
 */
export function forceMaintenanceCheck(): Promise<void>;
/**
 * Get watcher status and configuration
 * @returns {WatcherStatus} Watcher status information
 */
export function getWatcherStatus(): WatcherStatus;
export type RawCacheEntry = {
    /**
     * - OAuth Bearer token
     */
    credential: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Instance expiration timestamp
     */
    expiresAt: string;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
    /**
     * - ISO timestamp of last access
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
};
export type CacheEntry = {
    /**
     * - OAuth Bearer token
     */
    credential: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Instance expiration timestamp
     */
    expiresAt: string;
    /**
     * - User ID who owns this instance
     */
    user_id: string;
    /**
     * - ISO timestamp of last access
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
     * - Alternative field name for expiration
     */
    expires_at?: string | undefined;
    /**
     * - Instance status
     */
    status?: string | undefined;
    /**
     * - ISO timestamp of last modification
     */
    last_modified?: string | undefined;
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
    cache_hit_rate_last_hour: string;
    /**
     * - Memory usage in MB
     */
    memory_usage_mb: string;
};
export type WatcherStatus = {
    /**
     * - Whether watcher is active
     */
    is_running: boolean;
    /**
     * - Watcher interval in milliseconds
     */
    interval_ms: number;
    /**
     * - Expiration tolerance in milliseconds
     */
    expiration_tolerance_ms: number;
    /**
     * - Stale threshold in hours
     */
    stale_threshold_hours: number;
    /**
     * - Maximum cache size
     */
    max_cache_size: number;
    /**
     * - Watcher uptime in seconds
     */
    uptime_seconds: number;
};
export type CacheEntryWithId = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Cache entry data
     */
    cached: CacheEntry;
};
export type CacheEntryWithUsage = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Cache entry data
     */
    cached: CacheEntry;
};
//# sourceMappingURL=credentialWatcher.d.ts.map