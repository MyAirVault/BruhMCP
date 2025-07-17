/**
 * Discord Credential Cache Service
 * In-memory caching for OAuth credentials with background refresh
 * Based on Gmail MCP service architecture
 */

// Global credential cache for Discord service
const discordCredentialCache = new Map();

/**
 * Initialize credential cache system
 */
export function initializeCredentialCache() {
	console.log(`💾 Initializing Discord credential cache system`);

	// Start background cleanup process
	const cleanupInterval = setInterval(
		() => {
			const cleaned = cleanupExpiredTokens();
			if (cleaned > 0) {
				console.log(`🧹 Cleaned ${cleaned} expired tokens from Discord cache`);
			}
		},
		5 * 60 * 1000
	); // Every 5 minutes

	// Store interval for cleanup
	discordCredentialCache.set('__cleanup_interval__', cleanupInterval);

	console.log(`✅ Discord credential cache system initialized`);
}

/**
 * Sets cached credential for an instance
 * @param {string} instanceId - The instance ID
 * @param {Object} tokenData - Token data to cache
 * @param {string} tokenData.bearerToken - Bearer token
 * @param {string} tokenData.refreshToken - Refresh token
 * @param {number} tokenData.expiresAt - Expiration timestamp
 * @param {string} tokenData.user_id - User ID
 * @param {string} tokenData.tokenType - Token type (Bearer/Bot)
 * @param {string} tokenData.scope - Token scope
 */
export function setCachedCredential(instanceId, tokenData) {
	if (!tokenData) {
		discordCredentialCache.delete(instanceId);
		console.log(`🗑️  Removed cached credential for instance: ${instanceId}`);
		return;
	}

	const cacheEntry = {
		bearerToken: tokenData.bearerToken,
		refreshToken: tokenData.refreshToken,
		expiresAt: tokenData.expiresAt,
		user_id: tokenData.user_id,
		tokenType: tokenData.tokenType || 'Bearer',
		scope: tokenData.scope,
		last_used: new Date().toISOString(),
		refresh_attempts: 0,
		cached_at: new Date().toISOString(),
	};

	discordCredentialCache.set(instanceId, cacheEntry);
	console.log(`💾 Cached Discord OAuth tokens for instance: ${instanceId}`);
}

/**
 * Gets cached credential for an instance
 * @param {string} instanceId - The instance ID
 * @returns {Object|null} Cached credential or null if not found/expired
 */
export function getCachedCredential(instanceId) {
	const cached = discordCredentialCache.get(instanceId);

	if (!cached) {
		return null;
	}

	// Check if token has expired
	if (cached.expiresAt && cached.expiresAt < Date.now()) {
		console.log(`🗑️  Removing expired token from cache: ${instanceId}`);
		discordCredentialCache.delete(instanceId);
		return null;
	}

	// Update last used timestamp
	cached.last_used = new Date().toISOString();
	return cached;
}

/**
 * Removes cached credential for an instance
 * @param {string} instanceId - The instance ID
 */
export function removeCachedCredential(instanceId) {
	const removed = discordCredentialCache.delete(instanceId);
	if (removed) {
		console.log(`🗑️  Removed cached credential for instance: ${instanceId}`);
	}
}

/**
 * Checks if cached credential exists and is valid
 * @param {string} instanceId - The instance ID
 * @returns {boolean} True if valid cached credential exists
 */
export function hasCachedCredential(instanceId) {
	const cached = getCachedCredential(instanceId);
	return cached !== null;
}

/**
 * Updates cached credential with new token data
 * @param {string} instanceId - The instance ID
 * @param {Object} updates - Updates to apply
 */
export function updateCachedCredential(instanceId, updates) {
	const cached = discordCredentialCache.get(instanceId);
	if (!cached) {
		console.log(`⚠️  No cached credential to update for instance: ${instanceId}`);
		return;
	}

	Object.assign(cached, updates, {
		last_used: new Date().toISOString(),
	});

	console.log(`🔄 Updated cached credential for instance: ${instanceId}`);
}

/**
 * Increments refresh attempt count for an instance
 * @param {string} instanceId - The instance ID
 */
export function incrementRefreshAttempts(instanceId) {
	const cached = discordCredentialCache.get(instanceId);
	if (cached) {
		cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
		console.log(
			`🔄 Incremented refresh attempts for instance: ${instanceId} (attempts: ${cached.refresh_attempts})`
		);
	}
}

/**
 * Resets refresh attempt count for an instance
 * @param {string} instanceId - The instance ID
 */
export function resetRefreshAttempts(instanceId) {
	const cached = discordCredentialCache.get(instanceId);
	if (cached) {
		cached.refresh_attempts = 0;
		console.log(`✅ Reset refresh attempts for instance: ${instanceId}`);
	}
}

