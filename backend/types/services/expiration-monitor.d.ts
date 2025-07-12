export default expirationMonitor;
declare const expirationMonitor: ExpirationMonitor;
/**
 * Expiration monitoring service for MCP instances
 */
declare class ExpirationMonitor {
    checkInterval: NodeJS.Timeout | null;
    intervalTime: number;
    /**
     * Start the expiration monitor
     */
    start(): void;
    /**
     * Stop the expiration monitor
     */
    stop(): void;
    /**
     * Check for expired MCP instances and handle them
     */
    checkExpiredMCPs(): Promise<void>;
    /**
     * Handle an expired MCP instance
     * @param {Object} instance - MCP instance object
     */
    handleExpiredMCP(instance: Object): Promise<void>;
    /**
     * Manually check a specific MCP instance for expiration
     * @param {string} instanceId - MCP instance ID
     * @returns {Promise<boolean>} True if instance was expired
     */
    checkSingleMCP(instanceId: string): Promise<boolean>;
    /**
     * Get expiration status
     * @returns {Object} Monitor status
     */
    getStatus(): Object;
}
//# sourceMappingURL=expiration-monitor.d.ts.map