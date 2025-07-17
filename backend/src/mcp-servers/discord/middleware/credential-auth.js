/**
 * Discord Credential Authentication Middleware
 * Enterprise-grade authentication with database integration and token refresh
 * Based on Gmail MCP service architecture
 */

import { getCachedCredential, setCachedCredential } from '../services/credential-cache.js';
import {
	lookupInstanceCredentials,
	updateInstanceUsage,
	tokenNeedsRefresh,
	updateInstanceCredentials,
	markInstanceForReauth,
	logApiOperation,
	createTokenAuditLog,
} from '../services/database.js';
import { refreshBearerToken } from '../utils/oauth-integration.js';
import { handleOAuthError } from '../utils/oauth-error-handler.js';
import { validateInstanceId } from '../utils/oauth-validation.js';
import { recordTokenRefreshMetrics } from '../utils/token-metrics.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Creates Discord credential authentication middleware
 * @returns {Function} Express middleware function
 */
export function createCredentialAuthMiddleware() {
	return async (req, res, next) => {
		const { instanceId } = req.params;

		try {
			// Validate instance ID format
			const instanceValidation = validateInstanceId(instanceId);
			if (!instanceValidation.valid) {
				return ErrorResponses.badRequest(res, instanceValidation.error, {
					instanceId,
					service: 'discord',
				});
			}

			// Check credential cache first (fast path)
			let cachedCredential = getCachedCredential(instanceId);

			if (cachedCredential && cachedCredential.bearerToken) {
				console.log(`✅ Using cached credential for instance: ${instanceId}`);

				req.bearerToken = cachedCredential.bearerToken;
				req.instanceId = instanceId;
				req.userId = cachedCredential.user_id;
				req.tokenType = cachedCredential.tokenType || 'Bearer';
				req.scope = cachedCredential.scope || 'identify';

				// Update usage statistics
				await updateInstanceUsage(instanceId);

				return next();
			}

			console.log(`🔍 Cache miss, looking up instance credentials: ${instanceId}`);

			// Cache miss - lookup from database
			const instance = await lookupInstanceCredentials(instanceId, 'discord');

			if (!instance) {
				await logApiOperation(instanceId, 'AUTH_FAILED', {
					reason: 'INSTANCE_NOT_FOUND',
				});

				// Create audit log entry for instance not found
				createTokenAuditLog({
					instanceId,
					operation: 'validate',
					status: 'failure',
					metadata: {
						service: 'discord',
						reason: 'INSTANCE_NOT_FOUND',
						message: 'Instance not found or not properly configured',
					},
				});

				return ErrorResponses.notFound(res, 'Instance', {
					instanceId,
					service: 'discord',
					metadata: {
						message: 'Instance not found or not properly configured',
						possibleCauses: [
							'Instance ID does not exist',
							'Instance is not active',
							'OAuth setup is incomplete',
						],
					},
				});
			}

			// Check if instance requires re-authentication
			if (instance.oauth_status !== 'completed') {
				await logApiOperation(instanceId, 'AUTH_FAILED', {
					reason: 'OAUTH_INCOMPLETE',
					status: instance.oauth_status,
				});

				// Create audit log entry for incomplete authentication
				createTokenAuditLog({
					instanceId,
					operation: 'validate',
					status: 'failure',
					metadata: {
						service: 'discord',
						reason: 'OAUTH_INCOMPLETE',
						oauthStatus: instance.oauth_status,
						message: 'OAuth authentication incomplete',
					},
				});

				return ErrorResponses.unauthorized(res, 'OAuth authentication incomplete', {
					instanceId,
					service: 'discord',
					metadata: {
						oauthStatus: instance.oauth_status,
						message: 'Please complete OAuth authentication',
					},
				});
			}

			// Check if instance is active
			if (instance.status !== 'active') {
				await logApiOperation(instanceId, 'AUTH_FAILED', {
					reason: 'INSTANCE_INACTIVE',
					status: instance.status,
				});

				return ErrorResponses.forbidden(res, 'Instance is not active', {
					instanceId,
					service: 'discord',
					metadata: {
						instanceStatus: instance.status,
						message: 'Instance has been deactivated',
					},
				});
			}

			// Check if token needs refresh
			if (tokenNeedsRefresh(instance)) {
				console.log(`🔄 Token needs refresh for instance: ${instanceId}`);

				if (!instance.refresh_token) {
					console.log(`⚠️  No refresh token available for instance: ${instanceId}`);
					await markInstanceForReauth(instanceId, 'NO_REFRESH_TOKEN');

					return ErrorResponses.unauthorized(res, 'Authentication expired', {
						instanceId,
						service: 'discord',
						metadata: {
							message: 'Your Discord authentication has expired. Please re-authenticate.',
							requiresReauth: true,
						},
					});
				}

				// Attempt token refresh with dual-method approach
				const refreshStartTime = Date.now();
				let newTokens;
				let usedMethod = 'unknown';
				
				try {

					try {
						newTokens = await refreshBearerToken({
							refreshToken: instance.refresh_token,
							clientId: instance.client_id,
							clientSecret: instance.client_secret,
						});
						usedMethod = 'oauth_service';
					} catch (oauthServiceError) {
						// Fallback to direct Discord OAuth
						const { refreshWithDiscordAPI } = await import('../utils/oauth-integration.js');
						newTokens = await refreshWithDiscordAPI({
							refreshToken: instance.refresh_token,
							clientId: instance.client_id,
							clientSecret: instance.client_secret,
						});
						usedMethod = 'direct_oauth';
					}

					// Validate newTokens response
					if (!newTokens || !newTokens.access_token) {
						throw new Error('Invalid token response from Discord OAuth service');
					}

					// Calculate new expiration time
					const expiresIn = newTokens.expires_in || 3600; // Default to 1 hour if not provided
					const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

					// Update database with new tokens
					await updateInstanceCredentials(instanceId, {
						access_token: newTokens.access_token,
						refresh_token: newTokens.refresh_token || instance.refresh_token,
						token_expires_at: newExpiresAt,
					});

					// Update cache with new tokens
					setCachedCredential(instanceId, {
						bearerToken: newTokens.access_token,
						refreshToken: newTokens.refresh_token || instance.refresh_token,
						expiresAt: newExpiresAt.getTime(),
						user_id: instance.user_id,
						tokenType: newTokens.token_type || 'Bearer',
						scope: newTokens.scope || instance.scope,
					});

					// Use refreshed token
					cachedCredential = getCachedCredential(instanceId);

					await logApiOperation(instanceId, 'TOKEN_REFRESH_SUCCESS', {
						middleware: true,
						expires_in: expiresIn,
						method: usedMethod,
					});

					// Create audit log entry for successful token refresh
					createTokenAuditLog({
						instanceId,
						operation: 'refresh',
						status: 'success',
						metadata: {
							service: 'discord',
							expires_in: expiresIn,
							token_type: newTokens.token_type || 'Bearer',
							scope: newTokens.scope || instance.scope,
						},
					});

					console.log(`✅ Successfully refreshed token for instance: ${instanceId}`);

					// Record successful token refresh metrics
					const refreshEndTime = Date.now();
					recordTokenRefreshMetrics(
						instanceId,
						usedMethod,
						true, // success
						null, // errorType
						null, // errorMessage
						refreshStartTime,
						refreshEndTime
					);
				} catch (refreshError) {
					console.error(`❌ Token refresh failed for instance ${instanceId}:`, refreshError);

					// Record failed token refresh metrics
					const refreshEndTime = Date.now();
					recordTokenRefreshMetrics(
						instanceId,
						usedMethod,
						false, // success
						'TOKEN_REFRESH_FAILED', // errorType
						refreshError.message || 'Unknown error', // errorMessage
						refreshStartTime,
						refreshEndTime
					);

					const errorResponse = handleOAuthError(refreshError, instanceId, 'TOKEN_REFRESH');

					// Create audit log entry for failed token refresh
					createTokenAuditLog({
						instanceId,
						operation: 'refresh',
						status: 'failure',
						metadata: {
							service: 'discord',
							error: refreshError instanceof Error ? refreshError.message : String(refreshError),
							errorType: errorResponse?.error?.type || 'UNKNOWN_ERROR',
							requiresReauth: errorResponse?.error?.requiresReauth || false,
						},
					});

					if (errorResponse.error.requiresReauth) {
						await markInstanceForReauth(instanceId, 'REFRESH_FAILED');

						return ErrorResponses.unauthorized(res, errorResponse.error.message, {
							instanceId,
							service: 'discord',
							metadata: {
								...errorResponse.metadata,
								requiresReauth: true,
							},
						});
					}

					// Return temporary error for retryable errors
					if (errorResponse.error.shouldRetry) {
						return res.status(errorResponse.error.httpStatus).json({
							success: false,
							error: errorResponse.error.message,
							retryAfter: errorResponse.error.retryAfter,
							metadata: errorResponse.metadata,
						});
					}

					// Return general error for non-retryable errors
					return ErrorResponses.internal(res, 'Token refresh failed', {
						instanceId,
						service: 'discord',
						metadata: errorResponse.metadata,
					});
				}
			}

			// Use current token (either from DB or refreshed)
			if (!cachedCredential) {
				// Cache the current token if not already cached
				setCachedCredential(instanceId, {
					bearerToken: instance.access_token,
					refreshToken: instance.refresh_token,
					expiresAt: instance.token_expires_at ? new Date(instance.token_expires_at).getTime() : null,
					user_id: instance.user_id,
					tokenType: instance.token_type || 'Bearer',
					scope: instance.scope,
				});

				cachedCredential = getCachedCredential(instanceId);
			}

			// Validate we have a bearer token
			if (!cachedCredential || !cachedCredential.bearerToken) {
				await logApiOperation(instanceId, 'AUTH_FAILED', {
					reason: 'NO_BEARER_TOKEN',
				});

				return ErrorResponses.unauthorized(res, 'No valid access token', {
					instanceId,
					service: 'discord',
					metadata: {
						message: 'No valid access token found. Please re-authenticate.',
					},
				});
			}

			// Attach authentication data to request
			req.bearerToken = cachedCredential.bearerToken;
			req.instanceId = instanceId;
			req.userId = cachedCredential.user_id;
			req.tokenType = cachedCredential.tokenType || 'Bearer';
			req.scope = cachedCredential.scope || 'identify';

			// Update usage statistics
			await updateInstanceUsage(instanceId);

			// Log successful authentication
			await logApiOperation(instanceId, 'AUTH_SUCCESS', {
				middleware: true,
				tokenType: cachedCredential.tokenType || 'Bearer',
			});

			// Create audit log entry for successful authentication
			createTokenAuditLog({
				instanceId,
				operation: 'validate',
				status: 'success',
				metadata: {
					service: 'discord',
					tokenType: cachedCredential.tokenType || 'Bearer',
					scope: cachedCredential.scope || 'identify',
					authenticated: true,
				},
			});

			console.log(`✅ Discord authentication successful for instance: ${instanceId}`);
			return next();
		} catch (error) {
			console.error('Discord credential auth middleware error:', error);

			const errorMessage = error instanceof Error ? error.message : String(error);

			await logApiOperation(instanceId, 'AUTH_ERROR', {
				middleware: true,
				error: errorMessage,
			});

			return ErrorResponses.internal(res, 'Authentication system error', {
				instanceId: instanceId,
				service: 'discord',
				metadata: {
					errorMessage,
					step: 'credential_authentication',
				},
			});
		}
	};
}

