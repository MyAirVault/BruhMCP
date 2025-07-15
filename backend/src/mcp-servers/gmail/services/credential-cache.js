/**
 * Credential cache service for Gmail MCP instance management
 * Phase 2: OAuth Bearer Token Management and Caching System implementation
 * 
 * This service manages in-memory caching of OAuth Bearer tokens and refresh tokens
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Gmail service instances
const gmailCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Gmail OAuth credential cache system');
	gmailCredentialCache.clear();
	console.log('✅ Gmail OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = gmailCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Bearer token from cache: ${instanceId}`);
		gmailCredentialCache.delete(instanceId);
		return null;
	}
	
	// Update last used timestamp
	cached.last_used = new Date().toISOString();
	
	console.log(`✅ Cache hit for instance: ${instanceId}`);
	return cached;
}

/**
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - OAuth Bearer access token
 * @param {string} tokenData.refreshToken - OAuth refresh token
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {string} tokenData.user_id - User ID who owns this instance
 */
export function setCachedCredential(instanceId, tokenData) {
	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString()
	};
	
	gmailCredentialCache.set(instanceId, cacheEntry);
	const expiresInMinutes = Math.floor((tokenData.expiresAt - Date.now()) / 60000);
	console.log(`💾 Cached OAuth tokens for instance: ${instanceId} (expires in ${expiresInMinutes} minutes)`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId) {
	const removed = gmailCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed OAuth tokens from cache: ${instanceId}`);
	}
	return removed;
}

/**
 * Get cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
	const totalEntries = gmailCredentialCache.size;
	const entries = Array.from(gmailCredentialCache.values());
	
	const now = Date.now();
	const expiredCount = entries.filter(entry => {
		return entry.expiresAt && entry.expiresAt < now;
	}).length;
	
	const recentlyUsed = entries.filter(entry => {
		const lastUsed = new Date(entry.last_used);
		const hoursSinceUsed = (now - lastUsed) / (1000 * 60 * 60);
		return hoursSinceUsed < 1;
	}).length;
	
	const averageExpiryMinutes = entries.length > 0 
		? entries.reduce((sum, entry) => {
			const minutesToExpiry = (entry.expiresAt - now) / 60000;
			return sum + Math.max(0, minutesToExpiry);
		}, 0) / entries.length 
		: 0;
	
	return {
		total_entries: totalEntries,
		expired_entries: expiredCount,
		recently_used: recentlyUsed,
		cache_hit_rate_last_hour: recentlyUsed > 0 ? (recentlyUsed / totalEntries * 100).toFixed(2) : 0,
		average_expiry_minutes: Math.floor(averageExpiryMinutes),
		memory_usage_mb: (JSON.stringify(Array.from(gmailCredentialCache.entries())).length / 1024 / 1024).toFixed(2)
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(gmailCredentialCache.keys());
}

/**
 * Check if an instance is cached and token is valid
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and token is valid
 */
export function isInstanceCached(instanceId) {
	const cached = gmailCredentialCache.get(instanceId);
	if (!cached) return false;
	
	// Check Bearer token expiration
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		return false;
	}
	
	return true;
}

/**
 * Clear all cached credentials (for testing/restart)
 */
export function clearCredentialCache() {
	const count = gmailCredentialCache.size;
	gmailCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from OAuth credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
export function peekCachedCredential(instanceId) {
	return gmailCredentialCache.get(instanceId) || null;
}

/**
 * Update cached token metadata without changing the tokens themselves
 * Used for status changes and token refresh to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Updates to apply to cache entry
 * @param {string} [updates.status] - New instance status
 * @param {number} [updates.expiresAt] - New token expiration timestamp
 * @param {string} [updates.bearerToken] - New bearer token
 * @param {string} [updates.refreshToken] - New refresh token
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = gmailCredentialCache.get(instanceId);
	if (!cached) {
		console.log(`ℹ️ No cache entry to update for instance: ${instanceId}`);
		return false;
	}

	// Update metadata fields
	if (updates.expiresAt !== undefined) {
		cached.expiresAt = updates.expiresAt;
		const expiresInMinutes = Math.floor((updates.expiresAt - Date.now()) / 60000);
		console.log(`📅 Updated cached token expiration for instance ${instanceId}: ${expiresInMinutes} minutes`);
	}

	if (updates.bearerToken !== undefined) {
		cached.bearerToken = updates.bearerToken;
		console.log(`🔄 Updated cached bearer token for instance ${instanceId}`);
	}

	if (updates.refreshToken !== undefined) {
		cached.refreshToken = updates.refreshToken;
		console.log(`🔄 Updated cached refresh token for instance ${instanceId}`);
	}

	if (updates.status !== undefined) {
		cached.status = updates.status;
		console.log(`🔄 Updated cached status for instance ${instanceId}: ${updates.status}`);
	}

	// Update last modified timestamp
	cached.last_modified = new Date().toISOString();

	gmailCredentialCache.set(instanceId, cached);
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
	const now = Date.now();

	for (const [instanceId, cached] of gmailCredentialCache.entries()) {
		let shouldRemove = false;
		let removeReason = '';

		// Remove expired Bearer tokens
		if (cached.expiresAt && cached.expiresAt < now) {
			shouldRemove = true;
			removeReason = 'expired_token';
		}

		// Remove inactive entries (if status is tracked in cache)
		if (cached.status && ['inactive', 'expired'].includes(cached.status)) {
			shouldRemove = true;
			removeReason = cached.status;
		}

		if (shouldRemove) {
			gmailCredentialCache.delete(instanceId);
			removedCount++;
			console.log(`🗑️ Removed ${removeReason} cache entry for instance: ${instanceId}`);
		}
	}

	if (removedCount > 0) {
		console.log(`🧹 Cache cleanup (${reason}): removed ${removedCount} invalid entries`);
	}

	return removedCount;
}

/**
 * Update refresh attempt count for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} Current refresh attempt count
 */
export function incrementRefreshAttempts(instanceId) {
	const cached = gmailCredentialCache.get(instanceId);
	if (!cached) {
		return 0;
	}

	cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
	cached.last_refresh_attempt = new Date().toISOString();
	
	gmailCredentialCache.set(instanceId, cached);
	
	console.log(`🔄 Refresh attempt ${cached.refresh_attempts} for instance: ${instanceId}`);
	return cached.refresh_attempts;
}

/**
 * Reset refresh attempt count (after successful refresh)
 * @param {string} instanceId - UUID of the service instance
 */
export function resetRefreshAttempts(instanceId) {
	const cached = gmailCredentialCache.get(instanceId);
	if (!cached) {
		return;
	}

	cached.refresh_attempts = 0;
	cached.last_successful_refresh = new Date().toISOString();
	
	gmailCredentialCache.set(instanceId, cached);
	
	console.log(`✅ Reset refresh attempts for instance: ${instanceId}`);
}