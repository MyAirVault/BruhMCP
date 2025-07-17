/**
 * Gets or creates a persistent handler for an instance
 * @param {string} instanceId - The instance ID
 * @param {Object} serviceConfig - Service configuration
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {DiscordMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: Object, bearerToken: string): DiscordMCPHandler;
/**
 * Destroys a handler session for an instance
 * @param {string} instanceId - The instance ID
 */
export function destroyHandler(instanceId: string): void;
/**
 * Starts the session cleanup service
 * Removes inactive sessions after 1 hour of inactivity
 */
export function startSessionCleanup(): void;
/**
 * Stops the session cleanup service
 */
export function stopSessionCleanup(): void;
/**
 * Cleans up inactive sessions
 */
export function cleanupInactiveSessions(): void;
/**
 * Gets session statistics
 * @returns {Object} Session statistics
 */
export function getSessionStatistics(): Object;
/**
 * Destroys all handler sessions
 */
export function destroyAllSessions(): void;
import { DiscordMCPHandler } from '../endpoints/mcp-handler.js';
//# sourceMappingURL=handler-sessions.d.ts.map