/**
 * Gets cache statistics for monitoring
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
	const stats = {
		total_cached: discordCredentialCache.size,
		instances: [],
		cache_health: {
			expired_tokens: 0,
			tokens_expiring_soon: 0,
			healthy_tokens: 0,
		},
	};

	const now = Date.now();
	const fiveMinutesFromNow = now + 5 * 60 * 1000;

	for (const [instanceId, credential] of discordCredentialCache.entries()) {
		const instanceStats = {
			instance_id: instanceId,
			cached_at: credential.cached_at,
			last_used: credential.last_used,
			refresh_attempts: credential.refresh_attempts,
			token_type: credential.tokenType,
			has_refresh_token: !!credential.refreshToken,
			expires_at: credential.expiresAt ? new Date(credential.expiresAt).toISOString() : null,
			status: 'healthy',
		};

		// Check token health
		if (credential.expiresAt) {
			if (credential.expiresAt < now) {
				instanceStats.status = 'expired';
				stats.cache_health.expired_tokens++;
			} else if (credential.expiresAt < fiveMinutesFromNow) {
				instanceStats.status = 'expiring_soon';
				stats.cache_health.tokens_expiring_soon++;
			} else {
				stats.cache_health.healthy_tokens++;
			}
		} else {
			stats.cache_health.healthy_tokens++;
		}

		stats.instances.push(instanceStats);
	}

	return stats;
}

/**
 * Cleans up expired tokens from cache
 * @returns {number} Number of tokens cleaned up
 */
export function cleanupExpiredTokens() {
	const now = Date.now();
	let cleanedCount = 0;

	for (const [instanceId, credential] of discordCredentialCache.entries()) {
		if (credential.expiresAt && credential.expiresAt < now) {
			discordCredentialCache.delete(instanceId);
			cleanedCount++;
			console.log(`🧹 Cleaned up expired token for instance: ${instanceId}`);
		}
	}

	if (cleanedCount > 0) {
		console.log(`🧹 Cleaned up ${cleanedCount} expired tokens from cache`);
	}

	return cleanedCount;
}

/**
 * Gets instances that need token refresh
 * @returns {Array} Array of instance IDs that need refresh
 */
export function getInstancesNeedingRefresh() {
	const now = Date.now();
	const refreshThreshold = now + 10 * 60 * 1000; // 10 minutes from now
	const needsRefresh = [];

	for (const [instanceId, credential] of discordCredentialCache.entries()) {
		if (
			credential.expiresAt &&
			credential.expiresAt < refreshThreshold &&
			credential.refreshToken &&
			(credential.refresh_attempts || 0) < 3
		) {
			needsRefresh.push(instanceId);
		}
	}

	return needsRefresh;
}

/**
 * Clears all cached credentials (use with caution)
 */
export function clearAllCachedCredentials() {
	const count = discordCredentialCache.size;
	discordCredentialCache.clear();
	console.log(`🧹 Cleared all ${count} cached credentials`);
}

/**
 * Gets all cached instance IDs
 * @returns {Array<string>} Array of instance IDs
 */
export function getCachedInstanceIds() {
	return Array.from(discordCredentialCache.keys());
}

/**
 * Checks if instance credential is close to expiry
 * @param {string} instanceId - The instance ID
 * @param {number} thresholdMinutes - Minutes before expiry to consider "close"
 * @returns {boolean} True if close to expiry
 */
export function isCredentialCloseToExpiry(instanceId, thresholdMinutes = 5) {
	const cached = discordCredentialCache.get(instanceId);
	if (!cached || !cached.expiresAt) {
		return false;
	}

	const threshold = Date.now() + thresholdMinutes * 60 * 1000;
	return cached.expiresAt < threshold;
}

/**
 * Gets credential expiry status for an instance
 * @param {string} instanceId - The instance ID
 * @returns {Object} Expiry status information
 */
export function getCredentialExpiryStatus(instanceId) {
	const cached = discordCredentialCache.get(instanceId);
	if (!cached) {
		return {
			exists: false,
			expired: false,
			expiring_soon: false,
			expires_at: null,
			minutes_until_expiry: null,
		};
	}

	const now = Date.now();
	const expiresAt = cached.expiresAt;

	if (!expiresAt) {
		return {
			exists: true,
			expired: false,
			expiring_soon: false,
			expires_at: null,
			minutes_until_expiry: null,
		};
	}

	const minutesUntilExpiry = Math.floor((expiresAt - now) / (60 * 1000));

	return {
		exists: true,
		expired: expiresAt < now,
		expiring_soon: minutesUntilExpiry < 5,
		expires_at: new Date(expiresAt).toISOString(),
		minutes_until_expiry: minutesUntilExpiry,
	};
}
