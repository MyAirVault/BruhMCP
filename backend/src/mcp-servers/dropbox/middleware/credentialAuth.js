/**
 * OAuth Credential Authentication Middleware for Dropbox MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth Bearer token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User ID
 * @property {string} [last_used] - Last used timestamp
 */

/**
 * @typedef {Object} DatabaseInstance
 * @property {string} instance_id - Instance UUID
 * @property {string} user_id - User ID
 * @property {string} oauth_status - OAuth status
 * @property {string} status - Instance status
 * @property {string|null} expires_at - Instance expiration date
 * @property {number} usage_count - Usage count
 * @property {string|null} custom_name - Custom name
 * @property {string|null} last_used_at - Last used timestamp
 * @property {string} mcp_service_name - Service name
 * @property {string} display_name - Display name
 * @property {string} auth_type - Authentication type
 * @property {boolean} service_active - Service active status
 * @property {number} port - Service port
 * @property {string|null} api_key - API key
 * @property {string|null} client_id - OAuth client ID
 * @property {string|null} client_secret - OAuth client secret
 * @property {string|null} access_token - OAuth access token
 * @property {string|null} refresh_token - OAuth refresh token
 * @property {string|null} token_expires_at - Token expiration date
 * @property {string|null} oauth_completed_at - OAuth completion date
 */

/**
 * @typedef {Object} TokenRefreshParams
 * @property {string} refreshToken - Refresh token
 * @property {string} clientId - OAuth client ID
 * @property {string} clientSecret - OAuth client secret
 */

/**
 * @typedef {Object} NewTokens
 * @property {string} access_token - New access token
 * @property {string|null} refresh_token - New refresh token (optional)
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} [scope] - Token scope
 */

/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status - OAuth status
 * @property {string|null|undefined} accessToken - Access token
 * @property {string|null|undefined} refreshToken - Refresh token
 * @property {Date|null|undefined} tokenExpiresAt - Token expiration date
 * @property {string|null|undefined} scope - Token scope
 */

/**
 * @typedef {Object} TokenAuditLogParams
 * @property {string} instanceId - Instance ID
 * @property {string} operation - Operation type
 * @property {string} status - Operation status
 * @property {string} method - Method used
 * @property {string} [errorType] - Error type
 * @property {string} [errorMessage] - Error message
 * @property {string} userId - User ID
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} TokenRefreshError
 * @property {string} message - Error message
 * @property {string} errorType - Error type
 * @property {string} originalError - Original error message
 */

/**
 * @typedef {Object} TokenRefreshFailureResponse
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} error - Error message
 * @property {string} errorCode - Error code
 * @property {string} instanceId - Instance ID
 */

