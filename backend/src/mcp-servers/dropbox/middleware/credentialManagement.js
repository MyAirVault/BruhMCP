/**
 * Credential management utilities for Dropbox OAuth token operations
 * Handles credential caching, token validation, and database operations
 */

/// <reference path="./types.js" />
const { getCachedCredential, setCachedCredential } = require('../services/credentialCache.js');
const { updateInstanceUsage } = require('../services/database.js');

/**
 * Check cached credentials for an instance
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').CachedCredential|undefined} Cached credential object or undefined if not found
 */
function checkCachedCredentials(instanceId) {
  const credential = getCachedCredential(instanceId);
  return /** @type {import('./types.js').CachedCredential | undefined} */ (credential || undefined);
}

/**
 * Validate if cached credentials have a valid bearer token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {cachedCredential is import('./types.js').CachedCredential} True if cached credential has valid bearer token
 */
function hasCachedBearerToken(cachedCredential) {
  return !!(cachedCredential && cachedCredential.bearerToken);
}

/**
 * Set up request with cached bearer token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - The cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
async function setupRequestWithCachedToken(req, cachedCredential, instanceId) {
  console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
  
  req.bearerToken = cachedCredential.bearerToken;
  req.instanceId = instanceId;
  req.userId = cachedCredential.user_id;
  
  // Update usage tracking asynchronously
  updateInstanceUsage(instanceId).catch((/** @type {Error} */ err) => {
    console.error('Failed to update usage tracking:', err);
  });
}

/**
 * Get token information from cached credentials or database instance
 * @param {import('./types.js').CachedCredential} [cachedCredential] - Cached credential object
 * @param {import('./types.js').DatabaseInstance} [instance] - Database instance record
 * @returns {{refreshToken: string, expiresAt: number} | undefined} Token information or undefined if not available
 */
function getTokenInfo(cachedCredential, instance) {
  if (cachedCredential && cachedCredential.refreshToken && cachedCredential.expiresAt) {
    return {
      refreshToken: cachedCredential.refreshToken,
      expiresAt: cachedCredential.expiresAt
    };
  }
  
  if (instance && instance.refresh_token && instance.token_expires_at) {
    return {
      refreshToken: instance.refresh_token,
      expiresAt: instance.token_expires_at.getTime()
    };
  }
  
  return undefined;
}

/**
 * Cache new tokens after successful refresh
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - New access token
 * @param {string} refreshToken - New refresh token
 * @param {number} expiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @returns {void}
 */
function cacheNewTokens(instanceId, accessToken, refreshToken, expiresAt, userId) {
  setCachedCredential(instanceId, /** @type {import('../../../types/dropbox.d.ts').CachedCredentials} */ ({
    bearerToken: accessToken,
    refreshToken: refreshToken,
    expiresAt: expiresAt,
    user_id: userId,
    last_used: new Date().toISOString(),
    refresh_attempts: 0,
    cached_at: new Date().toISOString(),
    last_modified: Date.now(),
    status: 'completed'
  }));
  
  console.log(`✅ Cached new Bearer token for instance: ${instanceId}`);
}

/**
 * Set up request with new tokens after refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} accessToken - New access token
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
async function setupRequestWithNewTokens(req, accessToken, instanceId, userId) {
  req.bearerToken = accessToken;
  req.instanceId = instanceId;
  req.userId = userId;
  
  // Update usage tracking asynchronously
  updateInstanceUsage(instanceId).catch((/** @type {Error} */ err) => {
    console.error('Failed to update usage tracking:', err);
  });
  
  console.log(`✅ Request setup with refreshed Bearer token for instance: ${instanceId}`);
}

/**
 * Check if token is expired or will expire soon
 * @param {number} expiresAt - Token expiration timestamp
 * @param {number} [bufferMinutes=10] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
function isTokenExpired(expiresAt, bufferMinutes = 10) {
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  const expiresSoon = expiresAt - now < bufferMs;
  
  if (expiresSoon) {
    const minutesLeft = Math.floor((expiresAt - now) / 60000);
    console.log(`⏰ Token expires in ${minutesLeft} minutes (considering expired due to ${bufferMinutes}min buffer)`);
  }
  
  return expiresSoon;
}

/**
 * Validate instance and user authorization
 * @param {import('./types.js').DatabaseInstance | null} instance - Database instance record
 * @param {string} expectedUserId - Expected user ID
 * @returns {boolean} True if instance exists and belongs to the user
 */
function validateInstanceOwnership(instance, expectedUserId) {
  if (!instance) {
    console.log(`❌ Instance not found in database`);
    return false;
  }
  
  if (instance.user_id !== expectedUserId) {
    console.log(`❌ Instance does not belong to user: ${expectedUserId}`);
    return false;
  }
  
  return true;
}

module.exports = {
  checkCachedCredentials,
  hasCachedBearerToken,
  setupRequestWithCachedToken,
  getTokenInfo,
  cacheNewTokens,
  setupRequestWithNewTokens,
  isTokenExpired,
  validateInstanceOwnership
};