/**
 * Initialize credential cache system
 */
export function initializeCredentialCache(): void;
/**
 * Sets cached credential for an instance
 * @param {string} instanceId - The instance ID
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - Bearer token
 * @param {string} tokenData.refreshToken - Refresh token
 * @param {number} tokenData.expiresAt - Expiration timestamp
 * @param {string} tokenData.user_id - User ID
 * @param {string} tokenData.tokenType - Token type (Bearer/Bot)
 * @param {string} tokenData.scope - Token scope
 */
export function setCachedCredential(instanceId: string, tokenData: {
    bearerToken: string;
    refreshToken: string;
    expiresAt: number;
    user_id: string;
    tokenType: string;
    scope: string;
}): void;
/**
 * Gets cached credential for an instance
 * @param {string} instanceId - The instance ID
 * @returns {Object|null} Cached credential or null if not found/expired
 */
export function getCachedCredential(instanceId: string): Object | null;
/**
 * Removes cached credential for an instance
 * @param {string} instanceId - The instance ID
 */
export function removeCachedCredential(instanceId: string): void;
/**
 * Checks if cached credential exists and is valid
 * @param {string} instanceId - The instance ID
 * @returns {boolean} True if valid cached credential exists
 */
export function hasCachedCredential(instanceId: string): boolean;
/**
 * Updates cached credential with new token data
 * @param {string} instanceId - The instance ID
 * @param {Object} updates - Updates to apply
 */
export function updateCachedCredential(instanceId: string, updates: Object): void;
/**
 * Increments refresh attempt count for an instance
 * @param {string} instanceId - The instance ID
 */
export function incrementRefreshAttempts(instanceId: string): void;
/**
 * Resets refresh attempt count for an instance
 * @param {string} instanceId - The instance ID
 */
export function resetRefreshAttempts(instanceId: string): void;
/**
 * Gets cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics(): Object;
/**
 * Cleans up expired tokens from cache
 * @returns {number} Number of tokens cleaned up
 */
export function cleanupExpiredTokens(): number;
/**
 * Gets instances that need token refresh
 * @returns {Array} Array of instance IDs that need refresh
 */
export function getInstancesNeedingRefresh(): any[];
/**
 * Clears all cached credentials (use with caution)
 */
export function clearAllCachedCredentials(): void;
/**
 * Gets all cached instance IDs
 * @returns {Array<string>} Array of instance IDs
 */
export function getCachedInstanceIds(): Array<string>;
/**
 * Checks if instance credential is close to expiry
 * @param {string} instanceId - The instance ID
 * @param {number} thresholdMinutes - Minutes before expiry to consider "close"
 * @returns {boolean} True if close to expiry
 */
export function isCredentialCloseToExpiry(instanceId: string, thresholdMinutes?: number): boolean;
/**
 * Gets credential expiry status for an instance
 * @param {string} instanceId - The instance ID
 * @returns {Object} Expiry status information
 */
export function getCredentialExpiryStatus(instanceId: string): Object;
//# sourceMappingURL=credential-cache.d.ts.map