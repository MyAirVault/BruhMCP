/**
 * OAuth token refresh options
 */
export type TokenRefreshOptions = {
    /**
     * - The refresh token
     */
    refreshToken: string;
    /**
     * - OAuth client ID
     */
    clientId: string;
    /**
     * - OAuth client secret
     */
    clientSecret: string;
};
/**
 * New OAuth tokens received from refresh
 */
export type NewOAuthTokens = {
    /**
     * - New access token
     */
    access_token: string;
    /**
     * - New refresh token (if provided)
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in: number;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
/**
 * Token refresh error information
 */
export type TokenRefreshError = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - Error type classification
     */
    errorType: string;
    /**
     * - Original error details
     */
    originalError: string;
    /**
     * - Error name
     */
    name: string;
};
/**
 * Token refresh result
 */
export type TokenRefreshResult = {
    /**
     * - Whether refresh was successful
     */
    success: boolean;
    /**
     * - New access token
     */
    accessToken?: string | undefined;
    /**
     * - New refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expiresIn?: number | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Error information if failed
     */
    error?: TokenRefreshError | undefined;
    /**
     * - Method used for refresh ('oauth_service' | 'direct_oauth')
     */
    method: string;
    /**
     * - Additional metadata for successful refresh
     */
    metadata?: TokenRefreshMetadata | undefined;
    /**
     * - Additional error info for failed refresh
     */
    errorInfo?: TokenRefreshErrorInfo | undefined;
};
/**
 * Token refresh metadata for successful operations
 */
export type TokenRefreshMetadata = {
    /**
     * - Token expiration in seconds
     */
    expiresIn: number;
    /**
     * - Token scope
     */
    scope: string;
    /**
     * - Refresh operation duration in ms
     */
    responseTime: number;
    /**
     * - Method used for refresh
     */
    method: string;
};
/**
 * Token refresh error information for failed operations
 */
export type TokenRefreshErrorInfo = {
    /**
     * - The error that occurred
     */
    error: TokenRefreshError;
    /**
     * - Method used for refresh
     */
    method: string;
    /**
     * - Refresh operation duration in ms
     */
    responseTime: number;
    /**
     * - Original error message
     */
    originalError: string;
    /**
     * - User ID
     */
    userId: string;
};
/**
 * Database instance record
 */
export type DatabaseInstance = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - Current access token
     */
    access_token?: string | undefined;
    /**
     * - Current refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration date
     */
    token_expires_at?: Date | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - OAuth status ('pending' | 'completed' | 'failed')
     */
    oauth_status: string;
};
/**
 * Express request object with authentication data
 */
export type ExpressRequest = {
    /**
     * - Instance ID from middleware
     */
    instanceId: string;
    /**
     * - Bearer token from middleware
     */
    bearerToken?: string | undefined;
    /**
     * - User ID from middleware
     */
    userId?: string | undefined;
    /**
     * - Express params
     */
    params: Object;
    /**
     * - Express body
     */
    body: Object;
    /**
     * - Express headers
     */
    headers: Object;
};
/**
 * Authentication error result
 */
export type AuthErrorResult = {
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Error type classification
     */
    errorType: string;
    /**
     * - Error message for user
     */
    message: string;
    /**
     * - HTTP status code to return
     */
    statusCode: number;
};
/**
 * Cached credential entry
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
     * - Owner user ID
     */
    user_id: string;
    /**
     * - Last access timestamp
     */
    last_used: number;
    /**
     * - Failed refresh counter
     */
    refresh_attempts: number;
    /**
     * - Cache creation time
     */
    cached_at: number;
    /**
     * - Last update time
     */
    last_modified: number;
    /**
     * - Instance status
     */
    status: string;
};
/**
 * Cache statistics
 */
export type CacheStatistics = {
    /**
     * - Total cached entries
     */
    totalEntries: number;
    /**
     * - Valid (non-expired) entries
     */
    validEntries: number;
    /**
     * - Expired entries
     */
    expiredEntries: number;
    /**
     * - Cache hit rate percentage
     */
    hitRate: number;
    /**
     * - Total cache hits
     */
    totalHits: number;
    /**
     * - Total cache misses
     */
    totalMisses: number;
    /**
     * - Last cleanup timestamp
     */
    lastCleanup: string;
};
/**
 * Watcher statistics
 */
export type WatcherStatistics = {
    /**
     * - Whether watcher is running
     */
    isRunning: boolean;
    /**
     * - Last run timestamp
     */
    lastRun: number;
    /**
     * - Total number of runs
     */
    totalRuns: number;
    /**
     * - Successful token refreshes
     */
    successfulRefreshes: number;
    /**
     * - Failed token refreshes
     */
    failedRefreshes: number;
    /**
     * - Cleaned up invalid entries
     */
    cleanedUpEntries: number;
};
/**
 * Session statistics
 */
export type SessionStatistics = {
    /**
     * - Total active sessions
     */
    totalSessions: number;
    /**
     * - Cleanup interval in milliseconds
     */
    cleanupIntervalMs: number;
    /**
     * - Whether cleanup is enabled
     */
    cleanupEnabled: boolean;
    /**
     * - Last cleanup timestamp
     */
    lastCleanup: string;
};
//# sourceMappingURL=types.d.ts.map