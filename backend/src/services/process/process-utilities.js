/**
 * Check if a process is running
 * @param {string|number} pid - Process ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {boolean} True if process is running
 */
export function isProcessRunning(pid, activeProcesses) {
	// For simulated processes (string IDs), check if they exist in our map
	if (typeof pid === 'string') {
		const instanceId = pid.replace('mcp-', '');
		return activeProcesses.has(instanceId);
	}

	// For real process IDs
	try {
		process.kill(pid, 0); // Signal 0 checks if process exists
		return true;
	} catch {
		return false;
	}
}

/**
 * Get process information
 * @param {string} instanceId - Instance ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {Object|null} Process information or null if not found
 */
export function getProcessInfo(instanceId, activeProcesses) {
	return activeProcesses.get(instanceId) || null;
}

/**
 * Get all active processes
 * @param {Map} activeProcesses - Active processes map
 * @returns {Array<Object>} Array of process information
 */
export function getAllActiveProcesses(activeProcesses) {
	return Array.from(activeProcesses.values());
}

/**
 * Health check for all processes
 * @param {Map} activeProcesses - Active processes map
 * @returns {Promise<Array<Object>>} Array of process health status
 */
export async function healthCheckAll(activeProcesses) {
	const healthResults = [];

	for (const [instanceId, processInfo] of activeProcesses) {
		const isRunning = isProcessRunning(processInfo.processId, activeProcesses);

		healthResults.push({
			instanceId,
			processId: processInfo.processId,
			assignedPort: processInfo.assignedPort,
			isRunning,
			uptime: Date.now() - processInfo.startTime.getTime(),
			mcpType: processInfo.mcpType,
			userId: processInfo.userId,
		});
	}

	return healthResults;
}
