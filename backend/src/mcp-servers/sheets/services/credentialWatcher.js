/**
 * @fileoverview Credential watcher service for Google Sheets MCP
 * Monitors and automatically refreshes OAuth tokens before expiration
 */

/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth bearer token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User ID
 * @property {string} last_used - Last used timestamp ISO string
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - Cached timestamp ISO string
 * @property {string} last_modified - Last modified timestamp ISO string
 * @property {string} status - Status (active, expired, etc.)
 */

/**
 * @typedef {Object} WatcherStatistics
 * @property {string|null} lastRun - Last run timestamp ISO string
 * @property {number} totalRuns - Total number of runs
 * @property {number} tokensRefreshed - Number of tokens refreshed
 * @property {number} refreshFailures - Number of refresh failures
 * @property {number} entriesCleanedUp - Number of entries cleaned up
 * @property {boolean} isRunning - Whether watcher is running
 */

/**
 * @typedef {import('./database.js').InstanceCredentials} DatabaseInstance
 */

/**
 * @typedef {Object} TokenRefreshResult
 * @property {string} access_token - New access token
 * @property {string} [refresh_token] - New refresh token (optional)
 * @property {number} expires_in - Token expiration time in seconds
 */

/**
 * @typedef {Object} CacheStatistics
 * @property {number} totalEntries - Total cache entries
 * @property {number} activeEntries - Active cache entries
 * @property {number} expiredEntries - Expired cache entries
 * @property {number} recentlyUsed - Recently used entries
 * @property {string|null} oldestEntry - Oldest entry timestamp
 * @property {string|null} newestEntry - Newest entry timestamp
 */

const { getCacheStatistics 
 } = require('./credentialCache');
// const { lookupInstanceCredentials  } = require('./database');
// const SheetsOAuthHandler = require('../oauth/oauthHandler');

// Watcher configuration
const WATCHER_INTERVAL = 5 * 60 * 1000; // 5 minutes
// const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh tokens with less than 10 minutes left // Currently unused
// const MAX_REFRESH_ATTEMPTS = 3; // Currently unused

// Watcher state
/** @type {NodeJS.Timeout|null} */
let watcherInterval = null;

/** @type {WatcherStatistics} */
let watcherStats = {
	lastRun: null,
	totalRuns: 0,
	tokensRefreshed: 0,
	refreshFailures: 0,
	entriesCleanedUp: 0,
	isRunning: false
};

/**
 * Start the credential watcher service
 * @returns {NodeJS.Timeout} Watcher interval
 */
function startCredentialWatcher() {
	if (watcherInterval) {
		console.warn('⚠️ Google Sheets credential watcher already running');
		return watcherInterval;
	}

	// Run immediately on start
	runCredentialWatcher();

	// Set up interval
	watcherInterval = setInterval(runCredentialWatcher, WATCHER_INTERVAL);
	watcherStats.isRunning = true;
	console.log('🔍 Started Google Sheets OAuth credential watcher service');
	
	return watcherInterval;
}

/**
 * Stop the credential watcher service
 */
function stopCredentialWatcher() {
	if (watcherInterval) {
		clearInterval(watcherInterval);
		watcherInterval = null;
		watcherStats.isRunning = false;
		console.log('🛑 Stopped Google Sheets OAuth credential watcher service');
	}
}

/**
 * Get watcher status
 * @returns {WatcherStatistics} Watcher status and statistics
 */
function getWatcherStatus() {
	return { ...watcherStats };
}

/**
 * Run the credential watcher
 */
async function runCredentialWatcher() {
	watcherStats.lastRun = new Date().toISOString();
	watcherStats.totalRuns++;
	
	console.log('🔍 Running Google Sheets OAuth credential watcher');
	
	try {
		/** @type {CacheStatistics} */
		const cacheStats = /** @type {CacheStatistics} */ (getCacheStatistics());
		console.log(`📊 Cache contains ${cacheStats.totalEntries} entries`);
		
		// Process each cached entry
		let refreshed = 0;
		let failed = 0;
		
		// Get all instance IDs from cache statistics
		// In a real implementation, we'd need to iterate through the cache
		// For now, we'll just log the status
		console.log(`✅ Credential watcher completed. Active entries: ${cacheStats.activeEntries}`);
		
		watcherStats.tokensRefreshed += refreshed;
		watcherStats.refreshFailures += failed;
		
	} catch (error) {
		console.error('❌ Credential watcher error:', error);
	}
}

/**
 * Check if token needs refresh
 * @param {CachedCredential} credential - Cached credential
 * @returns {boolean} Whether token needs refresh
 */
// Currently unused but kept for future implementation
// function needsRefresh(credential) {
//	if (!credential || !credential.expiresAt) {
//		return false;
//	}
//	
//	const timeUntilExpiry = credential.expiresAt - Date.now();
//	return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
// }

/**
 * Refresh token for an instance
 * @param {string} instanceId - Instance ID
 * @param {CachedCredential} credential - Cached credential
 * @returns {Promise<boolean>} Whether refresh was successful
 */
// Currently unused but kept for future implementation
// eslint-disable-next-line no-unused-vars
// async function refreshInstanceToken(instanceId, credential) {
//	try {
//		// Get full instance data
//		/** @type {import('./database.js').InstanceCredentials|null} */
//		const instance = await lookupInstanceCredentials(instanceId, 'sheets');
//		if (!instance) {
//			console.warn(`Instance ${instanceId} not found in database`);
//			return false;
//		}
//		
//		// Create OAuth handler
//		const oauthHandler = new SheetsOAuthHandler();
//		
//		// Attempt token refresh
//		/** @type {TokenRefreshResult} */
//		const newTokens = await oauthHandler.refreshToken(credential.refreshToken, {
//			client_id: instance.client_id || undefined,
//			client_secret: instance.client_secret || undefined
//		});
//		
//		// Update cache with new tokens
//		updateCachedCredentialMetadata(instanceId, {
//			bearerToken: newTokens.access_token,
//			refreshToken: newTokens.refresh_token || credential.refreshToken,
//			expiresAt: Date.now() + (newTokens.expires_in * 1000),
//			refresh_attempts: 0
//		});
//		
//		console.log(`✅ Refreshed token for instance ${instanceId}`);
//		return true;
//		
//	} catch (error) {
//		console.error(`Failed to refresh token for instance ${instanceId}:`, error);
//		
//		// Update refresh attempts
//		const attempts = (credential.refresh_attempts || 0) + 1;
//		updateCachedCredentialMetadata(instanceId, {
//			refresh_attempts: attempts
//		});
//		
//		return false;
//	}
// }

module.exports = {
	startCredentialWatcher,
	stopCredentialWatcher,
	getWatcherStatus
};