/**
 * Credential cache service - Main export file
 * Re-exports all cache functionality from specialized modules
 */

// Core cache operations
const {
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential
} = require('./cacheCore');

// Cache statistics and monitoring
const {
	getCacheStatistics,
	getCachedInstanceIds,
	getCachePerformanceMetrics
} = require('./cacheStatistics');

// Cache management and maintenance
const {
	updateCachedCredentialMetadata,
	cleanupInvalidCacheEntries,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	cleanupUserCacheEntries,
	cleanupTeamCacheEntries
} = require('./cacheManagement');

module.exports = {
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential,
	getCacheStatistics,
	getCachedInstanceIds,
	getCachePerformanceMetrics,
	updateCachedCredentialMetadata,
	cleanupInvalidCacheEntries,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	cleanupUserCacheEntries,
	cleanupTeamCacheEntries,
	// Backward compatibility alias
	deleteCachedCredential: removeCachedCredential
};