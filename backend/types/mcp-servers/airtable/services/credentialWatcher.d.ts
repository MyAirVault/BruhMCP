export type WatcherStatus = {
    /**
     * - Whether watcher is running
     */
    is_running: boolean;
    /**
     * - Check interval in milliseconds
     */
    interval_ms: number;
    /**
     * - Expiration tolerance
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
     * - Uptime in seconds
     */
    uptime_seconds: number;
};
export type CachedCredentialEntry = {
    /**
     * - API key
     */
    credential: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - User ID
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
     * - When cached
     */
    cached_at: string;
};
export type CacheStatistics = {
    /**
     * - Total entries in cache
     */
    total_entries: number;
    /**
     * - Number of expired entries
     */
    expired_entries: number;
    /**
     * - Recently used entries (last hour)
     */
    recently_used: number;
    /**
     * - Cache hit rate percentage
     */
    cache_hit_rate_last_hour: number | string;
    /**
     * - Memory usage in MB
     */
    memory_usage_mb: string;
};
/**
 * Start the credential watcher background process
 * Runs every 30 seconds to maintain cache health
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher background process
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
 * @typedef {Object} WatcherStatus
 * @property {boolean} is_running - Whether watcher is running
 * @property {number} interval_ms - Check interval in milliseconds
 * @property {number} expiration_tolerance_ms - Expiration tolerance
 * @property {number} stale_threshold_hours - Stale threshold in hours
 * @property {number} max_cache_size - Maximum cache size
 * @property {number} uptime_seconds - Uptime in seconds
 */
/**
 * Get watcher status and configuration
 * @returns {WatcherStatus} Watcher status information
 */
export function getWatcherStatus(): WatcherStatus;
//# sourceMappingURL=credentialWatcher.d.ts.map