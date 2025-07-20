/**
 * Credential cache service for Google Sheets MCP instance management
 * Phase 2: OAuth Bearer Token Management and Caching System implementation
 * Based on Gmail MCP implementation patterns
 * 
 * This service manages in-memory caching of OAuth Bearer tokens and refresh tokens
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Google Sheets service instances
const sheetsCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
function initializeCredentialCache() {
	console.log('🚀 Initializing Google Sheets OAuth credential cache system');
	sheetsCredentialCache.clear();
	console.log('✅ Google Sheets OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
function getCachedCredential(instanceId) {
	const cached = sheetsCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Bearer token from cache: ${instanceId}`);
		sheetsCredentialCache.delete(instanceId);
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
function setCachedCredential(instanceId, tokenData) {
	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString()
	};
	
	sheetsCredentialCache.set(instanceId, cacheEntry);
	const expiresInMinutes = Math.floor((tokenData.expiresAt - Date.now()) / 60000);
	console.log(`💾 Cached OAuth tokens for instance: ${instanceId} (expires in ${expiresInMinutes} minutes)`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
function removeCachedCredential(instanceId) {
	const removed = sheetsCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed OAuth tokens from cache: ${instanceId}`);
	}
	return removed;
}

/**
 * Get cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
function getCacheStatistics() {
	const totalEntries = sheetsCredentialCache.size;
	const entries = Array.from(sheetsCredentialCache.values());
	
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
		memory_usage_mb: (JSON.stringify(Array.from(sheetsCredentialCache.entries())).length / 1024 / 1024).toFixed(2)
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
function getCachedInstanceIds() {
	return Array.from(sheetsCredentialCache.keys());
}

/**
 * Check if an instance is cached and token is valid
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and token is valid
 */
