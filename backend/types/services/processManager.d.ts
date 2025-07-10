export default processManager;
declare const processManager: ProcessManager;
/**
 * Process management service for MCP instances
 */
declare class ProcessManager {
	activeProcesses: Map<any, any>;
	/**
	 * Create a new MCP process
	 * @param {Object} config - Process configuration
	 * @param {string} config.mcpType - MCP type name
	 * @param {string} config.instanceId - Instance ID
	 * @param {string} config.userId - User ID
	 * @param {Object} config.credentials - Decrypted credentials
	 * @param {Object} config.config - Instance configuration
	 * @returns {Promise<Object>} Process information
	 */
	createProcess(config: {
		mcpType: string;
		instanceId: string;
		userId: string;
		credentials: object;
		config: object;
	}): Promise<object>;
	/**
	 * Setup process monitoring for an MCP instance
	 * @param {string} instanceId - Instance ID
	 * @param {ChildProcess} mcpProcess - Node.js process
	 */
	setupProcessMonitoring(instanceId: string, mcpProcess: ChildProcess): void;
	/**
	 * Handle process exit
	 * @param {string} instanceId - Instance ID
	 * @param {number} code - Exit code
	 */
	handleProcessExit(instanceId: string, code: number): void;
	/**
	 * Handle process error
	 * @param {string} instanceId - Instance ID
	 * @param {Error} error - Error object
	 */
	handleProcessError(instanceId: string, error: Error): void;
	/**
	 * Terminate a process
	 * @param {string} instanceId - Instance ID
	 * @returns {Promise<boolean>} True if process was terminated
	 */
	terminateProcess(instanceId: string): Promise<boolean>;
	/**
	 * Check if a process is running
	 * @param {number} pid - Process ID
	 * @returns {boolean} True if process is running
	 */
	isProcessRunning(pid: number): boolean;
	/**
	 * Get process information
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Process information or null if not found
	 */
	getProcessInfo(instanceId: string): object | null;
	/**
	 * Get all active processes
	 * @returns {Array<Object>} Array of process information
	 */
	getAllActiveProcesses(): Array<object>;
	/**
	 * Health check for all processes
	 * @returns {Promise<Array<Object>>} Array of process health status
	 */
	healthCheckAll(): Promise<Array<object>>;
}
//# sourceMappingURL=processManager.d.ts.map
