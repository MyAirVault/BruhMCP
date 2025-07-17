/**
 * Discord Handler Sessions Service
 * Manages persistent MCP handlers for each instance
 */

import { DiscordMCPHandler } from '../endpoints/mcp-handler.js';

// Session storage for persistent handlers
const handlerSessions = new Map();

// Session statistics
let sessionStats = {
	created: 0,
	destroyed: 0,
	active: 0,
	cleanups: 0,
	lastCleanup: null,
	startTime: Date.now(),
};

// Cleanup interval
let cleanupInterval = null;

/**
 * Gets or creates a persistent handler for an instance
 * @param {string} instanceId - The instance ID
 * @param {Object} serviceConfig - Service configuration
 * @param {string} bearerToken - Bearer token for authentication
 * @returns {DiscordMCPHandler} Persistent handler instance
 */
export function getOrCreateHandler(instanceId, serviceConfig, bearerToken) {
	// Check if handler already exists
	let session = handlerSessions.get(instanceId);

	if (session) {
		// Update tokens if they've changed
		if (session.bearerToken !== bearerToken) {
			console.log(`🔄 Updating tokens for instance: ${instanceId}`);
			session.handler.updateTokens(bearerToken);
			session.bearerToken = bearerToken;
		}

		// Update last access time
		session.lastAccessed = Date.now();
		return session.handler;
	}

	// Create new handler session
	console.log(`🆕 Creating new handler session for instance: ${instanceId}`);

	const handler = new DiscordMCPHandler(serviceConfig, bearerToken);

	session = {
		instanceId,
		handler,
		bearerToken,
		createdAt: Date.now(),
		lastAccessed: Date.now(),
	};

	handlerSessions.set(instanceId, session);
	sessionStats.created++;
	sessionStats.active++;

	return handler;
}

/**
 * Destroys a handler session for an instance
 * @param {string} instanceId - The instance ID
 */
export function destroyHandler(instanceId) {
	const session = handlerSessions.get(instanceId);

	if (session) {
		console.log(`🗑️ Destroying handler session for instance: ${instanceId}`);

		// Call cleanup if handler has cleanup method
		if (typeof session.handler.cleanup === 'function') {
			session.handler.cleanup();
		}

		handlerSessions.delete(instanceId);
		sessionStats.destroyed++;
		sessionStats.active--;
	}
}

/**
 * Starts the session cleanup service
 * Removes inactive sessions after 1 hour of inactivity
 */
export function startSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
	}

	console.log('🧹 Starting Discord handler session cleanup service...');

	// Run cleanup every 15 minutes
	cleanupInterval = setInterval(cleanupInactiveSessions, 15 * 60 * 1000);

	console.log('✅ Discord handler session cleanup service started');
}

/**
 * Stops the session cleanup service
 */
export function stopSessionCleanup() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
		console.log('🛑 Discord handler session cleanup service stopped');
	}
}

/**
 * Cleans up inactive sessions
 */
export function cleanupInactiveSessions() {
	const now = Date.now();
	const inactivityThreshold = 60 * 60 * 1000; // 1 hour
	let cleanedCount = 0;

	for (const [instanceId, session] of handlerSessions.entries()) {
		const timeSinceLastAccess = now - session.lastAccessed;

		if (timeSinceLastAccess > inactivityThreshold) {
			console.log(
				`🧹 Cleaning up inactive session for instance: ${instanceId} (inactive for ${formatDuration(timeSinceLastAccess)})`
			);
			destroyHandler(instanceId);
			cleanedCount++;
		}
	}

	if (cleanedCount > 0) {
		sessionStats.cleanups++;
		sessionStats.lastCleanup = now;
		console.log(`🧹 Cleaned up ${cleanedCount} inactive handler sessions`);
	}
}

/**
 * Gets session statistics
 * @returns {Object} Session statistics
 */
export function getSessionStatistics() {
	const now = Date.now();
	const uptimeMs = now - sessionStats.startTime;

	// Calculate session details
	const sessionDetails = [];
	for (const [instanceId, session] of handlerSessions.entries()) {
		sessionDetails.push({
			instanceId,
			createdAt: session.createdAt,
			lastAccessed: session.lastAccessed,
			ageMs: now - session.createdAt,
			inactiveMs: now - session.lastAccessed,
			hasTokens: !!session.bearerToken,
		});
	}

	return {
		active_sessions: sessionStats.active,
		total_created: sessionStats.created,
		total_destroyed: sessionStats.destroyed,
		total_cleanups: sessionStats.cleanups,
		last_cleanup: sessionStats.lastCleanup ? new Date(sessionStats.lastCleanup).toISOString() : null,
		uptime_ms: uptimeMs,
		uptime_readable: formatDuration(uptimeMs),
		session_details: sessionDetails,
	};
}

/**
 * Destroys all handler sessions
 */
export function destroyAllSessions() {
	console.log(`🗑️ Destroying all ${handlerSessions.size} handler sessions...`);

	for (const instanceId of handlerSessions.keys()) {
		destroyHandler(instanceId);
	}

	console.log('✅ All handler sessions destroyed');
}

/**
 * Formats duration in milliseconds to human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Human-readable duration
 */
function formatDuration(ms) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
	if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
	return `${seconds}s`;
}
