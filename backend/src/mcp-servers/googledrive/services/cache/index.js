/**
 * Credential cache service for Google Drive MCP
 * Re-exports all cache functionality from individual modules
 */

// Core cache functionality
export {
	initializeCredentialCache,
	getCachedCredential,
	setCachedCredential,
	removeCachedCredential,
	getCachedInstanceIds,
	isInstanceCached,
	clearCredentialCache,
	peekCachedCredential
} from './cacheCore.js';

// Metadata management
export {
	updateCachedCredentialMetadata,
	incrementRefreshAttempts,
	resetRefreshAttempts
} from './cacheMetadata.js';

// Statistics and monitoring
export {
	getCacheStatistics
} from './cacheStatistics.js';

// Maintenance and cleanup
export {
	cleanupInvalidCacheEntries
} from './cacheMaintenance.js';

// Background synchronization
export {
	startBackgroundCacheSync
} from './cacheSync.js';