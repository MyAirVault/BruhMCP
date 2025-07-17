/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {GitHubMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: Object, bearerToken: string): GitHubMCPHandler;
/**
 * Remove a handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was found and removed
 */
export function removeHandler(instanceId: string): boolean;
/**
 * Get session statistics
 * @returns {Object} Session statistics
 */
export function getSessionStats(): Object;
/**
 * Get all active session IDs
 * @returns {string[]} Array of active session instance IDs
 */
export function getActiveSessionIds(): string[];
/**
 * Clean up expired sessions
 * @returns {number} Number of sessions cleaned up
 */
export function cleanupExpiredSessions(): number;
/**
 * Force cleanup of all sessions
 * Used during shutdown or maintenance
 */
export function cleanupAllSessions(): void;
/**
 * Check if a session exists for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session exists
 */
export function hasSession(instanceId: string): boolean;
/**
 * Update session metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} metadata - Metadata to update
 */
export function updateSessionMetadata(instanceId: string, metadata: Object): void;
/**
 * Start automatic cleanup of expired sessions
 * @returns {Object} Cleanup controller with stop method
 */
export function startSessionCleanup(): Object;
export function getDetailedSessionInfo(): {
    sessions: {
        instanceId: any;
        createdAt: string;
        lastAccessed: string;
        ageMinutes: number;
        inactiveMinutes: number;
        isExpired: boolean;
        metadata: any;
    }[];
    stats: Object;
};
import { GitHubMCPHandler } from '../../endpoints/mcp-handler.js';
//# sourceMappingURL=handler-sessions.d.ts.map