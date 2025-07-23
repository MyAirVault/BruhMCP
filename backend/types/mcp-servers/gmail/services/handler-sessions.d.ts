/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {import('../middleware/types.js').ServiceConfig} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {GmailMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: import("../middleware/types.js").ServiceConfig, bearerToken: string): GmailMCPHandler;
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
import { GmailMCPHandler } from '../endpoints/mcp-handler.js';
//# sourceMappingURL=handler-sessions.d.ts.map