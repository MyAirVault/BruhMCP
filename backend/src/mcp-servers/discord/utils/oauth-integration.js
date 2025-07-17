/**
 * Discord OAuth Service Integration
 * Handles OAuth token refresh and service communication
 * Based on Gmail MCP service architecture
 */

import oauthServiceManager from '../../../services/oauth-service-manager.js';

/**
 * Refreshes Discord OAuth tokens using the OAuth service
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export async function refreshWithOAuthService(params) {
	const { refreshToken, clientId, clientSecret } = params;

	// Ensure OAuth service is running
	const serviceAvailable = await oauthServiceManager.ensureServiceRunning();
	if (!serviceAvailable) {
		throw new Error('OAuth service is not available');
	}

	try {
		console.log('🔄 Refreshing Discord OAuth tokens via OAuth service...');

		const response = await oauthServiceManager.makeOAuthServiceRequest('/exchange-refresh-token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				provider: 'discord',
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		});

		const tokenData = await response.json();

		if (!tokenData.success) {
			throw new Error(tokenData.error || 'Token refresh failed');
		}

		console.log('✅ Successfully refreshed Discord OAuth tokens');

		return {
			access_token: tokenData.tokens.access_token,
			refresh_token: tokenData.tokens.refresh_token || refreshToken,
			expires_in: tokenData.tokens.expires_in || 3600,
			token_type: tokenData.tokens.token_type || 'Bearer',
			scope: tokenData.tokens.scope,
		};
	} catch (error) {
		console.error('OAuth service refresh error:', error);

		if (error.circuitBreakerState) {
			throw new Error(`OAuth service unavailable: ${error.message}`);
		}

		// Try fallback to direct Discord API refresh
		console.log('🔄 Falling back to direct Discord API refresh...');
		return await refreshWithDiscordAPI(params);
	}
}

/**
 * Refreshes Discord OAuth tokens directly via Discord API
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export async function refreshWithDiscordAPI(params) {
	const { refreshToken, clientId, clientSecret } = params;

	try {
		console.log('🔄 Refreshing Discord OAuth tokens via Discord API...');

		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw new Error(`Discord API error: ${errorData.error || response.statusText}`);
		}

		const tokenData = await response.json();

		console.log('✅ Successfully refreshed Discord OAuth tokens via Discord API');

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token || refreshToken,
			expires_in: tokenData.expires_in || 3600,
			token_type: tokenData.token_type || 'Bearer',
			scope: tokenData.scope,
		};
	} catch (error) {
		console.error('Discord API refresh error:', error);
		throw error;
	}
}

/**
 * Refreshes bearer token for an instance
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<Object>} New token data
 */
export async function refreshBearerToken(params) {
	const { refreshToken, clientId, clientSecret } = params;

	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	if (!clientId || !clientSecret) {
		throw new Error('Missing client credentials for token refresh');
	}

	try {
		// Try OAuth service first, fall back to direct API
		return await refreshWithOAuthService({
			refreshToken,
			clientId,
			clientSecret,
		});
	} catch (error) {
		console.error('Token refresh failed:', error);
		throw new Error(`Failed to refresh Discord OAuth token: ${error.message}`);
	}
}

/**
 * Validates Discord OAuth token
 * @param {string} accessToken - Access token to validate
 * @returns {Promise<Object>} Token validation result
 */
export async function validateOAuthToken(accessToken) {
	try {
		const response = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			return {
				valid: false,
				error: `Token validation failed: ${response.status} ${response.statusText}`,
			};
		}

		const userData = await response.json();

		return {
			valid: true,
			user_id: userData.id,
			username: userData.username,
			discriminator: userData.discriminator,
			avatar: userData.avatar,
			bot: userData.bot || false,
			verified: userData.verified,
			email: userData.email,
		};
	} catch (error) {
		return {
			valid: false,
			error: `Token validation error: ${error.message}`,
		};
	}
}

/**
 * Gets Discord OAuth authorization URL
 * @param {Object} params - OAuth parameters
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.redirectUri - Redirect URI
 * @param {Array<string>} params.scopes - OAuth scopes
 * @param {string} params.state - State parameter
 * @returns {string} Authorization URL
 */
export function getOAuthAuthorizationUrl(params) {
	const { clientId, redirectUri, scopes, state } = params;

	const authUrl = new URL('https://discord.com/api/oauth2/authorize');
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', scopes.join(' '));
	authUrl.searchParams.set('state', state);

	return authUrl.toString();
}

/**
 * Exchanges authorization code for tokens
 * @param {Object} params - Exchange parameters
 * @param {string} params.code - Authorization code
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @param {string} params.redirectUri - Redirect URI
 * @returns {Promise<Object>} Token data
 */
export async function exchangeCodeForTokens(params) {
	const { code, clientId, clientSecret, redirectUri } = params;

	try {
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
			throw new Error(`Discord OAuth error: ${errorData.error || response.statusText}`);
		}

		const tokenData = await response.json();

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_in: tokenData.expires_in,
			token_type: tokenData.token_type,
			scope: tokenData.scope,
		};
	} catch (error) {
		console.error('Code exchange error:', error);
		throw error;
	}
}

/**
 * Revokes Discord OAuth token
 * @param {Object} params - Revoke parameters
 * @param {string} params.token - Token to revoke
 * @param {string} params.clientId - Discord client ID
 * @param {string} params.clientSecret - Discord client secret
 * @returns {Promise<boolean>} Success status
 */
export async function revokeOAuthToken(params) {
	const { token, clientId, clientSecret } = params;

	try {
		const response = await fetch('https://discord.com/api/oauth2/token/revoke', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				token,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		});

		return response.ok;
	} catch (error) {
		console.error('Token revocation error:', error);
		return false;
	}
}

/**
 * Gets current user information using OAuth token
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} User information
 */
export async function getCurrentUser(accessToken) {
	try {
		const response = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Get current user error:', error);
		throw error;
	}
}

/**
 * Gets user's guilds using OAuth token
 * @param {string} accessToken - Access token
 * @returns {Promise<Array>} User's guilds
 */
export async function getUserGuilds(accessToken) {
	try {
		const response = await fetch('https://discord.com/api/users/@me/guilds', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to get user guilds: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Get user guilds error:', error);
		throw error;
	}
}
