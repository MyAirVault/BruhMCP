/**
 * OAuth Credential Authentication Middleware for Gmail MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

/// <reference path="./types.js" />

import { lookupInstanceCredentials } from '../services/database.js';
import { 
  isValidInstanceId, 
  createInstanceIdValidationError, 
  validateInstance 
} from './validation.js';
import { 
  checkCachedCredentials, 
  hasCachedBearerToken, 
  setupRequestWithCachedToken, 
  getTokenInfo, 
  isAccessTokenValid, 
  cacheAndSetupToken, 
  setupLightweightRequest 
} from './credential-management.js';
import { performTokenRefresh } from './token-refresh.js';
import { 
  createSystemErrorResponse, 
  createLightweightSystemErrorResponse, 
  handleRefreshFailure, 
  createRefreshFailureResponse, 
  createReauthenticationResponse, 
  logRefreshFallback 
} from './auth-error-handler.js';
import { 
  logSuccessfulTokenRefresh, 
  logFailedTokenRefresh, 
  logReauthenticationRequired 
} from './audit-logger.js';

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCredentialAuthMiddleware() {
  /**
   * @param {import('./types.js').ExpressRequest} req - Express request object
   * @param {import('./types.js').ExpressResponse} res - Express response object
   * @param {import('./types.js').ExpressNext} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    if (!isValidInstanceId(instanceId)) {
      return createInstanceIdValidationError(res, instanceId);
    }

    try {
      // Check credential cache first (fast path)
      const cachedCredential = checkCachedCredentials(instanceId);
      
      if (hasCachedBearerToken(cachedCredential)) {
        await setupRequestWithCachedToken(req, cachedCredential, instanceId);
        return next();
      }

      console.log(`⏳ OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'gmail'));
      
      // Validate instance and all requirements
      const validation = validateInstance(instance, res, instanceId, true);
      if (!validation.isValid) {
        return validation.errorResponse;
      }

      // TypeScript assertion: instance is valid after validation
      const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

      // Get token information from cache or database
      const { refreshToken, accessToken, tokenExpiresAt } = getTokenInfo(validInstance, cachedCredential);

      // If we have an access token that's still valid, use it
      if (isAccessTokenValid(accessToken, tokenExpiresAt)) {
        await cacheAndSetupToken(
          instanceId, 
          /** @type {string} */ (accessToken), 
          /** @type {number} */ (tokenExpiresAt), 
          validInstance.user_id, 
          req,
          refreshToken, 
          cachedCredential
        );
        return next();
      }

      // If we have a refresh token, try to refresh the access token
      if (refreshToken) {
        try {
          const refreshResult = await performTokenRefresh(instanceId, refreshToken, validInstance, req);
          
          if (refreshResult.success && refreshResult.metadata) {
            // Log successful refresh
            await logSuccessfulTokenRefresh(
              instanceId, 
              refreshResult.metadata.method, 
              validInstance.user_id, 
              refreshResult.metadata
            );
            return next();
          } else if (refreshResult.error && refreshResult.errorInfo) {
            // Log failed refresh
            await logFailedTokenRefresh(
              instanceId, 
              refreshResult.errorInfo.method, 
              validInstance.user_id, 
              refreshResult.error.errorType || 'UNKNOWN_ERROR',
              refreshResult.error.message || 'Token refresh failed',
              refreshResult.errorInfo
            );

            // Handle refresh failure
            const errorResult = await handleRefreshFailure(instanceId, refreshResult.error);
            
            // If error requires re-authentication, return immediately
            if (errorResult.requiresReauth) {
              return createRefreshFailureResponse(res, errorResult);
            }
            
            // For other errors, fall through to full OAuth exchange
            logRefreshFallback(refreshResult.error);
          }
        } catch (refreshError) {
          console.error('Token refresh operation failed:', refreshError);
          const errorObj = refreshError instanceof Error ? refreshError : new Error(String(refreshError));
          const tokenError = /** @type {import('./types.js').TokenRefreshError} */ ({
            message: errorObj.message,
            errorType: 'UNKNOWN_ERROR',
            originalError: errorObj.message,
            name: errorObj.name
          });
          logRefreshFallback(tokenError);
        }
      }

      // Need to perform full OAuth exchange - this indicates user needs to re-authenticate
      await logReauthenticationRequired(
        instanceId, 
        validInstance.user_id, 
        !!refreshToken, 
        !!accessToken, 
        tokenExpiresAt ? tokenExpiresAt <= Date.now() : 'unknown'
      );
      
      return await createReauthenticationResponse(res, instanceId, refreshToken);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      return createSystemErrorResponse(res, instanceId, errorObj);
    }
  };
}

/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createLightweightAuthMiddleware() {
  /**
   * @param {import('./types.js').ExpressRequest} req - Express request object
   * @param {import('./types.js').ExpressResponse} res - Express response object
   * @param {import('./types.js').ExpressNext} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    if (!isValidInstanceId(instanceId)) {
      return createInstanceIdValidationError(res, instanceId);
    }

    try {
      // Quick database lookup without credential exchange
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'gmail'));
      
      // Validate instance without OAuth requirements
      const validation = validateInstance(instance, res, instanceId, false);
      if (!validation.isValid) {
        return validation.errorResponse;
      }
      
      // TypeScript assertion: instance is valid after validation
      const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

      setupLightweightRequest(req, instanceId, validInstance.user_id);
      
      return next();

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      return createLightweightSystemErrorResponse(res, instanceId, errorObj);
    }
  };
}

/**
 * Create cache performance monitoring middleware for development
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware() {
  /**
   * @param {import('./types.js').ExpressRequest} req - Express request object
   * @param {import('./types.js').ExpressResponse} res - Express response object
   * @param {import('./types.js').ExpressNext} next - Express next function
   */
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response time
    const originalJson = res.json;
    /**
     * @param {any} body - Response body
     */
    res.json = function(body) {
      const responseTime = Date.now() - startTime;
      
      // Add performance headers in development
      res.set('X-Cache-Performance-Ms', responseTime.toString());
      res.set('X-Instance-Id', req.instanceId || 'unknown');
      
      // Log performance metrics
      if (responseTime > 100) {
        console.log(`⚠️  Slow response for ${req.method} ${req.originalUrl || req.url}: ${responseTime}ms`);
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// Export all modular components (explicit exports to avoid type conflicts)
export {
  isValidInstanceId,
  createInstanceIdValidationError,
  validateInstance,
  validateInstanceExists,
  validateServiceActive,
  validateInstanceStatus,
  validateInstanceNotExpired,
  validateOAuthCredentials
} from './validation.js';

export {
  checkCachedCredentials,
  hasCachedBearerToken,
  setupRequestWithCachedToken,
  getTokenInfo,
  isAccessTokenValid,
  cacheAndSetupToken,
  cacheNewTokens,
  setupRequestWithNewTokens,
  setupLightweightRequest
} from './credential-management.js';

export {
  attemptTokenRefresh,
  recordSuccessfulRefreshMetrics,
  recordFailedRefreshMetrics,
  updateDatabaseWithNewTokens,
  processSuccessfulRefresh,
  processFailedRefresh,
  performTokenRefresh
} from './token-refresh.js';

export {
  createSystemErrorResponse,
  createLightweightSystemErrorResponse,
  handleRefreshFailure,
  createRefreshFailureResponse,
  createReauthenticationResponse,
  logRefreshFallback
} from './auth-error-handler.js';

export {
  logSuccessfulTokenRefresh,
  logFailedTokenRefresh,
  logReauthenticationRequired,
  createAuditLogEntry,
  logTokenValidationSuccess
} from './audit-logger.js';