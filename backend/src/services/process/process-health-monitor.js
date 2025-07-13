import fetch from 'node-fetch';
import { EventEmitter } from 'events';

/**
 * Process Health Monitor - Basic process monitoring (simplified without port checks)
 */
export class ProcessHealthMonitor extends EventEmitter {
	constructor() {
		super();
		this.processChecks = new Map(); // instanceId -> process check interval
		this.startupValidation = new Map(); // instanceId -> startup promise
		this.healthCheckInterval = 60000; // 1 minute
	}

	/**
	 * Validate process startup (simplified)
	 * @param {string} instanceId - Instance ID
	 * @param {Object} processInfo - Process information
	 * @returns {Promise<boolean>} True if process started successfully
	 */
	async validateProcessStartup(instanceId, processInfo) {
		console.log(`🔍 Validating startup for instance ${instanceId}`);

		return new Promise((resolve, reject) => {
			// Simple process existence check
			const timeout = setTimeout(() => {
				this.startupValidation.delete(instanceId);
				reject(new Error('Startup timeout - process validation failed'));
			}, 10000); // 10 second timeout

			this.startupValidation.set(instanceId, { resolve, reject, timeout });

			// Handle process exit during startup
			if (processInfo.process) {
				processInfo.process.once('exit', code => {
					if (this.startupValidation.has(instanceId)) {
						clearTimeout(timeout);
						console.log(`❌ Process ${instanceId} exited during startup with code ${code}`);
						this.startupValidation.delete(instanceId);
						reject(new Error(`Process exited during startup with code ${code}`));
					}
				});

				// Handle process error during startup
				processInfo.process.once('error', error => {
					if (this.startupValidation.has(instanceId)) {
						clearTimeout(timeout);
						console.log(`❌ Process ${instanceId} error during startup:`, error.message);
						this.startupValidation.delete(instanceId);
						reject(new Error(`Process error during startup: ${error.message}`));
					}
				});

				// If process is still running after 2 seconds, consider it successful
				setTimeout(() => {
					if (this.startupValidation.has(instanceId) && !processInfo.process.killed) {
						clearTimeout(timeout);
						console.log(`✅ Instance ${instanceId} startup validation successful`);
						this.startupValidation.delete(instanceId);
						this._startContinuousProcessMonitoring(instanceId, processInfo.process);
						resolve(true);
					}
				}, 2000);
			} else {
				clearTimeout(timeout);
				this.startupValidation.delete(instanceId);
				reject(new Error('No process object provided'));
			}
		});
	}

	_startContinuousProcessMonitoring(instanceId, process) {
		if (this.processChecks.has(instanceId)) {
			clearInterval(this.processChecks.get(instanceId));
		}

		const interval = setInterval(() => {
			if (process.killed || process.exitCode !== null) {
				console.log(`⚠️ Process ${instanceId} is no longer running`);
				this.emit('process-died', { instanceId });
				this.stopMonitoring(instanceId);
			}
		}, this.healthCheckInterval);

		this.processChecks.set(instanceId, interval);
		console.log(`💗 Started continuous process monitoring for instance ${instanceId}`);
	}

	/**
	 * Stop monitoring for an instance
	 * @param {string} instanceId - Instance ID
	 */
	stopMonitoring(instanceId) {
		if (this.processChecks.has(instanceId)) {
			clearInterval(this.processChecks.get(instanceId));
			this.processChecks.delete(instanceId);
			console.log(`🛑 Stopped process monitoring for instance ${instanceId}`);
		}

		if (this.startupValidation.has(instanceId)) {
			const validation = this.startupValidation.get(instanceId);
			clearTimeout(validation.timeout);
			this.startupValidation.delete(instanceId);
			validation.reject(new Error('Monitoring stopped'));
		}
	}

	/**
	 * Get process status for all monitored instances
	 * @returns {Promise<Array>} Process status array
	 */
	async getAllProcessStatus() {
		const results = [];
		for (const [instanceId, interval] of this.processChecks) {
			results.push({
				instanceId,
				monitoring: true,
				lastCheck: new Date(),
			});
		}
		return results;
	}

	/**
	 * Clean up all monitoring
	 */
	cleanup() {
		for (const [instanceId, interval] of this.processChecks) {
			clearInterval(interval);
		}
		this.processChecks.clear();
		
		for (const [instanceId, validation] of this.startupValidation) {
			clearTimeout(validation.timeout);
		}
		this.startupValidation.clear();
		
		console.log('🧹 Process monitor cleanup completed');
	}
}

// Create singleton instance
export const processHealthMonitor = new ProcessHealthMonitor();
export default processHealthMonitor;
