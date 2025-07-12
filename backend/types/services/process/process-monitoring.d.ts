/**
 * Setup process monitoring for an MCP instance
 * @param {string} instanceId - Instance ID
 * @param {ChildProcess} mcpProcess - Node.js process
 * @param {Map} activeProcesses - Active processes map
 * @param {string} userId - User ID for log organization
 * @returns {void}
 */
export function setupProcessMonitoring(instanceId: string, mcpProcess: ChildProcess, activeProcesses: Map<any, any>, userId: string): void;
/**
 * Handle process exit
 * @param {string} instanceId - Instance ID
 * @param {number} code - Exit code
 * @param {Map} activeProcesses - Active processes map
 * @returns {void}
 */
export function handleProcessExit(instanceId: string, code: number, activeProcesses: Map<any, any>): void;
/**
 * Handle process error
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @param {Map} activeProcesses - Active processes map
 * @returns {void}
 */
export function handleProcessError(instanceId: string, error: Error, activeProcesses: Map<any, any>): void;
/**
 * Terminate a process
 * @param {string} instanceId - Instance ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {Promise<boolean>} True if process was terminated
 */
export function terminateProcess(instanceId: string, activeProcesses: Map<any, any>): Promise<boolean>;
//# sourceMappingURL=process-monitoring.d.ts.map