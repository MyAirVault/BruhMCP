/**
 * Cache synchronization service for Google Drive MCP
 * Handles background sync with database
 */

import { googleDriveCredentialCache } from './cacheCore.js';
import { getCacheStatistics } from './cacheStatistics.js';
import { cleanupInvalidCacheEntries } from './cacheMaintenance.js';
import { getOAuthTokensForInstanceSync, updateOAuthTokenMetadataSync } from '../database.js';

// Background sync state
let syncInterval = null;

/**
 * Perform background cache synchronization
 * @returns {Promise<Object>} Sync statistics
 */
async function backgroundCacheSync() {
	console.log('🔄 Starting background cache sync...');
	
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
				const dbTokens = await getOAuthTokensForInstanceSync(instanceId);
				
				if (!dbTokens) {
					// Instance no longer exists in database
					googleDriveCredentialCache.delete(instanceId);
					stats.removed++;
					continue;
				}
				
				// Check if cache is outdated
				if (cached.bearerToken !== dbTokens.access_token || 
					cached.refreshToken !== dbTokens.refresh_token) {
					// Update cache with database values
					cached.bearerToken = dbTokens.access_token;
					cached.refreshToken = dbTokens.refresh_token;
					cached.expiresAt = dbTokens.expires_at;
					cached.last_modified = Date.now();
					stats.synced++;
					console.log(`🔄 Synced cache with database for instance: ${instanceId}`);
				}
				
				// Update database metadata with cache stats
				await updateOAuthTokenMetadataSync(instanceId, {
					last_cache_sync: Date.now(),
					cache_status: 'synced',
					refresh_attempts: cached.refresh_attempts || 0
				});
				
			} catch (error) {
				console.error(`Error syncing instance ${instanceId}:`, error.message);
				stats.errors++;
			}
		}
		
		stats.duration_ms = Date.now() - stats.start_time;
		console.log(`✅ Background cache sync completed in ${stats.duration_ms}ms`);
		console.log(`📊 Sync stats: ${stats.checked} checked, ${stats.synced} synced, ${stats.removed} removed, ${stats.errors} errors`);
		
	} catch (error) {
		console.error('❌ Background cache sync failed:', error);
		stats.error = error.message;
	}
	
	return stats;
}

/**
 * Start background cache synchronization service
 * @param {number} [intervalMinutes] - Sync interval in minutes (default: 5)
 * @returns {Object} Sync service controller
 */
export function startBackgroundCacheSync(intervalMinutes = 5) {
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
			clearInterval(syncInterval);
			console.log(`⏹️ Stopped background cache sync service`);
		},
		runSync: () => backgroundCacheSync()
	};
}