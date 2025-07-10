import portManager from '../portManager.js';
import { setTimeout } from 'node:timers';

/**
 * Setup process monitoring for an MCP instance
 * @param {string} instanceId - Instance ID
 * @param {ChildProcess} mcpProcess - Node.js process
 * @param {Map} activeProcesses - Active processes map
 * @returns {void}
 */
export function setupProcessMonitoring(instanceId, mcpProcess, activeProcesses) {
	// Log stdout
	mcpProcess.stdout.on('data', data => {
		console.log(`MCP ${instanceId} stdout: ${data.toString()}`);
	});

	// Log stderr
	mcpProcess.stderr.on('data', data => {
		console.error(`MCP ${instanceId} stderr: ${data.toString()}`);
	});

	// Handle process exit
	mcpProcess.on('exit', code => {
		console.log(`MCP ${instanceId} exited with code ${code}`);
		handleProcessExit(instanceId, code, activeProcesses);
	});

	// Handle process error
	mcpProcess.on('error', error => {
		console.error(`MCP ${instanceId} error:`, error);
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
		// Release port
		portManager.releasePort(processInfo.assignedPort);

		// Remove from active processes
		activeProcesses.delete(instanceId);

		// Log exit
		console.log(`Process ${instanceId} exited with code ${code}, port ${processInfo.assignedPort} released`);
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
	console.error(`Process ${instanceId} error:`, error);

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
		return false;
	}

	try {
		// Send SIGTERM for graceful shutdown
		process.kill(processInfo.processId, 'SIGTERM');

		// Wait for graceful shutdown, then force kill if needed
		setTimeout(() => {
			if (activeProcesses.has(instanceId)) {
				try {
					process.kill(processInfo.processId, 'SIGKILL');
				} catch {
					// Process already terminated
				}
			}
		}, 10000);

		return true;
	} catch (error) {
		console.error(`Failed to terminate process ${instanceId}:`, error);
		return false;
	}
}
