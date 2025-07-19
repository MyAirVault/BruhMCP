/**
 * Handler session management for Google Sheets MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 * Based on Gmail MCP implementation patterns
 * 
 * This service works alongside the OAuth credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

// Global handler session cache for Google Sheets service instances
const handlerSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Create a new handler session for an instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} oauth - OAuth configuration object with bearer token
 * @returns {Promise<Object>} Handler session object
 */
async function createHandlerSession(instanceId, oauth) {
	try {
		// Import handler class dynamically to avoid circular dependencies
		const { SheetsMCPHandler } = require('../endpoints/mcp-handler');
		
		console.log(`🔧 Creating new Google Sheets handler session for instance: ${instanceId}`);
		const handler = new SheetsMCPHandler(oauth);
		
		const session = {
			handler,
			lastAccessed: Date.now(),
			instanceId,
			createdAt: Date.now()
		};
		
		handlerSessions.set(instanceId, session);
		console.log(`✅ Google Sheets handler session created. Total sessions: ${handlerSessions.size}`);
		
		return session;
	} catch (error) {
		console.error(`❌ Failed to create handler session for instance ${instanceId}:`, error);
		throw error;
	}
}

/**
 * Get existing handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Handler session or null if not found
 */
function getHandlerSession(instanceId) {
	const session = handlerSessions.get(instanceId);
	
	if (session) {
		// Update last accessed timestamp
		session.lastAccessed = Date.now();
		console.log(`♻️  Reusing existing Google Sheets handler session for instance: ${instanceId}`);
	}
	
	return session;
}

/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} oauth - OAuth configuration object with bearer token
 * @returns {Promise<Object>} Handler session object
 */
async function getOrCreateHandlerSession(instanceId, oauth) {
	let session = getHandlerSession(instanceId);
	
	if (!session) {
		session = await createHandlerSession(instanceId, oauth);
	} else {
		// Update bearer token in case it was refreshed
		if (oauth.bearerToken && session.handler.bearerToken !== oauth.bearerToken) {
			session.handler.bearerToken = oauth.bearerToken;
			console.log(`🔄 Updated bearer token in existing session for instance: ${instanceId}`);
		}
	}
	
	return session;
}

/**
 * Remove a specific handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was removed, false if not found
 */
function removeHandlerSession(instanceId) {
	const removed = handlerSessions.delete(instanceId);
	if (removed) {
		console.log(`🗑️  Removed Google Sheets handler session for instance: ${instanceId}`);
	}
	return removed;
}

/**
 * Get statistics about current handler sessions
 * @returns {Object} Session statistics
 */
function getSessionStatistics() {
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
			has_bearer_token: !!session.handler.bearerToken
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
			console.log(`🧹 Cleaned up expired Google Sheets session: ${instanceId} (idle for ${Math.floor(idleTime / 60000)} minutes)`);
		}
	}
	
	if (removedCount > 0) {
		console.log(`🧹 Google Sheets session cleanup complete. Removed ${removedCount} expired sessions. Active sessions: ${handlerSessions.size}`);
	}
}

// Cleanup interval handle
let cleanupInterval = null;

/**
 * Start the session cleanup service
 * Called when the server starts
 */
function startSessionCleanup() {
	if (cleanupInterval) {
		console.warn('⚠️  Google Sheets session cleanup already running');
		return;
	}
	
	cleanupInterval = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);
	console.log('🧹 Started Google Sheets handler session cleanup service');
}

/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
function stopSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		console.log('🛑 Stopped Google Sheets handler session cleanup service');
	}
	
	// Clear all sessions on shutdown
	handlerSessions.clear();
	console.log('🗑️  Cleared all Google Sheets handler sessions');
}

/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
function invalidateHandlerSession(instanceId) {
	const removed = removeHandlerSession(instanceId);
	if (removed) {
		console.log(`🔄 Google Sheets handler session invalidated due to credential change: ${instanceId}`);
	}
}

/**
 * Update bearer token in existing session
 * Called when OAuth tokens are refreshed
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newBearerToken - New bearer token
 */
function updateSessionBearerToken(instanceId, newBearerToken) {
	const session = handlerSessions.get(instanceId);
	if (session && session.handler) {
		session.handler.bearerToken = newBearerToken;
		session.lastAccessed = Date.now();
		console.log(`🔄 Updated bearer token in Google Sheets session: ${instanceId}`);
		return true;
	}
	return false;
}

/**
 * Clear all handler sessions (for testing/restart)
 */
function clearAllSessions() {
	const count = handlerSessions.size;
	handlerSessions.clear();
	console.log(`🗑️  Cleared ${count} Google Sheets handler sessions`);
}

module.exports = {
	createHandlerSession,
	getHandlerSession,
	getOrCreateHandlerSession,
	removeHandlerSession,
	getSessionStatistics,
	startSessionCleanup,
	stopSessionCleanup,
	invalidateHandlerSession,
	updateSessionBearerToken,
	clearAllSessions
};