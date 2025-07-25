/**
 * Core credential cache functionality
 * Basic cache operations for OAuth tokens
 */

/**
 * @typedef {Object} CacheEntry
 * @property {string} bearerToken - Bearer token
 * @property {string} refreshToken - Refresh token
 * @property {number} expiresAt - Expiration timestamp
 * @property {string} user_id - User ID
 * @property {string} team_id - Team ID
 * @property {string} last_used - Last used timestamp
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - Cache timestamp
 * @property {string} [last_modified] - Last modified timestamp
 * @property {string} [last_refresh_attempt] - Last refresh attempt timestamp
 * @property {string} [last_successful_refresh] - Last successful refresh timestamp
 */

// Global credential cache for Slack service instances
/** @type {Map<string, CacheEntry>} */
const slackCredentialCache = new Map();

/**
 * Initialize the credential cache system
 * Called on service startup
 */
export function initializeCredentialCache() {
	console.log('🚀 Initializing Slack OAuth credential cache system');
	slackCredentialCache.clear();
	console.log('✅ Slack OAuth credential cache initialized');
}

/**
 * Get cached credential for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️ Removing expired Slack Bearer token from cache: ${instanceId}`);
		slackCredentialCache.delete(instanceId);
		return null;
	}
	
	// Update last used timestamp
	cached.last_used = new Date().toISOString();
	
	console.log(`✅ Slack cache hit for instance: ${instanceId}`);
	return cached;
}

/**
 * Store OAuth tokens in cache
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - OAuth Bearer access token
 * @param {string} tokenData.refreshToken - OAuth refresh token
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {string} tokenData.user_id - User ID who owns this instance
 * @param {string} tokenData.team_id - Slack team ID
 */
export function setCachedCredential(instanceId, tokenData) {
	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		team_id: tokenData.team_id,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString()
	};
	
	slackCredentialCache.set(instanceId, cacheEntry);
	const expiresInMinutes = Math.floor((tokenData.expiresAt - Date.now()) / 60000);
	console.log(`💾 Cached Slack OAuth tokens for instance: ${instanceId} (expires in ${expiresInMinutes} minutes)`);
}

/**
 * Remove credential from cache
 * @param {string} instanceId - UUID of the service instance
 */
export function removeCachedCredential(instanceId) {
	const removed = slackCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️ Removed Slack credential from cache: ${instanceId}`);
	}
}

/**
 * Check if instance is cached
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if instance is cached and not expired
 */
export function isInstanceCached(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	
	if (!cached) {
		return false;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		slackCredentialCache.delete(instanceId);
		return false;
	}
	
	return true;
}

/**
 * Clear all cached credentials
 */
export function clearCredentialCache() {
	const count = slackCredentialCache.size;
	slackCredentialCache.clear();
	console.log(`🧹 Cleared ${count} Slack credential cache entries`);
}

/**
 * Peek at cached credential without updating last_used timestamp
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Cached credential data or null if not found/expired
 */
export function peekCachedCredential(instanceId) {
	const cached = slackCredentialCache.get(instanceId);
	
	if (!cached) {
		return null;
	}
	
	// Check if Bearer token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		return null;
	}
	
	return cached;
}

/**
 * Get access to the internal cache Map (for advanced operations)
 * @returns {Map<string, CacheEntry>} The internal cache Map
 */
export function getCacheMap() {
	return slackCredentialCache;
}