/**
 * OAuth Credential Authentication Middleware for Gmail MCP Service
 * Handles OAuth Bearer token authentication and credential caching
 */

import { getCachedCredential, setCachedCredential, updateCachedCredentialMetadata } from '../services/credential-cache.js';
import { lookupInstanceCredentials, updateInstanceUsage } from '../services/database.js';
import { exchangeOAuthForBearer, refreshBearerToken } from '../utils/oauth-validation.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {Function} Express middleware function
 */
export function createCredentialAuthMiddleware() {
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.badRequest(res, 'Invalid instance ID format', {
        instanceId,
        expectedFormat: 'UUID v4'
      });
    }

    try {
      // Check credential cache first (fast path)
      let cachedCredential = getCachedCredential(instanceId);
      
      if (cachedCredential && cachedCredential.bearerToken) {
        console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
        req.bearerToken = cachedCredential.bearerToken;
        req.instanceId = instanceId;
        req.userId = cachedCredential.user_id;
        
        // Update usage tracking asynchronously
        updateInstanceUsage(instanceId).catch(err => {
          console.error('Failed to update usage tracking:', err);
        });
        
        return next();
      }

      console.log(`⏳ OAuth Bearer token cache miss for instance: ${instanceId}, performing database lookup`);

      // Cache miss - lookup credentials from database
      const instance = await lookupInstanceCredentials(instanceId, 'gmail');
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          service: 'gmail'
        });
      }

      // Validate service is active
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Gmail service is currently disabled', {
          instanceId,
          service: 'gmail'
        });
      }

      // Validate instance status
      if (instance.status === 'inactive') {
        return ErrorResponses.forbidden(res, 'Instance is paused', {
          instanceId,
          status: instance.status
        });
      }

      if (instance.status === 'expired') {
        return ErrorResponses.forbidden(res, 'Instance has expired', {
          instanceId,
          status: instance.status
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
          authType: instance.auth_type
        });
      }

      // Check if we have a cached Bearer token that just expired
      if (cachedCredential && cachedCredential.refreshToken) {
        console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
        
        try {
          const newTokens = await refreshBearerToken({
            refreshToken: cachedCredential.refreshToken,
            clientId: instance.client_id,
            clientSecret: instance.client_secret
          });

          // Update cache with new Bearer token
          setCachedCredential(instanceId, {
            bearerToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || cachedCredential.refreshToken,
            expiresAt: Date.now() + (newTokens.expires_in * 1000),
            user_id: instance.user_id
          });

          req.bearerToken = newTokens.access_token;
          req.instanceId = instanceId;
          req.userId = instance.user_id;

          // Update usage tracking
          await updateInstanceUsage(instanceId);

          return next();
        } catch (refreshError) {
          console.error(`Failed to refresh Bearer token for instance ${instanceId}:`, refreshError);
          // Fall through to full OAuth exchange
        }
      }

      // Need to perform full OAuth exchange
      console.log(`🔐 Performing OAuth exchange for instance: ${instanceId}`);
      
      try {
        const tokenResponse = await exchangeOAuthForBearer({
          clientId: instance.client_id,
          clientSecret: instance.client_secret,
          scopes: [
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/userinfo.profile', 
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        });

        // Cache the Bearer token and refresh token
        setCachedCredential(instanceId, {
          bearerToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
          user_id: instance.user_id
        });

        req.bearerToken = tokenResponse.access_token;
        req.instanceId = instanceId;
        req.userId = instance.user_id;

        // Update usage tracking
        await updateInstanceUsage(instanceId);

        return next();

      } catch (oauthError) {
        console.error(`OAuth exchange failed for instance ${instanceId}:`, oauthError);
        return ErrorResponses.unauthorized(res, 'OAuth authentication failed', {
          instanceId,
          error: oauthError.message
        });
      }

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
 * @returns {Function} Express middleware function
 */
export function createLightweightAuthMiddleware() {
  return async (req, res, next) => {
    const { instanceId } = req.params;
    
    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      return ErrorResponses.badRequest(res, 'Invalid instance ID format', {
        instanceId,
        expectedFormat: 'UUID v4'
      });
    }

    try {
      // Quick database lookup without credential exchange
      const instance = await lookupInstanceCredentials(instanceId, 'gmail');
      
      if (!instance) {
        return ErrorResponses.notFound(res, 'Instance', {
          instanceId,
          service: 'gmail'
        });
      }

      // Basic validation
      if (!instance.service_active) {
        return ErrorResponses.serviceUnavailable(res, 'Gmail service is currently disabled', {
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
 * @returns {Function} Express middleware function
 */
export function createCachePerformanceMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Override res.json to capture response time
    const originalJson = res.json;
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