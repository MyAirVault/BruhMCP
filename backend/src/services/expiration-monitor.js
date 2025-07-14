import { getExpiredInstances, updateMCPInstance, getMCPInstanceById, bulkMarkInstancesExpired } from '../db/queries/mcpInstancesQueries.js';
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
				return;
			}

			console.log(`⏰ Found ${expiredInstances.length} expired MCP instances`);

			for (const instance of expiredInstances) {
				console.log(`⏰ MCP instance ${instance.instance_id} has expired`);
				await this.handleExpiredMCP(instance);
			}
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
