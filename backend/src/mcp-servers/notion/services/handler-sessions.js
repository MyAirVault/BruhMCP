/**
 * Handler session management for Notion MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 *
 * This service works alongside the credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

import { NotionMCPHandler } from '../endpoints/mcp-handler.js';

// Global handler session cache for Notion service instances
const handlerSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {ServiceConfig} serviceConfig - Service configuration object
 * @param {string} apiKey - Notion API key for this instance
 * @returns {NotionMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, apiKey) {
	let session = handlerSessions.get(instanceId);

	if (!session) {
		// Create new handler instance for this instanceId
		console.log(`🔧 Creating new handler session for instance: ${instanceId}`);

		try {
			const handler = new NotionMCPHandler(serviceConfig, apiKey);

			session = {
				handler,
				lastAccessed: Date.now(),
				instanceId,
				createdAt: Date.now(),
			};

			handlerSessions.set(instanceId, session);
			console.log(`✅ Handler session created. Total sessions: ${handlerSessions.size}`);
		} catch (error) {
			console.error(`❌ Failed to create handler session for instance: ${instanceId}`, error);
			// Clean up any partial session data
			handlerSessions.delete(instanceId);
			throw error;
		}
	} else {
		console.log(`♻️  Reusing existing handler session for instance: ${instanceId}`);
		
		// Update API key in case it was refreshed
		if (apiKey && session.handler.apiKey !== apiKey) {
			session.handler.apiKey = apiKey;
			// Update the NotionService instance if it exists
			if (session.handler.notionService) {
				session.handler.notionService.apiKey = apiKey;
			}
			console.log(`🔄 Updated API key in existing session for instance: ${instanceId}`);
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
		console.log(`🗑️  Removed handler session for instance: ${instanceId}`);
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
			has_api_key: !!session.handler.apiKey,
		})),
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
			try {
				// Clean up handler resources
				if (session.handler && session.handler.transports) {
					// Close all transport connections
					for (const [sessionId, transport] of Object.entries(session.handler.transports)) {
						try {
							if (transport && typeof transport.close === 'function') {
								transport.close();
							}
						} catch (error) {
							console.error(`Error closing transport ${sessionId}:`, error);
						}
					}
				}

				handlerSessions.delete(instanceId);
				removedCount++;
				console.log(
					`🧹 Cleaned up expired session: ${instanceId} (idle for ${Math.floor(idleTime / 60000)} minutes)`
				);
			} catch (error) {
				console.error(`Error cleaning up session ${instanceId}:`, error);
				// Still remove the session even if cleanup fails
				handlerSessions.delete(instanceId);
				removedCount++;
			}
		}
	}

	if (removedCount > 0) {
		console.log(
			`🧹 Session cleanup complete. Removed ${removedCount} expired sessions. Active sessions: ${handlerSessions.size}`
		);
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

/**
 * Update API key in existing session
 * Called when Notion API keys are refreshed or updated
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newApiKey - New Notion API key
 * @returns {boolean} True if session was updated, false if not found
 */
export function updateSessionApiKey(instanceId, newApiKey) {
	const session = handlerSessions.get(instanceId);
	if (session && session.handler) {
		// Update the API key in the handler's NotionService instance
		if (session.handler.notionService) {
			session.handler.notionService.apiKey = newApiKey;
		}
		// Update the handler's direct API key reference if it exists
		if (session.handler.apiKey !== undefined) {
			session.handler.apiKey = newApiKey;
		}
		session.lastAccessed = Date.now();
		console.log(`🔄 Updated API key in Notion session: ${instanceId}`);
		return true;
	}
	return false;
}
