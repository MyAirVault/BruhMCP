/**
 * Credential watcher service for background cache maintenance
 * Phase 2: Token Management and Caching System implementation
 *
 * Runs every 30 seconds to monitor cached credentials and perform cleanup
 */

const {
	getCachedInstanceIds,
	peekCachedCredential,
	removeCachedCredential,
	getCacheStatistics,
} = require('./credentialCache');

/**
 * @typedef {Object} RawCacheEntry
 * @property {string} credential - OAuth Bearer token
 * @property {string} refreshToken - OAuth refresh token
 * @property {string} expiresAt - Instance expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 * @property {string} last_used - ISO timestamp of last access
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - ISO timestamp when cached
 */

/**
 * @typedef {Object} CacheEntry
 * @property {string} credential - OAuth Bearer token
 * @property {string} refreshToken - OAuth refresh token
 * @property {string} expiresAt - Instance expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 * @property {string} last_used - ISO timestamp of last access
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - ISO timestamp when cached
 * @property {string} [expires_at] - Alternative field name for expiration
 * @property {string} [status] - Instance status
 * @property {string} [last_modified] - ISO timestamp of last modification
 */

/**
 * @typedef {Object} CacheStatistics
 * @property {number} total_entries - Total number of cached entries
 * @property {number} expired_entries - Number of expired entries
 * @property {number} recently_used - Number of recently used entries
 * @property {string} cache_hit_rate_last_hour - Cache hit rate percentage
 * @property {string} memory_usage_mb - Memory usage in MB
 */

/**
 * @typedef {Object} WatcherStatus
 * @property {boolean} is_running - Whether watcher is active
 * @property {number} interval_ms - Watcher interval in milliseconds
 * @property {number} expiration_tolerance_ms - Expiration tolerance in milliseconds
 * @property {number} stale_threshold_hours - Stale threshold in hours
 * @property {number} max_cache_size - Maximum cache size
 * @property {number} uptime_seconds - Watcher uptime in seconds
 */

/**
 * @typedef {Object} CacheEntryWithId
 * @property {string} instanceId - Instance ID
 * @property {CacheEntry} cached - Cache entry data
 */

/**
 * @typedef {Object} CacheEntryWithUsage
 * @property {string} instanceId - Instance ID
 * @property {CacheEntry} cached - Cache entry data
 */

// Watcher configuration
const WATCHER_INTERVAL_MS = 30000; // 30 seconds
const EXPIRATION_TOLERANCE_MS = 30000; // 30 seconds before expiration
const STALE_THRESHOLD_HOURS = 24; // Remove credentials unused for 24+ hours
const MAX_CACHE_SIZE = 10000; // Maximum number of cached credentials

/** @type {NodeJS.Timeout|null} */
let watcherInterval = null;
/** @type {boolean} */
let isWatcherRunning = false;

/**
 * Start the credential watcher background process
 * Runs every 30 seconds to maintain cache health
 * @returns {void}
 */
function startCredentialWatcher() {
	if (isWatcherRunning) {
		console.log('⚠️ Credential watcher is already running');
		return;
	}

	console.log('🚀 Starting Figma credential watcher (30-second intervals)');

	// Run initial cleanup
	performCacheMaintenanceCheck();

	// Start recurring watcher
	watcherInterval = setInterval(() => {
		performCacheMaintenanceCheck();
	}, WATCHER_INTERVAL_MS);

	isWatcherRunning = true;
	console.log('✅ Credential watcher started successfully');
}

/**
 * Stop the credential watcher background process
 * @returns {void}
 */
function stopCredentialWatcher() {
	if (!isWatcherRunning) {
		console.log('⚠️ Credential watcher is not running');
		return;
	}

	if (watcherInterval) {
		clearInterval(watcherInterval);
		watcherInterval = null;
	}

	isWatcherRunning = false;
	console.log('📴 Credential watcher stopped');
}

/**
 * Check if credential watcher is running
 * @returns {boolean} True if watcher is active
 */
function isCredentialWatcherRunning() {
	return isWatcherRunning;
}

/**
 * Perform cache maintenance and cleanup
 * Called every 30 seconds by the watcher
 * @returns {void}
 */
