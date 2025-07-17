/**
 * OAuth Integration utilities for Notion MCP Service
 * Handles OAuth flow integration with external OAuth service
 */

import { fetch } from 'undici';

/**
 * Exchange authorization code for access token using OAuth service
 * @param {Object} params - OAuth exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token response
 */
export async function exchangeAuthCodeForToken({ code, clientId, clientSecret, redirectUri }) {
	const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';

	try {
		const response = await fetch(`${oauthServiceUrl}/oauth/token`, {
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
			throw new Error(`OAuth service error: ${response.status} - ${errorData.error || 'Unknown error'}`);
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
		console.error('OAuth token exchange failed:', error);
		throw error;
	}
}

/**
 * Refresh access token using OAuth service
 * @param {Object} params - Token refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Promise<Object>} New token response
 */
export async function refreshAccessToken({ refreshToken, clientId, clientSecret }) {
	const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';

	try {
		const response = await fetch(`${oauthServiceUrl}/oauth/refresh`, {
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
			throw new Error(`OAuth refresh error: ${response.status} - ${errorData.error || 'Unknown error'}`);
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token || refreshToken, // Keep old refresh token if new one not provided
			expires_in: tokenData.expires_in || 3600,
			scope: tokenData.scope,
			token_type: tokenData.token_type || 'Bearer',
		};
	} catch (error) {
		console.error('OAuth token refresh failed:', error);
		throw error;
	}
}

/**
 * Get OAuth authorization URL
 * @param {Object} params - Authorization parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.redirectUri - Redirect URI
 * @param {string} params.scope - Requested scopes
 * @param {string} params.state - State parameter for CSRF protection
 * @returns {string} Authorization URL
 */
export function getAuthorizationUrl({ clientId, redirectUri, scope, state }) {
	const notionAuthUrl = 'https://api.notion.com/v1/oauth/authorize';
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		state: state,
		scope: scope || 'read,write',
	});

	return `${notionAuthUrl}?${params.toString()}`;
}

/**
 * Validate OAuth callback parameters
 * @param {Object} params - Callback parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.state - State parameter
 * @param {string} params.error - Error parameter
 * @returns {Object} Validation result
 */
export function validateOAuthCallback({ code, state, error }) {
	if (error) {
		return {
			isValid: false,
			error: `OAuth error: ${error}`,
			errorType: 'OAUTH_ERROR',
		};
	}

	if (!code) {
		return {
			isValid: false,
			error: 'Missing authorization code',
			errorType: 'MISSING_CODE',
		};
	}

	if (!state) {
		return {
			isValid: false,
			error: 'Missing state parameter',
			errorType: 'MISSING_STATE',
		};
	}

	return {
		isValid: true,
		code,
		state,
	};
}
