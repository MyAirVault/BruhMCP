/**
 * Token refresh utilities for OAuth Bearer token operations
 * Handles token refresh logic with fallback mechanisms and metrics
 */

/// <reference path="./types.js" />

import { refreshBearerToken, refreshBearerTokenDirect } from '../utils/oauthValidation.js';
import { updateOAuthStatus, updateOAuthStatusWithLocking } from '../../../db/queries/mcpInstances/index.js';
import { recordTokenRefreshMetrics } from '../utils/tokenMetrics.js';
import { cacheNewTokens, setupRequestWithNewTokens } from './credentialManagement.js';

/**
 * Attempt to refresh token using OAuth service with fallback to direct Google OAuth
 * @param {import('./types.js').TokenRefreshOptions} options - Token refresh options
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Token refresh result
 */
export async function attemptTokenRefresh(options) {
  const { refreshToken, clientId, clientSecret } = options;
  let usedMethod = 'oauth_service';
  
  try {
    /** @type {import('./types.js').NewOAuthTokens} */
    let newTokens;
    
    // Try OAuth service first, then fallback to direct Google OAuth
    try {
      newTokens = /** @type {import('./types.js').NewOAuthTokens} */ (await refreshBearerToken({
        refreshToken: refreshToken,
        clientId: clientId,
        clientSecret: clientSecret
      }));
      usedMethod = 'oauth_service';
    } catch (oauthServiceError) {
      const errorMessage = oauthServiceError instanceof Error ? oauthServiceError.message : String(oauthServiceError);
      console.log(`⚠️  OAuth service failed, trying direct Google OAuth: ${errorMessage}`);
      
      // Check if error indicates OAuth service unavailable
      if (errorMessage.includes('OAuth service error') || 
          errorMessage.includes('Failed to start OAuth service')) {
        
        // Fallback to direct Google OAuth
        newTokens = /** @type {import('./types.js').NewOAuthTokens} */ (await refreshBearerTokenDirect({
          refreshToken: refreshToken,
          clientId: clientId,
          clientSecret: clientSecret
        }));
        usedMethod = 'direct_oauth';
      } else {
        // Re-throw if it's not a service availability issue
        throw oauthServiceError;
      }
    }

    return {
      success: true,
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || refreshToken,
      expiresIn: newTokens.expires_in,
      scope: newTokens.scope,
      error: undefined,
      method: usedMethod
    };

  } catch (refreshError) {
    const error = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
    const errorObj = /** @type {any} */ (error);
    /** @type {import('./types.js').TokenRefreshError} */
    const tokenError = {
      message: error.message || 'Token refresh failed',
      errorType: errorObj.errorType || 'UNKNOWN_ERROR',
      originalError: errorObj.originalError || error.message,
      name: error.name || 'TokenRefreshError'
    };

    return {
      success: false,
      accessToken: undefined,
      refreshToken: undefined,
      expiresIn: undefined,
      scope: undefined,
      error: tokenError,
      method: usedMethod
    };
  }
}

/**
 * Record token refresh metrics for successful operations
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {number} startTime - Refresh start timestamp
 * @param {number} endTime - Refresh end timestamp
 * @returns {void}
 */
export function recordSuccessfulRefreshMetrics(instanceId, method, startTime, endTime) {
  recordTokenRefreshMetrics(
    instanceId, 
    /** @type {'oauth_service'|'direct_oauth'} */ (method), 
    true, // success
    startTime, 
    endTime,
    '', // errorType
    '' // errorMessage
  );
}

/**
 * Record token refresh metrics for failed operations
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {import('./types.js').TokenRefreshError} error - The error that occurred
 * @param {number} startTime - Refresh start timestamp
 * @param {number} endTime - Refresh end timestamp
 * @returns {void}
 */
export function recordFailedRefreshMetrics(instanceId, method, error, startTime, endTime) {
  recordTokenRefreshMetrics(
    instanceId, 
    /** @type {'oauth_service'|'direct_oauth'} */ (method), 
    false, // failure
    startTime, 
    endTime,
    error.errorType || 'UNKNOWN_ERROR',
    error.message || 'Token refresh failed'
  );
}

/**
 * Update database with new OAuth tokens using optimistic locking
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The new access token
 * @param {string} refreshToken - The refresh token
 * @param {Date} expiresAt - Token expiration date
 * @param {string} [scope] - Token scope
 * @returns {Promise<void>} Promise that resolves when database is updated
 */
