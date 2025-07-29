/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth Bearer access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 * @property {string} last_used - ISO timestamp of last usage
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - ISO timestamp when cached
 * @property {string} [status] - Instance status
 * @property {string} [last_modified] - ISO timestamp of last modification
 * @property {string} [last_refresh_attempt] - ISO timestamp of last refresh attempt
 * @property {string} [last_successful_refresh] - ISO timestamp of last successful refresh
 * @property {string} [scope] - OAuth scope
 */

/**
 * @typedef {Object} TokenData
 * @property {string} bearerToken - OAuth Bearer access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 */

/**
 * @typedef {Object} CacheStatistics
 * @property {number} total_entries - Total number of cached entries
 * @property {number} expired_entries - Number of expired entries
 * @property {number} recently_used - Number of recently used entries
 * @property {string|number} cache_hit_rate_last_hour - Cache hit rate percentage
 * @property {number} average_expiry_minutes - Average expiry time in minutes
 * @property {string} memory_usage_mb - Memory usage in MB
 */

/**
 * @typedef {Object} CredentialUpdate
 * @property {string} [status] - New instance status
 * @property {number} [expiresAt] - New token expiration timestamp
 * @property {string} [bearerToken] - New bearer token
 * @property {string} [refreshToken] - New refresh token
 */

/**
 * @typedef {Object} SyncOptions
 * @property {boolean} [forceRefresh] - Force refresh from database
 * @property {boolean} [updateDatabase] - Update database if cache is newer
 */

/**
 * @typedef {Object} BackgroundSyncOptions
 * @property {number} [maxInstances] - Maximum instances to sync per run
 * @property {boolean} [removeOrphaned] - Remove orphaned cache entries
 */

/**
 * @typedef {Object} SyncResults
 * @property {number} total - Total instances processed
 * @property {number} synced - Successfully synced instances
 * @property {number} errors - Number of errors
 * @property {number} orphaned - Number of orphaned instances
 * @property {number} skipped - Number of skipped instances
 */

/**
 * @typedef {Object} SyncController
 * @property {() => void} stop - Function to stop the sync service
 * @property {() => Promise<SyncResults>} runSync - Function to run sync manually
 */

/**
 * @typedef {Object} InstanceCredentials
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the instance
 * @property {string} oauth_status - OAuth status (pending, completed, failed, expired)
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {string|null} expires_at - Expiration timestamp
 * @property {number} usage_count - Usage count
 * @property {string|null} custom_name - Custom name for the instance
 * @property {string|null} last_used_at - Last usage timestamp
 * @property {string} mcp_service_name - MCP service name
 * @property {string} display_name - Service display name
 * @property {string} auth_type - Service type ('api_key' or 'oauth')
 * @property {boolean} service_active - Whether the service is active
 * @property {number} port - Service port
 * @property {string|null} api_key - API key (only for api_key type services)
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {string|null} token_expires_at - Token expiration timestamp
 * @property {string|null} oauth_completed_at - OAuth completion timestamp
 */

/**
 * Credential cache service for Dropbox MCP instance management
 * Phase 2: OAuth Bearer Token Management and Caching System implementation
 * 
 * This service manages in-memory caching of OAuth Bearer tokens and refresh tokens
 * to reduce database hits and improve request performance.
 */

// Global credential cache for Dropbox service instances
/** @type {Map<string, CachedCredential>} */
const dropboxCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
function initializeCredentialCache() {
	console.log('🚀 Initializing Dropbox OAuth credential cache system');
	dropboxCredentialCache.clear();
	console.log('✅ Dropbox OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {CachedCredential|null} Cached credential data or null if not found/expired
 */
function getCachedCredential(instanceId) {
	const cached = dropboxCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Bearer token from cache: ${instanceId}`);
		dropboxCredentialCache.delete(instanceId);
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
 * @param {TokenData} tokenData - Token data to cache
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
	
	dropboxCredentialCache.set(instanceId, cacheEntry);
	const expiresInMinutes = Math.floor((tokenData.expiresAt - Date.now()) / 60000);
	console.log(`💾 Cached OAuth tokens for instance: ${instanceId} (expires in ${expiresInMinutes} minutes)`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
function removeCachedCredential(instanceId) {
	const removed = dropboxCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed OAuth tokens from cache: ${instanceId}`);
	}
	return removed;
}

/**
 * Get cache statistics for monitoring
 * @returns {CacheStatistics} Cache statistics
 */
