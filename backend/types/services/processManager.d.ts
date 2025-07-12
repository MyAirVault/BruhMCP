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
     * @returns {Promise<Object>} Process information
     */
    createProcess(config: Object): Promise<Object>;
    /**
     * Terminate a process
     * @param {string} instanceId - Instance ID
     * @returns {Promise<boolean>} True if process was terminated
     */
    terminateProcess(instanceId: string): Promise<boolean>;
    /**
     * Check if a process is running
     * @param {string|number} pid - Process ID
     * @returns {boolean} True if process is running
     */
    isProcessRunning(pid: string | number): boolean;
    /**
     * Get process information
     * @param {string} instanceId - Instance ID
     * @returns {Object|null} Process information or null if not found
     */
    getProcessInfo(instanceId: string): Object | null;
    /**
     * Get all active processes
     * @returns {Array<Object>} Array of process information
     */
    getAllActiveProcesses(): Array<Object>;
    /**
     * Health check for all processes
     * @returns {Promise<Array<Object>>} Array of process health status
     */
    healthCheckAll(): Promise<Array<Object>>;
    /**
     * Get enhanced health status including monitoring data
     * @returns {Promise<Array<Object>>} Enhanced health status
     */
    getEnhancedHealthStatus(): Promise<Array<Object>>;
    /**
     * Clean up orphaned instances
     * @returns {Promise<Object>} Cleanup results
     */
    cleanupOrphanedInstances(): Promise<Object>;
    /**
     * Get process manager statistics
     * @returns {Object} Statistics
     */
    getStats(): Object;
}
//# sourceMappingURL=processManager.d.ts.map