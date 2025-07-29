/**
 * OAuth Credential Authentication Middleware for Slack MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

/// <reference path="./types.js" />

/**
 * Slack error structure for OAuth operations
 * @typedef {Object} SlackError
 * @property {string} [message] - Error message
 * @property {string} [errorType] - Error type classification
 * @property {string} [originalError] - Original error message
 * @property {string} [code] - Error code
 * @property {number} [status] - HTTP status code
 * @property {string} [stack] - Error stack trace
 */

/**
 * Extended error options for Slack error responses
 * @typedef {import('../../../utils/errorResponse.js').CustomErrorOptions & {
 *   expectedFormat?: string,
 *   error?: string,
 *   errorCode?: string,
 *   requiresReauth?: boolean
 * }} ExtendedErrorOptions
 */

/**
 * Extended OAuth update data for Slack
 * @typedef {import('../../../db/queries/mcpInstances/types.js').OAuthUpdateData & {
 *   teamId?: string
 * }} SlackOAuthUpdateData
 */
const { getCachedCredential, setCachedCredential  } = require('../services/credentialCache');
const { lookupInstanceCredentials, updateInstanceUsage  } = require('../services/database');
const { refreshBearerToken, refreshBearerTokenDirect  } = require('../utils/oauthValidation');
const { updateOAuthStatus, updateOAuthStatusWithLocking, createTokenAuditLog  } = require('../../../db/queries/mcpInstances/index');
const { ErrorResponses  } = require('../../../utils/errorResponse');
const { handleTokenRefreshFailure, logOAuthError  } = require('../utils/oauthErrorHandler');
const { recordTokenRefreshMetrics  } = require('../utils/tokenMetrics');

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {Function} Express middleware function
 */
