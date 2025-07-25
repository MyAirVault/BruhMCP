/**
 * OAuth Credential Authentication Middleware for Reddit MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

// @ts-check

import { getCachedCredential, setCachedCredential } from '../services/credentialCache.js';
import { lookupInstanceCredentials, updateInstanceUsage } from '../services/database.js';
import { refreshBearerToken, refreshBearerTokenDirect } from '../utils/oauthValidation.js';
import { updateOAuthStatus, updateOAuthStatusWithLocking, createTokenAuditLog } from '../../../db/queries/mcpInstances/index.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';
import { handleTokenRefreshFailure, logOAuthError } from '../utils/oauthErrorHandler.js';
import { recordTokenRefreshMetrics } from '../utils/tokenMetrics.js';

/**
 * @typedef {import('./types.js').CachedCredential} CachedCredential
 * @typedef {import('./types.js').DatabaseInstance} DatabaseInstance
 * @typedef {import('./types.js').NewOAuthTokens} NewOAuthTokens
 * @typedef {import('./types.js').ExpressRequest} ExpressRequest
 * @typedef {import('./types.js').ExpressResponse} ExpressResponse
 * @typedef {import('./types.js').ExpressNext} ExpressNext
 * @typedef {import('./types.js').TokenRefreshOptions} TokenRefreshOptions
 */

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): Promise<void>} Express middleware function
 */
