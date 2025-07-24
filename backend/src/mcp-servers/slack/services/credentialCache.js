/**
 * Credential cache service - Main export file
 * Re-exports all cache functionality from specialized modules
 */

// Core cache operations
export {
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential
} from './cacheCore.js';

// Cache statistics and monitoring
export {
	getCacheStatistics,
	getCachedInstanceIds,
	getCachePerformanceMetrics
} from './cacheStatistics.js';

// Cache management and maintenance
export {
	updateCachedCredentialMetadata,
	cleanupInvalidCacheEntries,
	incrementRefreshAttempts,
	resetRefreshAttempts,
	cleanupUserCacheEntries,
	cleanupTeamCacheEntries
} from './cacheManagement.js';

// Backward compatibility alias
export { removeCachedCredential as deleteCachedCredential } from './cacheCore.js';