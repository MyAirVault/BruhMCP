/**
 * Cache management and maintenance
 * Handles cache updates, cleanup, and background operations
 */

import { getCacheMap, removeCachedCredential } from './cacheCore.js';

/**
 * Update cached credential metadata without changing tokens
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} updates - Metadata updates
 * @param {string} updates.user_id - New user ID (optional)
 * @param {string} updates.team_id - New team ID (optional)
 * @param {string} updates.status - Instance status (optional)
 * @param {number} updates.expiresAt - New expiration time (optional)
 * @returns {boolean} True if update was successful
 */
export function updateCachedCredentialMetadata(instanceId, updates) {
	const cache = getCacheMap();
	const cached = cache.get(instanceId);
	
	if (!cached) {
		console.log(`⚠️ Cannot update metadata: instance ${instanceId} not in cache`);
		return false;
	}
	
	// Apply updates
	const allowedUpdates = ['user_id', 'team_id', 'status', 'expiresAt'];
	let hasChanges = false;
	
	for (const [key, value] of Object.entries(updates)) {
		if (allowedUpdates.includes(key) && cached[key] !== value) {
			cached[key] = value;
			hasChanges = true;
		}
	}
	
	if (hasChanges) {
		cached.last_modified = new Date().toISOString();
		console.log(`✅ Updated Slack cache metadata for instance: ${instanceId}`);
		return true;
	}
	
	return false;
}

/**
 * Clean up invalid cache entries
 * @param {string} reason - Reason for cleanup (for logging)
 * @returns {number} Number of entries removed
 */
export function cleanupInvalidCacheEntries(reason = 'cleanup') {
	const cache = getCacheMap();
	const now = Date.now();
	let removedCount = 0;
	
	for (const [instanceId, entry] of cache.entries()) {
		let shouldRemove = false;
		let removeReason = '';
		
		// Check if expired
		if (entry.expiresAt && entry.expiresAt < now) {
			shouldRemove = true;
			removeReason = 'expired';
		}
		
		// Check if missing critical data
		if (!entry.bearerToken || !entry.user_id) {
			shouldRemove = true;
			removeReason = 'missing_critical_data';
		}
		
		// Check if too many failed refresh attempts
		if (entry.refresh_attempts > 5) {
			shouldRemove = true;
			removeReason = 'too_many_refresh_failures';
		}
		
		if (shouldRemove) {
			cache.delete(instanceId);
			removedCount++;
			console.log(`🧹 Removed invalid cache entry: ${instanceId} (reason: ${removeReason})`);
		}
	}
	
	if (removedCount > 0) {
		console.log(`🧹 Cache cleanup (${reason}): removed ${removedCount} invalid entries`);
	}
	
	return removedCount;
}

/**
 * Increment refresh attempts counter for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} New refresh attempts count
 */
export function incrementRefreshAttempts(instanceId) {
	const cache = getCacheMap();
	const cached = cache.get(instanceId);
	
	if (cached) {
		cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
		cached.last_refresh_attempt = new Date().toISOString();
		console.log(`🔄 Incremented refresh attempts for ${instanceId}: ${cached.refresh_attempts}`);
		return cached.refresh_attempts;
	}
	
	return 0;
}

/**
 * Reset refresh attempts counter for an instance
 * @param {string} instanceId - UUID of the service instance
 */
export function resetRefreshAttempts(instanceId) {
	const cache = getCacheMap();
	const cached = cache.get(instanceId);
	
	if (cached) {
		cached.refresh_attempts = 0;
		cached.last_successful_refresh = new Date().toISOString();
		console.log(`✅ Reset refresh attempts for ${instanceId}`);
	}
}

/**
 * Bulk cleanup of cache entries for a specific user
 * @param {string} userId - User ID to cleanup
 * @returns {number} Number of entries removed
 */
export function cleanupUserCacheEntries(userId) {
	const cache = getCacheMap();
	let removedCount = 0;
	
	for (const [instanceId, entry] of cache.entries()) {
		if (entry.user_id === userId) {
			cache.delete(instanceId);
			removedCount++;
			console.log(`🧹 Removed cache entry for user ${userId}: ${instanceId}`);
		}
	}
	
	return removedCount;
}

/**
 * Bulk cleanup of cache entries for a specific team
 * @param {string} teamId - Team ID to cleanup
 * @returns {number} Number of entries removed
 */
export function cleanupTeamCacheEntries(teamId) {
	const cache = getCacheMap();
	let removedCount = 0;
	
	for (const [instanceId, entry] of cache.entries()) {
		if (entry.team_id === teamId) {
			cache.delete(instanceId);
			removedCount++;
			console.log(`🧹 Removed cache entry for team ${teamId}: ${instanceId}`);
		}
	}
	
	return removedCount;
}