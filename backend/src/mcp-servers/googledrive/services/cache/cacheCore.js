/**
 * Core credential cache functionality for Google Drive MCP
 * Manages in-memory storage of OAuth tokens
 */

// Global credential cache for Google Drive service instances
export const googleDriveCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Google Drive OAuth credential cache system');
	googleDriveCredentialCache.clear();
	console.log('✅ Google Drive OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = googleDriveCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Bearer token from cache: ${instanceId}`);
		googleDriveCredentialCache.delete(instanceId);
		return null;
	}
	
	// Update last accessed time
	cached.last_used = Date.now();
	
	return {
		bearerToken: cached.bearerToken,
		refreshToken: cached.refreshToken,
		expiresAt: cached.expiresAt,
		user_id: cached.user_id,
		instance_id: instanceId
	};
}

/**
 * Set cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} tokenData - Token data to cache
 */
export function setCachedCredential(instanceId, tokenData) {
	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		last_used: Date.now(),
		refresh_attempts: 0,
		cached_at: Date.now(),
		last_modified: Date.now(),
		status: tokenData.status || 'active'
	};
	
	googleDriveCredentialCache.set(instanceId, cacheEntry);
	console.log(`💾 Cached OAuth tokens for instance: ${instanceId}`);
}

/**
 * Remove cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if removed, false if not found
 */
export function removeCachedCredential(instanceId) {
	const result = googleDriveCredentialCache.delete(instanceId);
	if (result) {
		console.log(`🗑️ Removed cached OAuth tokens for instance: ${instanceId}`);
	}
	return result;
}

/**
 * Get all cached instance IDs
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(googleDriveCredentialCache.keys());
}

/**
 * Check if instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached
 */
export function isInstanceCached(instanceId) {
	return googleDriveCredentialCache.has(instanceId);
}

/**
 * Clear all cached credentials
 * WARNING: This will force all active instances to re-authenticate
 */
export function clearCredentialCache() {
	const count = googleDriveCredentialCache.size;
	googleDriveCredentialCache.clear();
	console.log(`🧹 Cleared ${count} cached OAuth tokens`);
	return count;
}

/**
 * Peek at cached credential without updating last accessed time
 * Useful for monitoring and debugging
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null
 */
export function peekCachedCredential(instanceId) {
	const cached = googleDriveCredentialCache.get(instanceId);
	if (!cached) {
		return null;
	}
	
	return { ...cached }; // Return copy to prevent modifications
}