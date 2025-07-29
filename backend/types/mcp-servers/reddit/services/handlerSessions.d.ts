/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {{name: string, displayName: string, version: string, scopes: string[]}} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {RedditMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
}, bearerToken: string): RedditMCPHandler;
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
 * Update bearer token in existing session
 * Called when OAuth tokens are refreshed
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newBearerToken - New bearer token
 */
export function updateSessionBearerToken(instanceId: string, newBearerToken: string): boolean;
import { RedditMCPHandler } from "../endpoints/mcpHandler";
//# sourceMappingURL=handlerSessions.d.ts.map