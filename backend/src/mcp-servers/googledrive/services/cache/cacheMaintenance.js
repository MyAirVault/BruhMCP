/**
 * Cache maintenance and cleanup for Google Drive MCP
 * Handles cache cleanup and expiry management
 */

import { googleDriveCredentialCache, removeCachedCredential } from './cacheCore.js';

/**
 * Clean up invalid or expired cache entries
 * @param {string} [reason] - Reason for cleanup (for logging)
 * @returns {{total_checked: number, expired_removed: number, invalid_removed: number, stale_removed: number}} Cleanup statistics
 */
export function cleanupInvalidCacheEntries(reason = 'cleanup') {
	const stats = {
		total_checked: 0,
		expired_removed: 0,
		invalid_removed: 0,
		stale_removed: 0
	};
	
	const now = Date.now();
	const staleThreshold = 30 * 60 * 1000; // 30 minutes without access
	const entriesToRemove = [];
	
	for (const [instanceId, cached] of googleDriveCredentialCache.entries()) {
		stats.total_checked++;
		
		// Check for expired tokens
		if (cached.expiresAt && cached.expiresAt < now) {
			entriesToRemove.push({ id: instanceId, reason: 'expired' });
			stats.expired_removed++;
			continue;
		}
		
		// Check for invalid entries
		if (!cached.bearerToken || !cached.refreshToken) {
			entriesToRemove.push({ id: instanceId, reason: 'invalid' });
			stats.invalid_removed++;
			continue;
		}
		
		// Check for stale entries (not accessed in 30 minutes)
		if (cached.last_used && (now - cached.last_used) > staleThreshold) {
			entriesToRemove.push({ id: instanceId, reason: 'stale' });
			stats.stale_removed++;
		}
	}
	
	// Remove identified entries
	for (const entry of entriesToRemove) {
		removeCachedCredential(entry.id);
		console.log(`🧹 Removed ${entry.reason} cache entry: ${entry.id} (reason: ${reason})`);
	}
	
	const totalRemoved = stats.expired_removed + stats.invalid_removed + stats.stale_removed;
	if (totalRemoved > 0) {
		console.log(`✅ Cache cleanup completed: ${totalRemoved} entries removed (${reason})`);
	}
	
	return stats;
}