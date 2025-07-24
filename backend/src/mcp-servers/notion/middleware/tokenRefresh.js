/**
 * Token refresh functionality for Notion OAuth authentication
 * Handles token refresh with fallback mechanisms
 */

/// <reference path="./types.js" />

import { refreshBearerToken, refreshBearerTokenDirect } from '../utils/oauthValidation.js';
import { recordTokenRefreshMetrics } from '../utils/tokenMetrics.js';
import { updateOAuthStatusWithLocking } from '../../../db/queries/mcpInstances/index.js';
import { cacheNewTokens, setupRequestWithNewTokens } from './credentialManagement.js';

/**
 * Attempt token refresh with OAuth service or direct method
 * @param {string} refreshToken - Refresh token to use
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Promise<{tokens: import('./types.js').NewTokens, method: string}>} Refresh result
 */
export async function attemptTokenRefresh(refreshToken, clientId, clientSecret) {
  let usedMethod = 'oauth_service';
  let newTokens;

  try {
    // Try OAuth service first
    newTokens = await refreshBearerToken({
      refreshToken: refreshToken,
      clientId: clientId,
      clientSecret: clientSecret,
    });
    usedMethod = 'oauth_service';
  } catch (oauthServiceError) {
    console.log(`⚠️  OAuth service failed, trying direct Notion OAuth: ${oauthServiceError.message}`);

    // Check if error indicates OAuth service unavailable
    if (
      oauthServiceError.message.includes('OAuth service error') ||
      oauthServiceError.message.includes('Failed to start OAuth service')
    ) {
      // Fallback to direct Notion OAuth
      newTokens = await refreshBearerTokenDirect({
        refreshToken: refreshToken,
        clientId: clientId,
        clientSecret: clientSecret,
      });
      usedMethod = 'direct_oauth';
    } else {
      // Re-throw if it's not a service availability issue
      throw oauthServiceError;
    }
  }

  return { tokens: newTokens, method: usedMethod };
}

/**
 * Record successful refresh metrics
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {void}
 */
export function recordSuccessfulRefreshMetrics(instanceId, method, startTime) {
  const endTime = Date.now();
  recordTokenRefreshMetrics(instanceId, method, true, endTime - startTime);
}

/**
 * Record failed refresh metrics
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {void}
 */
export function recordFailedRefreshMetrics(instanceId, method, startTime) {
  const endTime = Date.now();
  recordTokenRefreshMetrics(instanceId, method, false, endTime - startTime);
}

/**
 * Update database with new tokens
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @returns {Promise<void>} Promise that resolves when database is updated
 */
export async function updateDatabaseWithNewTokens(instanceId, newTokens) {
  const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

  await updateOAuthStatusWithLocking(instanceId, {
    status: 'completed',
    accessToken: newTokens.access_token,
    refreshToken: newTokens.refresh_token,
    tokenExpiresAt: newExpiresAt,
  });

  console.log(`✅ Database updated with new tokens for instance: ${instanceId}`);
}

/**
 * Process successful refresh result
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {number} startTime - Start time of refresh operation
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Processing result
 */
export async function processSuccessfulRefresh(instanceId, newTokens, method, userId, req, startTime) {
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Record successful metrics
  recordSuccessfulRefreshMetrics(instanceId, method, startTime);

  // Update database with new tokens
  await updateDatabaseWithNewTokens(instanceId, newTokens);

  // Cache new tokens
  cacheNewTokens(instanceId, newTokens, userId);

  // Setup request with new tokens
  await setupRequestWithNewTokens(req, instanceId, newTokens, userId);

  console.log(`✅ Bearer token refreshed successfully for instance: ${instanceId} using ${method} (${duration}ms)`);

  return {
    success: true,
    metadata: {
      method,
      duration,
      expiresIn: newTokens.expires_in
    }
  };
}

/**
 * Process failed refresh result
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error that occurred during refresh
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Start time of refresh operation
 * @returns {import('./types.js').TokenRefreshResult} Processing result
 */
export function processFailedRefresh(instanceId, error, method, startTime) {
  // Record failed metrics
  recordFailedRefreshMetrics(instanceId, method, startTime);

  console.error(`❌ Bearer token refresh failed for instance: ${instanceId} using ${method}:`, error.message);

  const tokenError = /** @type {import('./types.js').TokenRefreshError} */ ({
    message: error.message,
    errorType: error.name === 'TypeError' ? 'NETWORK_ERROR' : 'OAUTH_ERROR',
    originalError: error.message,
    name: error.name
  });

  return {
    success: false,
    error: tokenError,
    errorInfo: {
      method,
      duration: Date.now() - startTime
    }
  };
}

/**
 * Main token refresh orchestration function
 * @param {string} instanceId - The instance ID
 * @param {string} refreshToken - Refresh token to use
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh result
 */
export async function performTokenRefresh(instanceId, refreshToken, instance, req) {
  console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);

  const refreshStartTime = Date.now();

  try {
    const { tokens: newTokens, method } = await attemptTokenRefresh(
      refreshToken,
      instance.client_id,
      instance.client_secret
    );

    return await processSuccessfulRefresh(
      instanceId,
      newTokens,
      method,
      instance.user_id,
      req,
      refreshStartTime
    );
  } catch (refreshError) {
    const error = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
    return processFailedRefresh(instanceId, error, 'oauth_service', refreshStartTime);
  }
}

export default {
  attemptTokenRefresh,
  recordSuccessfulRefreshMetrics,
  recordFailedRefreshMetrics,
  updateDatabaseWithNewTokens,
  processSuccessfulRefresh,
  processFailedRefresh,
  performTokenRefresh
};