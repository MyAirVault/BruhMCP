/**
 * Start the credential watcher service
 */
export function startCredentialWatcher(): void;
/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher(): void;
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
export type ExtendedCachedCredential = import("../middleware/types.js").ExtendedCachedCredential;
export type DatabaseInstance = import("../middleware/types.js").DatabaseInstance;
export type NewOAuthTokens = import("../middleware/types.js").NewOAuthTokens;
export type TokenRefreshOptions = import("../middleware/types.js").TokenRefreshOptions;
export type WatcherStats = {
    /**
     * - ISO timestamp of last run
     */
    lastRun: string | null;
    /**
     * - Total number of watcher cycles
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
export type WatcherStatus = {
    /**
     * - Whether the watcher is currently running
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
     * - Maximum refresh attempts allowed
     */
    maxRefreshAttempts: number;
    /**
     * - Extended statistics with next run info
     */
    statistics: WatcherStats & {
        nextRunIn: string;
    };
};
//# sourceMappingURL=credentialWatcher.d.ts.map