export type CacheEntry = import('./cacheCore.js').CacheEntry;
/**
 * @typedef {import('./cacheCore.js').CacheEntry} CacheEntry
 */
/**
 * Update cached credential metadata without changing tokens
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Metadata updates
 * @param {string} updates.user_id - New user ID (optional)
 * @param {string} updates.team_id - New team ID (optional)
 * @param {string} updates.status - Instance status (optional)
 * @param {number} updates.expiresAt - New expiration time (optional)
 * @returns {boolean} True if update was successful
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: {
    user_id: string;
    team_id: string;
    status: string;
    expiresAt: number;
}): boolean;
/**
 * Clean up invalid cache entries
 * @param {string} reason - Reason for cleanup (for logging)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason?: string): number;
/**
 * Increment refresh attempts counter for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} New refresh attempts count
 */
export function incrementRefreshAttempts(instanceId: string): number;
/**
 * Reset refresh attempts counter for an instance
 * @param {string} instanceId - UUID of the service instance
 */
export function resetRefreshAttempts(instanceId: string): void;
/**
 * Bulk cleanup of cache entries for a specific user
 * @param {string} userId - User ID to cleanup
 * @returns {number} Number of entries removed
 */
export function cleanupUserCacheEntries(userId: string): number;
/**
 * Bulk cleanup of cache entries for a specific team
 * @param {string} teamId - Team ID to cleanup
 * @returns {number} Number of entries removed
 */
export function cleanupTeamCacheEntries(teamId: string): number;
//# sourceMappingURL=cacheManagement.d.ts.map