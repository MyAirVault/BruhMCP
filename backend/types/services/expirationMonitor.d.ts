export default expirationMonitor;
export type MCPInstance = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Service name
     */
    mcp_service_name: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - OAuth status (optional)
     */
    oauth_status?: string | undefined;
    /**
     * - Expiration date
     */
    expires_at: Date | string | null;
    /**
     * - Last updated date
     */
    updated_at: Date | string;
};
declare const expirationMonitor: ExpirationMonitor;
/**
 * @typedef {Object} MCPInstance
 * @property {string} instance_id - Instance ID
 * @property {string} user_id - User ID
 * @property {string} mcp_service_name - Service name
 * @property {string} status - Instance status
 * @property {string} [oauth_status] - OAuth status (optional)
 * @property {Date|string|null} expires_at - Expiration date
 * @property {Date|string} updated_at - Last updated date
 */
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
     * @param {MCPInstance} instance - MCP instance object
     */
    handleExpiredMCP(instance: MCPInstance): Promise<void>;
    /**
     * Clean up failed OAuth instances
     */
    cleanupFailedOAuthInstances(): Promise<void>;
    /**
     * Handle a failed OAuth instance by deleting it
     * @param {MCPInstance} instance - MCP instance object with failed OAuth
     * @returns {Promise<boolean>} True if deletion was successful, false otherwise
     */
    handleFailedOAuthInstance(instance: MCPInstance): Promise<boolean>;
    /**
     * Clean up pending OAuth instances older than 5 minutes
     */
    cleanupPendingOAuthInstances(): Promise<void>;
    /**
     * Handle a pending OAuth instance by deleting it
     * @param {MCPInstance} instance - MCP instance object with pending OAuth
     * @returns {Promise<boolean>} True if deletion was successful, false otherwise
     */
    handlePendingOAuthInstance(instance: MCPInstance): Promise<boolean>;
    /**
     * Manually check a specific MCP instance for expiration
     * @param {string} instanceId - MCP instance ID
     * @param {string} userId - User ID (for authorization)
     * @returns {Promise<boolean>} True if instance was expired
     */
    checkSingleMCP(instanceId: string, userId: string): Promise<boolean>;
    /**
     * Get expiration status
     * @returns {Object} Monitor status
     */
    getStatus(): Object;
}
//# sourceMappingURL=expirationMonitor.d.ts.map