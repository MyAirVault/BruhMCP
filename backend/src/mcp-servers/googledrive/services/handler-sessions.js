/**
 * Handler session management for Google Drive MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 * 
 * This service works alongside the OAuth credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

import { GoogleDriveMCPHandler } from '../endpoints/mcp-handler.js';

// Global handler session cache for Google Drive service instances
const handlerSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {GoogleDriveMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, bearerToken) {
	// Validate input parameters
	if (!instanceId || typeof instanceId !== 'string') {
		throw new Error('Valid instanceId is required');
	}
	
	if (!serviceConfig || typeof serviceConfig !== 'object') {
		throw new Error('Valid serviceConfig is required');
	}
	
	if (!bearerToken || typeof bearerToken !== 'string') {
		throw new Error('Valid bearerToken is required');
	}
	
	let session = handlerSessions.get(instanceId);
	
	if (!session) {
		// Create new handler instance for this instanceId
		console.log(`🔧 Creating new Google Drive handler session for instance: ${instanceId}`);
		
		let handler;
		try {
			handler = new GoogleDriveMCPHandler(serviceConfig, bearerToken);
		} catch (error) {
			console.error(`❌ Failed to create handler for instance ${instanceId}:`, error);
			throw new Error(`Failed to create handler: ${error.message}`);
		}
		
		session = {
			handler,
			lastAccessed: Date.now(),
			instanceId,
			createdAt: Date.now(),
			isValid: true
		};
		
		handlerSessions.set(instanceId, session);
		console.log(`✅ Google Drive handler session created. Total sessions: ${handlerSessions.size}`);
	} else {
		// Validate existing session
		if (!session.handler || !session.isValid) {
			console.log(`🔄 Recreating invalid session for instance: ${instanceId}`);
			handlerSessions.delete(instanceId);
			return getOrCreateHandler(instanceId, serviceConfig, bearerToken);
		}
		
		console.log(`♻️  Reusing existing Google Drive handler session for instance: ${instanceId}`);
		
		// Update bearer token in case it was refreshed
		if (bearerToken && session.handler.bearerToken !== bearerToken) {
			session.handler.bearerToken = bearerToken;
			console.log(`🔄 Updated bearer token in existing session for instance: ${instanceId}`);
		}
	}
	
	// Update last accessed timestamp
	session.lastAccessed = Date.now();
	
	// Validate handler state before returning
	if (!session.handler || typeof session.handler !== 'object') {
		console.error(`❌ Invalid handler state for instance ${instanceId}`);
		handlerSessions.delete(instanceId);
		throw new Error('Handler is in invalid state');
	}
	
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
		console.log(`🗑️  Removed Google Drive handler session for instance: ${instanceId}`);
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
		let shouldRemove = false;
		let reason = '';
		
		// Check for expired sessions
		const idleTime = now - session.lastAccessed;
		if (idleTime > SESSION_TIMEOUT) {
			shouldRemove = true;
			reason = `idle for ${Math.floor(idleTime / 60000)} minutes`;
		}
		
		// Check for invalid sessions
		if (!session.handler || !session.isValid || session.handler === null) {
			shouldRemove = true;
			reason = reason ? `${reason}, invalid handler` : 'invalid handler';
		}
		
		// Check for missing required properties
		if (!session.instanceId || !session.createdAt || !session.lastAccessed) {
			shouldRemove = true;
			reason = reason ? `${reason}, missing properties` : 'missing properties';
		}
		
		// Check for corrupted timestamps
		if (typeof session.createdAt !== 'number' || typeof session.lastAccessed !== 'number') {
			shouldRemove = true;
			reason = reason ? `${reason}, corrupted timestamps` : 'corrupted timestamps';
		}
		
		if (shouldRemove) {
			try {
				// Clean up handler if it exists
				if (session.handler && typeof session.handler.cleanup === 'function') {
					session.handler.cleanup();
				}
			} catch (cleanupError) {
				console.error(`❌ Error cleaning up handler for ${instanceId}:`, cleanupError);
			}
			
			handlerSessions.delete(instanceId);
			removedCount++;
			console.log(`🧹 Cleaned up Google Drive session: ${instanceId} (${reason})`);
		}
	}
	
	if (removedCount > 0) {
		console.log(`🧹 Google Drive session cleanup complete. Removed ${removedCount} sessions. Active sessions: ${handlerSessions.size}`);
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
		console.warn('⚠️  Google Drive session cleanup already running');
		return;
	}
	
	cleanupInterval = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);
	console.log('🧹 Started Google Drive handler session cleanup service');
}

/**
 * Stop the session cleanup service
 * Called during graceful shutdown
 */
export function stopSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		console.log('🛑 Stopped Google Drive handler session cleanup service');
	}
	
	// Clear all sessions on shutdown
	handlerSessions.clear();
	console.log('🗑️  Cleared all Google Drive handler sessions');
}

/**
 * Integration with credential cache invalidation
 * When credentials are invalidated, also remove the handler session
 * @param {string} instanceId - UUID of the service instance
 */
export function invalidateHandlerSession(instanceId) {
	const removed = removeHandlerSession(instanceId);
	if (removed) {
		console.log(`🔄 Google Drive handler session invalidated due to credential change: ${instanceId}`);
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
		session.handler.bearerToken = newBearerToken;
		session.lastAccessed = Date.now();
		console.log(`🔄 Updated bearer token in Google Drive session: ${instanceId}`);
		return true;
	}
	return false;
}