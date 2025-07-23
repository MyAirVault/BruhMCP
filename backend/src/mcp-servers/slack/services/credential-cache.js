/**
 * Credential cache service for Slack MCP instance management
 * Phase 2: OAuth Bearer Token Management and Caching System implementation
 * 
 * This service manages in-memory caching of OAuth Bearer tokens and refresh tokens
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Slack service instances
const slackCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Slack OAuth credential cache system');
	slackCredentialCache.clear();
	console.log('✅ Slack OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Slack Bearer token from cache: ${instanceId}`);
		slackCredentialCache.delete(instanceId);
		return null;
	}
	
	// Update last used timestamp
	cached.last_used = new Date().toISOString();
	
	console.log(`✅ Slack cache hit for instance: ${instanceId}`);
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
 * @param {string} tokenData.team_id - Slack team ID
 */
export function setCachedCredential(instanceId, tokenData) {
	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		team_id: tokenData.team_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString()
	};
	
	slackCredentialCache.set(instanceId, cacheEntry);
	const expiresInMinutes = Math.floor((tokenData.expiresAt - Date.now()) / 60000);
	console.log(`💾 Cached Slack OAuth tokens for instance: ${instanceId} (expires in ${expiresInMinutes} minutes)`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId) {
	const removed = slackCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed Slack OAuth tokens from cache: ${instanceId}`);
	}
	return removed;
}

/**
 * Get cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
	const totalEntries = slackCredentialCache.size;
	const entries = Array.from(slackCredentialCache.values());
	
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
		memory_usage_mb: (JSON.stringify(Array.from(slackCredentialCache.entries())).length / 1024 / 1024).toFixed(2)
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(slackCredentialCache.keys());
}

/**
 * Check if an instance is cached and token is valid
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and token is valid
 */
export function isInstanceCached(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
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
	const count = slackCredentialCache.size;
	slackCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from Slack OAuth credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cache entry or null
 */
export function peekCachedCredential(instanceId) {
	return slackCredentialCache.get(instanceId) || null;
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
 * @param {string} [updates.team_id] - New team ID
 * @returns {boolean} True if cache entry was updated, false if not found
 */
export function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = slackCredentialCache.get(instanceId);
	if (!cached) {
		console.log(`ℹ️ No cache entry to update for Slack instance: ${instanceId}`);
		return false;
	}

	// Update metadata fields
	if (updates.expiresAt !== undefined) {
		cached.expiresAt = updates.expiresAt;
		const expiresInMinutes = Math.floor((updates.expiresAt - Date.now()) / 60000);
		console.log(`📅 Updated cached token expiration for Slack instance ${instanceId}: ${expiresInMinutes} minutes`);
	}

	if (updates.bearerToken !== undefined) {
		cached.bearerToken = updates.bearerToken;
		console.log(`🔄 Updated cached bearer token for Slack instance ${instanceId}`);
	}

	if (updates.refreshToken !== undefined) {
		cached.refreshToken = updates.refreshToken;
		console.log(`🔄 Updated cached refresh token for Slack instance ${instanceId}`);
	}

	if (updates.team_id !== undefined) {
		cached.team_id = updates.team_id;
		console.log(`🏢 Updated cached team ID for Slack instance ${instanceId}: ${updates.team_id}`);
	}

	if (updates.status !== undefined) {
		cached.status = updates.status;
		console.log(`🔄 Updated cached status for Slack instance ${instanceId}: ${updates.status}`);
	}

	// Update last modified timestamp
	cached.last_modified = new Date().toISOString();

	slackCredentialCache.set(instanceId, cached);
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

	for (const [instanceId, cached] of slackCredentialCache.entries()) {
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
			slackCredentialCache.delete(instanceId);
			removedCount++;
			console.log(`🗑️ Removed ${removeReason} Slack cache entry for instance: ${instanceId}`);
		}
	}

	if (removedCount > 0) {
		console.log(`🧹 Slack cache cleanup (${reason}): removed ${removedCount} invalid entries`);
	}

	return removedCount;
}

/**
 * Update refresh attempt count for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} Current refresh attempt count
 */
export function incrementRefreshAttempts(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	if (!cached) {
		return 0;
	}

	cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
	cached.last_refresh_attempt = new Date().toISOString();
	
	slackCredentialCache.set(instanceId, cached);
	
	console.log(`🔄 Refresh attempt ${cached.refresh_attempts} for Slack instance: ${instanceId}`);
	return cached.refresh_attempts;
}

/**
 * Reset refresh attempt count (after successful refresh)
 * @param {string} instanceId - UUID of the service instance
 */
export function resetRefreshAttempts(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	if (!cached) {
		return;
	}

	cached.refresh_attempts = 0;
	cached.last_successful_refresh = new Date().toISOString();
	
	slackCredentialCache.set(instanceId, cached);
	
	console.log(`✅ Reset refresh attempts for Slack instance: ${instanceId}`);
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
export async function syncCacheWithDatabase(instanceId, options = {}) {
	const { forceRefresh = false, updateDatabase = false } = options;
	
	try {
		// Import database functions dynamically to avoid circular dependencies
		const { getMCPInstanceById } = await import('../../../db/queries/mcpInstances/index.js');
		const { lookupInstanceCredentials } = await import('./database.js');
		
		// Get current cache state
		const cachedCredential = peekCachedCredential(instanceId);
		
		// Get database state
		const dbInstance = await lookupInstanceCredentials(instanceId, 'slack');
		
		if (!dbInstance) {
			// Instance doesn't exist in database, remove from cache
			if (cachedCredential) {
				removeCachedCredential(instanceId);
				console.log(`🗑️ Removed orphaned Slack cache entry for instance: ${instanceId}`);
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
			console.log(`🔄 Syncing Slack cache from database for instance: ${instanceId} (force: ${forceRefresh}, dbNewer: ${dbIsNewer})`);
			
			// Update cache with database data
			if (dbInstance.access_token && dbInstance.refresh_token) {
				const tokenExpiresAt = dbInstance.token_expires_at ? 
					new Date(dbInstance.token_expires_at).getTime() : 
					Date.now() + (43200 * 1000); // Default 12 hours for Slack
				
				setCachedCredential(instanceId, {
					bearerToken: dbInstance.access_token,
					refreshToken: dbInstance.refresh_token,
					expiresAt: tokenExpiresAt,
					user_id: dbInstance.user_id,
					team_id: dbInstance.team_id
				});
				
				console.log(`✅ Updated Slack cache from database for instance: ${instanceId}`);
			} else {
				// No valid tokens in database, remove from cache
				removeCachedCredential(instanceId);
				console.log(`🗑️ Removed Slack cache entry due to invalid database tokens: ${instanceId}`);
			}
			
			return true;
		}
		
		// Update database if cache is newer and updateDatabase is true
		if (updateDatabase && cacheIsNewer && cachedCredential) {
			console.log(`🔄 Updating database from Slack cache for instance: ${instanceId}`);
			
			const { updateOAuthStatus } = await import('../../../db/queries/mcpInstances/index.js');
			
			const tokenExpiresAt = cachedCredential.expiresAt ? 
				new Date(cachedCredential.expiresAt) : null;
			
			await updateOAuthStatus(instanceId, {
				status: 'completed',
				accessToken: cachedCredential.bearerToken,
				refreshToken: cachedCredential.refreshToken,
				tokenExpiresAt: tokenExpiresAt,
				scope: cachedCredential.scope || null,
				teamId: cachedCredential.team_id
			});
			
			console.log(`✅ Updated database from Slack cache for instance: ${instanceId}`);
			return true;
		}
		
		// Cache and database are in sync
		console.log(`✅ Slack cache and database are in sync for instance: ${instanceId}`);
		return true;
		
	} catch (error) {
		console.error(`❌ Failed to sync Slack cache with database for instance ${instanceId}:`, error);
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
export async function backgroundCacheSync(options = {}) {
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
		
		console.log(`🔄 Starting background Slack cache sync for ${cachedInstanceIds.length} instances`);
		
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
				console.error(`❌ Error syncing Slack instance ${instanceId}:`, error);
				results.errors++;
			}
		}
		
		// Skip remaining instances if there are too many
		results.skipped = cachedInstanceIds.length - instancesToProcess.length;
		
		console.log(`✅ Background Slack cache sync completed:`, results);
		return results;
		
	} catch (error) {
		console.error(`❌ Background Slack cache sync failed:`, error);
		results.errors++;
		return results;
	}
}

/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {Object} Sync service controller
 */
export function startBackgroundCacheSync(intervalMinutes = 5) {
	const intervalMs = intervalMinutes * 60 * 1000;
	
	console.log(`🚀 Starting background Slack cache sync service (interval: ${intervalMinutes} minutes)`);
	
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
			console.log(`⏹️ Stopped background Slack cache sync service`);
		},
		runSync: () => backgroundCacheSync()
	};
}