import { processHealthMonitor } from './process-health-monitor.js';
import { updateMCPInstance } from '../../db/queries/mcpInstancesQueries.js';

/**
 * Process Cleanup Service - Handles database cleanup for failed processes
 */
export class ProcessCleanupService {
	constructor() {
		this.setupEventHandlers();
	}

	setupEventHandlers() {
		// Handle process exit events
		processHealthMonitor.on('process-exit', this.handleProcessExit.bind(this));

		// Handle process error events
		processHealthMonitor.on('process-error', this.handleProcessError.bind(this));

		// Handle health check failures
		processHealthMonitor.on('health-check-failed', this.handleHealthCheckFailure.bind(this));

		console.log('🧹 Process cleanup service initialized');
	}

	async handleProcessExit(event) {
		const { instanceId, code, port, cleanExit } = event;

		try {
			if (cleanExit) {
				console.log(`✅ Clean exit for instance ${instanceId}, updating status to inactive`);
				await updateMCPInstance(instanceId, {
					status: 'inactive',
					process_id: null,
					assigned_port: null,
					updated_at: new Date(),
				});
			} else {
				console.log(`💥 Unexpected exit for instance ${instanceId}, marking as failed`);
				await updateMCPInstance(instanceId, {
					status: 'failed',
					process_id: null,
					assigned_port: null,
					error_message: `Process exited unexpectedly with code ${code}`,
					updated_at: new Date(),
				});
			}
		} catch (error) {
			console.error(`❌ Failed to update database for exited instance ${instanceId}:`, error);
		}
	}

	async handleProcessError(event) {
		const { instanceId, error, timestamp } = event;

		try {
			console.log(`⚠️  Process error for instance ${instanceId}, updating status to failed`);
			await updateMCPInstance(instanceId, {
				status: 'failed',
				process_id: null,
				assigned_port: null,
				error_message: `Process error: ${error}`,
				updated_at: timestamp,
			});
		} catch (dbError) {
			console.error(`❌ Failed to update database for errored instance ${instanceId}:`, dbError);
		}
	}

	async handleHealthCheckFailure(event) {
		const { instanceId, port, error } = event;

		try {
			console.log(`💔 Health check failed for instance ${instanceId}, investigating...`);

			// Give the process a chance to recover
			await new Promise(resolve => setTimeout(resolve, 5000));

			// Check if it's still failing
			const stillFailing = await this.verifyHealthFailure(instanceId, port);

			if (stillFailing) {
				console.log(`🚨 Persistent health failure for instance ${instanceId}, marking as failed`);
				await updateMCPInstance(instanceId, {
					status: 'failed',
					error_message: `Health check failed: ${error}`,
					updated_at: new Date(),
				});
			} else {
				console.log(`🔄 Instance ${instanceId} recovered from temporary health check failure`);
			}
		} catch (dbError) {
			console.error(`❌ Failed to handle health check failure for instance ${instanceId}:`, dbError);
		}
	}

	async verifyHealthFailure(instanceId, port) {
		try {
			const fetch = (await import('node-fetch')).default;
			const response = await fetch(`http://localhost:${port}/health`, {
				timeout: 3000,
				signal: AbortSignal.timeout(3000),
			});
			return !response.ok;
		} catch (error) {
			return true; // Still failing
		}
	}

	/**
	 * Scan for orphaned database records and clean them up
	 * @returns {Promise<Object>} Cleanup results
	 */
	async cleanupOrphanedInstances() {
		try {
			console.log('🔍 Scanning for orphaned MCP instances...');

			// This would need to be implemented with a database query
			// to find instances marked as 'active' but with no running process
			const results = {
				scanned: 0,
				cleaned: 0,
				errors: [],
			};

			// TODO: Implement database scan for orphaned instances
			// const activeInstances = await getActiveMCPInstances();
			// for (const instance of activeInstances) {
			//     if (!isProcessRunning(instance.process_id)) {
			//         await this.cleanupOrphanedInstance(instance);
			//         results.cleaned++;
			//     }
			//     results.scanned++;
			// }

			console.log(`🧹 Cleanup completed: ${results.cleaned}/${results.scanned} instances cleaned`);
			return results;
		} catch (error) {
			console.error('❌ Failed to cleanup orphaned instances:', error);
			throw error;
		}
	}

	async cleanupOrphanedInstance(instance) {
		try {
			console.log(`🗑️  Cleaning up orphaned instance ${instance.id}`);

			await updateMCPInstance(instance.id, {
				status: 'failed',
				process_id: null,
				assigned_port: null,
				error_message: 'Process was orphaned and cleaned up',
				updated_at: new Date(),
			});

			// Port management removed - no longer tracking assigned ports
		} catch (error) {
			console.error(`❌ Failed to cleanup orphaned instance ${instance.id}:`, error);
			throw error;
		}
	}
}

// Create singleton instance
export const processCleanupService = new ProcessCleanupService();
export default processCleanupService;
