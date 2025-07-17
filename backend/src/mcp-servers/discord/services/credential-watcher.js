/**
 * Discord Credential Watcher Service
 * Background service for token refresh and maintenance
 * Based on Gmail MCP service architecture
 */

import {
	getCacheStatistics,
	getInstancesNeedingRefresh,
	setCachedCredential,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	cleanupExpiredTokens,
} from './credential-cache.js';
import {
	lookupInstanceCredentials,
	updateInstanceCredentials,
	tokenNeedsRefresh,
	markInstanceForReauth,
	logApiOperation,
} from './database.js';
import { refreshBearerToken } from '../utils/oauth-integration.js';
import { parseOAuthError, requiresReauthentication } from '../utils/oauth-error-handler.js';

// Background service state
let watcherInterval = null;
let isWatcherRunning = false;
let watcherStats = {
	lastRun: null,
	totalRefreshAttempts: 0,
	successfulRefreshes: 0,
	failedRefreshes: 0,
	tokensMarkedForReauth: 0,
	cleanupRuns: 0,
};

// Configuration
const WATCHER_CONFIG = {
	intervalMs: 5 * 60 * 1000, // 5 minutes
	maxRefreshAttempts: 3,
	refreshThresholdMs: 10 * 60 * 1000, // 10 minutes before expiry
	cleanupIntervalMs: 60 * 60 * 1000, // 1 hour
	batchSize: 10, // Max instances to process per run
};

/**
 * Starts the credential watcher service
 */
export function startCredentialWatcher() {
	if (isWatcherRunning) {
		console.log('⚠️  Credential watcher is already running');
		return;
	}

	console.log('🔄 Starting Discord credential watcher service...');

	// Run immediately on start
	runWatcherCycle();

	// Set up interval
	watcherInterval = setInterval(runWatcherCycle, WATCHER_CONFIG.intervalMs);
	isWatcherRunning = true;

	console.log(`✅ Discord credential watcher started (interval: ${WATCHER_CONFIG.intervalMs}ms)`);
}

/**
 * Stops the credential watcher service
 */
export function stopCredentialWatcher() {
	if (!isWatcherRunning) {
		console.log('⚠️  Credential watcher is not running');
		return;
	}

	console.log('🛑 Stopping Discord credential watcher service...');

	if (watcherInterval) {
		clearInterval(watcherInterval);
		watcherInterval = null;
	}

	isWatcherRunning = false;
	console.log('✅ Discord credential watcher stopped');
}

/**
 * Runs a single watcher cycle
 */
async function runWatcherCycle() {
	try {
		console.log('🔄 Running Discord credential watcher cycle...');
		watcherStats.lastRun = new Date().toISOString();

		// Get instances that need refresh from cache
		const instancesNeedingRefresh = getInstancesNeedingRefresh();

		if (instancesNeedingRefresh.length === 0) {
			console.log('✅ No instances need token refresh');
		} else {
			console.log(`🔄 Processing ${instancesNeedingRefresh.length} instances for token refresh`);

			// Process in batches to avoid overwhelming the system
			const batches = chunkArray(instancesNeedingRefresh, WATCHER_CONFIG.batchSize);

			for (const batch of batches) {
				await processBatch(batch);
			}
		}

		// Clean up expired tokens periodically
		if (shouldRunCleanup()) {
			await runCleanupCycle();
		}

		console.log('✅ Credential watcher cycle completed');
	} catch (error) {
		console.error('❌ Error in credential watcher cycle:', error);
	}
}

/**
 * Processes a batch of instances for token refresh
 * @param {Array<string>} instanceIds - Array of instance IDs to process
 */
async function processBatch(instanceIds) {
	const promises = instanceIds.map(processInstanceRefresh);
	await Promise.allSettled(promises);
}

/**
 * Processes token refresh for a single instance
 * @param {string} instanceId - Instance ID to process
 */
async function processInstanceRefresh(instanceId) {
	try {
		console.log(`🔄 Processing token refresh for instance: ${instanceId}`);
		watcherStats.totalRefreshAttempts++;

		// Get instance data from database
		const instance = await lookupInstanceCredentials(instanceId, 'discord');

		if (!instance) {
			console.log(`⚠️  Instance not found in database: ${instanceId}`);
			return;
		}

		// Check if token actually needs refresh
		if (!tokenNeedsRefresh(instance)) {
			console.log(`ℹ️  Token doesn't need refresh yet for instance: ${instanceId}`);
			return;
		}

		// Check if we have refresh token
		if (!instance.refresh_token) {
			console.log(`⚠️  No refresh token available for instance: ${instanceId}`);
			await markInstanceForReauth(instanceId, 'NO_REFRESH_TOKEN');
			watcherStats.tokensMarkedForReauth++;
			return;
		}

		// Increment refresh attempts
		incrementRefreshAttempts(instanceId);

		// Attempt token refresh
		const newTokens = await refreshBearerToken({
			refreshToken: instance.refresh_token,
			clientId: instance.client_id,
			clientSecret: instance.client_secret,
		});

		// Update database with new tokens
		await updateInstanceCredentials(instanceId, {
			access_token: newTokens.access_token,
			refresh_token: newTokens.refresh_token,
			token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000),
		});

		// Update cache with new tokens
		setCachedCredential(instanceId, {
			bearerToken: newTokens.access_token,
			refreshToken: newTokens.refresh_token,
			expiresAt: Date.now() + newTokens.expires_in * 1000,
			user_id: instance.user_id,
			tokenType: newTokens.token_type,
			scope: newTokens.scope,
		});

		// Reset refresh attempts
		resetRefreshAttempts(instanceId);

		// Log successful refresh
		await logApiOperation(instanceId, 'TOKEN_REFRESH_SUCCESS', {
			watcher: true,
			expires_in: newTokens.expires_in,
		});

		watcherStats.successfulRefreshes++;
		console.log(`✅ Successfully refreshed token for instance: ${instanceId}`);
	} catch (error) {
		console.error(`❌ Failed to refresh token for instance ${instanceId}:`, error);
		watcherStats.failedRefreshes++;

		// Parse the error to determine if re-auth is needed
		if (requiresReauthentication(error)) {
			console.log(`🔄 Marking instance for re-auth: ${instanceId}`);
			await markInstanceForReauth(instanceId, 'REFRESH_FAILED');
			watcherStats.tokensMarkedForReauth++;
		}

		// Log failed refresh
		await logApiOperation(instanceId, 'TOKEN_REFRESH_FAILED', {
			watcher: true,
			error: error.message,
			requiresReauth: requiresReauthentication(error),
		});
	}
}

