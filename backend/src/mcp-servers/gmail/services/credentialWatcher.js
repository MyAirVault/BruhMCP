/**
 * Credential watcher service for Gmail MCP OAuth token management
 * Monitors and automatically refreshes OAuth Bearer tokens before expiration
 */

import { cleanupInvalidCacheEntries, getCachedInstanceIds, peekCachedCredential, updateCachedCredentialMetadata, incrementRefreshAttempts, resetRefreshAttempts } from './credentialCache.js';
import { refreshBearerToken } from '../utils/oauthValidation.js';
import { lookupInstanceCredentials } from './database.js';

// Watcher configuration
const WATCHER_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh tokens with less than 10 minutes left
const MAX_REFRESH_ATTEMPTS = 3;

// Watcher state
/** @type {NodeJS.Timeout | null} */
let watcherInterval = null;
let watcherStats = {
  lastRun: /** @type {string | null} */ (null),
  totalRuns: 0,
  tokensRefreshed: 0,
  refreshFailures: 0,
  entriesCleanedUp: 0,
  isRunning: false
};

/**
 * Start the credential watcher service
 */
export function startCredentialWatcher() {
  if (watcherInterval) {
    console.warn('⚠️  Gmail credential watcher already running');
    return;
  }

  watcherInterval = setInterval(runCredentialWatcher, WATCHER_INTERVAL);
  watcherStats.isRunning = true;
  console.log('🔍 Started Gmail OAuth credential watcher service');
}

/**
 * Stop the credential watcher service
 */
export function stopCredentialWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    watcherStats.isRunning = false;
    console.log('🛑 Stopped Gmail OAuth credential watcher service');
  }
}

/**
 * Get watcher status and statistics
 * @returns {Object} Watcher status information
 */
export function getWatcherStatus() {
  return {
    isRunning: watcherStats.isRunning,
    intervalMinutes: WATCHER_INTERVAL / 60000,
    refreshThresholdMinutes: TOKEN_REFRESH_THRESHOLD / 60000,
    maxRefreshAttempts: MAX_REFRESH_ATTEMPTS,
    statistics: {
      ...watcherStats,
      nextRunIn: watcherStats.isRunning 
        ? Math.ceil(WATCHER_INTERVAL / 60000) + ' minutes'
        : 'N/A'
    }
  };
}

/**
 * Run the credential watcher cycle
 */
async function runCredentialWatcher() {
  const startTime = Date.now();
  watcherStats.lastRun = new Date().toISOString();
  watcherStats.totalRuns++;

  console.log(`🔍 Running Gmail OAuth credential watcher cycle #${watcherStats.totalRuns}`);

  try {
    // Get all cached instance IDs
    const cachedInstanceIds = getCachedInstanceIds();
    
    if (cachedInstanceIds.length === 0) {
      console.log('ℹ️  No cached instances to check');
      return;
    }

    console.log(`📊 Checking ${cachedInstanceIds.length} cached instances for token expiration`);

    // Check each cached instance
    const refreshPromises = cachedInstanceIds.map(async (instanceId) => {
      try {
        await checkAndRefreshToken(instanceId);
      } catch (error) {
        console.error(`❌ Failed to check/refresh token for instance ${instanceId}:`, error);
        watcherStats.refreshFailures++;
      }
    });

    // Wait for all refresh operations to complete
    await Promise.all(refreshPromises);

    // Clean up invalid cache entries
    const cleanupCount = cleanupInvalidCacheEntries('watcher_cleanup');
    watcherStats.entriesCleanedUp += cleanupCount;

    const duration = Date.now() - startTime;
    console.log(`✅ Gmail credential watcher cycle completed in ${duration}ms`);

  } catch (error) {
    console.error('❌ Gmail credential watcher cycle failed:', error);
  }
}

/**
 * Check and refresh a token if needed
 * @param {string} instanceId - Instance ID to check
 */
async function checkAndRefreshToken(instanceId) {
  const cached = peekCachedCredential(instanceId);
  
  if (!cached) {
    console.log(`ℹ️  Instance ${instanceId} no longer in cache, skipping`);
    return;
  }

  const now = Date.now();
  const cached_typed = /** @type {import('../middleware/types.js').ExtendedCachedCredential} */ (cached);
  const timeUntilExpiry = cached_typed.expiresAt - now;

  // Skip if token doesn't need refresh yet
  if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) {
    const minutesLeft = Math.floor(timeUntilExpiry / 60000);
    console.log(`✅ Token for instance ${instanceId} still valid for ${minutesLeft} minutes`);
    return;
  }

  // Check if we've already tried too many times
  const refreshAttempts = cached_typed.refresh_attempts || 0;
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.log(`⚠️  Max refresh attempts reached for instance ${instanceId}, removing from cache`);
    cleanupInvalidCacheEntries('max_attempts_reached');
    return;
  }

  console.log(`🔄 Attempting to refresh token for instance ${instanceId} (attempt ${refreshAttempts + 1})`);

  try {
    // Increment refresh attempts
    incrementRefreshAttempts(instanceId);

    // Get instance credentials from database
    const instance = await lookupInstanceCredentials(instanceId, 'gmail');
    
    const instance_typed = /** @type {import('../middleware/types.js').DatabaseInstance} */ (instance);
  if (!instance || !instance_typed.client_id || !instance_typed.client_secret) {
      console.log(`❌ Invalid instance credentials for ${instanceId}, removing from cache`);
      cleanupInvalidCacheEntries('invalid_credentials');
      return;
    }

    // Refresh the Bearer token
    const newTokens = await refreshBearerToken({
      refreshToken: cached_typed.refreshToken,
      clientId: instance_typed.client_id,
      clientSecret: instance_typed.client_secret
    });

    // Update cache with new tokens
    const newTokens_typed = /** @type {import('../middleware/types.js').NewOAuthTokens} */ (newTokens);
    updateCachedCredentialMetadata(instanceId, {
      bearerToken: newTokens_typed.access_token,
      refreshToken: newTokens_typed.refresh_token || cached_typed.refreshToken,
      expiresAt: Date.now() + (newTokens_typed.expires_in * 1000)
    });

    // Reset refresh attempts after success
    resetRefreshAttempts(instanceId);

    watcherStats.tokensRefreshed++;
    const newExpiryMinutes = Math.floor(newTokens_typed.expires_in / 60);
    console.log(`✅ Successfully refreshed token for instance ${instanceId} (expires in ${newExpiryMinutes} minutes)`);

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`❌ Failed to refresh token for instance ${instanceId}:`, err);
    watcherStats.refreshFailures++;
    
    // If refresh failed due to invalid refresh token, remove from cache
    if (err.message.includes('invalid_grant') || err.message.includes('invalid_request')) {
      console.log(`🗑️  Removing instance ${instanceId} from cache due to invalid refresh token`);
      cleanupInvalidCacheEntries('invalid_refresh_token');
    }
  }
}

/**
 * Force refresh a specific instance token
 * @param {string} instanceId - Instance ID to refresh
 * @returns {Promise<boolean>} True if refresh was successful
 */
export async function forceRefreshInstanceToken(instanceId) {
  try {
    console.log(`🔄 Force refreshing token for instance: ${instanceId}`);
    await checkAndRefreshToken(instanceId);
    return true;
  } catch (error) {
    console.error(`❌ Force refresh failed for instance ${instanceId}:`, error);
    return false;
  }
}

/**
 * Manual cleanup of invalid cache entries
 * @returns {number} Number of entries removed
 */
export function manualCleanup() {
  console.log('🧹 Running manual cache cleanup...');
  return cleanupInvalidCacheEntries('manual_cleanup');
}