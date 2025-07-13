/**
 * Credential cache service for Figma MCP instance management
 * Phase 2: Token Management and Caching System implementation
 * 
 * This service manages in-memory caching of Figma Personal Access Tokens (PAT)
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Figma service instances
const figmaCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Figma credential cache system');
	figmaCredentialCache.clear();
	console.log('✅ Figma credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = figmaCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if instance has expired
	if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
		console.log(`🗑️ Removing expired instance from cache: ${instanceId}`);
		figmaCredentialCache.delete(instanceId);
		return null;
	}
	
	// Update last used timestamp
	cached.last_used = new Date().toISOString();
	
	console.log(`✅ Cache hit for instance: ${instanceId}`);
	return cached;
}

/**
 * Store credential in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} credentialData - Credential data to cache
 * @param {string} credentialData.api_key - Figma Personal Access Token
 * @param {string} credentialData.expires_at - Instance expiration timestamp
 * @param {string} credentialData.user_id - User ID who owns this instance
 */
export function setCachedCredential(instanceId, credentialData) {
	const cacheEntry = {
		credential: credentialData.api_key,
		expires_at: credentialData.expires_at,
		user_id: credentialData.user_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString()
	};
	
	figmaCredentialCache.set(instanceId, cacheEntry);
	console.log(`💾 Cached credential for instance: ${instanceId} (expires: ${credentialData.expires_at})`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId) {
	const removed = figmaCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed credential from cache: ${instanceId}`);
	}
	return removed;
}

/**
 * Get cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
	const totalEntries = figmaCredentialCache.size;
	const entries = Array.from(figmaCredentialCache.values());
	
	const now = new Date();
	const expiredCount = entries.filter(entry => {
		return entry.expires_at && new Date(entry.expires_at) < now;
	}).length;
	
	const recentlyUsed = entries.filter(entry => {
		const lastUsed = new Date(entry.last_used);
		const hoursSinceUsed = (now - lastUsed) / (1000 * 60 * 60);
		return hoursSinceUsed < 1;
	}).length;
	
	return {
		total_entries: totalEntries,
		expired_entries: expiredCount,
		recently_used: recentlyUsed,
		cache_hit_rate_last_hour: recentlyUsed > 0 ? (recentlyUsed / totalEntries * 100).toFixed(2) : 0,
		memory_usage_mb: (JSON.stringify(Array.from(figmaCredentialCache.entries())).length / 1024 / 1024).toFixed(2)
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(figmaCredentialCache.keys());
}

/**
 * Check if an instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and valid
 */
export function isInstanceCached(instanceId) {
	const cached = figmaCredentialCache.get(instanceId);
	if (!cached) return false;
	
	// Check expiration
	if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
		return false;
	}
	
	return true;
}

/**
 * Clear all cached credentials (for testing/restart)
 */
export function clearCredentialCache() {
	const count = figmaCredentialCache.size;
	figmaCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
export function peekCachedCredential(instanceId) {
	return figmaCredentialCache.get(instanceId) || null;
}