/**
 * Runs cleanup cycle for expired tokens
 */
async function runCleanupCycle() {
	try {
		console.log('🧹 Running credential cleanup cycle...');

		// Clean up expired tokens from cache
		const cleanedTokens = cleanupExpiredTokens();

		watcherStats.cleanupRuns++;
		console.log(`🧹 Cleaned up ${cleanedTokens} expired tokens from cache`);
	} catch (error) {
		console.error('❌ Error in cleanup cycle:', error);
	}
}

/**
 * Determines if cleanup should run
 * @returns {boolean} True if cleanup should run
 */
function shouldRunCleanup() {
	if (!watcherStats.lastRun) {
		return true;
	}

	const lastRunTime = new Date(watcherStats.lastRun).getTime();
	const now = Date.now();
	const timeSinceLastRun = now - lastRunTime;

	return timeSinceLastRun >= WATCHER_CONFIG.cleanupIntervalMs;
}

/**
 * Utility function to chunk array into batches
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array<Array>} Chunked array
 */
function chunkArray(array, size) {
	const chunks = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Gets watcher statistics
 * @returns {Object} Watcher statistics
 */
export function getWatcherStatistics() {
	return {
		isRunning: isWatcherRunning,
		configuration: WATCHER_CONFIG,
		statistics: {
			...watcherStats,
			uptime: isWatcherRunning
				? Date.now() - (watcherStats.lastRun ? new Date(watcherStats.lastRun).getTime() : Date.now())
				: 0,
		},
		cache: getCacheStatistics(),
	};
}

/**
 * Forces a watcher cycle to run immediately
 */
export async function forceWatcherCycle() {
	if (!isWatcherRunning) {
		throw new Error('Credential watcher is not running');
	}

	console.log('🔄 Forcing credential watcher cycle...');
	await runWatcherCycle();
}

/**
 * Updates watcher configuration
 * @param {Object} newConfig - New configuration options
 */
export function updateWatcherConfig(newConfig) {
	Object.assign(WATCHER_CONFIG, newConfig);
	console.log('⚙️  Updated credential watcher configuration:', WATCHER_CONFIG);
}

/**
 * Resets watcher statistics
 */
export function resetWatcherStatistics() {
	watcherStats = {
		lastRun: null,
		totalRefreshAttempts: 0,
		successfulRefreshes: 0,
		failedRefreshes: 0,
		tokensMarkedForReauth: 0,
		cleanupRuns: 0,
	};
	console.log('🔄 Reset credential watcher statistics');
}

/**
 * Checks if an instance needs immediate refresh
 * @param {string} instanceId - Instance ID to check
 * @returns {Promise<boolean>} True if immediate refresh is needed
 */
export async function needsImmediateRefresh(instanceId) {
	try {
		const instance = await lookupInstanceCredentials(instanceId, 'discord');
		if (!instance) {
			return false;
		}

		return tokenNeedsRefresh(instance);
	} catch (error) {
		console.error(`Error checking refresh status for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Manually triggers refresh for a specific instance
 * @param {string} instanceId - Instance ID to refresh
 * @returns {Promise<boolean>} True if refresh was successful
 */
export async function refreshInstanceToken(instanceId) {
	try {
		console.log(`🔄 Manual token refresh for instance: ${instanceId}`);
		await processInstanceRefresh(instanceId);
		return true;
	} catch (error) {
		console.error(`❌ Manual refresh failed for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Gets health status of the credential watcher
 * @returns {Object} Health status
 */
export function getWatcherHealth() {
	const stats = getWatcherStatistics();
	const cacheStats = getCacheStatistics();

	return {
		service: 'discord-credential-watcher',
		status: isWatcherRunning ? 'running' : 'stopped',
		health: {
			cache_size: cacheStats.total_cached,
			expired_tokens: cacheStats.cache_health.expired_tokens,
			tokens_expiring_soon: cacheStats.cache_health.tokens_expiring_soon,
			healthy_tokens: cacheStats.cache_health.healthy_tokens,
		},
		statistics: stats.statistics,
		last_run: watcherStats.lastRun,
		success_rate:
			watcherStats.totalRefreshAttempts > 0
				? ((watcherStats.successfulRefreshes / watcherStats.totalRefreshAttempts) * 100).toFixed(2) + '%'
				: 'N/A',
	};
}