function isInstanceCached(instanceId) {
	const cached = sheetsCredentialCache.get(instanceId);
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
function clearCredentialCache() {
	const count = sheetsCredentialCache.size;
	sheetsCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from OAuth credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
function peekCachedCredential(instanceId) {
	return sheetsCredentialCache.get(instanceId) || null;
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
function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = sheetsCredentialCache.get(instanceId);
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

	sheetsCredentialCache.set(instanceId, cached);
	return true;
}

/**
 * Remove expired or inactive instances from cache
 * Called by background watcher and status change operations
 * @param {string} reason - Reason for cleanup (expired, inactive, deleted)
 * @returns {number} Number of entries removed
 */
function cleanupInvalidCacheEntries(reason = 'cleanup') {
	let removedCount = 0;
	const now = Date.now();

	for (const [instanceId, cached] of sheetsCredentialCache.entries()) {
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
			sheetsCredentialCache.delete(instanceId);
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
function incrementRefreshAttempts(instanceId) {
	const cached = sheetsCredentialCache.get(instanceId);
	if (!cached) {
		return 0;
	}

	cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
	cached.last_refresh_attempt = new Date().toISOString();
	
	sheetsCredentialCache.set(instanceId, cached);
	
	console.log(`🔄 Refresh attempt ${cached.refresh_attempts} for instance: ${instanceId}`);
	return cached.refresh_attempts;
}

/**
 * Reset refresh attempt count (after successful refresh)
 * @param {string} instanceId - UUID of the service instance
 */
function resetRefreshAttempts(instanceId) {
	const cached = sheetsCredentialCache.get(instanceId);
	if (!cached) {
		return;
	}

	cached.refresh_attempts = 0;
	cached.last_successful_refresh = new Date().toISOString();
	
	sheetsCredentialCache.set(instanceId, cached);
	
	console.log(`✅ Reset refresh attempts for instance: ${instanceId}`);
}

/**
 * Synchronize cache with database for consistency
 * This function ensures cache and database are in sync during failure scenarios
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} options - Sync options
 * @param {boolean} [options.forceRefresh] - Force refresh from database
 * @param {boolean} [options.updateDatabase] - Update database if cache is newer
 * @returns {Promise<boolean>} True if sync was successful
 */
async function syncCacheWithDatabase(instanceId, options = {}) {
	const { forceRefresh = false, updateDatabase = false } = options;
	
	try {
		// Import database functions dynamically to avoid circular dependencies
		const { lookupInstanceCredentials } = await import('./database.js');
		
		// Get current cache state
		const cachedCredential = peekCachedCredential(instanceId);
		
		// Get database state
		const dbInstance = await lookupInstanceCredentials(instanceId, 'sheets');
		
		if (!dbInstance) {
			// Instance doesn't exist in database, remove from cache
			if (cachedCredential) {
				removeCachedCredential(instanceId);
				console.log(`🗑️ Removed orphaned cache entry for instance: ${instanceId}`);
			}
			return false;
		}
		
		// Check if database has newer data
		const dbTokenTimestamp = dbInstance.credentials_updated_at ? 
			new Date(dbInstance.credentials_updated_at).getTime() : 0;
		const cacheTimestamp = cachedCredential?.cached_at ? 
			new Date(cachedCredential.cached_at).getTime() : 0;
		
		const dbIsNewer = dbTokenTimestamp > cacheTimestamp;
		const cacheIsNewer = cacheTimestamp > dbTokenTimestamp;
		
		// Force refresh from database
		if (forceRefresh || !cachedCredential || dbIsNewer) {
			console.log(`🔄 Syncing cache from database for instance: ${instanceId} (force: ${forceRefresh}, dbNewer: ${dbIsNewer})`);
			
			// Update cache with database data
			if (dbInstance.access_token && dbInstance.refresh_token) {
				let tokenExpiresAt;
				if (dbInstance.token_expires_at) {
					const expirationDate = new Date(dbInstance.token_expires_at);
					tokenExpiresAt = isNaN(expirationDate.getTime()) ? 
						Date.now() + (3600 * 1000) : // Default 1 hour if invalid date
						expirationDate.getTime();
				} else {
					tokenExpiresAt = Date.now() + (3600 * 1000); // Default 1 hour
				}
				
				setCachedCredential(instanceId, {
					bearerToken: dbInstance.access_token,
					refreshToken: dbInstance.refresh_token,
					expiresAt: tokenExpiresAt,
					user_id: dbInstance.user_id
				});
				
				console.log(`✅ Updated cache from database for instance: ${instanceId}`);
			} else {
				// No valid tokens in database, remove from cache
				removeCachedCredential(instanceId);
				console.log(`🗑️ Removed cache entry due to invalid database tokens: ${instanceId}`);
			}
			
			return true;
		}
		
		// Update database if cache is newer and updateDatabase is true
		if (updateDatabase && cacheIsNewer && cachedCredential) {
			console.log(`🔄 Updating database from cache for instance: ${instanceId}`);
			
			const { updateOAuthStatus } = await import('../../../db/queries/mcpInstancesQueries.js');
			
			const tokenExpiresAt = cachedCredential.expiresAt ? 
				new Date(cachedCredential.expiresAt) : null;
			
			await updateOAuthStatus(instanceId, {
				status: 'completed',
				accessToken: cachedCredential.bearerToken,
				refreshToken: cachedCredential.refreshToken,
				tokenExpiresAt: tokenExpiresAt,
				scope: cachedCredential.scope || null
			});
			
			console.log(`✅ Updated database from cache for instance: ${instanceId}`);
			return true;
		}
		
		// Cache and database are in sync
		console.log(`✅ Cache and database are in sync for instance: ${instanceId}`);
		return true;
		
	} catch (error) {
		console.error(`❌ Failed to sync cache with database for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Background synchronization for all cached instances
 * This function runs periodically to ensure cache-database consistency
 * @param {Object} options - Sync options
 * @param {number} [options.maxInstances] - Maximum instances to sync per run
 * @param {boolean} [options.removeOrphaned] - Remove orphaned cache entries
 * @returns {Promise<Object>} Sync results
 */
async function backgroundCacheSync(options = {}) {
	const { maxInstances = 50, removeOrphaned = true } = options;
	
	const results = {
		total: 0,
		synced: 0,
		errors: 0,
		orphaned: 0,
		skipped: 0
	};
	
	try {
		const cachedInstanceIds = getCachedInstanceIds();
		results.total = cachedInstanceIds.length;
		
		console.log(`🔄 Starting background cache sync for ${cachedInstanceIds.length} instances`);
		
		// Process instances in batches
		const instancesToProcess = cachedInstanceIds.slice(0, maxInstances);
		
		for (const instanceId of instancesToProcess) {
			try {
				const syncResult = await syncCacheWithDatabase(instanceId, { forceRefresh: false });
				
				if (syncResult) {
					results.synced++;
				} else {
					results.orphaned++;
					if (removeOrphaned) {
						removeCachedCredential(instanceId);
					}
				}
				
				// Small delay to prevent overwhelming the database
				await new Promise(resolve => setTimeout(resolve, 10));
				
			} catch (error) {
				console.error(`❌ Error syncing instance ${instanceId}:`, error);
				results.errors++;
			}
		}
		
		// Skip remaining instances if there are too many
		results.skipped = cachedInstanceIds.length - instancesToProcess.length;
		
		console.log(`✅ Background cache sync completed:`, results);
		return results;
		
	} catch (error) {
		console.error(`❌ Background cache sync failed:`, error);
		results.errors++;
		return results;
	}
}

/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {Object} Sync service controller
 */
function startBackgroundCacheSync(intervalMinutes = 5) {
	const intervalMs = intervalMinutes * 60 * 1000;
	
	console.log(`🚀 Starting background cache sync service (interval: ${intervalMinutes} minutes)`);
	
	const syncInterval = setInterval(async () => {
		await backgroundCacheSync();
	}, intervalMs);
	
	// Run initial sync after 30 seconds
	setTimeout(async () => {
		await backgroundCacheSync();
	}, 30000);
	
	return {
		stop: () => {
			clearInterval(syncInterval);
			console.log(`⏹️ Stopped background cache sync service`);
		},
		runSync: () => backgroundCacheSync()
	};
}

export {
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	getCacheStatistics,
	getCachedInstanceIds,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential,
	updateCachedCredentialMetadata,
	cleanupInvalidCacheEntries,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	syncCacheWithDatabase,
	backgroundCacheSync,
	startBackgroundCacheSync
};