export async function updateDatabaseWithNewTokens(instanceId, accessToken, refreshToken, expiresAt, scope) {
  try {
    await updateOAuthStatusWithLocking(instanceId, {
      status: 'completed',
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenExpiresAt: expiresAt,
      scope: scope
    });
  } catch (lockingError) {
    // Fallback to regular update if optimistic locking fails
    console.warn(`⚠️ Optimistic locking failed for ${instanceId}, falling back to regular update`);
    await updateOAuthStatus(instanceId, {
      status: 'completed',
      accessToken: accessToken, 
      refreshToken: refreshToken,
      tokenExpiresAt: expiresAt,
      scope: scope
    });
  }
}

/**
 * Process successful token refresh - cache, update database, and setup request
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshResult} refreshResult - The token refresh result
 * @param {import('./types.js').DatabaseInstance} instance - The database instance
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshMetadata>} Processing result with metadata
 */
export async function processSuccessfulRefresh(instanceId, refreshResult, instance, req) {
  if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.expiresIn) {
    throw new Error('Invalid refresh result: missing required token data');
  }

  const { accessToken, refreshToken, expiresIn, scope, method } = refreshResult;
  const refreshStartTime = Date.now() - 1000; // Approximate start time  
  const refreshEndTime = Date.now();
  const newExpiresAt = new Date(Date.now() + (expiresIn * 1000));

  // Record successful metrics
  recordSuccessfulRefreshMetrics(instanceId, method, refreshStartTime, refreshEndTime);

  // Update cache with new Bearer token
  cacheNewTokens(instanceId, accessToken, refreshToken, newExpiresAt.getTime(), instance.user_id);

  // Update database with new tokens
  await updateDatabaseWithNewTokens(instanceId, accessToken, refreshToken, newExpiresAt, scope);

  // Setup request with new tokens
  await setupRequestWithNewTokens(req, accessToken, instanceId, instance.user_id);

  return {
    expiresIn,
    scope: scope || '',
    responseTime: refreshEndTime - refreshStartTime,
    method
  };
}

/**
 * Process failed token refresh - record metrics and handle cleanup
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshResult} refreshResult - The token refresh result
 * @param {string} userId - The user ID
 * @returns {import('./types.js').TokenRefreshErrorInfo} Processing result with error information
 */
export function processFailedRefresh(instanceId, refreshResult, userId) {
  if (!refreshResult.error) {
    throw new Error('Invalid refresh result: missing error information');
  }

  const { error, method } = refreshResult;
  const refreshStartTime = Date.now() - 1000; // Approximate start time
  const refreshEndTime = Date.now();
  
  // Record failed metrics
  recordFailedRefreshMetrics(instanceId, method, error, refreshStartTime, refreshEndTime);

  return {
    error,
    method,
    responseTime: refreshEndTime - refreshStartTime,
    originalError: error.originalError || error.message,
    userId
  };
}

/**
 * Perform complete token refresh operation
 * @param {string} instanceId - The instance ID
 * @param {string} refreshToken - The refresh token
 * @param {import('./types.js').DatabaseInstance} instance - The database instance
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @returns {Promise<import('./types.js').TokenRefreshResult>} Refresh operation result
 */
export async function performTokenRefresh(instanceId, refreshToken, instance, req) {
  console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
  
  const refreshOptions = {
    refreshToken: refreshToken,
    clientId: instance.client_id,
    clientSecret: instance.client_secret
  };

  const refreshResult = await attemptTokenRefresh(refreshOptions);

  if (refreshResult.success) {
    const metadata = await processSuccessfulRefresh(instanceId, refreshResult, instance, req);
    return {
      success: true,
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken,
      expiresIn: refreshResult.expiresIn,
      scope: refreshResult.scope,
      error: undefined,
      method: refreshResult.method,
      metadata,
      errorInfo: undefined
    };
  } else {
    const errorInfo = processFailedRefresh(instanceId, refreshResult, instance.user_id);
    return {
      success: false,
      accessToken: undefined,
      refreshToken: undefined,
      expiresIn: undefined,
      scope: undefined,
      error: refreshResult.error,
      method: refreshResult.method,
      metadata: undefined,
      errorInfo
    };
  }
}