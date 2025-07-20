/**
 * Credential watcher service for Google Sheets MCP OAuth token management
 * Monitors and automatically refreshes OAuth Bearer tokens before expiration
 * Based on Gmail MCP implementation patterns
 */

import { cleanupInvalidCacheEntries, getCachedInstanceIds, peekCachedCredential, updateCachedCredentialMetadata, incrementRefreshAttempts, resetRefreshAttempts, removeCachedCredential } from './credential-cache.js';
import { refreshBearerToken } from '../utils/oauth-validation.js';
import { lookupInstanceCredentials } from './database.js';

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
 */
function startCredentialWatcher() {
  if (watcherInterval) {
    console.warn('⚠️  Google Sheets credential watcher already running');
    return;
  }

  watcherInterval = setInterval(runCredentialWatcher, WATCHER_INTERVAL);
  watcherStats.isRunning = true;
  console.log('🔍 Started Google Sheets OAuth credential watcher service');
}

/**
 * Stop the credential watcher service
 */
function stopCredentialWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    watcherStats.isRunning = false;
    console.log('🛑 Stopped Google Sheets OAuth credential watcher service');
  }
}

/**
 * Get watcher status and statistics
 * @returns {Object} Watcher status information
 */
function getWatcherStatus() {
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

  console.log(`🔍 Running Google Sheets OAuth credential watcher cycle #${watcherStats.totalRuns}`);

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
    await Promise.allSettled(refreshPromises);

    // Clean up expired cache entries
    const cleanedUp = cleanupInvalidCacheEntries('watcher-cycle');
    watcherStats.entriesCleanedUp += cleanedUp;

    const duration = Date.now() - startTime;
    console.log(`✅ Completed credential watcher cycle in ${duration}ms`);

  } catch (error) {
    console.error('❌ Error during credential watcher cycle:', error);
  }
}

/**
 * Check and refresh token for a specific instance
 * @param {string} instanceId - Instance ID to check
 */
async function checkAndRefreshToken(instanceId) {
  const cached = peekCachedCredential(instanceId);
  
  if (!cached) {
    return; // Instance not cached
  }

  const now = Date.now();
  const timeToExpiry = cached.expiresAt - now;
  
  // Skip if token doesn't need refresh yet
  if (timeToExpiry > TOKEN_REFRESH_THRESHOLD) {
    return;
  }

  console.log(`⏰ Token for instance ${instanceId} expires in ${Math.floor(timeToExpiry / 60000)} minutes, attempting refresh`);

  // Check refresh attempt count
  const refreshAttempts = cached.refresh_attempts || 0;
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.warn(`⚠️  Max refresh attempts reached for instance ${instanceId}, skipping`);
    return;
  }

  try {
    // Get fresh instance data from database
    const instance = await lookupInstanceCredentials(instanceId, 'sheets');
    
    if (!instance) {
      console.log(`🗑️ Instance ${instanceId} no longer exists in database, removing from cache`);
      // Remove from cache since instance doesn't exist
      removeCachedCredential(instanceId);
      return;
    }

    // Check if instance is still active
    if (instance.status !== 'active') {
      console.log(`⏸️ Instance ${instanceId} is not active (${instance.status}), skipping refresh`);
      return;
    }

    // Increment refresh attempts
    incrementRefreshAttempts(instanceId);

    // Perform token refresh
    const newTokens = await refreshBearerToken({
      refreshToken: cached.refreshToken,
      clientId: instance.client_id,
      clientSecret: instance.client_secret
    });

    // Update cache with new tokens
    const newExpiresAt = Date.now() + (newTokens.expires_in * 1000);
    updateCachedCredentialMetadata(instanceId, {
      bearerToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || cached.refreshToken,
      expiresAt: newExpiresAt
    });

    // Reset refresh attempts on success
    resetRefreshAttempts(instanceId);

    // Update database with new tokens
    const { updateOAuthStatus } = await import('../../../db/queries/mcpInstancesQueries.js');
    await updateOAuthStatus(instanceId, {
      status: 'completed',
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || cached.refreshToken,
      tokenExpiresAt: new Date(newExpiresAt),
      scope: newTokens.scope
    });

    watcherStats.tokensRefreshed++;
    console.log(`✅ Successfully refreshed token for instance ${instanceId}`);

  } catch (error) {
    console.error(`❌ Failed to refresh token for instance ${instanceId}:`, error);
    watcherStats.refreshFailures++;
    
    // If refresh failed due to invalid refresh token, mark for cleanup
    if (error.message.includes('invalid_grant') || error.message.includes('invalid_refresh_token')) {
      console.log(`🗑️ Invalid refresh token for instance ${instanceId}, will be cleaned up`);
      updateCachedCredentialMetadata(instanceId, { status: 'expired' });
    }
  }
}

/**
 * Force refresh all cached tokens (for testing/maintenance)
 * @returns {Promise<Object>} Refresh results
 */
async function forceRefreshAllTokens() {
  const startTime = Date.now();
  const results = {
    total: 0,
    refreshed: 0,
    failed: 0,
    skipped: 0
  };

  try {
    const cachedInstanceIds = getCachedInstanceIds();
    results.total = cachedInstanceIds.length;

    console.log(`🔄 Force refreshing tokens for ${cachedInstanceIds.length} instances`);

    for (const instanceId of cachedInstanceIds) {
      try {
        const cached = peekCachedCredential(instanceId);
        if (!cached) {
          results.skipped++;
          continue;
        }

        // Reset refresh attempts for force refresh
        resetRefreshAttempts(instanceId);
        
        await checkAndRefreshToken(instanceId);
        results.refreshed++;

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error force refreshing instance ${instanceId}:`, error);
        results.failed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Force refresh completed in ${duration}ms:`, results);

    return results;

  } catch (error) {
    console.error('❌ Error during force refresh:', error);
    results.failed++;
    return results;
  }
}

/**
 * Manually trigger a watcher cycle
 * @returns {Promise<void>}
 */
async function triggerWatcherCycle() {
  console.log('🔄 Manually triggering credential watcher cycle');
  await runCredentialWatcher();
}

/**
 * Reset watcher statistics
 */
function resetWatcherStats() {
  watcherStats = {
    lastRun: null,
    totalRuns: 0,
    tokensRefreshed: 0,
    refreshFailures: 0,
    entriesCleanedUp: 0,
    isRunning: watcherStats.isRunning
  };
  console.log('📊 Reset credential watcher statistics');
}

export {
  startCredentialWatcher,
  stopCredentialWatcher,
  getWatcherStatus,
  forceRefreshAllTokens,
  triggerWatcherCycle,
  resetWatcherStats
};