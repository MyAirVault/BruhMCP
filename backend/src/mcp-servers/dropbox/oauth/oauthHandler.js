/**
 * @fileoverview Dropbox OAuth Handler
 * Implements OAuth flow for Dropbox MCP service
 */

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */

/**
 * Dropbox OAuth Handler Class
 * Implements OAuth 2.0 flow for Dropbox service
 */
class DropboxOAuthHandler {
	constructor() {
		this.redirectUri = `${process.env.PUBLIC_DOMAIN || 'http://localhost:5000'}/api/v1/auth-registry/callback/dropbox`;
		this.scopes = [
			'account_info.read',
			'files.metadata.write',
			'files.content.write',
			'sharing.write'
		];
	}

	/**
	 * Initiates OAuth flow for Dropbox
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
					service: 'dropbox',
				})
			).toString('base64');

			// Generate authorization URL
			const authUrl = new URL('https://dropbox.com/oauth2/authorize');
			authUrl.searchParams.set('client_id', client_id);
			authUrl.searchParams.set('redirect_uri', this.redirectUri);
			authUrl.searchParams.set('response_type', 'code');
			authUrl.searchParams.set('state', state);
			authUrl.searchParams.set('token_access_type', 'offline'); // Request refresh token
			authUrl.searchParams.set('force_reapprove', 'true'); // Force consent screen

			console.log(`🔐 Generated Dropbox OAuth URL for instance ${instanceId}`);

			return {
				authUrl: authUrl.toString(),
				state,
				instanceId,
			};
		} catch (error) {
			console.error('Failed to initiate Dropbox OAuth flow:', error);
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

			// Exchange code for tokens
			const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					code,
					grant_type: 'authorization_code',
					client_id,
					client_secret,
					redirect_uri: this.redirectUri,
				}),
			});

			if (!tokenResponse.ok) {
				const errorData = await tokenResponse.text();
				throw new Error(`Token exchange failed: ${errorData}`);
			}

			const tokens = await tokenResponse.json();

			if (!tokens.access_token) {
				throw new Error('Failed to obtain access token');
			}

			console.log(`✅ Dropbox OAuth callback successful for instance ${instanceId}`);

			return {
				success: true,
				tokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expires_in: tokens.expires_in || 14400, // Dropbox tokens typically expire in 4 hours
					scope: tokens.scope || this.scopes.join(' '),
				},
			};
		} catch (error) {
			console.error('Dropbox OAuth callback failed:', error);
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

			const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
					client_id,
					client_secret,
				}),
			});

			if (!tokenResponse.ok) {
				const errorData = await tokenResponse.text();
				throw new Error(`Token refresh failed: ${errorData}`);
			}

			const tokens = await tokenResponse.json();

			return {
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token || refreshToken,
				expires_in: tokens.expires_in || 14400, // Dropbox tokens typically expire in 4 hours
			};
		} catch (error) {
			console.error('Failed to refresh Dropbox OAuth token:', error);
			throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

export default DropboxOAuthHandler;