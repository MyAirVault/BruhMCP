export type SyncStats = {
    /**
     * - Number of cache entries checked
     */
    checked: number;
    /**
     * - Number of entries synced with database
     */
    synced: number;
    /**
     * - Number of entries removed
     */
    removed: number;
    /**
     * - Number of errors encountered
     */
    errors: number;
    /**
     * - Start time in milliseconds
     */
    start_time: number;
    /**
     * - Duration in milliseconds
     */
    duration_ms?: number | undefined;
    /**
     * - Error message if sync failed
     */
    error?: string | undefined;
};
export type CleanupStats = {
    /**
     * - Total entries checked
     */
    total_checked: number;
    /**
     * - Number of expired entries removed
     */
    expired_removed: number;
    /**
     * - Number of invalid entries removed
     */
    invalid_removed: number;
    /**
     * - Number of stale entries removed
     */
    stale_removed: number;
};
export type CachedCredential = {
    /**
     * - OAuth access token
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
     * - Last modification timestamp
     */
    last_modified: number;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts?: number | undefined;
};
export type DatabaseTokens = {
    /**
     * - OAuth access token from database
     */
    access_token: string;
    /**
     * - OAuth refresh token from database
     */
    refresh_token: string;
    /**
     * - Token expiration timestamp from database
     */
    expires_at: number;
};
export type SyncController = {
    /**
     * - Function to stop the sync service
     */
    stop: () => void;
    /**
     * - Function to manually run sync
     */
    runSync: () => Promise<SyncStats>;
};
/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {SyncController} Sync service controller
 */
export function startBackgroundCacheSync(intervalMinutes?: number | undefined): SyncController;
//# sourceMappingURL=cacheSync.d.ts.map