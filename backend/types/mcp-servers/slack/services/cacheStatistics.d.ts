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
export function getCacheStatistics(): CacheStatistics;
/**
 * Get list of cached instance IDs
 * @returns {string[]} Array of instance IDs
 */
export function getCachedInstanceIds(): string[];
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
export function getCachePerformanceMetrics(): CachePerformanceMetrics;
export type CacheEntry = import("./cacheCore.js").CacheEntry;
export type RefreshAttemptStats = {
    /**
     * - Entries with zero refresh attempts
     */
    zero_attempts: number;
    /**
     * - Entries with 1-3 refresh attempts
     */
    one_to_three_attempts: number;
    /**
     * - Entries with more than 3 refresh attempts
     */
    more_than_three_attempts: number;
};
export type CacheStatistics = {
    /**
     * - Total number of cache entries
     */
    total_entries: number;
    /**
     * - Number of expired entries
     */
    expired_entries: number;
    /**
     * - Number of valid entries
     */
    valid_entries: number;
    /**
     * - Count of entries by user ID
     */
    entries_by_user: Record<string, number>;
    /**
     * - Count of entries by team ID
     */
    entries_by_team: Record<string, number>;
    /**
     * - Average age of entries in minutes
     */
    average_age_minutes: number;
    /**
     * - Age of oldest entry in minutes
     */
    oldest_entry_age_minutes: number;
    /**
     * - Age of newest entry in minutes
     */
    newest_entry_age_minutes: number;
    /**
     * - Statistics on refresh attempts
     */
    refresh_attempt_stats: RefreshAttemptStats;
};
export type CachePerformanceMetrics = {
    /**
     * - Number of entries in cache
     */
    cache_size: number;
    /**
     * - Estimated hit rate (0-1)
     */
    hit_rate_estimate: number;
    /**
     * - Estimated memory usage in KB
     */
    memory_usage_estimate_kb: number;
    /**
     * - Number of active teams
     */
    active_teams: number;
    /**
     * - Number of active users
     */
    active_users: number;
    /**
     * - Cache health score (0-100)
     */
    health_score: number;
};
//# sourceMappingURL=cacheStatistics.d.ts.map