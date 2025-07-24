/**
 * OAuth Credential Authentication Middleware for Google Drive MCP Service
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
} from './credentialManagement.js';
import { performTokenRefresh } from './tokenRefresh.js';
import { 
  createSystemErrorResponse, 
  createLightweightSystemErrorResponse, 
  handleRefreshFailure, 
  createRefreshFailureResponse, 
  createReauthenticationResponse, 
  logRefreshFallback,
  createNoValidTokenResponse
} from './authErrorHandler.js';
import { 
  logSuccessfulTokenRefresh, 
  logFailedTokenRefresh, 
  logReauthenticationRequired 
} from './auditLogger.js';

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
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'googledrive'));
      
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
          
          if (refreshResult.success) {
            await logSuccessfulTokenRefresh(instanceId, validInstance.user_id);
            return next();
          }
          
          // Handle refresh failure
          await logFailedTokenRefresh(instanceId, validInstance.user_id, refreshResult.error || 'Unknown error');
          
          if (refreshResult.requiresReauth) {
            await logReauthenticationRequired(instanceId, validInstance.user_id);
            return createReauthenticationResponse(res, instanceId);
          }
          
          return createRefreshFailureResponse(res, instanceId, refreshResult.error || 'Token refresh failed');
          
        } catch (refreshError) {
          const errorMessage = refreshError instanceof Error ? refreshError.message : String(refreshError);
          await logFailedTokenRefresh(instanceId, validInstance.user_id, errorMessage);
          return createRefreshFailureResponse(res, instanceId, errorMessage);
        }
      }

      // No valid token or refresh token available
      return createNoValidTokenResponse(res, instanceId);

    } catch (error) {
      return createSystemErrorResponse(res, instanceId, error);
    }
  };
}

/**
 * Create lightweight authentication middleware (no OAuth token required)
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
      // Lookup instance from database (no OAuth status check)
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'googledrive'));
      
      // Validate instance (without OAuth requirement)
      const validation = validateInstance(instance, res, instanceId, false);
      if (!validation.isValid) {
        return validation.errorResponse;
      }

      // TypeScript assertion: instance is valid after validation
      const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);
      
      // Set up request without token
      setupLightweightRequest(req, instanceId, validInstance.user_id);
      
      return next();
      
    } catch (error) {
      return createLightweightSystemErrorResponse(res, instanceId, error);
    }
  };
}

/**
 * Create cache performance monitoring middleware
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware() {
  /**
   * @param {import('./types.js').ExpressRequest} req - Express request object
   * @param {import('./types.js').ExpressResponse} res - Express response object
   * @param {import('./types.js').ExpressNext} next - Express next function
   */
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const instanceId = req.params.instanceId || 'unknown';
      console.log(`📊 Cache performance: ${req.method} ${req.path} - ${duration}ms (instance: ${instanceId})`);
    });
    
    next();
  };
}