/**
 * Credential management utilities for OAuth token operations
 * Handles credential caching, token validation, and database operations
 */

/// <reference path="./types.js" />
import { getCachedCredential, setCachedCredential } from '../services/credentialCache.js';
import { updateInstanceUsage } from '../services/database.js';

/**
 * Check cached credentials for an instance
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').CachedCredential|undefined} Cached credential object or undefined if not found
 */
export function checkCachedCredentials(instanceId) {
  const credential = getCachedCredential(instanceId);
  return /** @type {import('./types.js').CachedCredential | undefined} */ (credential || undefined);
}

/**
 * Validate if cached credentials have a valid bearer token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {cachedCredential is import('./types.js').CachedCredential} True if cached credential has valid bearer token
 */
export function hasCachedBearerToken(cachedCredential) {
  return !!(cachedCredential && cachedCredential.bearerToken);
}

/**
 * Set up request with cached bearer token and update usage
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {import('./types.js').CachedCredential} cachedCredential - The cached credential object
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export async function setupRequestWithCachedToken(req, cachedCredential, instanceId) {
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
 * @param {import('./types.js').DatabaseInstance} instance - The database instance object
 * @param {import('./types.js').CachedCredential} [cachedCredential] - The cached credential object
 * @returns {import('./types.js').TokenInfo} Object containing token information
 */
export function getTokenInfo(instance, cachedCredential) {
  const refreshToken = cachedCredential?.refreshToken || instance.refresh_token;
  const accessToken = cachedCredential?.bearerToken || instance.access_token;
  const tokenExpiresAt = cachedCredential?.expiresAt || 
    (instance.token_expires_at ? new Date(instance.token_expires_at).getTime() : undefined);

  return {
    refreshToken,
    accessToken,
    tokenExpiresAt
  };
}

/**
 * Check if an access token is still valid
 * @param {string} [accessToken] - The access token
 * @param {number} [tokenExpiresAt] - Token expiration timestamp
 * @returns {boolean} True if token is valid and not expired
 */
export function isAccessTokenValid(accessToken, tokenExpiresAt) {
  return !!(accessToken && tokenExpiresAt && tokenExpiresAt > Date.now());
}

/**
 * Cache access token if not already cached and set up request
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - Associated user ID
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} [refreshToken] - The refresh token
 * @param {import('./types.js').CachedCredential} [cachedCredential] - Existing cached credential
 * @returns {Promise<void>} Promise that resolves when caching and setup is complete
 */
export async function cacheAndSetupToken(
  instanceId, 
  accessToken, 
  tokenExpiresAt, 
  userId, 
  req,
  refreshToken, 
  cachedCredential
) {
  console.log(`✅ Using valid access token for instance: ${instanceId}`);
  
  // Cache the token if it wasn't cached before
  if (!cachedCredential) {
    setCachedCredential(instanceId, {
      bearerToken: accessToken,
      refreshToken: refreshToken || '',
      expiresAt: tokenExpiresAt,
      user_id: userId
    });
  }

  req.bearerToken = accessToken;
  req.instanceId = instanceId;
  req.userId = userId;

  // Update usage tracking
  updateInstanceUsage(instanceId).catch((/** @type {Error} */ err) => {
    console.error('Failed to update usage tracking:', err);
  });
}

/**
 * Cache new tokens after successful refresh
 * @param {string} instanceId - The instance ID
 * @param {string} accessToken - The new access token
 * @param {string} refreshToken - The refresh token (new or existing)
 * @param {number} expiresAt - Token expiration timestamp
 * @param {string} userId - Associated user ID
 * @returns {void}
 */
export function cacheNewTokens(instanceId, accessToken, refreshToken, expiresAt, userId) {
  setCachedCredential(instanceId, {
    bearerToken: accessToken,
    refreshToken: refreshToken,
    expiresAt: expiresAt,
    user_id: userId
  });
}

/**
 * Set up request with new tokens after refresh
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} accessToken - The new access token
 * @param {string} instanceId - The instance ID
 * @param {string} userId - Associated user ID
 * @returns {Promise<void>} Promise that resolves when setup is complete
 */
export async function setupRequestWithNewTokens(req, accessToken, instanceId, userId) {
  req.bearerToken = accessToken;
  req.instanceId = instanceId;
  req.userId = userId;

  // Update usage tracking
  updateInstanceUsage(instanceId).catch((/** @type {Error} */ err) => {
    console.error('Failed to update usage tracking:', err);
  });
}

/**
 * Set up lightweight request for non-critical endpoints
 * @param {import('./types.js').ExpressRequest} req - Express request object
 * @param {string} instanceId - The instance ID
 * @param {string} userId - Associated user ID
 * @returns {void}
 */
export function setupLightweightRequest(req, instanceId, userId) {
  req.instanceId = instanceId;
  req.userId = userId;
}