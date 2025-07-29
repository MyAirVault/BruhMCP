/**
 * Core credential cache functionality for Google Drive MCP
 * Manages in-memory storage of OAuth tokens
 */
export const googleDriveCredentialCache: Map<any, any>;
/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache(): void;
/**
 * Set cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @param {any} tokenData - Token data to cache
 */
export function setCachedCredential(instanceId: string, tokenData: any): void;
/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {any} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId: string): any;
/**
 * Remove cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if removed, false if not found
 */
export function removeCachedCredential(instanceId: string): boolean;
/**
 * Get all cached instance IDs
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds(): string[];
/**
 * Check if instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached
 */
export function isInstanceCached(instanceId: string): boolean;
/**
 * Clear all cached credentials
 * WARNING: This will force all active instances to re-authenticate
 */
export function clearCredentialCache(): number;
/**
 * Peek at cached credential without updating last accessed time
 * Useful for monitoring and debugging
 * @param {string} instanceId - UUID of the service instance
 * @returns {any} Cached credential data or null
 */
export function peekCachedCredential(instanceId: string): any;
//# sourceMappingURL=cacheCore.d.ts.map