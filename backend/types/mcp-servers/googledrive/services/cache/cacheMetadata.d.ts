/**
 * Update cached credential metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Metadata updates to apply
 * @returns {boolean} True if updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId: string, updates: Object): boolean;
/**
 * Increment refresh attempts for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} New refresh attempt count, or -1 if not found
 */
export function incrementRefreshAttempts(instanceId: string): number;
/**
 * Reset refresh attempts for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if reset, false if not found
 */
export function resetRefreshAttempts(instanceId: string): boolean;
//# sourceMappingURL=cacheMetadata.d.ts.map