/**
 * Cache Invalidation Service for MCP Instance Deletion
 * Handles service-specific cache cleanup when instances are deleted
 */

/**
 * Service cache cleanup registry
 * Maps service names to their cache cleanup functions
 */
const SERVICE_CACHE_HANDLERS = {
	figma: null, // Will be dynamically loaded to avoid circular dependencies
	github: null, // Future implementation
	slack: null, // Future implementation
};

/**
 * Invalidate cached credentials for a deleted instance
 * @param {string} serviceName - Service name (figma, github, slack, etc.)
 * @param {string} instanceId - Instance ID to remove from cache
 * @returns {Promise<boolean>} Success status of cache invalidation
 */
export async function invalidateInstanceCache(serviceName, instanceId) {
	try {
		console.log(`🗑️ Invalidating cache for ${serviceName} instance: ${instanceId}`);

		const success = await performServiceCacheCleanup(serviceName, instanceId);
		
		if (success) {
			console.log(`✅ Cache invalidated successfully for ${serviceName} instance: ${instanceId}`);
			return true;
		} else {
			console.warn(`⚠️ Cache invalidation failed for ${serviceName} instance: ${instanceId}`);
			return false;
		}
	} catch (error) {
		console.error(`❌ Error invalidating cache for ${serviceName} instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Perform service-specific cache cleanup
 * @param {string} serviceName - Service name
 * @param {string} instanceId - Instance ID to remove
 * @returns {Promise<boolean>} Success status
 */
async function performServiceCacheCleanup(serviceName, instanceId) {
	switch (serviceName) {
		case 'figma':
			return await cleanupFigmaCache(instanceId);
		
		case 'github':
			return await cleanupGithubCache(instanceId);
		
		case 'slack':
			return await cleanupSlackCache(instanceId);
		
		default:
			console.warn(`⚠️ No cache cleanup handler for service: ${serviceName}`);
			return true; // Don't fail deletion for unknown services
	}
}

/**
 * Clean up Figma service cache
 * @param {string} instanceId - Instance ID to remove
 * @returns {Promise<boolean>} Success status
 */
async function cleanupFigmaCache(instanceId) {
	try {
		// Dynamic import to avoid circular dependency
		const { removeCachedCredential } = await import('../mcp-servers/figma/services/credential-cache.js');
		
		const removed = removeCachedCredential(instanceId);
		
		if (removed) {
			console.log(`🗑️ Removed Figma cache entry for instance: ${instanceId}`);
		} else {
			console.log(`ℹ️ No Figma cache entry found for instance: ${instanceId} (may not have been cached)`);
		}
		
		return true; // Always return success - missing cache entry is not an error
	} catch (error) {
		console.error(`❌ Failed to cleanup Figma cache for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Clean up GitHub service cache (future implementation)
 * @param {string} instanceId - Instance ID to remove
 * @returns {Promise<boolean>} Success status
 */
async function cleanupGithubCache(instanceId) {
	try {
		// TODO: Implement GitHub cache cleanup when GitHub service is added
		console.log(`ℹ️ GitHub cache cleanup not yet implemented for instance: ${instanceId}`);
		return true;
	} catch (error) {
		console.error(`❌ Failed to cleanup GitHub cache for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Clean up Slack service cache (future implementation)
 * @param {string} instanceId - Instance ID to remove
 * @returns {Promise<boolean>} Success status
 */
async function cleanupSlackCache(instanceId) {
	try {
		// TODO: Implement Slack cache cleanup when Slack service is added
		console.log(`ℹ️ Slack cache cleanup not yet implemented for instance: ${instanceId}`);
		return true;
	} catch (error) {
		console.error(`❌ Failed to cleanup Slack cache for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Validate instance cache cleanup
 * Verify that instance was successfully removed from cache
 * @param {string} serviceName - Service name
 * @param {string} instanceId - Instance ID to verify
 * @returns {Promise<boolean>} True if instance is not in cache
 */
export async function validateCacheCleanup(serviceName, instanceId) {
	try {
		switch (serviceName) {
			case 'figma':
				return await validateFigmaCacheCleanup(instanceId);
			
			case 'github':
				return await validateGithubCacheCleanup(instanceId);
			
			case 'slack':
				return await validateSlackCacheCleanup(instanceId);
			
			default:
				return true; // Assume cleanup success for unknown services
		}
	} catch (error) {
		console.error(`❌ Error validating cache cleanup for ${serviceName} instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Validate Figma cache cleanup
 * @param {string} instanceId - Instance ID to verify
 * @returns {Promise<boolean>} True if not in cache
 */
async function validateFigmaCacheCleanup(instanceId) {
	try {
		const { isInstanceCached } = await import('../mcp-servers/figma/services/credential-cache.js');
		const stillCached = isInstanceCached(instanceId);
		
		if (stillCached) {
			console.warn(`⚠️ Figma instance ${instanceId} still found in cache after cleanup`);
			return false;
		}
		
		console.log(`✅ Confirmed Figma instance ${instanceId} removed from cache`);
		return true;
	} catch (error) {
		console.error(`❌ Error validating Figma cache cleanup for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Validate GitHub cache cleanup (future implementation)
 * @param {string} _instanceId - Instance ID to verify (unused - future implementation)
 * @returns {Promise<boolean>} True if not in cache
 */
async function validateGithubCacheCleanup(_instanceId) {
	// TODO: Implement validation when GitHub service is added
	return true;
}

/**
 * Validate Slack cache cleanup (future implementation)
 * @param {string} _instanceId - Instance ID to verify (unused - future implementation)
 * @returns {Promise<boolean>} True if not in cache
 */
async function validateSlackCacheCleanup(_instanceId) {
	// TODO: Implement validation when Slack service is added
	return true;
}

/**
 * Get supported services for cache invalidation
 * @returns {string[]} Array of supported service names
 */
export function getSupportedServices() {
	return Object.keys(SERVICE_CACHE_HANDLERS);
}

/**
 * Check if service supports cache invalidation
 * @param {string} serviceName - Service name to check
 * @returns {boolean} True if service supports cache invalidation
 */
export function isServiceSupported(serviceName) {
	return serviceName in SERVICE_CACHE_HANDLERS;
}

/**
 * Bulk cache invalidation for multiple instances
 * @param {Array<{serviceName: string, instanceId: string}>} instances - Instances to invalidate
 * @returns {Promise<Array<{instanceId: string, success: boolean}>>} Results for each instance
 */
export async function bulkInvalidateCache(instances) {
	const results = [];
	
	for (const { serviceName, instanceId } of instances) {
		try {
			const success = await invalidateInstanceCache(serviceName, instanceId);
			results.push({ instanceId, success });
		} catch (error) {
			console.error(`❌ Bulk invalidation failed for ${serviceName} instance ${instanceId}:`, error);
			results.push({ instanceId, success: false });
		}
	}
	
	return results;
}

/**
 * Emergency cache cleanup for all instances of a service
 * Use with caution - clears entire service cache
 * @param {string} serviceName - Service name to clear completely
 * @returns {Promise<boolean>} Success status
 */
export async function emergencyCacheClear(serviceName) {
	try {
		console.warn(`🚨 Emergency cache clear requested for service: ${serviceName}`);
		
		switch (serviceName) {
			case 'figma':
				const { clearCredentialCache } = await import('../mcp-servers/figma/services/credential-cache.js');
				clearCredentialCache();
				console.log(`🧹 Cleared entire Figma credential cache`);
				return true;
			
			case 'github':
				console.warn(`⚠️ GitHub emergency cache clear not yet implemented`);
				return true;
			
			case 'slack':
				console.warn(`⚠️ Slack emergency cache clear not yet implemented`);
				return true;
			
			default:
				console.error(`❌ Unknown service for emergency cache clear: ${serviceName}`);
				return false;
		}
	} catch (error) {
		console.error(`❌ Emergency cache clear failed for ${serviceName}:`, error);
		return false;
	}
}

/**
 * Update cache metadata for instance status or expiration changes
 * @param {string} serviceName - Service name (figma, github, slack, etc.)
 * @param {string} instanceId - Instance ID to update
 * @param {Object} updates - Metadata updates
 * @param {string} [updates.status] - New instance status
 * @param {string} [updates.expires_at] - New expiration timestamp
 * @returns {Promise<boolean>} Success status of cache update
 */
export async function updateInstanceCacheMetadata(serviceName, instanceId, updates) {
	try {
		console.log(`🔄 Updating cache metadata for ${serviceName} instance: ${instanceId}`);
		
		const success = await performCacheMetadataUpdate(serviceName, instanceId, updates);
		
		if (success) {
			console.log(`✅ Cache metadata updated successfully for ${serviceName} instance: ${instanceId}`);
			return true;
		} else {
			console.warn(`⚠️ Cache metadata update failed for ${serviceName} instance: ${instanceId}`);
			return false;
		}
	} catch (error) {
		console.error(`❌ Error updating cache metadata for ${serviceName} instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Perform service-specific cache metadata update
 * @param {string} serviceName - Service name
 * @param {string} instanceId - Instance ID to update
 * @param {Object} updates - Metadata updates
 * @returns {Promise<boolean>} Success status
 */
async function performCacheMetadataUpdate(serviceName, instanceId, updates) {
	switch (serviceName) {
		case 'figma':
			return await updateFigmaCacheMetadata(instanceId, updates);
		
		case 'github':
			return await updateGithubCacheMetadata(instanceId, updates);
		
		case 'slack':
			return await updateSlackCacheMetadata(instanceId, updates);
		
		default:
			console.warn(`⚠️ No cache metadata update handler for service: ${serviceName}`);
			return true; // Don't fail operations for unknown services
	}
}

/**
 * Update Figma service cache metadata
 * @param {string} instanceId - Instance ID to update
 * @param {Object} updates - Metadata updates
 * @returns {Promise<boolean>} Success status
 */
async function updateFigmaCacheMetadata(instanceId, updates) {
	try {
		// Dynamic import to avoid circular dependency
		const { updateCachedCredentialMetadata } = await import('../mcp-servers/figma/services/credential-cache.js');
		
		const updated = updateCachedCredentialMetadata(instanceId, updates);
		
		if (updated) {
			console.log(`📝 Updated Figma cache metadata for instance: ${instanceId}`);
		} else {
			console.log(`ℹ️ No Figma cache entry to update for instance: ${instanceId}`);
		}
		
		return true; // Always return success - missing cache entry is not an error
	} catch (error) {
		console.error(`❌ Failed to update Figma cache metadata for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Update GitHub service cache metadata (future implementation)
 * @param {string} instanceId - Instance ID to update
 * @param {Object} _updates - Metadata updates (unused - future implementation)
 * @returns {Promise<boolean>} Success status
 */
async function updateGithubCacheMetadata(instanceId, _updates) {
	try {
		// TODO: Implement GitHub cache metadata update when GitHub service is added
		console.log(`ℹ️ GitHub cache metadata update not yet implemented for instance: ${instanceId}`);
		return true;
	} catch (error) {
		console.error(`❌ Failed to update GitHub cache metadata for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Update Slack service cache metadata (future implementation)
 * @param {string} instanceId - Instance ID to update
 * @param {Object} _updates - Metadata updates (unused - future implementation)
 * @returns {Promise<boolean>} Success status
 */
async function updateSlackCacheMetadata(instanceId, _updates) {
	try {
		// TODO: Implement Slack cache metadata update when Slack service is added
		console.log(`ℹ️ Slack cache metadata update not yet implemented for instance: ${instanceId}`);
		return true;
	} catch (error) {
		console.error(`❌ Failed to update Slack cache metadata for instance ${instanceId}:`, error);
		return false;
	}
}

/**
 * Cleanup invalid cache entries across all services
 * @param {string} reason - Reason for cleanup (scheduled, manual, etc.)
 * @returns {Promise<Object>} Cleanup results by service
 */
export async function cleanupInvalidCacheEntries(reason = 'cleanup') {
	const results = {};
	
	try {
		console.log(`🧹 Starting cache cleanup: ${reason}`);
		
		// Cleanup Figma cache
		try {
			const { cleanupInvalidCacheEntries: figmaCleanup } = await import('../mcp-servers/figma/services/credential-cache.js');
			results.figma = figmaCleanup(reason);
		} catch (error) {
			console.error(`❌ Figma cache cleanup failed:`, error);
			results.figma = 0;
		}
		
		// Future: Cleanup GitHub cache
		results.github = 0;
		
		// Future: Cleanup Slack cache
		results.slack = 0;
		
		const totalCleaned = Object.values(results).reduce((sum, count) => sum + count, 0);
		console.log(`✅ Cache cleanup completed: ${totalCleaned} entries removed`);
		
		return results;
	} catch (error) {
		console.error(`❌ Cache cleanup failed:`, error);
		return results;
	}
}