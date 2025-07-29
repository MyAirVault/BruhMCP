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

// Metadata management
const { updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts
 } = require('./cacheMetadata');

// Statistics and monitoring
const { getCacheStatistics
 } = require('./cacheStatistics');

// Maintenance and cleanup
const { cleanupInvalidCacheEntries
 } = require('./cacheMaintenance');

// Background synchronization
const { startBackgroundCacheSync
 } = require('./cacheSync');

// Export all functions
module.exports = {
	// Core cache functionality
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	getCachedInstanceIds,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential,
	// Metadata management
	updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	// Statistics and monitoring
	getCacheStatistics,
	// Maintenance and cleanup
	cleanupInvalidCacheEntries,
	// Background synchronization
	startBackgroundCacheSync
};