function getCacheStatistics() {
	const totalEntries = dropboxCredentialCache.size;
	const entries = Array.from(dropboxCredentialCache.values());
	
	const now = Date.now();
	const expiredCount = entries.filter(entry => {
		return entry.expiresAt && entry.expiresAt < now;
	}).length;
	
	const recentlyUsed = entries.filter(entry => {
		const lastUsed = new Date(entry.last_used);
		const hoursSinceUsed = (now - lastUsed.getTime()) / (1000 * 60 * 60);
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
		memory_usage_mb: (JSON.stringify(Array.from(dropboxCredentialCache.entries())).length / 1024 / 1024).toFixed(2)
	};
}

/**
 * Get all cached instance IDs (for debugging/monitoring)
 * @returns {string[]} Array of cached instance IDs
 */
function getCachedInstanceIds() {
	return Array.from(dropboxCredentialCache.keys());
}

/**
 * Check if an instance is cached and token is valid
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and token is valid
 */
function isInstanceCached(instanceId) {
	const cached = dropboxCredentialCache.get(instanceId);
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
	const count = dropboxCredentialCache.size;
	dropboxCredentialCache.clear();
	console.log(`🧹 Cleared ${count} entries from OAuth credential cache`);
}

/**
 * Get cache entry without updating last_used (for monitoring)
 * @param {string} instanceId - UUID of the service instance
 * @returns {CachedCredential|null} Cache entry or null
 */
function peekCachedCredential(instanceId) {
	return dropboxCredentialCache.get(instanceId) || null;
}

/**
 * Update cached token metadata without changing the tokens themselves
 * Used for status changes and token refresh to keep cache in sync
 * @param {string} instanceId - UUID of the service instance
 * @param {CredentialUpdate} updates - Updates to apply to cache entry
 * @returns {boolean} True if cache entry was updated, false if not found
 */
function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = dropboxCredentialCache.get(instanceId);
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

	dropboxCredentialCache.set(instanceId, cached);
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

	for (const [instanceId, cached] of dropboxCredentialCache.entries()) {
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
			dropboxCredentialCache.delete(instanceId);
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
	const cached = dropboxCredentialCache.get(instanceId);
	if (!cached) {
		return 0;
	}

	cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
	cached.last_refresh_attempt = new Date().toISOString();
	
	dropboxCredentialCache.set(instanceId, cached);
	
	console.log(`🔄 Refresh attempt ${cached.refresh_attempts} for instance: ${instanceId}`);
	return cached.refresh_attempts;
}

/**
 * Reset refresh attempt count (after successful refresh)
 * @param {string} instanceId - UUID of the service instance
 */
function resetRefreshAttempts(instanceId) {
	const cached = dropboxCredentialCache.get(instanceId);
	if (!cached) {
		return;
	}

	cached.refresh_attempts = 0;
	cached.last_successful_refresh = new Date().toISOString();
	
	dropboxCredentialCache.set(instanceId, cached);
	
	console.log(`✅ Reset refresh attempts for instance: ${instanceId}`);
}

/**
 * Synchronize cache with database for consistency
 * This function ensures cache and database are in sync during failure scenarios
 * @param {string} instanceId - UUID of the service instance
 * @param {SyncOptions} [options] - Sync options
 * @returns {Promise<boolean>} True if sync was successful
 */
async function syncCacheWithDatabase(instanceId, options = {}) {
	const { forceRefresh = false, updateDatabase = false } = options;
	
	try {
		// Import database functions dynamically to avoid circular dependencies
		const { lookupInstanceCredentials } = require('./database.js');
		
		// Get current cache state
		const cachedCredential = peekCachedCredential(instanceId);
		
		// Get database state
		const dbInstance = await lookupInstanceCredentials(instanceId, 'dropbox');
		
		if (!dbInstance) {
			// Instance doesn't exist in database, remove from cache
			if (cachedCredential) {
				removeCachedCredential(instanceId);
				console.log(`🗑️ Removed orphaned cache entry for instance: ${instanceId}`);
			}
			return false;
		}
		
		// Check if database has newer data
		const dbTokenTimestamp = dbInstance.oauth_completed_at ? 
			new Date(dbInstance.oauth_completed_at).getTime() : 0;
		const cacheTimestamp = cachedCredential?.cached_at ? 
			new Date(cachedCredential.cached_at).getTime() : 0;
		
		const dbIsNewer = dbTokenTimestamp > cacheTimestamp;
		const cacheIsNewer = cacheTimestamp > dbTokenTimestamp;
		
		// Force refresh from database
		if (forceRefresh || !cachedCredential || dbIsNewer) {
			console.log(`🔄 Syncing cache from database for instance: ${instanceId} (force: ${forceRefresh}, dbNewer: ${dbIsNewer})`);
			
			// Update cache with database data
			if (dbInstance.access_token && dbInstance.refresh_token) {
				const tokenExpiresAt = dbInstance.token_expires_at ? 
					new Date(dbInstance.token_expires_at).getTime() : 
					Date.now() + (3600 * 1000); // Default 1 hour
				
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
			
			const { updateOAuthStatus } = require('../../../db/queries/mcpInstances/index.js');
			
			const tokenExpiresAt = cachedCredential.expiresAt ? 
				new Date(cachedCredential.expiresAt) : undefined;
			
			await updateOAuthStatus(instanceId, {
				status: 'completed',
				accessToken: cachedCredential.bearerToken,
				refreshToken: cachedCredential.refreshToken,
				tokenExpiresAt: tokenExpiresAt,
				scope: cachedCredential.scope || undefined
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
 * @param {BackgroundSyncOptions} [options] - Sync options
 * @returns {Promise<SyncResults>} Sync results
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
 * @returns {SyncController} Sync service controller
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

module.exports = {
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