function performCacheMaintenanceCheck() {
	try {
		const startTime = Date.now();
		/** @type {string[]} */
		const instanceIds = getCachedInstanceIds();

		if (instanceIds.length === 0) {
			return; // No cached credentials to check
		}

		console.log(`🔍 Credential watcher: Checking ${instanceIds.length} cached instances`);

		let expiredCount = 0;
		let staleCount = 0;
		let healthyCount = 0;

		const currentTime = new Date();

		for (const instanceId of instanceIds) {
			/** @type {RawCacheEntry|null} */
			const cached = /** @type {RawCacheEntry|null} */ (peekCachedCredential(instanceId));

			if (!cached) {
				continue; // Already removed
			}

			// Check for expired instances (with 30-second tolerance)
			if (cached.expiresAt) {
				const expirationTime = new Date(cached.expiresAt);
				const timeUntilExpiration = expirationTime.getTime() - currentTime.getTime();

				if (timeUntilExpiration <= EXPIRATION_TOLERANCE_MS) {
					console.log(
						`⏰ Removing credential for instance expiring soon: ${instanceId} (expires in ${Math.round(timeUntilExpiration / 1000)}s)`
					);
					removeCachedCredential(instanceId);
					expiredCount++;
					continue;
				}
			}

			// Check for stale credentials (unused for 24+ hours)
			const lastUsed = new Date(cached.last_used);
			const hoursSinceUsed = (currentTime.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);

			if (hoursSinceUsed >= STALE_THRESHOLD_HOURS) {
				console.log(
					`🧹 Removing stale credential: ${instanceId} (unused for ${Math.round(hoursSinceUsed)} hours)`
				);
				removeCachedCredential(instanceId);
				staleCount++;
				continue;
			}

			healthyCount++;
		}

		// Check cache size limits
		/** @type {string[]} */
		const remainingInstanceIds = getCachedInstanceIds();
		if (remainingInstanceIds.length > MAX_CACHE_SIZE) {
			const excessCount = remainingInstanceIds.length - MAX_CACHE_SIZE;
			console.log(`⚠️ Cache size limit exceeded, removing ${excessCount} least recently used entries`);

			// Get all entries with last_used timestamps
			/** @type {CacheEntryWithUsage[]} */
			const entriesWithUsage = remainingInstanceIds
				.map(id => {
					/** @type {RawCacheEntry|null} */
					const cached = /** @type {RawCacheEntry|null} */ (peekCachedCredential(id));
					return cached ? { instanceId: id, cached } : null;
				})
				.filter(
					/** @param {CacheEntryWithUsage|null} entry */ /** @returns {entry is CacheEntryWithUsage} */ entry =>
						entry !== null
				);

			// Sort by last_used (oldest first)
			entriesWithUsage.sort((a, b) => {
				if (!a || !b) return 0;
				return new Date(a.cached.last_used).getTime() - new Date(b.cached.last_used).getTime();
			});

			// Remove oldest entries
			for (let i = 0; i < excessCount; i++) {
				const entry = entriesWithUsage[i];
				if (entry) {
					console.log(`🗑️ Removing LRU credential: ${entry.instanceId}`);
					removeCachedCredential(entry.instanceId);
				}
			}
		}

		const duration = Date.now() - startTime;

		// Log maintenance summary (only if actions were taken)
		if (expiredCount > 0 || staleCount > 0) {
			console.log(
				`🧽 Cache maintenance completed in ${duration}ms: ${expiredCount} expired, ${staleCount} stale, ${healthyCount} healthy`
			);
		}

		// Log cache statistics every 10 minutes (20 watcher cycles)
		if (Math.floor(Date.now() / 1000) % 600 < 30) {
			logCacheStatistics();
		}
	} catch (error) {
		console.error('❌ Error during credential cache maintenance:', error);
	}
}

/**
 * Log detailed cache statistics for monitoring
 * @returns {void}
 */
function logCacheStatistics() {
	try {
		/** @type {CacheStatistics} */
		const stats = /** @type {CacheStatistics} */ (getCacheStatistics());
		console.log('📊 Cache Statistics:', {
			total_entries: stats.total_entries,
			expired_entries: stats.expired_entries,
			recently_used: stats.recently_used,
			cache_hit_rate: `${stats.cache_hit_rate_last_hour}%`,
			memory_usage: `${stats.memory_usage_mb}MB`,
			watcher_status: isWatcherRunning ? 'running' : 'stopped',
		});
	} catch (error) {
		console.error('❌ Error logging cache statistics:', error);
	}
}

/**
 * Force immediate cache maintenance check (for testing/manual triggers)
 * @returns {Promise<void>}
 */
async function forceMaintenanceCheck() {
	console.log('🔧 Manual cache maintenance check triggered');
	performCacheMaintenanceCheck();
}

/**
 * Get watcher status and configuration
 * @returns {WatcherStatus} Watcher status information
 */
function getWatcherStatus() {
	/** @type {WatcherStatus} */
	const status = {
		is_running: isWatcherRunning,
		interval_ms: WATCHER_INTERVAL_MS,
		expiration_tolerance_ms: EXPIRATION_TOLERANCE_MS,
		stale_threshold_hours: STALE_THRESHOLD_HOURS,
		max_cache_size: MAX_CACHE_SIZE,
		uptime_seconds: isWatcherRunning ? Math.floor(Date.now() / 1000) : 0,
	};
	return status;
}

module.exports = {
	startCredentialWatcher,
	stopCredentialWatcher,
	getWatcherStatus,
	forceMaintenanceCheck,
};