import { getCachedCredential, setCachedCredential } from '../services/credentialCache.js';
import { lookupInstanceCredentials, updateInstanceUsage } from '../services/database.js';
import { refreshBearerToken, refreshBearerTokenDirect } from '../utils/oauthValidation.js';
import { updateOAuthStatus, updateOAuthStatusWithLocking, createTokenAuditLog } from '../../../db/queries/mcpInstances/index.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';
import { handleTokenRefreshFailure, logOAuthError } from '../utils/oauthErrorHandler.js';
import { recordTokenRefreshMetrics } from '../utils/tokenMetrics.js';

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCredentialAuthMiddleware() {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.invalidInput(res, 'Invalid instance ID format', {
        instanceId,
        metadata: { expectedFormat: 'UUID v4' }
      });
    }

    try {
      // Check credential cache first (fast path)
      /** @type {CachedCredential|null} */
      let cachedCredential = /** @type {CachedCredential|null} */ (getCachedCredential(instanceId));
      
      if (cachedCredential && cachedCredential.bearerToken) {
        console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
        req.bearerToken = cachedCredential.bearerToken;
        req.instanceId = instanceId;
        req.userId = cachedCredential.user_id;
        
        // Update usage tracking asynchronously
        updateInstanceUsage(instanceId).catch((err) => {
          console.error('Failed to update usage tracking:', err);
        });
        
        return next();
      }

      console.log(`⏳ OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      /** @type {DatabaseInstance|null} */
      const instance = /** @type {DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'dropbox'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'dropbox' }
        });
      }

      // Validate service is active
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Dropbox service is currently disabled', {
          instanceId,
          metadata: { service: 'dropbox' }
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
      const refreshToken = cachedCredential?.refreshToken || instance.refresh_token || null;
      const accessToken = cachedCredential?.bearerToken || instance.access_token || null;
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
      if (refreshToken && refreshToken !== '') {
        console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
        
        const refreshStartTime = Date.now();
        let usedMethod = 'oauth_service';
        
        try {
          let newTokens;
          
          // Try OAuth service first, then fallback to direct Dropbox OAuth
          try {
            newTokens = await refreshBearerToken({
              refreshToken: refreshToken,
              clientId: instance.client_id,
              clientSecret: instance.client_secret
            });
            usedMethod = 'oauth_service';
          } catch (oauthServiceError) {
            /** @type {Error} */
            const errorObj = oauthServiceError instanceof Error ? oauthServiceError : new Error(String(oauthServiceError));
            console.log(`⚠️  OAuth service failed, trying direct Dropbox OAuth: ${errorObj.message}`);
            
            // Check if error indicates OAuth service unavailable
            if (errorObj.message.includes('OAuth service error') || 
                errorObj.message.includes('Failed to start OAuth service')) {
              
              // Fallback to direct Dropbox OAuth
              newTokens = await refreshBearerTokenDirect({
                refreshToken: refreshToken,
                clientId: instance.client_id,
                clientSecret: instance.client_secret
              });
              usedMethod = 'direct_oauth';
            } else {
              // Re-throw if it's not a service availability issue
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

          // Update database with new tokens using optimistic locking
          try {
            await updateOAuthStatusWithLocking(instanceId, {
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken,
              tokenExpiresAt: newExpiresAt,
              scope: newTokens.scope
            });
          } catch (lockingError) {
            // Fallback to regular update if optimistic locking fails
            console.warn(`⚠️ Optimistic locking failed for ${instanceId}, falling back to regular update`);
            await updateOAuthStatus(instanceId, {
              status: 'completed',
              accessToken: newTokens.access_token,
              refreshToken: newTokens.refresh_token || refreshToken,
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
          /** @type {TokenRefreshError} */
          const errorObj = refreshError instanceof Error ? 
            { message: refreshError.message, errorType: 'UNKNOWN_ERROR', originalError: refreshError.message } : 
            typeof refreshError === 'object' && refreshError !== null ? 
              { 
                message: String(/** @type {{message?: string}} */ (refreshError).message || 'Token refresh failed'), 
                errorType: String(/** @type {{errorType?: string}} */ (refreshError).errorType || 'UNKNOWN_ERROR'),
                originalError: String(/** @type {{originalError?: string}} */ (refreshError).originalError || '')
              } :
              { message: String(refreshError), errorType: 'UNKNOWN_ERROR', originalError: String(refreshError) };
          
          const refreshEndTime = Date.now();
          
          // Record failed metrics
          recordTokenRefreshMetrics(
            instanceId, 
            usedMethod, 
            false, // failure
            errorObj.errorType,
            errorObj.message,
            refreshStartTime, 
            refreshEndTime
          );

          // Create audit log entry for failure
          createTokenAuditLog({
            instanceId,
            operation: 'refresh',
            status: 'failure',
            method: usedMethod,
            errorType: errorObj.errorType,
            errorMessage: errorObj.message,
            userId: instance.user_id,
            metadata: {
              responseTime: refreshEndTime - refreshStartTime,
              originalError: errorObj.originalError || errorObj.message
            }
          }).catch(err => {
            console.error('Failed to create audit log:', err);
          });

          // Use centralized error handling
          const refreshErrorForLog = new Error(errorObj.message);
          logOAuthError(refreshErrorForLog, 'token refresh', instanceId);
          
          /** @type {TokenRefreshFailureResponse} */
          const errorResponse = /** @type {TokenRefreshFailureResponse} */ (await handleTokenRefreshFailure(instanceId, refreshErrorForLog, updateOAuthStatus));
          
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
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createLightweightAuthMiddleware() {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.invalidInput(res, 'Invalid instance ID format', {
        instanceId,
        metadata: { expectedFormat: 'UUID v4' }
      });
    }

    try {
      // Quick database lookup without credential exchange
      /** @type {DatabaseInstance|null} */
      const instance = /** @type {DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'dropbox'));
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          metadata: { service: 'dropbox' }
        });
      }

      // Basic validation
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Dropbox service is currently disabled', {
          instanceId
        });
      }

      req.instanceId = instanceId;
      req.userId = instance.user_id;
      
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
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware() {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response time
    const originalJson = res.json;
    /**
     * @param {object} body - Response body
     */
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