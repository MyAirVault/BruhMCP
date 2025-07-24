/**
 * Handler session management for Figma MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 * 
 * This service works alongside the credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

import { FigmaMCPHandler } from '../endpoints/mcpHandler.js';

/**
 * @typedef {import('../endpoints/mcpHandler.js').ServiceConfig} ServiceConfig
 */

/**
 * @typedef {Object} HandlerSession
 * @property {FigmaMCPHandler} handler - The MCP handler instance
 * @property {number} lastAccessed - Timestamp of last access
 * @property {string} instanceId - Instance ID
 * @property {number} createdAt - Timestamp when session was created
 */

// Global handler session cache for Figma service instances
/** @type {Map<string, HandlerSession>} */
const handlerSessions = new Map();


// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes


/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @param {string} apiKey - Figma API key for this instance
 * @returns {FigmaMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, apiKey) {
	let session = handlerSessions.get(instanceId);
	
	if (!session) {
		// Create new handler instance for this instanceId
		console.log(`🔧 Creating new handler session for instance: ${instanceId}`);
		const handler = new FigmaMCPHandler(serviceConfig, apiKey);
		
		session = {
			handler,
			lastAccessed: Date.now(),
			instanceId,
			createdAt: Date.now()
		};
		
		handlerSessions.set(instanceId, session);
		console.log(`✅ Handler session created. Total sessions: ${handlerSessions.size}`);
	} else {
		console.log(`♻️  Reusing existing handler session for instance: ${instanceId}`);
	}
	
	// Update last accessed timestamp
	session.lastAccessed = Date.now();
	
	return session.handler;
}


/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
export function removeHandlerSession(instanceId) {
	const removed = handlerSessions.delete(instanceId);
	if (removed) {
		console.log(`🗑️  Removed handler session for instance: ${instanceId}`);
	}
	return removed;
}


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
export function getSessionStatistics() {
	const now = Date.now();
	const sessions = Array.from(handlerSessions.values());
	
	return {
		total_sessions: handlerSessions.size,
		sessions: sessions.map(session => ({
			instanceId: session.instanceId,
			created_at: new Date(session.createdAt).toISOString(),
			last_accessed: new Date(session.lastAccessed).toISOString(),
			age_minutes: Math.floor((now - session.createdAt) / 60000),
			idle_minutes: Math.floor((now - session.lastAccessed) / 60000),
			is_initialized: session.handler.initialized
		}))
	};
}


/**
 * Clean up expired sessions
 * Called periodically to remove inactive sessions
 */
function cleanupExpiredSessions() {
	const now = Date.now();
	let removedCount = 0;
	
	for (const [instanceId, session] of handlerSessions) {
		const idleTime = now - session.lastAccessed;
		
		if (idleTime > SESSION_TIMEOUT) {
			handlerSessions.delete(instanceId);
			removedCount++;
			console.log(`🧹 Cleaned up expired session: ${instanceId} (idle for ${Math.floor(idleTime / 60000)} minutes)`);
		}
	}
	
	if (removedCount > 0) {
		console.log(`🧹 Session cleanup complete. Removed ${removedCount} expired sessions. Active sessions: ${handlerSessions.size}`);
	}
}


// Cleanup interval handle
/** @type {NodeJS.Timeout|null} */
let cleanupInterval = null;


/**
 * Start the session cleanup service
 * Called when the server starts
 */
export function startSessionCleanup() {
	if (cleanupInterval) {
		console.warn('⚠️  Session cleanup already running');
		return;
	}
	
	cleanupInterval = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);
	console.log('🧹 Started handler session cleanup service');
}


/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
export function stopSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		console.log('🛑 Stopped handler session cleanup service');
	}
	
	// Clear all sessions on shutdown
	handlerSessions.clear();
	console.log('🗑️  Cleared all handler sessions');
}


/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId) {
	const removed = removeHandlerSession(instanceId);
	if (removed) {
		console.log(`🔄 Handler session invalidated due to credential change: ${instanceId}`);
	}
}