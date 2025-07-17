/**
 * OAuth Validation utilities for Notion MCP Service
 * Handles OAuth token validation and refresh operations
 */

import { fetch } from 'undici';
import { createOAuthError } from './oauth-error-handler.js';

/**
 * Exchange OAuth authorization code for Bearer token
 * @param {Object} params - OAuth exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token response
 */
export async function exchangeOAuthForBearer({ code, clientId, clientSecret, redirectUri }) {
	const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';

	try {
		const response = await fetch(`${oauthServiceUrl}/oauth/notion/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw createOAuthError(
				errorData.error || 'TOKEN_EXCHANGE_FAILED',
				`OAuth token exchange failed: ${response.status}`,
				{ statusCode: response.status, originalError: errorData }
			);
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_in: tokenData.expires_in || 3600,
			scope: tokenData.scope,
			token_type: tokenData.token_type || 'Bearer',
		};
	} catch (error) {
		if (error.errorType) {
			throw error;
		}
		throw createOAuthError('OAUTH_SERVICE_ERROR', 'Failed to start OAuth service', {
			originalError: error.message,
		});
	}
}

/**
 * Refresh Bearer token using OAuth service
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export async function refreshBearerToken({ refreshToken, clientId, clientSecret }) {
	const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';

	try {
		const response = await fetch(`${oauthServiceUrl}/oauth/notion/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			// Map OAuth error responses to standard error types
			const errorType = mapOAuthErrorType(errorData.error || 'UNKNOWN_ERROR');

			throw createOAuthError(errorType, `OAuth token refresh failed: ${response.status}`, {
				statusCode: response.status,
				originalError: errorData,
			});
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token || refreshToken,
			expires_in: tokenData.expires_in || 3600,
			scope: tokenData.scope,
			token_type: tokenData.token_type || 'Bearer',
		};
	} catch (error) {
		if (error.errorType) {
			throw error;
		}
		throw createOAuthError('OAUTH_SERVICE_ERROR', 'Failed to start OAuth service', {
			originalError: error.message,
		});
	}
}

/**
 * Refresh Bearer token using direct Notion OAuth API
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export async function refreshBearerTokenDirect({ refreshToken, clientId, clientSecret }) {
	try {
		const response = await fetch('https://api.notion.com/v1/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			// Map Notion OAuth error responses to standard error types
			const errorType = mapNotionOAuthErrorType(errorData.error || 'UNKNOWN_ERROR');

			throw createOAuthError(errorType, `Direct Notion OAuth refresh failed: ${response.status}`, {
				statusCode: response.status,
				originalError: errorData,
			});
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token || refreshToken,
			expires_in: tokenData.expires_in || 3600,
			scope: tokenData.scope,
			token_type: tokenData.token_type || 'Bearer',
		};
	} catch (error) {
		if (error.errorType) {
			throw error;
		}
		throw createOAuthError('DIRECT_OAUTH_ERROR', 'Direct Notion OAuth API error', { originalError: error.message });
	}
}

/**
 * Validate Bearer token with Notion API
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateBearerToken(bearerToken) {
	try {
		const response = await fetch('https://api.notion.com/v1/users/me', {
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				'Notion-Version': '2022-06-28',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			return {
				isValid: false,
				error: `Token validation failed: ${response.status}`,
				errorType: response.status === 401 ? 'INVALID_TOKEN' : 'VALIDATION_ERROR',
				statusCode: response.status,
				originalError: errorData,
			};
		}

		const userData = await response.json();

		return {
			isValid: true,
			user: userData,
			tokenType: 'Bearer',
		};
	} catch (error) {
		return {
			isValid: false,
			error: 'Token validation request failed',
			errorType: 'VALIDATION_REQUEST_ERROR',
			originalError: error.message,
		};
	}
}

/**
 * Map OAuth service error types to standard error types
 * @param {string} oauthError - OAuth error from service
 * @returns {string} Standard error type
 */
function mapOAuthErrorType(oauthError) {
	switch (oauthError) {
		case 'invalid_grant':
			return 'INVALID_GRANT';
		case 'invalid_client':
			return 'INVALID_CLIENT';
		case 'unauthorized_client':
			return 'UNAUTHORIZED_CLIENT';
		case 'invalid_request':
			return 'INVALID_REQUEST';
		case 'unsupported_grant_type':
			return 'UNSUPPORTED_GRANT_TYPE';
		case 'temporarily_unavailable':
			return 'TEMPORARILY_UNAVAILABLE';
		case 'server_error':
			return 'SERVER_ERROR';
		default:
			return 'UNKNOWN_ERROR';
	}
}

/**
 * Map Notion OAuth error types to standard error types
 * @param {string} notionError - Notion OAuth error
 * @returns {string} Standard error type
 */
function mapNotionOAuthErrorType(notionError) {
	switch (notionError) {
		case 'invalid_grant':
			return 'INVALID_GRANT';
		case 'invalid_client':
			return 'INVALID_CLIENT';
		case 'unauthorized_client':
			return 'UNAUTHORIZED_CLIENT';
		case 'invalid_request':
			return 'INVALID_REQUEST';
		case 'unsupported_grant_type':
			return 'UNSUPPORTED_GRANT_TYPE';
		default:
			return 'UNKNOWN_ERROR';
	}
}
