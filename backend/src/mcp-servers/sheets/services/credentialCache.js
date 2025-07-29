/**
 * @fileoverview Credential cache service for Google Sheets MCP
 * Manages in-memory caching of OAuth tokens
 */

const { pool  } = require('../../../db/config');

// Global credential cache for Google Sheets service instances
const sheetsCredentialCache = new Map();

// Cache synchronization interval
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
/** @type {NodeJS.Timeout|null} */
let syncInterval = null;

/**
 * Initialize the credential cache system
 */
function initializeCredentialCache() {
	console.log('🚀 Initializing Google Sheets OAuth credential cache system');
	sheetsCredentialCache.clear();
	
	// Start background sync
	startBackgroundSync();
	
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
 * @param {{bearerToken: string, refreshToken?: string, expiresAt: number, user_id: string}} credentialData - Credential data to cache
 */
function setCachedCredential(instanceId, credentialData) {
	const cacheEntry = {
		bearerToken: credentialData.bearerToken,
		refreshToken: credentialData.refreshToken,
		expiresAt: credentialData.expiresAt,
		user_id: credentialData.user_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString(),
		last_modified: new Date().toISOString(),
		status: 'active'
	};
	
	sheetsCredentialCache.set(instanceId, cacheEntry);
	console.log(`💾 Cached OAuth tokens for instance: ${instanceId}`);
}

/**
 * Update cached credential metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} metadata - Metadata to update
 */
function updateCachedCredentialMetadata(instanceId, metadata) {
	const cached = sheetsCredentialCache.get(instanceId);
	
	if (cached) {
		Object.assign(cached, metadata, {
			last_modified: new Date().toISOString()
		});
		console.log(`📝 Updated metadata for cached instance: ${instanceId}`);
	}
}

/**
 * Delete cached credential
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if deleted, false if not found
 */
function deleteCachedCredential(instanceId) {
	const deleted = sheetsCredentialCache.delete(instanceId);
	
	if (deleted) {
		console.log(`🗑️ Removed cached credential for instance: ${instanceId}`);
	}
	
	return deleted;
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStatistics() {
	const now = Date.now();
	const entries = Array.from(sheetsCredentialCache.entries());
	
	const stats = {
		totalEntries: sheetsCredentialCache.size,
		activeEntries: 0,
		expiredEntries: 0,
		recentlyUsed: 0,
		oldestEntry: null,
		newestEntry: null
	};
	
	entries.forEach(([_, entry]) => {
		if (entry.expiresAt && entry.expiresAt > now) {
			stats.activeEntries++;
		} else {
			stats.expiredEntries++;
		}
		
		const lastUsed = new Date(entry.last_used).getTime();
		if (now - lastUsed < 5 * 60 * 1000) { // Used in last 5 minutes
			stats.recentlyUsed++;
		}
		
		if (!stats.oldestEntry || entry.cached_at < stats.oldestEntry) {
			stats.oldestEntry = entry.cached_at;
		}
		
		if (!stats.newestEntry || entry.cached_at > stats.newestEntry) {
			stats.newestEntry = entry.cached_at;
		}
	});
	
	return stats;
}

/**
 * Clear all cached credentials
 * @returns {number} Number of entries cleared
 */
function clearCache() {
	const size = sheetsCredentialCache.size;
	sheetsCredentialCache.clear();
	console.log(`🧹 Cleared ${size} cached credentials`);
	return size;
}

/**
 * Start background synchronization
 */
function startBackgroundSync() {
	if (syncInterval) {
		clearInterval(syncInterval);
	}
	
	syncInterval = setInterval(() => {
		syncCacheWithDatabase();
	}, SYNC_INTERVAL);
	
	console.log('🔄 Started background cache synchronization');
}

/**
 * Stop background synchronization
 */
function stopBackgroundSync() {
	if (syncInterval) {
		clearInterval(syncInterval);
		syncInterval = null;
		console.log('🛑 Stopped background cache synchronization');
	}
}

/**
 * Sync cache with database
 */
async function syncCacheWithDatabase() {
	console.log('🔄 Starting cache synchronization with database');
	
	try {
		// Get all active instances from cache
		const cacheEntries = Array.from(sheetsCredentialCache.entries());
		
		if (cacheEntries.length === 0) {
			return;
		}
		
		// Update database with cache metadata
		for (const [instanceId, entry] of cacheEntries) {
			if (entry.status === 'active' && entry.last_modified) {
				await updateDatabaseMetadata(instanceId, {
					last_used_at: entry.last_used,
					usage_count_increment: 1
				});
			}
		}
		
		console.log(`✅ Synchronized ${cacheEntries.length} cache entries with database`);
		
	} catch (error) {
		console.error('❌ Cache synchronization failed:', error);
	}
}

/**
 * Update database metadata
 * @param {string} instanceId - Instance ID
 * @param {{last_used_at?: string, usage_count_increment?: number}} metadata - Metadata to update
 */
async function updateDatabaseMetadata(instanceId, metadata) {
	try {
		const query = `
			UPDATE mcp_service_table 
			SET 
				last_used_at = COALESCE($2, last_used_at),
				usage_count = usage_count + COALESCE($3, 0),
				updated_at = CURRENT_TIMESTAMP
			WHERE instance_id = $1
		`;
		
		await pool.query(query, [
			instanceId,
			metadata.last_used_at,
			metadata.usage_count_increment || 0
		]);
		
	} catch (error) {
		console.error(`Failed to update database metadata for ${instanceId}:`, error);
	}
}

module.exports = {
	initializeCredentialCache,
	getCachedCredential,
	getCacheStatistics,
	setCachedCredential
};