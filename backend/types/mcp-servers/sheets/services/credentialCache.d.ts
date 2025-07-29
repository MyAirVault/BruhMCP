/**
 * Initialize the credential cache system
 */
export function initializeCredentialCache(): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): Object | null;
/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics(): Object;
/**
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {{bearerToken: string, refreshToken?: string, expiresAt: number, user_id: string}} credentialData - Credential data to cache
 */
export function setCachedCredential(instanceId: string, credentialData: {
    bearerToken: string;
    refreshToken?: string;
    expiresAt: number;
    user_id: string;
}): void;
//# sourceMappingURL=credentialCache.d.ts.map