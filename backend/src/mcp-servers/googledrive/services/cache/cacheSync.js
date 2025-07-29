/**
 * @typedef {Object} SyncStats
 * @property {number} checked - Number of cache entries checked
 * @property {number} synced - Number of entries synced with database
 * @property {number} removed - Number of entries removed
 * @property {number} errors - Number of errors encountered
 * @property {number} start_time - Start time in milliseconds
 * @property {number} [duration_ms] - Duration in milliseconds
 * @property {string} [error] - Error message if sync failed
 */

/**
 * @typedef {Object} CleanupStats
 * @property {number} total_checked - Total entries checked
 * @property {number} expired_removed - Number of expired entries removed
 * @property {number} invalid_removed - Number of invalid entries removed
 * @property {number} stale_removed - Number of stale entries removed
 */

/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {number} last_modified - Last modification timestamp
 * @property {number} [refresh_attempts] - Number of refresh attempts
 */

/**
 * @typedef {Object} DatabaseTokens
 * @property {string} access_token - OAuth access token from database
 * @property {string} refresh_token - OAuth refresh token from database
 * @property {number} expires_at - Token expiration timestamp from database
 */

/**
 * @typedef {Object} SyncController
 * @property {() => void} stop - Function to stop the sync service
 * @property {() => Promise<SyncStats>} runSync - Function to manually run sync
 */

/**
 * Cache synchronization service for Google Drive MCP
 * Handles background sync with database
 */

const { googleDriveCredentialCache  } = require('./cacheCore');
const { cleanupInvalidCacheEntries  } = require('./cacheMaintenance');
const { lookupInstanceCredentials  } = require('../database');

// Background sync state
/** @type {NodeJS.Timeout | null} */
let syncInterval = null;

/**
 * Perform background cache synchronization
 * @returns {Promise<SyncStats>} Sync statistics
 */
async function backgroundCacheSync() {
	console.log('🔄 Starting background cache sync...');
	
	/** @type {SyncStats} */
	const stats = {
		checked: 0,
		synced: 0,
		removed: 0,
		errors: 0,
		start_time: Date.now()
	};
	
	try {
		// First, cleanup invalid entries
		const cleanupStats = cleanupInvalidCacheEntries('background-sync');
		stats.removed = cleanupStats.expired_removed + cleanupStats.invalid_removed + cleanupStats.stale_removed;
		
		// Sync remaining entries with database
		for (const [instanceId, cached] of googleDriveCredentialCache.entries()) {
			stats.checked++;
			
			try {
				// Get current tokens from database
				const dbInstance = await lookupInstanceCredentials(instanceId, 'googledrive');
				
				if (!dbInstance) {
					// Instance no longer exists in database
					googleDriveCredentialCache.delete(instanceId);
					stats.removed++;
					continue;
				}
				
				/** @type {CachedCredential} */
				const typedCached = cached;
				
				// Check if cache is outdated
				if (typedCached.bearerToken !== dbInstance.access_token || 
					typedCached.refreshToken !== dbInstance.refresh_token) {
					// Update cache with database values
					if (dbInstance.access_token) {
						typedCached.bearerToken = dbInstance.access_token;
					}
					if (dbInstance.refresh_token) {
						typedCached.refreshToken = dbInstance.refresh_token;
					}
					// Handle token expiration - convert string to number if needed
					if (dbInstance.token_expires_at) {
						const expiresAt = typeof dbInstance.token_expires_at === 'string' 
							? new Date(dbInstance.token_expires_at).getTime()
							: dbInstance.token_expires_at;
						typedCached.expiresAt = expiresAt;
					} else {
						typedCached.expiresAt = Date.now() + 3600000; // Default 1 hour
					}
					typedCached.last_modified = Date.now();
					stats.synced++;
					console.log(`🔄 Synced cache with database for instance: ${instanceId}`);
				}
				
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				console.error(`Error syncing instance ${instanceId}:`, errorMessage);
				stats.errors++;
			}
		}
		
		stats.duration_ms = Date.now() - stats.start_time;
		console.log(`✅ Background cache sync completed in ${stats.duration_ms}ms`);
		console.log(`📊 Sync stats: ${stats.checked} checked, ${stats.synced} synced, ${stats.removed} removed, ${stats.errors} errors`);
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('❌ Background cache sync failed:', error);
		stats.error = errorMessage;
	}
	
	return stats;
}

/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {SyncController} Sync service controller
 */
function startBackgroundCacheSync(intervalMinutes = 5) {
	const intervalMs = intervalMinutes * 60 * 1000;
	
	console.log(`🚀 Starting background cache sync service (interval: ${intervalMinutes} minutes)`);
	
	syncInterval = setInterval(async () => {
		await backgroundCacheSync();
	}, intervalMs);
	
	// Run initial sync after 30 seconds
	setTimeout(async () => {
		await backgroundCacheSync();
	}, 30000);
	
	return {
		stop: () => {
			if (syncInterval) {
				clearInterval(syncInterval);
				syncInterval = null;
			}
			console.log(`⏹️ Stopped background cache sync service`);
		},
		runSync: () => backgroundCacheSync()
	};
}

module.exports = {
	startBackgroundCacheSync
};