export function createCredentialAuthMiddleware() {
  /**
   * @param {ExpressRequest} req - Express request object
   * @param {ExpressResponse} res - Express response object
   * @param {ExpressNext} next - Express next function
   * @returns {Promise<void>}
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    if (!instanceId) {
      return ErrorResponses.validation(res, 'Missing instance ID', [], {
        metadata: { expectedParameter: 'instanceId' }
      });
    }
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.validation(res, 'Invalid instance ID format', [], {
        instanceId,
        metadata: { expectedFormat: 'UUID v4' }
      });
    }

    try {
      // Check credential cache first (fast path)
      /** @type {CachedCredential | null} */
      let cachedCredential = /** @type {CachedCredential | null} */ (getCachedCredential(instanceId));
      
      if (cachedCredential && cachedCredential.bearerToken) {
        console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
        req.bearerToken = cachedCredential.bearerToken;
        req.instanceId = instanceId;
        req.userId = cachedCredential.user_id;
        
        // Update usage tracking asynchronously
        try {
          await updateInstanceUsage(instanceId);
        } catch (err) {
          console.error('Failed to update usage tracking:', err);
        }
        
        return next();
      }

      console.log(`⏳ OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      /** @type {DatabaseInstance | null} */
      const instance = /** @type {DatabaseInstance | null} */ (await lookupInstanceCredentials(instanceId, 'reddit'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'reddit' }
        });
      }

      // Validate service is active
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Reddit service is currently disabled', {
          instanceId,
          metadata: { service: 'reddit' }
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
        console.log(`✅ Using valid access token for instance: ${instanceId}`);
        
        // Cache the token if it wasn't cached before
        if (!cachedCredential) {
          setCachedCredential(instanceId, {
            bearerToken: accessToken,
            refreshToken: refreshToken || '',
            expiresAt: tokenExpiresAt,
            user_id: instance.user_id
          });
        }

        req.bearerToken = accessToken;
        req.instanceId = instanceId;
        req.userId = instance.user_id;

        // Update usage tracking
        await updateInstanceUsage(instanceId);
        return next();
      }

      // If we have a refresh token, try to refresh the access token
      if (refreshToken) {
        console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
        
        const refreshStartTime = Date.now();
        let usedMethod = 'oauth_service';
        
        try {
          /** @type {NewOAuthTokens} */
          let newTokens;
          
          // Try to refresh the token using available method
          try {
            newTokens = await refreshBearerToken({
              refreshToken: refreshToken,
              clientId: instance.client_id,
              clientSecret: instance.client_secret
            });
            usedMethod = 'oauth_service';
          } catch (refreshError) {
            /** @type {Error} */
            const errorObj = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
            console.log(`⚠️  Primary OAuth refresh failed: ${errorObj.message}`);
            
            // Try direct OAuth as fallback only for specific error types
            const isServiceUnavailable = errorObj.message.includes('OAuth service error') || 
                                       errorObj.message.includes('Failed to start OAuth service') ||
                                       errorObj.message.includes('ECONNREFUSED') ||
                                       errorObj.message.includes('timeout');
            
            if (isServiceUnavailable) {
              console.log(`🔄 Attempting direct OAuth fallback for instance: ${instanceId}`);
              newTokens = await refreshBearerTokenDirect({
                refreshToken: refreshToken,
                clientId: instance.client_id,
                clientSecret: instance.client_secret
              });
              usedMethod = 'direct_oauth';
            } else {
              // Re-throw for non-service-availability errors
              throw errorObj;
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
              responseTime: refreshEndTime - refreshStartTime
            }
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });

          // Update cache with new Bearer token
          setCachedCredential(instanceId, {
            bearerToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || refreshToken,
            expiresAt: newExpiresAt.getTime(),
            user_id: instance.user_id
          });

          // Update session bearer token immediately
          const { updateSessionBearerToken } = await import('../services/handlerSessions.js');
          updateSessionBearerToken(instanceId, newTokens.access_token);

          // Update database with new tokens using optimistic locking
          try {
            await updateOAuthStatusWithLocking(instanceId, {
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken || '',
              tokenExpiresAt: newExpiresAt,
              scope: newTokens.scope
            });
          } catch (lockingError) {
            // Fallback to regular update if optimistic locking fails
            console.warn(`⚠️ Optimistic locking failed for ${instanceId}, falling back to regular update`);
            await updateOAuthStatus(instanceId, {
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken || '',
              tokenExpiresAt: newExpiresAt,
              scope: newTokens.scope
            });
          }

          req.bearerToken = newTokens.access_token;
          req.instanceId = instanceId;
          req.userId = instance.user_id;

          // Update usage tracking
          await updateInstanceUsage(instanceId);

          return next();
        } catch (refreshError) {
          /** @type {Error & {errorType?: string, originalError?: string}} */
          const errorObj = refreshError instanceof Error ? 
            refreshError : 
            new Error(typeof refreshError === 'string' ? refreshError : 'Token refresh failed');
          
          const refreshEndTime = Date.now();
          
          // Record failed metrics
          recordTokenRefreshMetrics(
            instanceId, 
            usedMethod, 
            false, // failure
            errorObj.errorType || 'UNKNOWN_ERROR',
            errorObj.message || 'Token refresh failed',
            refreshStartTime, 
            refreshEndTime
          );

          // Create audit log entry for failure
          createTokenAuditLog({
            instanceId,
            operation: 'refresh',
            status: 'failure',
            method: usedMethod,
            errorType: errorObj.errorType || 'UNKNOWN_ERROR',
            errorMessage: errorObj.message || 'Token refresh failed',
            userId: instance.user_id,
            metadata: {
              responseTime: refreshEndTime - refreshStartTime,
              originalError: errorObj.originalError || errorObj.message
            }
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });

          // Use centralized error handling
          logOAuthError(errorObj, 'token refresh', instanceId);
          
          /** @type {{requiresReauth: boolean, error: string, errorCode?: string, instanceId: string}} */
          const errorResponse = /** @type {{requiresReauth: boolean, error: string, errorCode?: string, instanceId: string}} */ (await handleTokenRefreshFailure(instanceId, errorObj, updateOAuthStatus));
          
          // If error requires re-authentication, return immediately
          if (errorResponse.requiresReauth) {
            return ErrorResponses.unauthorized(res, errorResponse.error, {
              instanceId: errorResponse.instanceId,
              metadata: {
                error: errorResponse.error,
                errorCode: errorResponse.errorCode,
                requiresReauth: errorResponse.requiresReauth
              }
            });
          }
          
          // For other errors, fall through to full OAuth exchange
          console.log(`🔄 Falling back to full OAuth exchange due to refresh error: ${errorObj.message}`);
        }
      }

      // Need to perform full OAuth exchange - this indicates user needs to re-authenticate
      console.log(`🔐 Full OAuth exchange required for instance: ${instanceId}`);
      
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
        refreshToken: refreshToken || undefined, // Keep refresh token for potential retry
        tokenExpiresAt: undefined,
        scope: undefined
      });
      
      // Return specific error requiring re-authentication
      return ErrorResponses.unauthorized(res, 'OAuth authentication required - please re-authenticate', {
        instanceId,
        metadata: {
          error: 'No valid access token and refresh token failed',
          requiresReauth: true,
          errorCode: 'OAUTH_FLOW_REQUIRED'
        }
      });

    } catch (error) {
      console.error('Credential authentication middleware error:', error);
      /** @type {string} */
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
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): Promise<void>} Express middleware function
 */
export function createLightweightAuthMiddleware() {
  /**
   * @param {ExpressRequest} req - Express request object
   * @param {ExpressResponse} res - Express response object
   * @param {ExpressNext} next - Express next function
   * @returns {Promise<void>}
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    if (!instanceId) {
      return ErrorResponses.validation(res, 'Missing instance ID', [], {
        metadata: { expectedParameter: 'instanceId' }
      });
    }
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.validation(res, 'Invalid instance ID format', [], {
        instanceId,
        metadata: { expectedFormat: 'UUID v4' }
      });
    }

    try {
      // Quick database lookup without credential exchange
      /** @type {DatabaseInstance | null} */
      const instance = /** @type {DatabaseInstance | null} */ (await lookupInstanceCredentials(instanceId, 'reddit'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'reddit' }
        });
      }

      // Basic validation
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Reddit service is currently disabled', {
          instanceId,
          metadata: { service: 'reddit' }
        });
      }

      req.instanceId = instanceId;
      req.userId = instance.user_id;
      
      return next();

    } catch (error) {
      console.error('Lightweight authentication middleware error:', error);
      /** @type {string} */
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
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNext): void} Express middleware function
 */
export function createCachePerformanceMiddleware() {
  /**
   * @param {ExpressRequest} req - Express request object
   * @param {ExpressResponse} res - Express response object
   * @param {ExpressNext} next - Express next function
   * @returns {void}
   */
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response time
    const originalJson = res.json;
    /** @param {object} body */
    res.json = function(body) {
      const responseTime = Date.now() - startTime;
      
      // Add performance headers in development
      res.set('X-Cache-Performance-Ms', responseTime.toString());
      res.set('X-Instance-Id', req.instanceId || 'unknown');
      
      // Log performance metrics
      if (responseTime > 100) {
        console.log(`⚠️  Slow response for ${req.method} ${req.path}: ${responseTime}ms`);
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}