/**
 * @fileoverview Reddit OAuth Handler
 * Implements OAuth flow for Reddit MCP service
 */

import fetch from 'node-fetch';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */

/**
 * Reddit OAuth Handler Class
 * Implements OAuth 2.0 flow for Reddit service
 */
class RedditOAuthHandler {
	constructor() {
		this.redirectUri = `${process.env.PUBLIC_DOMAIN || 'http://localhost:5000'}/api/v1/auth-registry/callback/reddit`;
		this.scopes = ['identity', 'read', 'vote', 'submit', 'flair', 'edit'];
		this.authorizationEndpoint = 'https://www.reddit.com/api/v1/authorize';
		this.tokenEndpoint = 'https://www.reddit.com/api/v1/access_token';
	}

	/**
	 * Initiates OAuth flow for Reddit
	 * @param {string} instanceId - MCP instance ID
	 * @param {string} userId - User ID for authentication
	 * @param {AuthCredentials} credentials - OAuth credentials (client_id, client_secret)
	 * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
	 */
	async initiateFlow(instanceId, userId, credentials) {
		try {
			const { client_id, client_secret } = credentials;

			if (!client_id || !client_secret) {
				throw new Error('Missing required OAuth credentials: client_id and client_secret');
			}

			// Generate state parameter with instance ID and user ID
			const state = Buffer.from(
				JSON.stringify({
					instanceId,
					userId,
					timestamp: Date.now(),
					service: 'reddit',
				})
			).toString('base64');

			// Build authorization URL
			const authParams = new URLSearchParams({
				client_id,
				response_type: 'code',
				state,
				redirect_uri: this.redirectUri,
				duration: 'permanent', // Request permanent access (refresh token)
				scope: this.scopes.join(' '),
			});

			const authUrl = `${this.authorizationEndpoint}?${authParams.toString()}`;

			console.log(`🔐 Generated Reddit OAuth URL for instance ${instanceId}`);

			return {
				authUrl,
				state,
				instanceId,
			};
		} catch (error) {
			console.error('Failed to initiate Reddit OAuth flow:', error);
			throw new Error(`OAuth initiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Handles OAuth callback and exchanges code for tokens
	 * @param {string} code - OAuth authorization code
	 * @param {string} state - OAuth state parameter
	 * @returns {Promise<OAuthCallbackResult>} Callback processing result
	 */
	async handleCallback(code, state) {
		try {
			// Parse state to get instance info
			const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
			const { instanceId, userId } = stateData;

			if (!instanceId || !userId) {
				throw new Error('Invalid state: missing instance ID or user ID');
			}

			// Get stored credentials for this instance
			const mcpCrud = await import('../../../db/queries/mcpInstances/crud.js');
			const { getMCPInstanceById } = mcpCrud;
			const instance = await getMCPInstanceById(instanceId, userId);

			if (!instance || !instance.client_id || !instance.client_secret) {
				throw new Error('Instance not found or missing credentials');
			}

			const { client_id, client_secret } = {
				client_id: instance.client_id,
				client_secret: instance.client_secret,
			};

			// Exchange code for tokens
			const tokenParams = new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: this.redirectUri,
			});

			const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

			const response = await fetch(this.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${basicAuth}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'MinimCP:Reddit:v1.0.0 (by /u/minimcp)',
				},
				body: tokenParams,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
			}

			const tokens = await response.json();

			if (!tokens.access_token) {
				throw new Error('Failed to obtain access token');
			}

			console.log(`✅ Reddit OAuth callback successful for instance ${instanceId}`);

			return {
				success: true,
				tokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expires_in: tokens.expires_in || 3600,
					scope: tokens.scope || this.scopes.join(' '),
				},
			};
		} catch (error) {
			console.error('Reddit OAuth callback failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'OAuth callback failed',
			};
		}
	}

	/**
	 * Refreshes OAuth tokens
	 * @param {string} refreshToken - Refresh token
	 * @param {AuthCredentials} credentials - OAuth credentials
	 * @returns {Promise<{access_token: string, refresh_token: string, expires_in: number}>} New tokens
	 */
	async refreshToken(refreshToken, credentials) {
		try {
			const { client_id, client_secret } = credentials;

			const tokenParams = new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			});

			const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

			const response = await fetch(this.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Authorization': `Basic ${basicAuth}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'MinimCP:Reddit:v1.0.0 (by /u/minimcp)',
				},
				body: tokenParams,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
			}

			const newTokens = await response.json();

			return {
				access_token: newTokens.access_token,
				refresh_token: newTokens.refresh_token || refreshToken,
				expires_in: newTokens.expires_in || 3600,
			};
		} catch (error) {
			console.error('Failed to refresh Reddit OAuth token:', error);
			throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

export default RedditOAuthHandler;