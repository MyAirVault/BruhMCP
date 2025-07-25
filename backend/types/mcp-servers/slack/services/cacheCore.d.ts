/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache(): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): Object | null;
/**
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - OAuth Bearer access token
 * @param {string} tokenData.refreshToken - OAuth refresh token
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {string} tokenData.user_id - User ID who owns this instance
 * @param {string} tokenData.team_id - Slack team ID
 */
export function setCachedCredential(instanceId: string, tokenData: {
    bearerToken: string;
    refreshToken: string;
    expiresAt: number;
    user_id: string;
    team_id: string;
}): void;
/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId: string): void;
/**
 * Check if instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and not expired
 */
export function isInstanceCached(instanceId: string): boolean;
/**
 * Clear all cached credentials
 */
export function clearCredentialCache(): void;
/**
 * Peek at cached credential without updating last_used timestamp
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function peekCachedCredential(instanceId: string): Object | null;
/**
 * Get access to the internal cache Map (for advanced operations)
 * @returns {Map<string, CacheEntry>} The internal cache Map
 */
export function getCacheMap(): Map<string, CacheEntry>;
export type CacheEntry = {
    /**
     * - Bearer token
     */
    bearerToken: string;
    /**
     * - Refresh token
     */
    refreshToken: string;
    /**
     * - Expiration timestamp
     */
    expiresAt: number;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Team ID
     */
    team_id: string;
    /**
     * - Last used timestamp
     */
    last_used: string;
    /**
     * - Number of refresh attempts
     */
    refresh_attempts: number;
    /**
     * - Cache timestamp
     */
    cached_at: string;
    /**
     * - Last modified timestamp
     */
    last_modified?: string | undefined;
    /**
     * - Last refresh attempt timestamp
     */
    last_refresh_attempt?: string | undefined;
    /**
     * - Last successful refresh timestamp
     */
    last_successful_refresh?: string | undefined;
};
//# sourceMappingURL=cacheCore.d.ts.map