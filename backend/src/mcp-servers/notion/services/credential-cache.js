/**
 * Credential cache service for Notion MCP instance management
 * Phase 2: Token Management and Caching System implementation
 *
 * This service manages in-memory caching of Notion OAuth Bearer tokens
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Notion service instances
const notionCredentialCache = new Map();

// Cache operation locks to prevent race conditions
const cacheLocks = new Map();

/**
 * Acquire a lock for cache operations on a specific instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Function>} Release function to unlock
 */
async function acquireCacheLock(instanceId) {
	// Wait for any existing lock to be released
	while (cacheLocks.has(instanceId)) {
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	
	// Acquire the lock
	const lockPromise = new Promise((resolve) => {
		cacheLocks.set(instanceId, resolve);
	});
	
	// Return release function
	return () => {
		const resolve = cacheLocks.get(instanceId);
		if (resolve) {
			cacheLocks.delete(instanceId);
			resolve();
		}
	};
}

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Notion credential cache system');
	notionCredentialCache.clear();
	console.log('✅ Notion credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = notionCredentialCache.get(instanceId);

	if (!cached) {
		return null;
	}

	// Check if instance has expired
	if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
		console.log(`🗑️ Removing expired instance from cache: ${instanceId}`);
		notionCredentialCache.delete(instanceId);
		return null;
	}

	// Update last used timestamp
	cached.last_used = new Date().toISOString();

	console.log(`✅ Cache hit for instance: ${instanceId}`);

	// Return in the format expected by middleware
	return {
		bearerToken: cached.credential,
		refreshToken: cached.refreshToken,
		expiresAt: cached.expires_at,
		user_id: cached.user_id,
		last_used: cached.last_used,
		refresh_attempts: cached.refresh_attempts,
		cached_at: cached.cached_at,
	};
}

/**
 * Store credential in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} credentialData - Credential data to cache
 * @param {string} credentialData.bearerToken - OAuth Bearer token
 * @param {string} credentialData.refreshToken - OAuth refresh token
 * @param {string} credentialData.expires_at - Instance expiration timestamp
 * @param {string} credentialData.user_id - User ID who owns this instance
 */
export async function setCachedCredential(instanceId, credentialData) {
	const releaseLock = await acquireCacheLock(instanceId);
	
	try {
		const cacheEntry = {
			credential: credentialData.bearerToken,
			refreshToken: credentialData.refreshToken,
			expires_at: credentialData.expires_at,
			user_id: credentialData.user_id,
			last_used: new Date().toISOString(),
			refresh_attempts: 0,
			cached_at: new Date().toISOString(),
		};

		notionCredentialCache.set(instanceId, cacheEntry);
		console.log(`💾 Cached credential for instance: ${instanceId} (expires: ${credentialData.expires_at})`);
	} finally {
		releaseLock();
	}
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId) {
	const removed = notionCredentialCache.delete(instanceId);
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
	const totalEntries = notionCredentialCache.size;
	const entries = Array.from(notionCredentialCache.values());

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
		cache_hit_rate_last_hour: recentlyUsed > 0 ? ((recentlyUsed / totalEntries) * 100).toFixed(2) : 0,
		memory_usage_mb: (JSON.stringify(Array.from(notionCredentialCache.entries())).length / 1024 / 1024).toFixed(2),
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(notionCredentialCache.keys());
}

/**
 * Check if an instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and valid
 */
export function isInstanceCached(instanceId) {
	const cached = notionCredentialCache.get(instanceId);
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
	const count = notionCredentialCache.size;
	notionCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
export function peekCachedCredential(instanceId) {
	return notionCredentialCache.get(instanceId) || null;
}

/**
 * Update cached credential metadata (status, expiration) without changing the credential itself
 * Used for status changes and renewals to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Updates to apply to cache entry
 * @param {string} [updates.status] - New instance status
 * @param {string} [updates.expires_at] - New expiration timestamp
 * @returns {Promise<boolean>} True if cache entry was updated, false if not found
 */
export async function updateCachedCredentialMetadata(instanceId, updates) {
	const releaseLock = await acquireCacheLock(instanceId);
	
	try {
		const cached = notionCredentialCache.get(instanceId);
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

		notionCredentialCache.set(instanceId, cached);
		return true;
	} finally {
		releaseLock();
	}
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

	for (const [instanceId, cached] of notionCredentialCache.entries()) {
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
			notionCredentialCache.delete(instanceId);
			removedCount++;
			console.log(`🗑️ Removed ${removeReason} cache entry for instance: ${instanceId}`);
		}
	}

	if (removedCount > 0) {
		console.log(`🧹 Cache cleanup (${reason}): removed ${removedCount} invalid entries`);
	}

	return removedCount;
}
