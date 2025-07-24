/**
 * @fileoverview OAuth Credential Authentication Middleware for Google Sheets MCP Service
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
	logRefreshFallback 
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
			const instance = /** @type {import('./types.js').DatabaseInstance|null} */ (
				await lookupInstanceCredentials(instanceId, 'sheets')
			);
			
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
						logSuccessfulTokenRefresh(instanceId, refreshResult.method || 'oauth_handler', 0);
						return next();
					}
					
					// Handle refresh failure
					const errorDetails = handleRefreshFailure(instanceId, refreshResult.error);
					
					if (errorDetails.requiresReauth) {
						return createRefreshFailureResponse(res, instanceId, errorDetails);
					}
					
					// For other errors, fall through to full OAuth exchange
					logRefreshFallback(refreshResult.error);
					
				} catch (error) {
					logFailedTokenRefresh(instanceId, 'oauth_handler', error, 0);
					return createSystemErrorResponse(res, instanceId, error);
				}
			}

			// Need to perform full OAuth exchange
			logReauthenticationRequired(instanceId, {
				hasRefreshToken: !!refreshToken,
				hasAccessToken: !!accessToken,
				tokenExpired: tokenExpiresAt ? tokenExpiresAt <= Date.now() : true
			});
			
			return createReauthenticationResponse(res, instanceId);

		} catch (error) {
			return createSystemErrorResponse(res, instanceId, error);
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
			const instance = await lookupInstanceCredentials(instanceId, 'sheets');
			
			// Basic validation without OAuth check
			const validation = validateInstance(instance, res, instanceId, false);
			if (!validation.isValid) {
				return validation.errorResponse;
			}

			setupLightweightRequest(req, instanceId, instance.user_id);
			return next();

		} catch (error) {
			return createLightweightSystemErrorResponse(res, instanceId, error);
		}
	};
}

/**
 * Create cache performance monitoring middleware (development only)
 * @returns {import('express').RequestHandler} Express middleware function
 */
export function createCachePerformanceMiddleware() {
	/**
	 * @param {import('./types.js').ExpressRequest} req - Express request object
	 * @param {import('./types.js').ExpressResponse} res - Express response object
	 * @param {import('./types.js').ExpressNext} next - Express next function
	 */
	return async (req, res, next) => {
		const start = Date.now();
		
		// Log cache performance on response finish
		res.on('finish', () => {
			const duration = Date.now() - start;
			if (duration > 1000) {
				console.warn(`⚠️ Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
			}
		});
		
		next();
	};
}