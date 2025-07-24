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
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} credentialData - Credential data to cache
 */
export function setCachedCredential(instanceId: string, credentialData: Object): void;
/**
 * Update cached credential metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} metadata - Metadata to update
 */
export function updateCachedCredentialMetadata(instanceId: string, metadata: Object): void;
/**
 * Delete cached credential
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteCachedCredential(instanceId: string): boolean;
/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics(): Object;
/**
 * Clear all cached credentials
 * @returns {number} Number of entries cleared
 */
export function clearCache(): number;
/**
 * Stop background synchronization
 */
export function stopBackgroundSync(): void;
//# sourceMappingURL=credentialCache.d.ts.map