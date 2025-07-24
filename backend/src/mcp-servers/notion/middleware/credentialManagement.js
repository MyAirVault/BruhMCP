/**
 * Credential management utilities for Notion OAuth authentication
 * Handles token caching, validation, and request setup
 */

/// <reference path="./types.js" />

import { 
  getCachedCredential, 
  setCachedCredential,
  updateCachedCredentialMetadata 
} from '../services/credentialCache.js';
import { updateInstanceUsage } from '../services/database.js';

/**
 * Check for cached credentials
 * @param {string} instanceId - The instance ID to check
 * @returns {import('./types.js').CachedCredential | null} Cached credential or null
 */
export function checkCachedCredentials(instanceId) {
  return getCachedCredential(instanceId);
}

/**
 * Check if cached credential has a valid bearer token
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Cached credential object
 * @returns {boolean} True if has valid bearer token
 */
export function hasCachedBearerToken(cachedCredential) {
  return !!(cachedCredential && cachedCredential.bearerToken);
}

/**
 * Setup request with cached token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export async function setupRequestWithCachedToken(req, cachedCredential, instanceId) {
  console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`, {
    tokenLength: cachedCredential.bearerToken.length,
    tokenPrefix: cachedCredential.bearerToken.substring(0, 10) + '...',
    hasRefreshToken: !!cachedCredential.refreshToken,
    expiresAt: cachedCredential.expiresAt
  });

  req.bearerToken = cachedCredential.bearerToken;
  req.instanceId = instanceId;
  req.userId = cachedCredential.user_id;

  // Update usage tracking asynchronously
  updateInstanceUsage(instanceId).catch(err => {
    console.error('Failed to update usage tracking:', err);
  });
}

/**
 * Get token information from instance or cached credential
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Cached credential object
 * @returns {Object} Token information
 * @returns {string | undefined} returns.refreshToken - Refresh token
 * @returns {string | undefined} returns.accessToken - Access token
 * @returns {number | null} returns.tokenExpiresAt - Token expiration timestamp
 */
export function getTokenInfo(instance, cachedCredential) {
  const refreshToken = cachedCredential?.refreshToken || instance.refresh_token;
  const accessToken = cachedCredential?.bearerToken || instance.access_token;
  const tokenExpiresAt = cachedCredential?.expiresAt || 
    (instance.token_expires_at ? new Date(instance.token_expires_at).getTime() : null);

  return { refreshToken, accessToken, tokenExpiresAt };
}

/**
 * Check if access token is still valid (Notion tokens don't expire)
 * @param {string | undefined} accessToken - Access token to check
 * @param {number | null} tokenExpiresAt - Token expiration timestamp
 * @param {string} serviceName - Service name (defaults to 'notion')
 * @returns {boolean} True if token is valid
 */
export function isAccessTokenValid(accessToken, tokenExpiresAt, serviceName = 'notion') {
  if (!accessToken) return false;
  
  // For Notion, tokens don't expire, so if we have an access token, use it
  if (serviceName === 'notion') {
    return true;
  }
  
  // For other services, check if token is still valid
  return !!(tokenExpiresAt && tokenExpiresAt > Date.now());
}

/**
 * Cache token and setup request
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - Access token to cache
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string | undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential | null} cachedCredential - Existing cached credential
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export async function cacheAndSetupToken(instanceId, accessToken, tokenExpiresAt, userId, req, refreshToken, cachedCredential) {
  console.log(`✅ Using valid access token for instance: ${instanceId}`);

  // Cache the token if it wasn't cached before
  if (!cachedCredential) {
    setCachedCredential(instanceId, {
      bearerToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: tokenExpiresAt,
      user_id: userId,
    });
  }

  req.bearerToken = accessToken;
  req.instanceId = instanceId;
  req.userId = userId;

  // Update usage tracking
  await updateInstanceUsage(instanceId);
}

/**
 * Cache new tokens from refresh operation
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} userId - User ID
 * @returns {void}
 */
export function cacheNewTokens(instanceId, newTokens, userId) {
  const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
  
  setCachedCredential(instanceId, {
    bearerToken: newTokens.access_token,
    refreshToken: newTokens.refresh_token,
    expiresAt: newExpiresAt.getTime(),
    user_id: userId,
  });
}

/**
 * Setup request with new tokens from refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').NewTokens} newTokens - New tokens from refresh
 * @param {string} userId - User ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export async function setupRequestWithNewTokens(req, instanceId, newTokens, userId) {
  req.bearerToken = newTokens.access_token;
  req.instanceId = instanceId;
  req.userId = userId;

  // Update usage tracking
  await updateInstanceUsage(instanceId);
}

/**
 * Setup lightweight request for non-critical endpoints
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @returns {void}
 */
export function setupLightweightRequest(req, instanceId, userId) {
  req.instanceId = instanceId;
  req.userId = userId;
}

export default {
  checkCachedCredentials,
  hasCachedBearerToken,
  setupRequestWithCachedToken,
  getTokenInfo,
  isAccessTokenValid,
  cacheAndSetupToken,
  cacheNewTokens,
  setupRequestWithNewTokens,
  setupLightweightRequest
};