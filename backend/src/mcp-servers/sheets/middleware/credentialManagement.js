/**
 * @fileoverview Credential management utilities for Google Sheets middleware
 * Handles credential caching and request setup
 */

/// <reference path="./types.js" />

import { getCachedCredential, setCachedCredential } from '../services/credentialCache.js';
import { updateInstanceUsage } from '../services/database.js';

/**
 * Check for cached credentials
 * @param {string} instanceId - Instance ID
 * @returns {import('./types.js').CachedCredential|null} Cached credential or null
 */
export function checkCachedCredentials(instanceId) {
	const credential = getCachedCredential(instanceId);
	if (!credential || typeof credential !== 'object') {
		return null;
	}
	
	// Type guard to ensure it has required properties
	if ('bearerToken' in credential && 
		'expiresAt' in credential && 
		'user_id' in credential &&
		typeof credential.bearerToken === 'string' &&
		typeof credential.expiresAt === 'number' &&
		typeof credential.user_id === 'string') {
		/** @type {import('./types.js').CachedCredential} */
		const result = {
			bearerToken: credential.bearerToken,
			expiresAt: credential.expiresAt,
			user_id: credential.user_id
		};
		return result;
	}
	
	return null;
}

/**
 * Check if cached credential has valid bearer token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {boolean} Whether credential has bearer token
 */
export function hasCachedBearerToken(cachedCredential) {
	return !!(cachedCredential && cachedCredential.bearerToken);
}

/**
 * Setup request with cached token
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {import('./types.js').CachedCredential} cachedCredential - Cached credential
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
export async function setupRequestWithCachedToken(req, cachedCredential, instanceId) {
	console.log(`✅ OAuth Bearer token cache hit for instance: ${instanceId}`);
	
	req.bearerToken = cachedCredential.bearerToken;
	req.instanceId = instanceId;
	req.userId = cachedCredential.user_id;
	req.oauth = {
		bearerToken: cachedCredential.bearerToken,
		instanceId: instanceId,
		userId: cachedCredential.user_id
	};
	
	// Update usage tracking asynchronously
	/** @type {Promise<boolean>} */
	const updatePromise = updateInstanceUsage(instanceId);
	updatePromise.catch(/** @param {Error} err */ (err) => {
		console.error('Failed to update usage tracking:', err);
	});
}

/**
 * Get token information from instance and cache
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Cached credential
 * @returns {import('./types.js').TokenInfo} Token information
 */
export function getTokenInfo(instance, cachedCredential) {
	const refreshToken = cachedCredential?.refreshToken || instance.refresh_token;
	const accessToken = cachedCredential?.bearerToken || instance.access_token;
	const tokenExpiresAt = cachedCredential?.expiresAt || 
		(instance.token_expires_at ? new Date(instance.token_expires_at).getTime() : null);

	return { refreshToken, accessToken, tokenExpiresAt };
}

/**
 * Check if access token is valid
 * @param {string|undefined} accessToken - Access token
 * @param {number|null} tokenExpiresAt - Token expiration timestamp
 * @returns {boolean} Whether token is valid
 */
export function isAccessTokenValid(accessToken, tokenExpiresAt) {
	return !!(accessToken && tokenExpiresAt && tokenExpiresAt > Date.now());
}

/**
 * Cache token and setup request
 * @param {string} instanceId - Instance ID
 * @param {string} accessToken - Access token
 * @param {number} tokenExpiresAt - Token expiration timestamp
 * @param {string} userId - User ID
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {string|undefined} refreshToken - Refresh token
 * @param {import('./types.js').CachedCredential|null} cachedCredential - Existing cached credential
 * @returns {Promise<void>}
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
			refreshToken: refreshToken,
			expiresAt: tokenExpiresAt,
			user_id: userId
		});
	}

	req.bearerToken = accessToken;
	req.instanceId = instanceId;
	req.userId = userId;
	req.oauth = {
		bearerToken: accessToken,
		instanceId: instanceId,
		userId: userId
	};

	// Update usage tracking
	await updateInstanceUsage(instanceId);
}

/**
 * Setup lightweight request (without OAuth)
 * @param {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} req - Express request
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 */
export function setupLightweightRequest(req, instanceId, userId) {
	req.instanceId = instanceId;
	req.userId = userId;
}