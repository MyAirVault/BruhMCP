import portManager from '../portManager.js';
import { setTimeout } from 'node:timers';
import { processHealthMonitor } from './process-health-monitor.js';
import logFileManager from './log-file-manager.js';

/**
 * Setup process monitoring for an MCP instance
 * @param {string} instanceId - Instance ID
 * @param {ChildProcess} mcpProcess - Node.js process
 * @param {Map} activeProcesses - Active processes map
 * @param {string} userId - User ID for log organization
 * @returns {void}
 */
export function setupProcessMonitoring(instanceId, mcpProcess, activeProcesses, userId) {
	// Initialize log files for this instance
	try {
		logFileManager.initializeLogFiles(instanceId, userId);
	} catch (error) {
		console.error(`❌ Failed to initialize log files for ${instanceId}:`, error);
	}

	// Log stdout
	mcpProcess.stdout.on('data', data => {
		const message = data.toString();
		console.log(`🖥️  Instance ${instanceId} stdout: ${message}`);

		// Write to log file
		logFileManager.writeLog(instanceId, 'info', message, 'stdout');
	});

	// Log stderr
	mcpProcess.stderr.on('data', data => {
		const message = data.toString();
		console.error(`❌ Instance ${instanceId} stderr: ${message}`);

		// Write to log file
		logFileManager.writeLog(instanceId, 'error', message, 'stderr');
	});

	// Handle process exit
	mcpProcess.on('exit', code => {
		const message = `Instance ${instanceId} exited with code ${code}`;
		console.log(`🛑 ${message}`);

		// Log exit event
		logFileManager.writeLog(instanceId, code === 0 ? 'info' : 'error', message, 'system', { exitCode: code });

		handleProcessExit(instanceId, code, activeProcesses);
	});

	// Handle process error
	mcpProcess.on('error', error => {
		const message = `Instance ${instanceId} error: ${error.message}`;
		console.error(`⚠️  ${message}`);

		// Log error event
		logFileManager.writeLog(instanceId, 'error', message, 'system', { error: error.message });

		handleProcessError(instanceId, error, activeProcesses);
	});
}

/**
 * Handle process exit
 * @param {string} instanceId - Instance ID
 * @param {number} code - Exit code
 * @param {Map} activeProcesses - Active processes map
 * @returns {void}
 */
export function handleProcessExit(instanceId, code, activeProcesses) {
	const processInfo = activeProcesses.get(instanceId);
	if (processInfo) {
		// Stop health monitoring
		processHealthMonitor.stopMonitoring(instanceId);

		// Release port
		portManager.releasePort(processInfo.assignedPort);

		// Close log streams
		logFileManager.closeLogStreams(instanceId);

		// Remove from active processes
		activeProcesses.delete(instanceId);

		// Log exit with severity based on exit code
		const logLevel = code === 0 ? 'info' : 'error';
		const icon = code === 0 ? '✅' : '💥';
		console.log(
			`${icon} Instance ${instanceId} process exited with code ${code}, port ${processInfo.assignedPort} released`
		);

		// Emit event for external handling (database cleanup, etc.)
		processHealthMonitor.emit('process-exit', {
			instanceId,
			code,
			port: processInfo.assignedPort,
			cleanExit: code === 0,
		});
	}
}

/**
 * Handle process error
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @param {Map} activeProcesses - Active processes map
 * @returns {void}
 */
export function handleProcessError(instanceId, error, activeProcesses) {
	console.error(`💥 Instance ${instanceId} process error:`, error);

	// Stop health monitoring
	processHealthMonitor.stopMonitoring(instanceId);

	// Close log streams
	logFileManager.closeLogStreams(instanceId);

	// Emit error event for external handling
	processHealthMonitor.emit('process-error', {
		instanceId,
		error: error.message,
		timestamp: new Date(),
	});

	// Clean up process
	terminateProcess(instanceId, activeProcesses);
}

/**
 * Terminate a process
 * @param {string} instanceId - Instance ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {Promise<boolean>} True if process was terminated
 */
export async function terminateProcess(instanceId, activeProcesses) {
	const processInfo = activeProcesses.get(instanceId);
	if (!processInfo) {
		console.log(`⚠️  Process ${instanceId} not found in active processes`);
		return false;
	}

	try {
		console.log(`🛑 Terminating instance ${instanceId} (PID: ${processInfo.processId})`);

		// Send SIGTERM for graceful shutdown
		process.kill(processInfo.processId, 'SIGTERM');

		// Wait for graceful shutdown, then force kill if needed
		const forceKillTimeout = setTimeout(() => {
			if (activeProcesses.has(instanceId)) {
				try {
					console.log(`💀 Force killing instance ${instanceId} (PID: ${processInfo.processId})`);
					process.kill(processInfo.processId, 'SIGKILL');
					// Manually trigger cleanup if process doesn't exit gracefully
					handleProcessExit(instanceId, -1, activeProcesses);
				} catch {
					// Process already terminated, still ensure cleanup
					handleProcessExit(instanceId, -1, activeProcesses);
				}
			}
		}, 5000); // Reduced timeout to 5 seconds

		// Set up cleanup to clear timeout if process exits gracefully
		const originalProcessInfo = activeProcesses.get(instanceId);
		if (originalProcessInfo && originalProcessInfo.process) {
			originalProcessInfo.process.once('exit', () => {
				clearTimeout(forceKillTimeout);
			});
		}

		return true;
	} catch (error) {
		console.error(`❌ Failed to terminate instance ${instanceId}:`, error);
		// Ensure cleanup even if termination fails
		handleProcessExit(instanceId, -1, activeProcesses);
		return false;
	}
}
