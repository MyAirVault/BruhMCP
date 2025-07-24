/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @param {string} apiKey - Notion API key for this instance
 * @returns {NotionMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: ServiceConfig, apiKey: string): NotionMCPHandler;
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
 * Update API key in existing session
 * Called when Notion API keys are refreshed or updated
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newApiKey - New Notion API key
 * @returns {boolean} True if session was updated, false if not found
 */
export function updateSessionApiKey(instanceId: string, newApiKey: string): boolean;
import { NotionMCPHandler } from '../endpoints/mcpHandler.js';
//# sourceMappingURL=handlerSessions.d.ts.map