import { getExpiredInstances, updateMCPInstance, getMCPInstanceById, bulkMarkInstancesExpired, getFailedOAuthInstances, getPendingOAuthInstances, deleteMCPInstance } from '../db/queries/mcpInstancesQueries.js';
import { invalidateInstanceCache } from './cacheInvalidationService.js';

/**
 * Expiration monitoring service for MCP instances
 */
class ExpirationMonitor {
	constructor() {
		this.checkInterval = null;
		this.intervalTime = 60000; // Check every minute
	}

	/**
	 * Start the expiration monitor
	 */
	start() {
		if (this.checkInterval) {
			this.stop();
		}

		console.log('📅 Starting MCP expiration monitor...');

		// Run initial check
		this.checkExpiredMCPs();

		// Set up recurring check
		this.checkInterval = setInterval(() => {
			this.checkExpiredMCPs();
		}, this.intervalTime);
	}

	/**
	 * Stop the expiration monitor
	 */
	stop() {
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
			console.log('📅 Stopped MCP expiration monitor');
		}
	}

	/**
	 * Check for expired MCP instances and handle them
	 */
	async checkExpiredMCPs() {
		try {
			console.log('📅 Checking for expired MCP instances...');

			// Get all expired instances that haven't been marked as expired yet
			const expiredInstances = await getExpiredInstances();

			if (expiredInstances.length === 0) {
				console.log('✅ No expired MCP instances found');
			} else {
				console.log(`⏰ Found ${expiredInstances.length} expired MCP instances`);

				for (const instance of expiredInstances) {
					console.log(`⏰ MCP instance ${instance.instance_id} has expired`);
					await this.handleExpiredMCP(instance);
				}
			}

			// Also cleanup failed OAuth instances
			console.log('🔄 Starting failed OAuth cleanup...');
			await this.cleanupFailedOAuthInstances();
			console.log('🔄 Failed OAuth cleanup completed');

			// Also cleanup pending OAuth instances older than 5 minutes
			console.log('🔄 Starting pending OAuth cleanup...');
			await this.cleanupPendingOAuthInstances();
			console.log('🔄 Pending OAuth cleanup completed');
		} catch (error) {
			console.error('❌ Error checking expired MCPs:', error);
		}
	}

	/**
	 * Handle an expired MCP instance
	 * @param {Object} instance - MCP instance object
	 */
	async handleExpiredMCP(instance) {
		try {
			console.log(`🛑 Handling expired MCP instance ${instance.instance_id}`);

			// Invalidate cache for expired instance
			if (instance.mcp_service_name) {
				try {
					await invalidateInstanceCache(instance.mcp_service_name, instance.instance_id);
					console.log(`✅ Cache invalidated for expired MCP ${instance.instance_id}`);
				} catch (cacheError) {
					console.log(`⚠️  Cache invalidation failed for expired MCP ${instance.instance_id}:`, cacheError.message);
				}
			}

			// Update instance status to expired
			await updateMCPInstance(instance.instance_id, instance.user_id, {
				status: 'expired'
			});

			console.log(`📋 MCP instance ${instance.instance_id} marked as expired`);
		} catch (error) {
			console.error(`❌ Error handling expired MCP ${instance.instance_id}:`, error);
		}
	}

	/**
	 * Clean up failed OAuth instances
	 */
	async cleanupFailedOAuthInstances() {
		try {
			console.log('🗑️  [FAILED OAUTH CLEANUP] Checking for failed OAuth instances to cleanup...');

			// Get all instances with failed OAuth status
			const failedInstances = await getFailedOAuthInstances();

			if (failedInstances.length === 0) {
				console.log('✅ [FAILED OAUTH CLEANUP] No failed OAuth instances found');
				return;
			}

			console.log(`🗑️  [FAILED OAUTH CLEANUP] Found ${failedInstances.length} failed OAuth instances to delete:`);
			
			// Log details of failed instances before deletion
			failedInstances.forEach((instance, index) => {
				console.log(`   ${index + 1}. Instance ID: ${instance.instance_id} | Service: ${instance.mcp_service_name} | User: ${instance.user_id} | Status: ${instance.oauth_status}`);
			});

			let deletedCount = 0;
			let errorCount = 0;

			for (const instance of failedInstances) {
				const result = await this.handleFailedOAuthInstance(instance);
				if (result) {
					deletedCount++;
				} else {
					errorCount++;
				}
			}

			console.log(`🗑️  [FAILED OAUTH CLEANUP] Cleanup completed - Deleted: ${deletedCount}, Errors: ${errorCount}`);
		} catch (error) {
			console.error('❌ [FAILED OAUTH CLEANUP] Error cleaning up failed OAuth instances:', error.message);
		}
	}

	/**
	 * Handle a failed OAuth instance by deleting it
	 * @param {Object} instance - MCP instance object with failed OAuth
	 * @returns {boolean} True if deletion was successful, false otherwise
	 */
	async handleFailedOAuthInstance(instance) {
		try {
			console.log(`🗑️  [DELETING] ${instance.mcp_service_name} instance ${instance.instance_id} (User: ${instance.user_id})`);

			// Invalidate cache for failed instance
			if (instance.mcp_service_name) {
				try {
					await invalidateInstanceCache(instance.mcp_service_name, instance.instance_id);
					console.log(`✅ [CACHE] Invalidated cache for ${instance.mcp_service_name} instance ${instance.instance_id}`);
				} catch (cacheError) {
					console.log(`⚠️  [CACHE] Cache invalidation failed for ${instance.mcp_service_name} instance ${instance.instance_id}: ${cacheError.message}`);
				}
			}

			// Delete the instance completely
			const deleted = await deleteMCPInstance(instance.instance_id, instance.user_id);

			if (deleted) {
				console.log(`✅ [SUCCESS] Failed OAuth instance ${instance.instance_id} (${instance.mcp_service_name}) deleted successfully`);
				return true;
			} else {
				console.log(`⚠️  [WARNING] Failed to delete OAuth instance ${instance.instance_id} (${instance.mcp_service_name}) - may have already been deleted`);
				return false;
			}
		} catch (error) {
			console.error(`❌ [ERROR] Failed to delete OAuth instance ${instance.instance_id} (${instance.mcp_service_name}):`, error.message);
			return false;
		}
	}

	/**
	 * Clean up pending OAuth instances older than 5 minutes
	 */
	async cleanupPendingOAuthInstances() {
		try {
			console.log('🗑️  [PENDING OAUTH CLEANUP] Checking for pending OAuth instances to cleanup...');

			// Get all instances with pending OAuth status older than 5 minutes
			const pendingInstances = await getPendingOAuthInstances(5);

			if (pendingInstances.length === 0) {
				console.log('✅ [PENDING OAUTH CLEANUP] No pending OAuth instances found');
				return;
			}

			console.log(`🗑️  [PENDING OAUTH CLEANUP] Found ${pendingInstances.length} pending OAuth instances to delete:`);
			
			// Log details of pending instances before deletion
			pendingInstances.forEach((instance, index) => {
				const minutesOld = Math.floor((Date.now() - new Date(instance.updated_at)) / (1000 * 60));
				console.log(`   ${index + 1}. Instance ID: ${instance.instance_id} | Service: ${instance.mcp_service_name} | User: ${instance.user_id} | Status: ${instance.oauth_status} | Age: ${minutesOld} minutes`);
			});

			let deletedCount = 0;
			let errorCount = 0;

			for (const instance of pendingInstances) {
				const result = await this.handlePendingOAuthInstance(instance);
				if (result) {
					deletedCount++;
				} else {
					errorCount++;
				}
			}

			console.log(`🗑️  [PENDING OAUTH CLEANUP] Cleanup completed - Deleted: ${deletedCount}, Errors: ${errorCount}`);
		} catch (error) {
			console.error('❌ [PENDING OAUTH CLEANUP] Error cleaning up pending OAuth instances:', error.message);
		}
	}

	/**
	 * Handle a pending OAuth instance by deleting it
	 * @param {Object} instance - MCP instance object with pending OAuth
	 * @returns {boolean} True if deletion was successful, false otherwise
	 */
	async handlePendingOAuthInstance(instance) {
		try {
			const minutesOld = Math.floor((Date.now() - new Date(instance.updated_at)) / (1000 * 60));
			console.log(`🗑️  [DELETING] ${instance.mcp_service_name} instance ${instance.instance_id} (User: ${instance.user_id}) - pending for ${minutesOld} minutes`);

			// Invalidate cache for pending instance
			if (instance.mcp_service_name) {
				try {
					await invalidateInstanceCache(instance.mcp_service_name, instance.instance_id);
					console.log(`✅ [CACHE] Invalidated cache for ${instance.mcp_service_name} instance ${instance.instance_id}`);
				} catch (cacheError) {
					console.log(`⚠️  [CACHE] Cache invalidation failed for ${instance.mcp_service_name} instance ${instance.instance_id}: ${cacheError.message}`);
				}
			}

			// Delete the instance completely
			const deleted = await deleteMCPInstance(instance.instance_id, instance.user_id);

			if (deleted) {
				console.log(`✅ [SUCCESS] Pending OAuth instance ${instance.instance_id} (${instance.mcp_service_name}) deleted successfully`);
				return true;
			} else {
				console.log(`⚠️  [WARNING] Failed to delete pending OAuth instance ${instance.instance_id} (${instance.mcp_service_name}) - may have already been deleted`);
				return false;
			}
		} catch (error) {
			console.error(`❌ [ERROR] Failed to delete pending OAuth instance ${instance.instance_id} (${instance.mcp_service_name}):`, error.message);
			return false;
		}
	}

	/**
	 * Manually check a specific MCP instance for expiration
	 * @param {string} instanceId - MCP instance ID
	 * @param {string} userId - User ID (for authorization)
	 * @returns {Promise<boolean>} True if instance was expired
	 */
	async checkSingleMCP(instanceId, userId) {
		try {
			const instance = await getMCPInstanceById(instanceId, userId);
			if (!instance) {
				return false;
			}

			if (instance.expires_at && new Date() > new Date(instance.expires_at)) {
				await this.handleExpiredMCP(instance);
				return true;
			}

			return false;
		} catch (error) {
			console.error(`❌ Error checking single MCP ${instanceId}:`, error);
			return false;
		}
	}

	/**
	 * Get expiration status
	 * @returns {Object} Monitor status
	 */
	getStatus() {
		return {
			running: this.checkInterval !== null,
			intervalTime: this.intervalTime,
			nextCheck: this.checkInterval ? new Date(Date.now() + this.intervalTime) : null,
		};
	}
}

// Create singleton instance
const expirationMonitor = new ExpirationMonitor();

export default expirationMonitor;
