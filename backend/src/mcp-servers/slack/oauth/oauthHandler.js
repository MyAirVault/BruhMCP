/**
 * @fileoverview Slack OAuth Handler
 * Implements OAuth flow for Slack MCP service
 */

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */

/**
 * Slack OAuth Handler Class
 * Implements OAuth 2.0 flow for Slack service
 */
class SlackOAuthHandler {
	constructor() {
		this.redirectUri = `${process.env.PUBLIC_DOMAIN || 'http://localhost:5000'}/api/v1/auth-registry/callback/slack`;
		this.scopes = [
			'channels:history',
			'chat:write',
			'team:read',
			'channels:read',
			'users:read',
			'reminders:write',
			'reactions:read',
			'files:read',
			'files:write'
		];
	}

	/**
	 * Initiates OAuth flow for Slack
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
					service: 'slack',
				})
			).toString('base64');

			// Generate authorization URL for Slack OAuth v2
			const params = new URLSearchParams({
				client_id,
				scope: this.scopes.join(','),
				redirect_uri: this.redirectUri,
				state,
				response_type: 'code',
				access_type: 'offline' // Request refresh token
			});

			const authUrl = `https://slack.com/oauth/v2/authorize?${params.toString()}`;

			console.log(`🔐 Generated Slack OAuth URL for instance ${instanceId}`);

			return {
				authUrl,
				state,
				instanceId,
			};
		} catch (error) {
			console.error('Failed to initiate Slack OAuth flow:', error);
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
			// Get stored credentials for this instance with proper user authorization
			const instance = await getMCPInstanceById(instanceId, userId);

			if (!instance || !instance.client_id || !instance.client_secret) {
				throw new Error('Instance not found or missing credentials');
			}

			const { client_id, client_secret } = {
				client_id: instance.client_id,
				client_secret: instance.client_secret,
			};

			// Exchange code for tokens using Slack OAuth v2
			const response = await fetch('https://slack.com/api/oauth.v2.access', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				body: new URLSearchParams({
					client_id,
					client_secret,
					code,
					redirect_uri: this.redirectUri
				})
			});

			if (!response.ok) {
				throw new Error(`Slack OAuth token exchange failed: ${response.status} ${response.statusText}`);
			}

			const tokenData = await response.json();

			if (!tokenData.ok) {
				throw new Error(`Slack OAuth failed: ${tokenData.error}`);
			}

			if (!tokenData.access_token) {
				throw new Error('Failed to obtain access token from Slack');
			}

			console.log(`✅ Slack OAuth callback successful for instance ${instanceId}`);

			return {
				success: true,
				tokens: {
					access_token: tokenData.access_token,
					refresh_token: tokenData.refresh_token,
					expires_in: tokenData.expires_in || 43200, // Default 12 hours for Slack
					scope: tokenData.scope,
					team_id: tokenData.team.id
				},
			};
		} catch (error) {
			console.error('Slack OAuth callback failed:', error);
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
	 * @returns {Promise<{access_token: string, refresh_token: string, expires_in: number, team_id: string}>} New tokens
	 */
	async refreshToken(refreshToken, credentials) {
		try {
			const { client_id, client_secret } = credentials;

			const response = await fetch('https://slack.com/api/oauth.v2.access', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				body: new URLSearchParams({
					client_id,
					client_secret,
					grant_type: 'refresh_token',
					refresh_token: refreshToken
				})
			});

			if (!response.ok) {
				throw new Error(`Slack token refresh failed: ${response.status} ${response.statusText}`);
			}

			const tokenData = await response.json();

			if (!tokenData.ok) {
				throw new Error(`Slack token refresh failed: ${tokenData.error}`);
			}

			return {
				access_token: tokenData.access_token,
				refresh_token: tokenData.refresh_token || refreshToken,
				expires_in: tokenData.expires_in || 43200, // Default 12 hours for Slack
				team_id: tokenData.team.id
			};
		} catch (error) {
			console.error('Failed to refresh Slack OAuth token:', error);
			throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

export default SlackOAuthHandler;