/**
 * Credential cache service for Google Drive MCP
 * Re-exports all cache functionality from individual modules
 */

// Core cache functionality
const { initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	getCachedInstanceIds,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential
 } = require('./cacheCore');

module.exports = { initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	getCachedInstanceIds,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential
 };

// Metadata management
const { updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts
 } = require('./cacheMetadata');

module.exports = { updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts
 };

// Statistics and monitoring
const { getCacheStatistics
 } = require('./cacheStatistics');

module.exports = { getCacheStatistics
 };

// Maintenance and cleanup
const { cleanupInvalidCacheEntries
 } = require('./cacheMaintenance');

module.exports = { cleanupInvalidCacheEntries
 };

// Background synchronization
const { startBackgroundCacheSync
 } = require('./cacheSync');

module.exports = { startBackgroundCacheSync
 };