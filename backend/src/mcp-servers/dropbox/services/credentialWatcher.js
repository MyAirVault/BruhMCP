/**
 * Credential watcher service for Dropbox MCP OAuth token management
 * Monitors and automatically refreshes OAuth Bearer tokens before expiration
 */

const { cleanupInvalidCacheEntries, getCachedInstanceIds, peekCachedCredential, updateCachedCredentialMetadata, incrementRefreshAttempts, resetRefreshAttempts } = require('./credentialCache.js');
const { refreshBearerToken } = require('../utils/oauthValidation.js');
const { lookupInstanceCredentials } = require('./database.js');

// Watcher configuration
const WATCHER_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh tokens with less than 10 minutes left
const MAX_REFRESH_ATTEMPTS = 3;

/**
 * @typedef {Object} WatcherStatistics
 * @property {string|null} lastRun - ISO timestamp of last run
 * @property {number} totalRuns - Total number of runs
 * @property {number} tokensRefreshed - Number of tokens successfully refreshed
 * @property {number} refreshFailures - Number of failed refresh attempts
 * @property {number} entriesCleanedUp - Number of cache entries cleaned up
 * @property {boolean} isRunning - Whether the watcher is currently running
 */

/**
 * @typedef {Object} CachedCredentialData
 * @property {string} bearerToken - OAuth Bearer access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User ID who owns this instance
 * @property {string} last_used - ISO timestamp of last usage
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {string} cached_at - ISO timestamp when cached
 * @property {string} [status] - Instance status
 * @property {string} [last_modified] - ISO timestamp of last modification
 * @property {string} [last_refresh_attempt] - ISO timestamp of last refresh attempt
 */

/**
 * @typedef {Object} InstanceData
 * @property {string} instance_id - Instance UUID
 * @property {string} user_id - User ID
 * @property {string} mcp_service_id - Service ID
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 * @property {string} status - Instance status
 * @property {string} [expires_at] - Expiration timestamp
 * @property {string} [last_used_at] - Last used timestamp
 * @property {number} usage_count - Usage count
 * @property {string} [custom_name] - Custom name
 * @property {number} renewed_count - Renewed count
 * @property {string} [last_renewed_at] - Last renewed timestamp
 * @property {string} [credentials_updated_at] - Credentials updated timestamp
 * @property {string} created_at - Created timestamp
 * @property {string} updated_at - Updated timestamp
 */

/**
 * @typedef {Object} TokenData
 * @property {string} access_token - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} [scope] - Token scope
 */

/**
 * @typedef {Object} WatcherStatusInfo
 * @property {boolean} isRunning - Whether the watcher is currently running
 * @property {number} intervalMinutes - Interval between runs in minutes
 * @property {number} refreshThresholdMinutes - Threshold for token refresh in minutes
 * @property {number} maxRefreshAttempts - Maximum refresh attempts before giving up
 * @property {Object} statistics - Watcher statistics with nextRunIn info
 * @property {string|null} statistics.lastRun - ISO timestamp of last run
 * @property {number} statistics.totalRuns - Total number of runs
 * @property {number} statistics.tokensRefreshed - Number of tokens successfully refreshed
 * @property {number} statistics.refreshFailures - Number of failed refresh attempts
 * @property {number} statistics.entriesCleanedUp - Number of cache entries cleaned up
 * @property {boolean} statistics.isRunning - Whether the watcher is currently running
 * @property {string} statistics.nextRunIn - Time until next run
 */

// Watcher state
/** @type {NodeJS.Timeout|null} */
let watcherInterval = null;

/** @type {WatcherStatistics} */
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
    console.warn('⚠️  Dropbox credential watcher already running');
    return;
  }

  watcherInterval = setInterval(runCredentialWatcher, WATCHER_INTERVAL);
  watcherStats.isRunning = true;
  console.log('🔍 Started Dropbox OAuth credential watcher service');
}

/**
 * Stop the credential watcher service
 */
function stopCredentialWatcher() {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    watcherStats.isRunning = false;
    console.log('🛑 Stopped Dropbox OAuth credential watcher service');
  }
}

