import { createProcess } from './process/process-creation.js';
import { setupProcessMonitoring, terminateProcess } from './process/process-monitoring.js';
import {
	isProcessRunning,
	getProcessInfo,
	getAllActiveProcesses,
	healthCheckAll,
} from './process/process-utilities.js';
import { processHealthMonitor } from './process/process-health-monitor.js';
import processCleanupService from './process/process-cleanup.js';

/**
 * Process management service for MCP instances
 */
class ProcessManager {
	constructor() {
		this.activeProcesses = new Map(); // Map of instanceId -> process info
	}

	/**
	 * Create a new MCP process
	 * @param {Object} config - Process configuration
	 * @returns {Promise<Object>} Process information
	 */
	async createProcess(config) {
		const { processInfo, mcpProcess, result } = await createProcess(config);

		// Store process information
		this.activeProcesses.set(config.instanceId, processInfo);

		// Setup process monitoring
		setupProcessMonitoring(config.instanceId, mcpProcess, this.activeProcesses);

		return result;
	}

	/**
	 * Terminate a process
	 * @param {string} instanceId - Instance ID
	 * @returns {Promise<boolean>} True if process was terminated
	 */
	async terminateProcess(instanceId) {
		return terminateProcess(instanceId, this.activeProcesses);
	}

	/**
	 * Check if a process is running
	 * @param {string|number} pid - Process ID
	 * @returns {boolean} True if process is running
	 */
	isProcessRunning(pid) {
		return isProcessRunning(pid, this.activeProcesses);
	}

	/**
	 * Get process information
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Process information or null if not found
	 */
	getProcessInfo(instanceId) {
		return getProcessInfo(instanceId, this.activeProcesses);
	}

	/**
	 * Get all active processes
	 * @returns {Array<Object>} Array of process information
	 */
	getAllActiveProcesses() {
		return getAllActiveProcesses(this.activeProcesses);
	}

	/**
	 * Health check for all processes
	 * @returns {Promise<Array<Object>>} Array of process health status
	 */
	async healthCheckAll() {
		return healthCheckAll(this.activeProcesses);
	}

	/**
	 * Get enhanced health status including monitoring data
	 * @returns {Promise<Array<Object>>} Enhanced health status
	 */
	async getEnhancedHealthStatus() {
		const basicHealth = await this.healthCheckAll();
		const monitoringHealth = await processHealthMonitor.getAllHealthStatus();
		
		// Merge the results
		return basicHealth.map(basic => {
			const monitoring = monitoringHealth.find(m => m.instanceId === basic.instanceId);
			return {
				...basic,
				monitoring: monitoring || { monitoring: false }
			};
		});
	}

	/**
	 * Clean up orphaned instances
	 * @returns {Promise<Object>} Cleanup results
	 */
	async cleanupOrphanedInstances() {
		return processCleanupService.cleanupOrphanedInstances();
	}

	/**
	 * Get process manager statistics
	 * @returns {Object} Statistics
	 */
	getStats() {
		return {
			activeProcesses: this.activeProcesses.size,
			monitoredProcesses: processHealthMonitor.healthChecks.size,
			startupValidations: processHealthMonitor.startupValidation.size,
			timestamp: new Date()
		};
	}
}

// Create singleton instance
const processManager = new ProcessManager();

export default processManager;