function createCredentialAuthMiddleware() {
  return async (/** @type {import('./types.js').ExpressRequest} */ req, /** @type {import('./types.js').ExpressResponse} */ res, /** @type {import('./types.js').ExpressNext} */ next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.badRequest(res, 'Invalid instance ID format', /** @type {ExtendedErrorOptions} */ ({
        instanceId,
        expectedFormat: 'UUID v4'
      }));
    }

    try {
      // Check credential cache first (fast path)
      /** @type {import('./types.js').CachedCredential | null} */
      let cachedCredential = /** @type {import('./types.js').CachedCredential | null} */ (getCachedCredential(instanceId));
      
      if (cachedCredential && cachedCredential.bearerToken) {
        console.log(`✅ Slack OAuth Bearer token cache hit for instance: ${instanceId}`);
        req.bearerToken = cachedCredential.bearerToken;
        req.instanceId = instanceId;
        req.userId = cachedCredential.user_id;
        req.teamId = cachedCredential.team_id;
        
        // Update usage tracking asynchronously
        updateInstanceUsage(instanceId).catch(err => {
          console.error('Failed to update usage tracking:', err);
        });
        
        return next();
      }

      console.log(`⏳ Slack OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      /** @type {import('./types.js').DatabaseInstance | null} */
      const instance = /** @type {import('./types.js').DatabaseInstance | null} */ (await lookupInstanceCredentials(instanceId, 'slack'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'slack' }
        });
      }

      // Validate service is active
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Slack service is currently disabled', {
          instanceId,
          metadata: { service: 'slack' }
        });
      }

      // Validate instance status
      if (instance.status === 'inactive') {
        return ErrorResponses.forbidden(res, 'Instance is paused', {
          instanceId,
          metadata: { status: instance.status }
        });
      }

      if (instance.status === 'expired') {
        return ErrorResponses.forbidden(res, 'Instance has expired', {
          instanceId,
          metadata: { status: instance.status }
        });
      }

      // Check expiration time
      if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
        return ErrorResponses.forbidden(res, 'Instance has expired', {
          instanceId,
          expiresAt: instance.expires_at
        });
      }

      // Validate OAuth credentials
      if (instance.auth_type !== 'oauth' || !instance.client_id || !instance.client_secret) {
        return ErrorResponses.internal(res, 'Invalid OAuth credentials configuration', {
          instanceId,
          metadata: { authType: instance.auth_type }
        });
      }

      // Check if we have cached tokens or database tokens that need refreshing
      const refreshToken = cachedCredential?.refreshToken || instance.refresh_token;
      const accessToken = cachedCredential?.bearerToken || instance.access_token;
      const tokenExpiresAt = cachedCredential?.expiresAt || (instance.token_expires_at ? new Date(instance.token_expires_at).getTime() : null);

      // If we have an access token that's still valid, use it
      if (accessToken && tokenExpiresAt && tokenExpiresAt > Date.now()) {
        console.log(`✅ Using valid Slack access token for instance: ${instanceId}`);
        
        // Cache the token if it wasn't cached before
        if (!cachedCredential) {
          setCachedCredential(instanceId, {
            bearerToken: accessToken,
            refreshToken: refreshToken || '',
            expiresAt: tokenExpiresAt,
            user_id: instance.user_id,
            team_id: instance.team_id || ''
          });
        }

        req.bearerToken = accessToken;
        req.instanceId = instanceId;
        req.userId = instance.user_id;
        req.teamId = instance.team_id;

        // Update usage tracking
        await updateInstanceUsage(instanceId);
        return next();
      }

      // If we have a refresh token, try to refresh the access token
      if (refreshToken) {
        console.log(`🔄 Refreshing expired Slack Bearer token for instance: ${instanceId}`);
        
        const refreshStartTime = Date.now();
        let usedMethod = 'oauth_service';
        
        try {
          let newTokens;
          
          // Try OAuth service first, then fallback to direct Slack OAuth
          try {
            newTokens = await refreshBearerToken({
              refreshToken: refreshToken,
              clientId: instance.client_id,
              clientSecret: instance.client_secret
            });
            usedMethod = 'oauth_service';
          } catch (oauthServiceError) {
            const errorMessage = oauthServiceError instanceof Error ? oauthServiceError.message : String(oauthServiceError);
            console.log(`⚠️  OAuth service failed, trying direct Slack OAuth: ${errorMessage}`);
            
            // Check if error indicates OAuth service unavailable
            if (errorMessage.includes('OAuth service error') || 
                errorMessage.includes('Failed to start OAuth service')) {
              
              // Fallback to direct Slack OAuth
              newTokens = await refreshBearerTokenDirect({
                refreshToken: refreshToken,
                clientId: instance.client_id,
                clientSecret: instance.client_secret
              });
              usedMethod = 'direct_oauth';
            } else {
              // Re-throw if it's not a service availability issue
              throw oauthServiceError;
            }
          }

          const newExpiresAt = new Date(Date.now() + (newTokens.expires_in * 1000));
          const refreshEndTime = Date.now();

          // Record successful metrics
          recordTokenRefreshMetrics(
            instanceId, 
            usedMethod, 
            true, // success
            '', // errorType
            '', // errorMessage
            refreshStartTime, 
            refreshEndTime
          );

          // Create audit log entry
          createTokenAuditLog({
            instanceId,
            operation: 'refresh',
            status: 'success',
            method: usedMethod,
            userId: instance.user_id,
            metadata: {
              expiresIn: newTokens.expires_in,
              scope: newTokens.scope,
              responseTime: refreshEndTime - refreshStartTime,
              teamId: newTokens.team_id
            }
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });

          // Update cache with new Bearer token
          setCachedCredential(instanceId, {
            bearerToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || refreshToken,
            expiresAt: newExpiresAt.getTime(),
            user_id: instance.user_id,
            team_id: newTokens.team_id
          });

          // Update database with new tokens using optimistic locking
          try {
            await updateOAuthStatusWithLocking(instanceId, /** @type {SlackOAuthUpdateData} */ ({
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken,
              tokenExpiresAt: newExpiresAt,
              scope: newTokens.scope,
              teamId: newTokens.team_id
            }));
          } catch (lockingError) {
            // Fallback to regular update if optimistic locking fails
            console.warn(`⚠️ Optimistic locking failed for ${instanceId}, falling back to regular update`);
            await updateOAuthStatus(instanceId, /** @type {SlackOAuthUpdateData} */ ({
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken,
              tokenExpiresAt: newExpiresAt,
              scope: newTokens.scope,
              teamId: newTokens.team_id
            }));
          }

          req.bearerToken = newTokens.access_token;
          req.instanceId = instanceId;
          req.userId = instance.user_id;
          req.teamId = newTokens.team_id;

          // Update usage tracking
          await updateInstanceUsage(instanceId);

          return next();
        } catch (refreshError) {
          const refreshEndTime = Date.now();
          
          const slackError = /** @type {SlackError} */ (refreshError);
          const errorType = slackError.errorType || 'UNKNOWN_ERROR';
          const errorMessage = slackError.message || 'Token refresh failed';
          
          // Record failed metrics
          recordTokenRefreshMetrics(
            instanceId, 
            usedMethod, 
            false, // failure
            errorType,
            errorMessage,
            refreshStartTime, 
            refreshEndTime
          );

          // Create audit log entry for failure
          createTokenAuditLog({
            instanceId,
            operation: 'refresh',
            status: 'failure',
            method: usedMethod,
            errorType,
            errorMessage,
            userId: instance.user_id,
            metadata: {
              responseTime: refreshEndTime - refreshStartTime,
              originalError: slackError.originalError || errorMessage
            }
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });

          // Use centralized error handling
          logOAuthError(slackError, 'slack token refresh', instanceId);
          
          const errorResponse = await handleTokenRefreshFailure(instanceId, slackError, 
            /** @type {import('../utils/oauthErrorHandler.js').UpdateOAuthStatusFunction} */
            (async (id, status) => {
              await updateOAuthStatus(id, /** @type {import('../../../db/queries/mcpInstances/types.js').OAuthUpdateData} */ (status));
            })
          );
          
          // If error requires re-authentication, return immediately
          if (errorResponse.requiresReauth) {
            return ErrorResponses.unauthorized(res, errorResponse.error, /** @type {ExtendedErrorOptions} */ ({
              instanceId: errorResponse.instanceId,
              error: errorResponse.error,
              errorCode: errorResponse.errorCode,
              requiresReauth: errorResponse.requiresReauth
            }));
          }
          
          // For other errors, fall through to full OAuth exchange
          console.log(`🔄 Falling back to full OAuth exchange due to refresh error: ${errorMessage}`);
        }
      }

      // Need to perform full OAuth exchange - this indicates user needs to re-authenticate
      console.log(`🔐 Full OAuth exchange required for Slack instance: ${instanceId}`);
      
      // Create audit log entry for re-auth requirement
      createTokenAuditLog({
        instanceId,
        operation: 'validate',
        status: 'failure',
        method: 'middleware_check',
        errorType: 'OAUTH_FLOW_REQUIRED',
        errorMessage: 'No valid access token and refresh token failed',
        userId: instance.user_id,
        metadata: {
          hasRefreshToken: !!refreshToken,
          hasAccessToken: !!accessToken,
          tokenExpired: tokenExpiresAt ? tokenExpiresAt <= Date.now() : 'unknown'
        }
      }).catch(err => {
        console.error('Failed to create audit log:', err);
      });
      
      // Mark OAuth status as failed in database to indicate re-authentication needed
      await updateOAuthStatus(instanceId, {
        status: 'failed',
        accessToken: undefined,
        refreshToken: refreshToken, // Keep refresh token for potential retry
        tokenExpiresAt: undefined,
        scope: undefined
      });
      
      // Return specific error requiring re-authentication
      return ErrorResponses.unauthorized(res, 'OAuth authentication required - please re-authenticate', /** @type {ExtendedErrorOptions} */ ({
        instanceId,
        error: 'No valid access token and refresh token failed',
        requiresReauth: true,
        errorCode: 'OAUTH_FLOW_REQUIRED'
      }));

    } catch (error) {
      console.error('Slack credential authentication middleware error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return ErrorResponses.internal(res, 'Authentication system error', {
        instanceId,
        metadata: { errorMessage }
      });
    }
  };
}

/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {Function} Express middleware function
 */
function createLightweightAuthMiddleware() {
  return async (/** @type {import('./types.js').ExpressRequest} */ req, /** @type {import('./types.js').ExpressResponse} */ res, /** @type {import('./types.js').ExpressNext} */ next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.badRequest(res, 'Invalid instance ID format', /** @type {ExtendedErrorOptions} */ ({
        instanceId,
        expectedFormat: 'UUID v4'
      }));
    }

    try {
      // Quick database lookup without credential exchange
      /** @type {import('./types.js').DatabaseInstance | null} */
      const instance = /** @type {import('./types.js').DatabaseInstance | null} */ (await lookupInstanceCredentials(instanceId, 'slack'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'slack' }
        });
      }

      // Basic validation
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Slack service is currently disabled', {
          instanceId
        });
      }

      req.instanceId = instanceId;
      req.userId = instance.user_id;
      req.teamId = instance.team_id;
      
      return next();

    } catch (error) {
      console.error('Lightweight authentication middleware error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return ErrorResponses.internal(res, 'Authentication system error', {
        instanceId,
        metadata: { errorMessage }
      });
    }
  };
}

/**
 * Create cache performance monitoring middleware for development
 * @returns {Function} Express middleware function
 */
function createCachePerformanceMiddleware() {
  return (/** @type {import('./types.js').ExpressRequest} */ req, /** @type {import('./types.js').ExpressResponse} */ res, /** @type {import('./types.js').ExpressNext} */ next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response time
    const originalJson = res.json;
    res.json = function(body) {
      const responseTime = Date.now() - startTime;
      
      // Add performance headers in development
      res.set('X-Cache-Performance-Ms', responseTime.toString());
      res.set('X-Instance-Id', req.instanceId || 'unknown');
      res.set('X-Team-Id', req.teamId || 'unknown');
      
      // Log performance metrics
      if (responseTime > 100) {
        console.log(`⚠️  Slow response for ${req.method} ${req.path}: ${responseTime}ms`);
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

module.exports = {
  createCredentialAuthMiddleware,
  createLightweightAuthMiddleware,
  createCachePerformanceMiddleware
};