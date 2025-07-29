/**
 * @fileoverview Token refresh utilities for Google Drive OAuth middleware
 */

/// <reference path="./types.js" />

const GoogleDriveOAuthHandler = require('../oauth/oauthHandler');
const { setCachedCredential  } = require('../services/cache/index');
const { updateOAuthStatus  } = require('../../../db/queries/mcpInstances/oauth');
const { recordTokenRefreshMetrics  } = require('../utils/tokenMetrics');

/**
 * Attempts to refresh OAuth token using multiple strategies
 * @param {string} instanceId - Instance ID
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh result
 */
async function attemptTokenRefresh(instanceId, refreshToken, instance) {
  console.log(`🔄 Attempting OAuth token refresh for instance: ${instanceId}`);
  
  try {
    // Try OAuth service integration first
    const oauthHandler = new GoogleDriveOAuthHandler();
    const newTokens = await oauthHandler.refreshToken(refreshToken, {
      client_id: instance.client_id,
      client_secret: instance.client_secret
    });
    
    return {
      success: true,
      tokens: {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_in: newTokens.expires_in,
        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email'
      }
    };
  } catch (error) {
    console.error(`❌ OAuth token refresh failed for instance ${instanceId}:`, error);
    
    // Check if this is a permanent auth failure
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('invalid_grant') || errorMessage.includes('Token has been expired or revoked')) {
      return {
        success: false,
        error: errorMessage,
        requiresReauth: true
      };
    }
    
    return {
      success: false,
      error: errorMessage,
      requiresReauth: false
    };
  }
}

/**
 * Processes successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @param {import('./types.js').OAuthTokens} tokens - New tokens
 * @param {import('./types.js').CachedCredential|null} existingCache - Existing cache
 * @returns {Promise<void>}
 */
async function processSuccessfulRefresh(instanceId, userId, tokens, existingCache) {
  const expiresAt = Date.now() + (tokens.expires_in * 1000);
  
  // Update cache
  setCachedCredential(instanceId, {
    bearerToken: tokens.access_token,
    refreshToken: tokens.refresh_token || existingCache?.refreshToken,
    expiresAt,
    user_id: userId,
    last_used: Date.now(),
    refresh_attempts: 0,
    cached_at: existingCache?.cached_at || Date.now(),
    last_modified: Date.now(),
    status: 'active'
  });
  
  // Update database
  await updateOAuthStatus(instanceId, {
    status: 'completed',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || existingCache?.refreshToken,
    tokenExpiresAt: new Date(expiresAt),
    scope: tokens.scope
  });
  
  // Record metrics
  recordTokenRefreshMetrics(instanceId, 'direct_oauth', true, '', '', Date.now(), Date.now());
  
  console.log(`✅ OAuth token refreshed successfully for instance: ${instanceId}`);
}

/**
 * Processes failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} error - Error message
 * @param {boolean} requiresReauth - Whether re-authentication is required
 * @returns {void}
 */
function processFailedRefresh(instanceId, error, requiresReauth) {
  // Record metrics
  recordTokenRefreshMetrics(instanceId, 'direct_oauth', false, 'refresh_failed', error, Date.now(), Date.now());
  
  if (requiresReauth) {
    console.error(`🔐 Re-authentication required for instance ${instanceId}: ${error}`);
  } else {
    console.error(`❌ Token refresh failed for instance ${instanceId}: ${error}`);
  }
}

/**
 * Performs complete token refresh with all error handling
 * @param {string} instanceId - Instance ID
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh result
 */
async function performTokenRefresh(instanceId, refreshToken, instance, req) {
  const existingCache = getCachedCredential(instanceId);
  
  try {
    const refreshResult = await attemptTokenRefresh(instanceId, refreshToken, instance);
    
    if (refreshResult.success && refreshResult.tokens) {
      await processSuccessfulRefresh(instanceId, instance.user_id, refreshResult.tokens, existingCache);
      
      // Set up request with new token
      req.bearerToken = refreshResult.tokens.access_token;
      req.instanceId = instanceId;
      req.userId = instance.user_id;
      
      return refreshResult;
    }
    
    processFailedRefresh(instanceId, refreshResult.error || 'Unknown error', refreshResult.requiresReauth || false);
    return refreshResult;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    processFailedRefresh(instanceId, errorMessage, false);
    
    return {
      success: false,
      error: errorMessage,
      requiresReauth: false
    };
  }
}

// Import getCachedCredential here to avoid circular dependency
const { getCachedCredential  } = require('../services/cache/index');
module.exports = {
  performTokenRefresh
};