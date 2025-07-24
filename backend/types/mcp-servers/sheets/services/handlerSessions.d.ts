/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {string} bearerToken - OAuth bearer token
 * @param {Object} serviceConfig - Service configuration
 * @returns {Promise<import('../endpoints/mcpHandler.js').SheetsMCPHandler>} Handler instance
 */
export function getOrCreateHandler(instanceId: string, bearerToken: string, serviceConfig: Object): Promise<import("../endpoints/mcpHandler.js").SheetsMCPHandler>;
/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
export function removeHandlerSession(instanceId: string): boolean;
/**
 * Start periodic cleanup of expired sessions
 * @returns {NodeJS.Timeout} Cleanup interval reference
 */
export function startSessionCleanup(): NodeJS.Timeout;
/**
 * Stop periodic cleanup
 */
export function stopSessionCleanup(): void;
/**
 * Get session statistics
 * @returns {Object} Session statistics
 */
export function getSessionStatistics(): Object;
/**
 * Clear all sessions (for testing or emergency cleanup)
 */
export function clearAllSessions(): number;
//# sourceMappingURL=handlerSessions.d.ts.map