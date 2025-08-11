export type CachedCredential = {
    /**
     * - OAuth bearer token
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
     * - User ID
     */
    user_id: string;
    /**
     * - Last used timestamp ISO string
     */
    last_used: string;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - Cached timestamp ISO string
     */
    cached_at: string;
    /**
     * - Last modified timestamp ISO string
     */
    last_modified: string;
    /**
     * - Status (active, expired, etc.)
     */
    status: string;
};
export type WatcherStatistics = {
    /**
     * - Last run timestamp ISO string
     */
    lastRun: string | null;
    /**
     * - Total number of runs
     */
    totalRuns: number;
    /**
     * - Number of tokens refreshed
     */
    tokensRefreshed: number;
    /**
     * - Number of refresh failures
     */
    refreshFailures: number;
    /**
     * - Number of entries cleaned up
     */
    entriesCleanedUp: number;
    /**
     * - Whether watcher is running
     */
    isRunning: boolean;
};
export type DatabaseInstance = import("./database.js").InstanceCredentials;
export type TokenRefreshResult = {
    /**
     * - New access token
     */
    access_token: string;
    /**
     * - New refresh token (optional)
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration time in seconds
     */
    expires_in: number;
};
export type CacheStatistics = {
    /**
     * - Total cache entries
     */
    totalEntries: number;
    /**
     * - Active cache entries
     */
    activeEntries: number;
    /**
     * - Expired cache entries
     */
    expiredEntries: number;
    /**
     * - Recently used entries
     */
    recentlyUsed: number;
    /**
     * - Oldest entry timestamp
     */
    oldestEntry: string | null;
    /**
     * - Newest entry timestamp
     */
    newestEntry: string | null;
};
/**
 * Start the credential watcher service
 * @returns {NodeJS.Timeout} Watcher interval
 */
export function startCredentialWatcher(): NodeJS.Timeout;
/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher(): void;
/**
 * Get watcher status
 * @returns {WatcherStatistics} Watcher status and statistics
 */
export function getWatcherStatus(): WatcherStatistics;
//# sourceMappingURL=credentialWatcher.d.ts.map