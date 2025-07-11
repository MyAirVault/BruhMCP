import { getAllMCPInstances, updateMCPInstance, getMCPInstanceById } from '../db/queries/mcpInstancesQueries.js';
import processManager from './processManager.js';

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
            
            // Get all active MCP instances
            const instances = await getAllMCPInstances();
            const now = new Date();
            
            for (const instance of instances) {
                // Skip if no expiration date or already expired
                if (!instance.expires_at || instance.status === 'expired') {
                    continue;
                }
                
                // Check if expired
                if (now > new Date(instance.expires_at)) {
                    console.log(`⏰ MCP instance ${instance.id} has expired`);
                    await this.handleExpiredMCP(instance);
                }
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
            console.log(`🛑 Handling expired MCP instance ${instance.id}`);
            
            // Terminate the process if it's running
            if (instance.process_id) {
                const terminated = await processManager.terminateProcess(instance.id);
                if (terminated) {
                    console.log(`✅ Terminated process for expired MCP ${instance.id}`);
                } else {
                    console.log(`⚠️  Process not found or already terminated for expired MCP ${instance.id}`);
                }
            }
            
            // Update instance status to expired
            await updateMCPInstance(instance.id, {
                status: 'expired',
                is_active: false,
                process_id: null,
                assigned_port: null
            });
            
            console.log(`📋 MCP instance ${instance.id} marked as expired`);
            
        } catch (error) {
            console.error(`❌ Error handling expired MCP ${instance.id}:`, error);
        }
    }

    /**
     * Manually check a specific MCP instance for expiration
     * @param {string} instanceId - MCP instance ID
     * @returns {Promise<boolean>} True if instance was expired
     */
    async checkSingleMCP(instanceId) {
        try {
            const instance = await getMCPInstanceById(instanceId);
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
            nextCheck: this.checkInterval ? new Date(Date.now() + this.intervalTime) : null
        };
    }
}

// Create singleton instance
const expirationMonitor = new ExpirationMonitor();

export default expirationMonitor;