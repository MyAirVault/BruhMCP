/**
 * Handler session management for GitHub MCP JSON-RPC handlers
 * Maintains persistent handler instances per instanceId to preserve state between requests
 * 
 * This service works alongside the OAuth credential cache to provide stateful MCP sessions
 * required by the MCP protocol specification.
 */

import { GitHubMCPHandler } from '../../endpoints/mcp-handler.js';

// Global handler session cache for GitHub service instances
const handlerSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a persistent handler for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} serviceConfig - Service configuration object
 * @param {string} bearerToken - OAuth Bearer token for this instance
 * @returns {GitHubMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, bearerToken) {
	let session = handlerSessions.get(instanceId);
	
	if (!session) {
		// Create new handler instance for this instanceId
		console.log(`🔧 Creating new GitHub handler session for instance: ${instanceId}`);
		const handler = new GitHubMCPHandler(serviceConfig, bearerToken);
		
		session = {
			handler,
			lastAccessed: Date.now(),
			instanceId,
			createdAt: Date.now()
		};
		
		handlerSessions.set(instanceId, session);
		console.log(`✅ GitHub handler session created. Total sessions: ${handlerSessions.size}`);
	} else {
		console.log(`♻️  Reusing existing GitHub handler session for instance: ${instanceId}`);
		
		// Update bearer token in case it was refreshed
		if (bearerToken && session.handler.bearerToken !== bearerToken) {
			session.handler.bearerToken = bearerToken;
			console.log(`🔄 Updated bearer token in existing GitHub session for instance: ${instanceId}`);
		}
	}
	
	// Update last accessed time
	session.lastAccessed = Date.now();
	
	return session.handler;
}

/**
 * Remove a handler session
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session was found and removed
 */
export function removeHandler(instanceId) {
	const session = handlerSessions.get(instanceId);
	
	if (session) {
		console.log(`🗑️ Removing GitHub handler session for instance: ${instanceId}`);
		
		// Cleanup handler resources
		try {
			session.handler.cleanup();
		} catch (error) {
			console.error(`❌ Error cleaning up GitHub handler for instance ${instanceId}:`, error);
		}
		
		handlerSessions.delete(instanceId);
		console.log(`✅ GitHub handler session removed. Total sessions: ${handlerSessions.size}`);
		return true;
	}
	
	return false;
}

/**
 * Get session statistics
 * @returns {Object} Session statistics
 */
export function getSessionStats() {
	const sessions = Array.from(handlerSessions.values());
	const now = Date.now();
	
	return {
		totalSessions: sessions.length,
		activeSessions: sessions.filter(s => now - s.lastAccessed < SESSION_TIMEOUT).length,
		expiredSessions: sessions.filter(s => now - s.lastAccessed >= SESSION_TIMEOUT).length,
		oldestSession: sessions.length > 0 ? Math.min(...sessions.map(s => s.createdAt)) : null,
		newestSession: sessions.length > 0 ? Math.max(...sessions.map(s => s.createdAt)) : null,
		averageAge: sessions.length > 0 ? sessions.reduce((sum, s) => sum + (now - s.createdAt), 0) / sessions.length : 0
	};
}

/**
 * Get all active session IDs
 * @returns {string[]} Array of active session instance IDs
 */
export function getActiveSessionIds() {
	const now = Date.now();
	return Array.from(handlerSessions.entries())
		.filter(([_, session]) => now - session.lastAccessed < SESSION_TIMEOUT)
		.map(([instanceId]) => instanceId);
}

/**
 * Clean up expired sessions
 * @returns {number} Number of sessions cleaned up
 */
export function cleanupExpiredSessions() {
	const now = Date.now();
	const expiredSessions = [];
	
	for (const [instanceId, session] of handlerSessions.entries()) {
		if (now - session.lastAccessed >= SESSION_TIMEOUT) {
			expiredSessions.push(instanceId);
		}
	}
	
	console.log(`🧹 Cleaning up ${expiredSessions.length} expired GitHub handler sessions`);
	
	for (const instanceId of expiredSessions) {
		removeHandler(instanceId);
	}
	
	return expiredSessions.length;
}

/**
 * Force cleanup of all sessions
 * Used during shutdown or maintenance
 */
export function cleanupAllSessions() {
	console.log(`🧹 Cleaning up all ${handlerSessions.size} GitHub handler sessions`);
	
	for (const [instanceId, session] of handlerSessions.entries()) {
		try {
			session.handler.cleanup();
		} catch (error) {
			console.error(`❌ Error cleaning up GitHub handler for instance ${instanceId}:`, error);
		}
	}
	
	handlerSessions.clear();
	console.log(`✅ All GitHub handler sessions cleaned up`);
}

/**
 * Check if a session exists for the given instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if session exists
 */
export function hasSession(instanceId) {
	return handlerSessions.has(instanceId);
}

/**
 * Update session metadata
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} metadata - Metadata to update
 */
export function updateSessionMetadata(instanceId, metadata) {
	const session = handlerSessions.get(instanceId);
	if (session) {
		session.metadata = { ...session.metadata, ...metadata };
		session.lastAccessed = Date.now();
		console.log(`🔄 Updated metadata for GitHub session ${instanceId}`);
	}
}

/**
 * Start automatic cleanup of expired sessions
 * @returns {Object} Cleanup controller with stop method
 */
export function startSessionCleanup() {
	console.log(`🚀 Starting automatic GitHub session cleanup (interval: ${CLEANUP_INTERVAL / 1000}s)`);
	
	const cleanupInterval = setInterval(() => {
		const cleaned = cleanupExpiredSessions();
		if (cleaned > 0) {
			console.log(`✅ Cleaned up ${cleaned} expired GitHub sessions`);
		}
	}, CLEANUP_INTERVAL);
	
	return {
		stop: () => {
			clearInterval(cleanupInterval);
			console.log(`⏹️ Stopped automatic GitHub session cleanup`);
		}
	};
}

// Export stats for monitoring
export function getDetailedSessionInfo() {
	const sessions = Array.from(handlerSessions.entries()).map(([instanceId, session]) => ({
		instanceId,
		createdAt: new Date(session.createdAt).toISOString(),
		lastAccessed: new Date(session.lastAccessed).toISOString(),
		ageMinutes: Math.floor((Date.now() - session.createdAt) / 60000),
		inactiveMinutes: Math.floor((Date.now() - session.lastAccessed) / 60000),
		isExpired: Date.now() - session.lastAccessed >= SESSION_TIMEOUT,
		metadata: session.metadata || {}
	}));
	
	return {
		sessions,
		stats: getSessionStats()
	};
}