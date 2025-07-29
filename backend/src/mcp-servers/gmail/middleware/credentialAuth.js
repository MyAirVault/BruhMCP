/**
 * OAuth Credential Authentication Middleware for Gmail MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

/// <reference path="./types.js" />

const { lookupInstanceCredentials } = require('../services/database.js');
const { 
  isValidInstanceId, 
  createInstanceIdValidationError, 
  validateInstance 
} = require('./validation.js');
const { 
  checkCachedCredentials, 
  hasCachedBearerToken, 
  setupRequestWithCachedToken, 
  getTokenInfo, 
  isAccessTokenValid, 
  cacheAndSetupToken, 
  setupLightweightRequest 
} = require('./credentialManagement.js');
const { performTokenRefresh } = require('./tokenRefresh.js');
const { 
  createSystemErrorResponse, 
  createLightweightSystemErrorResponse, 
  handleRefreshFailure, 
  createRefreshFailureResponse, 
  createReauthenticationResponse, 
  logRefreshFallback 
} = require('./authErrorHandler.js');
const { 
  logSuccessfulTokenRefresh, 
  logFailedTokenRefresh, 
  logReauthenticationRequired 
} = require('./auditLogger.js');

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {import('express').RequestHandler} Express middleware function
 */
function createCredentialAuthMiddleware() {
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
function createLightweightAuthMiddleware() {
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
function createCachePerformanceMiddleware() {
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
;

;

;

;

;

module.exports = {
	createCredentialAuthMiddleware,
	createLightweightAuthMiddleware,
	createCachePerformanceMiddleware,
	isValidInstanceId: require('./validation.js').isValidInstanceId,
	createInstanceIdValidationError: require('./validation.js').createInstanceIdValidationError,
	validateInstance: require('./validation.js').validateInstance,
	validateInstanceExists: require('./validation.js').validateInstanceExists,
	validateServiceActive: require('./validation.js').validateServiceActive,
	validateInstanceStatus: require('./validation.js').validateInstanceStatus,
	validateInstanceNotExpired: require('./validation.js').validateInstanceNotExpired,
	validateOAuthCredentials: require('./validation.js').validateOAuthCredentials,
	checkCachedCredentials: require('./credentialManagement.js').checkCachedCredentials,
	hasCachedBearerToken: require('./credentialManagement.js').hasCachedBearerToken,
	setupRequestWithCachedToken: require('./credentialManagement.js').setupRequestWithCachedToken,
	getTokenInfo: require('./credentialManagement.js').getTokenInfo,
	isAccessTokenValid: require('./credentialManagement.js').isAccessTokenValid,
	cacheAndSetupToken: require('./credentialManagement.js').cacheAndSetupToken,
	cacheNewTokens: require('./credentialManagement.js').cacheNewTokens,
	setupRequestWithNewTokens: require('./credentialManagement.js').setupRequestWithNewTokens,
	setupLightweightRequest: require('./credentialManagement.js').setupLightweightRequest,
	attemptTokenRefresh: require('./tokenRefresh.js').attemptTokenRefresh,
	recordSuccessfulRefreshMetrics: require('./tokenRefresh.js').recordSuccessfulRefreshMetrics,
	recordFailedRefreshMetrics: require('./tokenRefresh.js').recordFailedRefreshMetrics,
	updateDatabaseWithNewTokens: require('./tokenRefresh.js').updateDatabaseWithNewTokens,
	processSuccessfulRefresh: require('./tokenRefresh.js').processSuccessfulRefresh,
	processFailedRefresh: require('./tokenRefresh.js').processFailedRefresh,
	performTokenRefresh: require('./tokenRefresh.js').performTokenRefresh,
	createSystemErrorResponse: require('./authErrorHandler.js').createSystemErrorResponse,
	createLightweightSystemErrorResponse: require('./authErrorHandler.js').createLightweightSystemErrorResponse,
	handleRefreshFailure: require('./authErrorHandler.js').handleRefreshFailure,
	createRefreshFailureResponse: require('./authErrorHandler.js').createRefreshFailureResponse,
	createReauthenticationResponse: require('./authErrorHandler.js').createReauthenticationResponse,
	logRefreshFallback: require('./authErrorHandler.js').logRefreshFallback,
	logSuccessfulTokenRefresh: require('./auditLogger.js').logSuccessfulTokenRefresh,
	logFailedTokenRefresh: require('./auditLogger.js').logFailedTokenRefresh,
	logReauthenticationRequired: require('./auditLogger.js').logReauthenticationRequired,
	createAuditLogEntry: require('./auditLogger.js').createAuditLogEntry,
	logTokenValidationSuccess: require('./auditLogger.js').logTokenValidationSuccess
};