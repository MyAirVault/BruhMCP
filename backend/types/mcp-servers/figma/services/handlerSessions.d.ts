export type SessionStatistics = {
    /**
     * - Total number of active sessions
     */
    total_sessions: number;
    /**
     * - Array of session information
     */
    sessions: Array<SessionInfo>;
};
export type SessionInfo = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - ISO timestamp when session was created
     */
    created_at: string;
    /**
     * - ISO timestamp of last access
     */
    last_accessed: string;
    /**
     * - Age of session in minutes
     */
    age_minutes: number;
    /**
     * - Minutes since last access
     */
    idle_minutes: number;
    /**
     * - Whether handler is initialized
     */
    is_initialized: boolean;
};
export type ServiceConfig = import("../endpoints/mcpHandler.js").ServiceConfig;
export type HandlerSession = {
    /**
     * - The MCP handler instance
     */
    handler: FigmaMCPHandler;
    /**
     * - Timestamp of last access
     */
    lastAccessed: number;
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Timestamp when session was created
     */
    createdAt: number;
};
/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @param {string} apiKey - Figma API key for this instance
 * @returns {FigmaMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId: string, serviceConfig: ServiceConfig, apiKey: string): FigmaMCPHandler;
/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
export function removeHandlerSession(instanceId: string): boolean;
/**
 * @typedef {Object} SessionStatistics
 * @property {number} total_sessions - Total number of active sessions
 * @property {Array<SessionInfo>} sessions - Array of session information
 */
/**
 * @typedef {Object} SessionInfo
 * @property {string} instanceId - Instance ID
 * @property {string} created_at - ISO timestamp when session was created
 * @property {string} last_accessed - ISO timestamp of last access
 * @property {number} age_minutes - Age of session in minutes
 * @property {number} idle_minutes - Minutes since last access
 * @property {boolean} is_initialized - Whether handler is initialized
 */
/**
 * Get statistics about current handler sessions
 * @returns {SessionStatistics} Session statistics
 */
export function getSessionStatistics(): SessionStatistics;
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
import { FigmaMCPHandler } from "../endpoints/mcpHandler.js";
//# sourceMappingURL=handlerSessions.d.ts.map