/**
 * Check if a process is running
 * @param {string|number} pid - Process ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {boolean} True if process is running
 */
export function isProcessRunning(pid: string | number, activeProcesses: Map<any, any>): boolean;
/**
 * Get process information
 * @param {string} instanceId - Instance ID
 * @param {Map} activeProcesses - Active processes map
 * @returns {Object|null} Process information or null if not found
 */
export function getProcessInfo(instanceId: string, activeProcesses: Map<any, any>): object | null;
/**
 * Get all active processes
 * @param {Map} activeProcesses - Active processes map
 * @returns {Array<Object>} Array of process information
 */
export function getAllActiveProcesses(activeProcesses: Map<any, any>): Array<object>;
/**
 * Health check for all processes
 * @param {Map} activeProcesses - Active processes map
 * @returns {Promise<Array<Object>>} Array of process health status
 */
export function healthCheckAll(activeProcesses: Map<any, any>): Promise<Array<object>>;
//# sourceMappingURL=process-utilities.d.ts.map
