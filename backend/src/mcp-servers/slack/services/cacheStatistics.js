/**
 * Cache statistics and monitoring
 * Provides metrics and monitoring for the credential cache
 */

import { getCacheMap } from './cacheCore.js';

/**
 * @typedef {import('./cacheCore.js').CacheEntry} CacheEntry
 */


/**
 * @typedef {Object} RefreshAttemptStats
 * @property {number} zero_attempts - Entries with zero refresh attempts
 * @property {number} one_to_three_attempts - Entries with 1-3 refresh attempts
 * @property {number} more_than_three_attempts - Entries with more than 3 refresh attempts
 */

/**
 * @typedef {Object} CacheStatistics
 * @property {number} total_entries - Total number of cache entries
 * @property {number} expired_entries - Number of expired entries
 * @property {number} valid_entries - Number of valid entries
 * @property {Record<string, number>} entries_by_user - Count of entries by user ID
 * @property {Record<string, number>} entries_by_team - Count of entries by team ID
 * @property {number} average_age_minutes - Average age of entries in minutes
 * @property {number} oldest_entry_age_minutes - Age of oldest entry in minutes
 * @property {number} newest_entry_age_minutes - Age of newest entry in minutes
 * @property {RefreshAttemptStats} refresh_attempt_stats - Statistics on refresh attempts
 */

/**
 * Get comprehensive cache statistics
 * @returns {CacheStatistics} Cache statistics
 */
export function getCacheStatistics() {
	const cache = getCacheMap();
	/** @type {CacheStatistics} */
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
	/** @type {number[]} */
	const ages = [];

	cache.forEach((entry) => {
		const typedEntry = entry;
		const ageMinutes = Math.floor((now - new Date(typedEntry.cached_at).getTime()) / 60000);
		ages.push(ageMinutes);
		totalAgeMinutes += ageMinutes;

		// Check if expired
		if (typedEntry.expiresAt && typedEntry.expiresAt < now) {
			stats.expired_entries++;
		} else {
			stats.valid_entries++;
		}

		// Group by user
		if (typedEntry.user_id) {
			stats.entries_by_user[typedEntry.user_id] = (stats.entries_by_user[typedEntry.user_id] || 0) + 1;
		}

		// Group by team
		if (typedEntry.team_id) {
			stats.entries_by_team[typedEntry.team_id] = (stats.entries_by_team[typedEntry.team_id] || 0) + 1;
		}

		// Refresh attempt stats
		if (typedEntry.refresh_attempts === 0) {
			stats.refresh_attempt_stats.zero_attempts++;
		} else if (typedEntry.refresh_attempts <= 3) {
			stats.refresh_attempt_stats.one_to_three_attempts++;
		} else {
			stats.refresh_attempt_stats.more_than_three_attempts++;
		}
	});

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
 * @typedef {Object} CachePerformanceMetrics
 * @property {number} cache_size - Number of entries in cache
 * @property {number} hit_rate_estimate - Estimated hit rate (0-1)
 * @property {number} memory_usage_estimate_kb - Estimated memory usage in KB
 * @property {number} active_teams - Number of active teams
 * @property {number} active_users - Number of active users
 * @property {number} health_score - Cache health score (0-100)
 */

/**
 * Get performance metrics for cache operations
 * @returns {CachePerformanceMetrics} Performance metrics
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
 * @param {CacheStatistics} stats - Cache statistics
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