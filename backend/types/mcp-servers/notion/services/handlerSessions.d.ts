/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {import('../endpoints/mcpHandler.js').ServiceConfig} serviceConfig - Service configuration object
 * @param {string} apiKey - Notion API key for this instance
 * @returns {NotionMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: import('../endpoints/mcpHandler.js').ServiceConfig, apiKey: string): NotionMCPHandler;
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
 * Get statistics about current handler sessions
 * @returns {Object} Session statistics
 */
export function getSessionStatistics(): Object;
/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId: string): void;
import { NotionMCPHandler } from "../endpoints/mcpHandler";
//# sourceMappingURL=handlerSessions.d.ts.map