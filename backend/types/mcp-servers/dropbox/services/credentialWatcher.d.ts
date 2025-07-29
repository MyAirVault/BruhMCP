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
     * - Number of failed refresh attempts
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
export type CachedCredentialData = {
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
};
export type InstanceData = {
    /**
     * - Instance UUID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Service ID
     */
    mcp_service_id: string;
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at?: string | undefined;
    /**
     * - Last used timestamp
     */
    last_used_at?: string | undefined;
    /**
     * - Usage count
     */
    usage_count: number;
    /**
     * - Custom name
     */
    custom_name?: string | undefined;
    /**
     * - Renewed count
     */
    renewed_count: number;
    /**
     * - Last renewed timestamp
     */
    last_renewed_at?: string | undefined;
    /**
     * - Credentials updated timestamp
     */
    credentials_updated_at?: string | undefined;
    /**
     * - Created timestamp
     */
    created_at: string;
    /**
     * - Updated timestamp
     */
    updated_at: string;
};
export type TokenData = {
    /**
     * - OAuth access token
     */
    access_token: string;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
export type WatcherStatusInfo = {
    /**
     * - Whether the watcher is currently running
     */
    isRunning: boolean;
    /**
     * - Interval between runs in minutes
     */
    intervalMinutes: number;
    /**
     * - Threshold for token refresh in minutes
     */
    refreshThresholdMinutes: number;
    /**
     * - Maximum refresh attempts before giving up
     */
    maxRefreshAttempts: number;
    /**
     * - Watcher statistics with nextRunIn info
     */
    statistics: {
        lastRun: string | null;
        totalRuns: number;
        tokensRefreshed: number;
        refreshFailures: number;
        entriesCleanedUp: number;
        isRunning: boolean;
        nextRunIn: string;
    };
};
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
//# sourceMappingURL=credentialWatcher.d.ts.map