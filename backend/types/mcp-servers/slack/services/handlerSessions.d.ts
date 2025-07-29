export type HandlerSession = {
    /**
     * - The MCP handler instance
     */
    handler: import('../endpoints/mcpHandler.js').SlackMCPHandler;
    /**
     * - Last access timestamp
     */
    lastAccessed: number;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Creation timestamp
     */
    createdAt: number;
};
/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {import('../endpoints/mcpHandler.js').ServiceConfig} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {import('../endpoints/mcpHandler.js').SlackMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: import('../endpoints/mcpHandler.js').ServiceConfig, bearerToken: string): import('../endpoints/mcpHandler.js').SlackMCPHandler;
/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
export function removeHandlerSession(instanceId: string): boolean;
/**
 * Get statistics about current handler sessions
 * @returns {Object} Session statistics
 */
export function getSessionStatistics(): Object;
/**
 * Start the session cleanup service
 * Called when the server starts
 */
export function startSessionCleanup(): void;
/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
export function stopSessionCleanup(): void;
/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId: string): void;
/**
 * Update bearer token in existing session
 * Called when OAuth tokens are refreshed
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newBearerToken - New bearer token
 */
export function updateSessionBearerToken(instanceId: string, newBearerToken: string): boolean;
//# sourceMappingURL=handlerSessions.d.ts.map