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

/**
 * Update cached credential metadata (status, expiration) without changing the credential itself
 * Used for status changes and renewals to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Updates to apply to cache entry
 * @param {string} [updates.status] - New instance status
 * @param {string} [updates.expires_at] - New expiration timestamp
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = figmaCredentialCache.get(instanceId);
	if (!cached) {
		console.log(`ℹ️ No cache entry to update for instance: ${instanceId}`);
		return false;
	}

	// Update metadata fields
	if (updates.expires_at !== undefined) {
		cached.expires_at = updates.expires_at;
		console.log(`📅 Updated cached expiration for instance ${instanceId}: ${updates.expires_at}`);
	}

	if (updates.status !== undefined) {
		cached.status = updates.status;
		console.log(`🔄 Updated cached status for instance ${instanceId}: ${updates.status}`);
	}

	// Update last modified timestamp
	cached.last_modified = new Date().toISOString();

	figmaCredentialCache.set(instanceId, cached);
	return true;
}

/**
 * Remove expired or inactive instances from cache
 * Called by background watcher and status change operations
 * @param {string} reason - Reason for cleanup (expired, inactive, deleted)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason = 'cleanup') {
	let removedCount = 0;
	const now = new Date();

	for (const [instanceId, cached] of figmaCredentialCache.entries()) {
		let shouldRemove = false;
		let removeReason = '';

		// Remove expired entries
		if (cached.expires_at && new Date(cached.expires_at) < now) {
			shouldRemove = true;
			removeReason = 'expired';
		}

		// Remove inactive entries (if status is tracked in cache)
		if (cached.status && ['inactive', 'expired'].includes(cached.status)) {
			shouldRemove = true;
			removeReason = cached.status;
		}

		if (shouldRemove) {
			figmaCredentialCache.delete(instanceId);
			removedCount++;
			console.log(`🗑️ Removed ${removeReason} cache entry for instance: ${instanceId}`);
		}
	}

	if (removedCount > 0) {
		console.log(`🧹 Cache cleanup (${reason}): removed ${removedCount} invalid entries`);
	}

	return removedCount;
}