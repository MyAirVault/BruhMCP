/**
 * Cache statistics and monitoring
 * Provides metrics and monitoring for the credential cache
 */

import { getCacheMap } from './cacheCore.js';

/**
 * Get comprehensive cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
	const cache = getCacheMap();
	const stats = {
		total_entries: cache.size,
		expired_entries: 0,
		valid_entries: 0,
		entries_by_user: {},
		entries_by_team: {},
		average_age_minutes: 0,
		oldest_entry_age_minutes: 0,
		newest_entry_age_minutes: 0,
		refresh_attempt_stats: {
			zero_attempts: 0,
			one_to_three_attempts: 0,
			more_than_three_attempts: 0
		}
	};

	const now = Date.now();
	let totalAgeMinutes = 0;
	const ages = [];

	for (const [instanceId, entry] of cache.entries()) {
		const ageMinutes = Math.floor((now - new Date(entry.cached_at).getTime()) / 60000);
		ages.push(ageMinutes);
		totalAgeMinutes += ageMinutes;

		// Check if expired
		if (entry.expiresAt && entry.expiresAt < now) {
			stats.expired_entries++;
		} else {
			stats.valid_entries++;
		}

		// Group by user
		if (entry.user_id) {
			stats.entries_by_user[entry.user_id] = (stats.entries_by_user[entry.user_id] || 0) + 1;
		}

		// Group by team
		if (entry.team_id) {
			stats.entries_by_team[entry.team_id] = (stats.entries_by_team[entry.team_id] || 0) + 1;
		}

		// Refresh attempt stats
		if (entry.refresh_attempts === 0) {
			stats.refresh_attempt_stats.zero_attempts++;
		} else if (entry.refresh_attempts <= 3) {
			stats.refresh_attempt_stats.one_to_three_attempts++;
		} else {
			stats.refresh_attempt_stats.more_than_three_attempts++;
		}
	}

	// Calculate age statistics
	if (ages.length > 0) {
		stats.average_age_minutes = Math.floor(totalAgeMinutes / ages.length);
		stats.oldest_entry_age_minutes = Math.max(...ages);
		stats.newest_entry_age_minutes = Math.min(...ages);
	}

	return stats;
}

/**
 * Get list of cached instance IDs
 * @returns {string[]} Array of instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(getCacheMap().keys());
}

/**
 * Get performance metrics for cache operations
 * @returns {Object} Performance metrics
 */
export function getCachePerformanceMetrics() {
	const cache = getCacheMap();
	const stats = getCacheStatistics();
	
	return {
		cache_size: cache.size,
		hit_rate_estimate: stats.valid_entries / Math.max(stats.total_entries, 1),
		memory_usage_estimate_kb: Math.floor(cache.size * 2), // Rough estimate
		active_teams: Object.keys(stats.entries_by_team).length,
		active_users: Object.keys(stats.entries_by_user).length,
		health_score: calculateCacheHealthScore(stats)
	};
}

/**
 * Calculate cache health score (0-100)
 * @param {Object} stats - Cache statistics
 * @returns {number} Health score
 */
function calculateCacheHealthScore(stats) {
	if (stats.total_entries === 0) return 100;
	
	const validRatio = stats.valid_entries / stats.total_entries;
	const refreshFailureRatio = stats.refresh_attempt_stats.more_than_three_attempts / stats.total_entries;
	
	// Base score from valid entries
	let score = validRatio * 80;
	
	// Penalty for high refresh failure rate
	score -= refreshFailureRatio * 30;
	
	// Bonus for having active entries
	if (stats.total_entries > 0 && stats.average_age_minutes < 60) {
		score += 10;
	}
	
	return Math.max(0, Math.min(100, Math.floor(score)));
}