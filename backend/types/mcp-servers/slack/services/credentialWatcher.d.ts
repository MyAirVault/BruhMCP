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
 * @returns {WatcherStatusInfo} Watcher status information
 */
export function getWatcherStatus(): WatcherStatusInfo;
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
 * Cached credential entry from cache
 */
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
     * - Number of refresh attempts
     */
    refresh_attempts?: number | undefined;
};
/**
 * Instance credentials from database
 */
export type InstanceCredentials = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - Slack team ID
     */
    team_id?: string | undefined;
    /**
     * - Slack team name
     */
    team_name?: string | undefined;
};
/**
 * Watcher statistics object
 */
export type WatcherStats = {
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
     * - Whether watcher is currently running
     */
    isRunning: boolean;
};
/**
 * Watcher status information
 */
export type WatcherStatusInfo = {
    /**
     * - Whether watcher is running
     */
    isRunning: boolean;
    /**
     * - Watcher interval in minutes
     */
    intervalMinutes: number;
    /**
     * - Refresh threshold in minutes
     */
    refreshThresholdMinutes: number;
    /**
     * - Maximum refresh attempts
     */
    maxRefreshAttempts: number;
    /**
     * - Watcher statistics with nextRunIn property
     */
    statistics: Object;
};
//# sourceMappingURL=credentialWatcher.d.ts.map