/**
 * OAuth Credential Authentication Middleware for Notion MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

/// <reference path="./types.js" />

const { lookupInstanceCredentials  } = require('../services/database');
const { isValidInstanceId, 
  createInstanceIdValidationError, 
  validateInstance 
 } = require('./validation');
const { checkCachedCredentials, 
  hasCachedBearerToken, 
  setupRequestWithCachedToken, 
  getTokenInfo, 
  isAccessTokenValid, 
  cacheAndSetupToken, 
  setupLightweightRequest 
 } = require('./credentialManagement');
const { performTokenRefresh  } = require('./tokenRefresh');
const { createSystemErrorResponse, 
  createLightweightSystemErrorResponse, 
  handleRefreshFailure, 
  createRefreshFailureResponse, 
  createReauthenticationResponse, 
  logRefreshFallback 
 } = require('./authErrorHandler');
const { logSuccessfulTokenRefresh, 
  logFailedTokenRefresh, 
  logReauthenticationRequired 
 } = require('./auditLogger');

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
function createCredentialAuthMiddleware() {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = /** @type {{instanceId: string}} */ (req.params);
    
    // Validate instance ID format
    if (!isValidInstanceId(instanceId)) {
      return createInstanceIdValidationError(res, instanceId);
    }

    try {
      // Check credential cache first (fast path)
      const cachedCredential = checkCachedCredentials(instanceId);
      
      if (hasCachedBearerToken(cachedCredential)) {
        await setupRequestWithCachedToken(/** @type {import('./types.js').ExpressRequest} */ (req), /** @type {import('./types.js').CachedCredential} */ (cachedCredential), instanceId);
        return next();
      }

      console.log(`⏳ OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'notion'));
      
      // Validate instance and all requirements
      const validation = validateInstance(instance, res, instanceId, true);
      if (!validation.isValid) {
        return validation.errorResponse;
      }

      // TypeScript assertion: instance is valid after validation
      const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

      // Get token information from cache or database
      const tokenInfo = getTokenInfo(validInstance, cachedCredential);
      const { refreshToken, accessToken, tokenExpiresAt } = tokenInfo;

      // If we have an access token that's still valid, use it (Notion tokens don't expire)
      if (isAccessTokenValid(accessToken, tokenExpiresAt, 'notion')) {
        await cacheAndSetupToken(
          instanceId, 
          /** @type {string} */ (accessToken), 
          /** @type {number} */ (tokenExpiresAt), 
          validInstance.user_id, 
          /** @type {import('./types.js').ExpressRequest} */ (req),
          refreshToken, 
          cachedCredential
        );
        return next();
      }

      // If we have a refresh token, try to refresh the access token
      // Skip refresh for Notion since tokens don't expire (this should not happen)
      if (refreshToken && validInstance.mcp_service_name !== 'notion') {
        try {
          const refreshResult = await performTokenRefresh(instanceId, refreshToken, validInstance, /** @type {import('./types.js').ExpressRequest} */ (req));
          
          if (refreshResult.success && refreshResult.metadata) {
            // Log successful refresh
            await logSuccessfulTokenRefresh(
              instanceId, 
              String(refreshResult.metadata.method), 
              validInstance.user_id, 
              refreshResult.metadata
            );
            return next();
          } else if (refreshResult.error && refreshResult.errorInfo) {
            // Log failed refresh
            await logFailedTokenRefresh(
              instanceId, 
              String(refreshResult.errorInfo.method), 
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
          logRefreshFallback(errorObj);
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
function createLightweightAuthMiddleware() {
  /**
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   * @param {import('express').NextFunction} next - Express next function
   */
  return async (req, res, next) => {
    const { instanceId } = /** @type {{instanceId: string}} */ (req.params);
    
    // Validate instance ID format
    if (!isValidInstanceId(instanceId)) {
      return createInstanceIdValidationError(res, instanceId);
    }

    try {
      // Quick database lookup without credential exchange
      const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (await lookupInstanceCredentials(instanceId, 'notion'));
      
      // Validate instance without OAuth requirements
      const validation = validateInstance(instance, res, instanceId, false);
      if (!validation.isValid) {
        return validation.errorResponse;
      }
      
      // TypeScript assertion: instance is valid after validation
      const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

      setupLightweightRequest(/** @type {import('./types.js').ExpressRequest} */ (req), instanceId, validInstance.user_id);
      
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
function createCachePerformanceMiddleware() {
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
     * @param {any} body - Response body
     */
    res.json = function(body) {
      const responseTime = Date.now() - startTime;
      
      // Add performance headers in development
      res.set('X-Cache-Performance-Ms', responseTime.toString());
      res.set('X-Instance-Id', /** @type {import('./types.js').ExpressRequest} */ (req).instanceId || 'unknown');
      
      // Log performance metrics
      if (responseTime > 100) {
        console.log(`⚠️  Slow response for ${req.method} ${req.originalUrl || req.url}: ${responseTime}ms`);
      }
      
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// All additional imports are already done at the top of the file
// Single consolidated export
module.exports = {
  createCredentialAuthMiddleware,
  createLightweightAuthMiddleware,
  createCachePerformanceMiddleware
};