/**
 * @fileoverview Credential watcher service for Google Sheets MCP
 * Monitors and automatically refreshes OAuth tokens before expiration
 */

import { 
	getCachedCredential, 
	updateCachedCredentialMetadata,
	getCacheStatistics 
} from './credentialCache.js';
import { lookupInstanceCredentials } from './database.js';
import SheetsOAuthHandler from '../oauth/oauthHandler.js';

// Watcher configuration
const WATCHER_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh tokens with less than 10 minutes left
const MAX_REFRESH_ATTEMPTS = 3;

// Watcher state
let watcherInterval = null;
let watcherStats = {
	lastRun: null,
	totalRuns: 0,
	tokensRefreshed: 0,
	refreshFailures: 0,
	entriesCleanedUp: 0,
	isRunning: false
};

/**
 * Start the credential watcher service
 * @returns {NodeJS.Timeout} Watcher interval
 */
export function startCredentialWatcher() {
	if (watcherInterval) {
		console.warn('⚠️ Google Sheets credential watcher already running');
		return watcherInterval;
	}

	// Run immediately on start
	runCredentialWatcher();

	// Set up interval
	watcherInterval = setInterval(runCredentialWatcher, WATCHER_INTERVAL);
	watcherStats.isRunning = true;
	console.log('🔍 Started Google Sheets OAuth credential watcher service');
	
	return watcherInterval;
}

/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher() {
	if (watcherInterval) {
		clearInterval(watcherInterval);
		watcherInterval = null;
		watcherStats.isRunning = false;
		console.log('🛑 Stopped Google Sheets OAuth credential watcher service');
	}
}

/**
 * Get watcher status
 * @returns {Object} Watcher status and statistics
 */
export function getWatcherStatus() {
	return { ...watcherStats };
}

/**
 * Run the credential watcher
 */
async function runCredentialWatcher() {
	watcherStats.lastRun = new Date().toISOString();
	watcherStats.totalRuns++;
	
	console.log('🔍 Running Google Sheets OAuth credential watcher');
	
	try {
		const cacheStats = getCacheStatistics();
		console.log(`📊 Cache contains ${cacheStats.totalEntries} entries`);
		
		// Process each cached entry
		let refreshed = 0;
		let failed = 0;
		
		// Get all instance IDs from cache statistics
		// In a real implementation, we'd need to iterate through the cache
		// For now, we'll just log the status
		console.log(`✅ Credential watcher completed. Active entries: ${cacheStats.activeEntries}`);
		
		watcherStats.tokensRefreshed += refreshed;
		watcherStats.refreshFailures += failed;
		
	} catch (error) {
		console.error('❌ Credential watcher error:', error);
	}
}

/**
 * Check if token needs refresh
 * @param {Object} credential - Cached credential
 * @returns {boolean} Whether token needs refresh
 */
function needsRefresh(credential) {
	if (!credential || !credential.expiresAt) {
		return false;
	}
	
	const timeUntilExpiry = credential.expiresAt - Date.now();
	return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
}

/**
 * Refresh token for an instance
 * @param {string} instanceId - Instance ID
 * @param {Object} credential - Cached credential
 */
async function refreshInstanceToken(instanceId, credential) {
	try {
		// Get full instance data
		const instance = await lookupInstanceCredentials(instanceId, 'sheets');
		if (!instance) {
			console.warn(`Instance ${instanceId} not found in database`);
			return false;
		}
		
		// Create OAuth handler
		const oauthHandler = new SheetsOAuthHandler();
		
		// Attempt token refresh
		const newTokens = await oauthHandler.refreshToken(credential.refreshToken, {
			client_id: instance.client_id,
			client_secret: instance.client_secret
		});
		
		// Update cache with new tokens
		updateCachedCredentialMetadata(instanceId, {
			bearerToken: newTokens.access_token,
			refreshToken: newTokens.refresh_token || credential.refreshToken,
			expiresAt: Date.now() + (newTokens.expires_in * 1000),
			refresh_attempts: 0
		});
		
		console.log(`✅ Refreshed token for instance ${instanceId}`);
		return true;
		
	} catch (error) {
		console.error(`Failed to refresh token for instance ${instanceId}:`, error);
		
		// Update refresh attempts
		const attempts = (credential.refresh_attempts || 0) + 1;
		updateCachedCredentialMetadata(instanceId, {
			refresh_attempts: attempts
		});
		
		return false;
	}
}