/**
 * Creates lightweight Discord authentication middleware (for health checks)
 * @returns {Function} Express middleware function
 */
export function createLightweightCredentialAuthMiddleware() {
	return async (req, res, next) => {
		const { instanceId } = req.params;

		try {
			// Validate instance ID format
			const instanceValidation = validateInstanceId(instanceId);
			if (!instanceValidation.valid) {
				return ErrorResponses.badRequest(res, instanceValidation.error, {
					instanceId,
					service: 'discord',
				});
			}

			// Check if instance exists in database
			const instance = await lookupInstanceCredentials(instanceId, 'discord');

			if (!instance) {
				return ErrorResponses.notFound(res, 'Instance', {
					instanceId,
					service: 'discord',
				});
			}

			// Basic validation - just check if we have some form of auth
			if (!instance.access_token && !req.headers.authorization) {
				return ErrorResponses.unauthorized(res, 'No authentication provided', {
					instanceId,
					service: 'discord',
				});
			}

			// Attach minimal auth data
			req.instanceId = instanceId;
			req.userId = instance.user_id;

			return next();
		} catch (error) {
			console.error('Discord lightweight auth middleware error:', error);

			return ErrorResponses.internal(res, 'Authentication system error', {
				instanceId: instanceId,
				service: 'discord',
				metadata: {
					errorMessage: error.message,
					step: 'lightweight_authentication',
				},
			});
		}
	};
}
