/**
 * Handler session management for Todoist MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 * 
 * This service works alongside the credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

import { TodoistMCPHandler } from '../endpoints/mcp-handler.js';

// Global handler session cache for Todoist service instances
const handlerSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} serviceConfig - Service configuration object
 * @param {string} apiKey - API key for this instance
 * @returns {TodoistMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, apiKey) {
	let session = handlerSessions.get(instanceId);
	
	if (!session) {
		// Create new handler instance for this instanceId
		console.log(`🔧 Creating new Todoist handler session for instance: ${instanceId}`);
		const handler = new TodoistMCPHandler(serviceConfig, apiKey);
		
		session = {
			handler,
			lastAccessed: Date.now(),
			instanceId,
			createdAt: Date.now()
		};
		
		handlerSessions.set(instanceId, session);
		console.log(`✅ Todoist handler session created. Total sessions: ${handlerSessions.size}`);
	} else {
		console.log(`♻️  Reusing existing Todoist handler session for instance: ${instanceId}`);
		
		// Update bearer token in case it was refreshed
		if (apiKey && session.handler.apiKey !== apiKey) {
			session.handler.apiKey = apiKey;
			console.log(`🔄 Updated bearer token in existing session for instance: ${instanceId}`);
		}
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
		console.log(`🗑️  Removed Todoist handler session for instance: ${instanceId}`);
	}
	return removed;
}

/**
 * Get statistics about current handler sessions
 * @returns {Object} Session statistics
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
			is_initialized: session.handler.initialized,
			has_bearer_token: !!session.handler.apiKey
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
			console.log(`🧹 Cleaned up expired Todoist session: ${instanceId} (idle for ${Math.floor(idleTime / 60000)} minutes)`);
		}
	}
	
	if (removedCount > 0) {
		console.log(`🧹 Todoist session cleanup complete. Removed ${removedCount} expired sessions. Active sessions: ${handlerSessions.size}`);
	}
}

// Cleanup interval handle
let cleanupInterval = null;

/**
 * Start the session cleanup service
 * Called when the server starts
 */
export function startSessionCleanup() {
	if (cleanupInterval) {
		console.warn('⚠️  Todoist session cleanup already running');
		return;
	}
	
	cleanupInterval = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);
	console.log('🧹 Started Todoist handler session cleanup service');
}

/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
export function stopSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		console.log('🛑 Stopped Todoist handler session cleanup service');
	}
	
	// Clear all sessions on shutdown
	handlerSessions.clear();
	console.log('🗑️  Cleared all Todoist handler sessions');
}

/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId) {
	const removed = removeHandlerSession(instanceId);
	if (removed) {
		console.log(`🔄 Todoist handler session invalidated due to credential change: ${instanceId}`);
	}
}

/**
 * Update bearer token in existing session
 * Called when OAuth tokens are refreshed
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newBearerToken - New bearer token
 */
export function updateSessionBearerToken(instanceId, newBearerToken) {
	const session = handlerSessions.get(instanceId);
	if (session && session.handler) {
		session.handler.apiKey = newBearerToken;
		session.lastAccessed = Date.now();
		console.log(`🔄 Updated bearer token in Todoist session: ${instanceId}`);
		return true;
	}
	return false;
}