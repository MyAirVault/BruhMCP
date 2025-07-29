/**
 * Cache statistics and monitoring for Google Drive MCP
 * Provides insights into cache performance and health
 */

const { googleDriveCredentialCache  } = require('./cacheCore');

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStatistics() {
	/** @type {any} */
	const stats = {
		total_entries: googleDriveCredentialCache.size,
		active_entries: 0,
		expired_entries: 0,
		near_expiry_entries: 0,
		last_accessed_times: /** @type {number[]} */ ([]),
		refresh_attempt_counts: /** @type {number[]} */ ([]),
		user_distribution: /** @type {any} */ ({})
	};
	
	const now = Date.now();
	const nearExpiryThreshold = 10 * 60 * 1000; // 10 minutes
	
	for (const [instanceId, cached] of googleDriveCredentialCache.entries()) {
		// Check expiry status
		if (cached.expiresAt) {
			if (cached.expiresAt < now) {
				stats.expired_entries++;
			} else if (cached.expiresAt - now < nearExpiryThreshold) {
				stats.near_expiry_entries++;
			} else {
				stats.active_entries++;
			}
		} else {
			stats.active_entries++;
		}
		
		// Track last accessed times
		if (cached.last_used) {
			stats.last_accessed_times.push(cached.last_used);
		}
		
		// Track refresh attempts
		stats.refresh_attempt_counts.push(cached.refresh_attempts || 0);
		
		// Track user distribution
		const userId = cached.user_id || 'unknown';
		stats.user_distribution[userId] = (stats.user_distribution[userId] || 0) + 1;
	}
	
	// Calculate average last accessed time
	if (stats.last_accessed_times.length > 0) {
		const avgLastAccessed = stats.last_accessed_times.reduce((/** @type {any} */ a, /** @type {any} */ b) => a + b, 0) / stats.last_accessed_times.length;
		stats.avg_minutes_since_access = Math.round((now - avgLastAccessed) / 60000);
	}
	
	// Calculate max refresh attempts
	if (stats.refresh_attempt_counts.length > 0) {
		stats.max_refresh_attempts = Math.max(...stats.refresh_attempt_counts);
		stats.avg_refresh_attempts = stats.refresh_attempt_counts.reduce((/** @type {any} */ a, /** @type {any} */ b) => a + b, 0) / stats.refresh_attempt_counts.length;
	}
	
	return stats;
}

module.exports = {
	getCacheStatistics
};