/**
 * Get watcher status and statistics
 * @returns {WatcherStatusInfo} Watcher status information
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

  console.log(`🔍 Running Dropbox OAuth credential watcher cycle #${watcherStats.totalRuns}`);

  try {
    // Get all cached instance IDs
    /** @type {string[]} */
    const cachedInstanceIds = getCachedInstanceIds();
    
    if (cachedInstanceIds.length === 0) {
      console.log('ℹ️  No cached instances to check');
      return;
    }

    console.log(`📊 Checking ${cachedInstanceIds.length} cached instances for token expiration`);

    // Check each cached instance
    /** @type {Promise<void>[]} */
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
    /** @type {number} */
    const cleanupCount = cleanupInvalidCacheEntries('watcher_cleanup');
    watcherStats.entriesCleanedUp += cleanupCount;

    /** @type {number} */
    const duration = Date.now() - startTime;
    console.log(`✅ Dropbox credential watcher cycle completed in ${duration}ms`);

  } catch (error) {
    console.error('❌ Dropbox credential watcher cycle failed:', error);
  }
}

/**
 * Check and refresh a token if needed
 * @param {string} instanceId - Instance ID to check
 * @returns {Promise<void>}
 */
async function checkAndRefreshToken(instanceId) {
  /** @type {CachedCredentialData|null} */
  const cached = /** @type {CachedCredentialData|null} */ (peekCachedCredential(instanceId));
  
  if (!cached) {
    console.log(`ℹ️  Instance ${instanceId} no longer in cache, skipping`);
    return;
  }

  /** @type {number} */
  const now = Date.now();
  /** @type {number} */
  const timeUntilExpiry = cached.expiresAt - now;

  // Skip if token doesn't need refresh yet
  if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) {
    /** @type {number} */
    const minutesLeft = Math.floor(timeUntilExpiry / 60000);
    console.log(`✅ Token for instance ${instanceId} still valid for ${minutesLeft} minutes`);
    return;
  }

  // Check if we've already tried too many times
  /** @type {number} */
  const refreshAttempts = cached.refresh_attempts || 0;
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
    /** @type {InstanceData|null} */
    const instance = /** @type {InstanceData|null} */ (await lookupInstanceCredentials(instanceId, 'dropbox'));
    
    if (!instance || !instance.client_id || !instance.client_secret) {
      console.log(`❌ Invalid instance credentials for ${instanceId}, removing from cache`);
      cleanupInvalidCacheEntries('invalid_credentials');
      return;
    }

    // Refresh the Bearer token
    /** @type {TokenData} */
    const newTokens = /** @type {TokenData} */ (await refreshBearerToken({
      refreshToken: cached.refreshToken,
      clientId: instance.client_id,
      clientSecret: instance.client_secret
    }));

    // Update cache with new tokens
    updateCachedCredentialMetadata(instanceId, {
      bearerToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || cached.refreshToken,
      expiresAt: Date.now() + ((newTokens.expires_in || 3600) * 1000)
    });

    // Reset refresh attempts after success
    resetRefreshAttempts(instanceId);

    watcherStats.tokensRefreshed++;
    /** @type {number} */
    const newExpiryMinutes = Math.floor((newTokens.expires_in || 3600) / 60);
    console.log(`✅ Successfully refreshed token for instance ${instanceId} (expires in ${newExpiryMinutes} minutes)`);

  } catch (error) {
    /** @type {Error} */
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
async function forceRefreshInstanceToken(instanceId) {
  try {
    console.log(`🔄 Force refreshing token for instance: ${instanceId}`);
    await checkAndRefreshToken(instanceId);
    return true;
  } catch (error) {
    /** @type {Error} */
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`❌ Force refresh failed for instance ${instanceId}:`, err);
    return false;
  }
}

/**
 * Manual cleanup of invalid cache entries
 * @returns {number} Number of entries removed
 */
function manualCleanup() {
  console.log('🧹 Running manual cache cleanup...');
  return cleanupInvalidCacheEntries('manual_cleanup');
}

module.exports = {
  startCredentialWatcher,
  stopCredentialWatcher,
  getWatcherStatus,
  forceRefreshInstanceToken,
  manualCleanup
};