/**
 * Cache metadata management for Google Drive MCP
 * Handles metadata updates and refresh attempt tracking
 */

const { googleDriveCredentialCache  } = require('./cacheCore');

/**
 * Update cached credential metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {any} updates - Metadata updates to apply
 * @returns {boolean} True if updated, false if not found
 */
function updateCachedCredentialMetadata(instanceId, updates) {
	const cached = googleDriveCredentialCache.get(instanceId);
	
	if (!cached) {
		return false;
	}
	
	// Apply updates
	if (updates.bearerToken !== undefined) {
		cached.bearerToken = updates.bearerToken;
	}
	
	if (updates.refreshToken !== undefined) {
		cached.refreshToken = updates.refreshToken;
	}
	
	if (updates.expiresAt !== undefined) {
		cached.expiresAt = updates.expiresAt;
	}
	
	if (updates.status !== undefined) {
		cached.status = updates.status;
	}
	
	// Update modification timestamp
	cached.last_modified = Date.now();
	
	// Reset refresh attempts on successful update
	if (updates.bearerToken) {
		cached.refresh_attempts = 0;
	}
	
	return true;
}

/**
 * Increment refresh attempts for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {number} New refresh attempt count, or -1 if not found
 */
function incrementRefreshAttempts(instanceId) {
	const cached = googleDriveCredentialCache.get(instanceId);
	
	if (!cached) {
		return -1;
	}
	
	cached.refresh_attempts = (cached.refresh_attempts || 0) + 1;
	cached.last_modified = Date.now();
	
	return cached.refresh_attempts;
}

/**
 * Reset refresh attempts for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if reset, false if not found
 */
function resetRefreshAttempts(instanceId) {
	const cached = googleDriveCredentialCache.get(instanceId);
	
	if (!cached) {
		return false;
	}
	
	cached.refresh_attempts = 0;
	cached.last_modified = Date.now();
	
	return true;
}

module.exports = {
	updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts
};