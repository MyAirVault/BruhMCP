/**
 * Start the credential watcher service
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher(): void;
/**
 * Watcher status information
 * @typedef {Object} WatcherStatus
 * @property {boolean} isRunning - Whether the watcher is running
 * @property {number} intervalMinutes - Watcher interval in minutes
 * @property {number} refreshThresholdMinutes - Token refresh threshold in minutes
 * @property {number} maxRefreshAttempts - Maximum refresh attempts
 * @property {WatcherStatistics & {nextRunIn: string}} statistics - Watcher statistics with next run info
 */
/**
 * Get watcher status and statistics
 * @returns {WatcherStatus} Watcher status information
 */
export function getWatcherStatus(): WatcherStatus;
/**
 * Force refresh a specific instance token
 * @param {string} instanceId - Instance ID to refresh
 * @returns {Promise<boolean>} True if refresh was successful
 */
export function forceRefreshInstanceToken(instanceId: string): Promise<boolean>;
/**
 * Manual cleanup of invalid cache entries
 * @returns {number} Number of entries removed
 */
export function manualCleanup(): number;
/**
 * Watcher status information
 */
export type WatcherStatus = {
    /**
     * - Whether the watcher is running
     */
    isRunning: boolean;
    /**
     * - Watcher interval in minutes
     */
    intervalMinutes: number;
    /**
     * - Token refresh threshold in minutes
     */
    refreshThresholdMinutes: number;
    /**
     * - Maximum refresh attempts
     */
    maxRefreshAttempts: number;
    /**
     * - Watcher statistics with next run info
     */
    statistics: WatcherStatistics & {
        nextRunIn: string;
    };
};
/**
 * Watcher statistics tracking
 */
export type WatcherStatistics = {
    /**
     * - ISO timestamp of last run
     */
    lastRun: string | null;
    /**
     * - Total number of runs
     */
    totalRuns: number;
    /**
     * - Number of tokens successfully refreshed
     */
    tokensRefreshed: number;
    /**
     * - Number of refresh failures
     */
    refreshFailures: number;
    /**
     * - Number of cache entries cleaned up
     */
    entriesCleanedUp: number;
    /**
     * - Whether the watcher is currently running
     */
    isRunning: boolean;
};
/**
 * Cached credential object from cache service
 */
export type CachedCredential = {
    /**
     * - OAuth Bearer token
     */
    bearerToken: string;
    /**
     * - OAuth refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp in milliseconds
     */
    expiresAt: number;
    /**
     * - Number of refresh attempts made
     */
    refresh_attempts?: number | undefined;
};
//# sourceMappingURL=credentialWatcher.d.ts.map