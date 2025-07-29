/**
 * @fileoverview Credential management utilities for Google Drive OAuth middleware
 */

/// <reference path="./types.js" />

const { getCachedCredential, setCachedCredential, updateCachedCredentialMetadata  } = require('../services/cache/index');
const { updateInstanceUsage  } = require('../services/database');

/**
 * Checks for cached credentials
 * @param {string} instanceId - Instance ID
 * @returns {import('./types.js').CachedCredential|null} Cached credential or null
 */
function checkCachedCredentials(instanceId) {
  return getCachedCredential(instanceId);
}

/**
 * Checks if cached credential has a bearer token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {boolean} Whether bearer token exists
 */
function hasCachedBearerToken(cachedCredential) {
  return !!(cachedCredential && cachedCredential.bearerToken);
}

/**
 * Sets up request with cached token
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
async function setupRequestWithCachedToken(req, cachedCredential, instanceId) {
  console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
  req.bearerToken = cachedCredential.bearerToken;
  req.instanceId = instanceId;
  req.userId = cachedCredential.user_id;
  
  // Update usage tracking asynchronously
  updateInstanceUsage(instanceId)
    .then(() => {
      console.log(`✅ Usage tracking updated for instance: ${instanceId}`);
    })
    .catch(err => {
      console.error(`❌ Failed to update usage tracking for instance ${instanceId}:`, err);
    });
}

/**
 * Gets token information from instance or cache
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {{refreshToken: string|undefined, accessToken: string|undefined, tokenExpiresAt: number|undefined}}
 */
function getTokenInfo(instance, cachedCredential) {
  const refreshToken = cachedCredential?.refreshToken || instance.refresh_token;
  const accessToken = instance.bearer_token;
  const tokenExpiresAt = instance.bearer_token_expires_at || instance.expires_at;
  
  return { refreshToken, accessToken, tokenExpiresAt };
}

/**
 * Checks if access token is still valid
 * @param {string|undefined} accessToken - Access token
 * @param {number|undefined} tokenExpiresAt - Token expiration timestamp
 * @returns {boolean} Whether token is valid
 */
function isAccessTokenValid(accessToken, tokenExpiresAt) {
  if (!accessToken || !tokenExpiresAt) return false;
  
  // Check if token expires in more than 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return tokenExpiresAt > fiveMinutesFromNow;
}

/**
 * Caches token and sets up request
 * @param {string} instanceId - Instance ID
 * @param {string} accessToken - Access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {string|undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential|null} existingCache - Existing cache
 * @returns {Promise<void>}
 */
async function cacheAndSetupToken(instanceId, accessToken, tokenExpiresAt, userId, req, refreshToken, existingCache) {
  // Cache the valid token
  setCachedCredential(instanceId, {
    bearerToken: accessToken,
    refreshToken: refreshToken || existingCache?.refreshToken,
    expiresAt: tokenExpiresAt,
    user_id: userId,
    last_used: Date.now(),
    refresh_attempts: 0,
    cached_at: existingCache?.cached_at || Date.now(),
    last_modified: Date.now(),
    status: 'active'
  });
  
  console.log(`✅ Cached valid access token for instance: ${instanceId}`);
  
  // Set up request
  req.bearerToken = accessToken;
  req.instanceId = instanceId;
  req.userId = userId;
  
  // Update usage tracking
  await updateInstanceUsage(instanceId);
}

/**
 * Sets up request for lightweight authentication (no token needed)
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {void}
 */
function setupLightweightRequest(req, instanceId, userId) {
  req.instanceId = instanceId;
  req.userId = userId;
}
module.exports = {
  checkCachedCredentials,
  hasCachedBearerToken,
  getTokenInfo,
  isAccessTokenValid,
  setupLightweightRequest,
  setupRequestWithCachedToken,
  cacheAndSetupToken
};