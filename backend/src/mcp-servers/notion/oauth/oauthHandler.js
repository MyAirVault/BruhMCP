/**
 * @fileoverview Notion OAuth Handler
 * Implements OAuth flow for Notion MCP service
 */

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */

/**
 * Notion OAuth Handler Class
 * Implements OAuth 2.0 flow for Notion service
 */
class NotionOAuthHandler {
	constructor() {
		this.redirectUri = `${process.env.PUBLIC_DOMAIN || 'http://localhost:5000'}/api/v1/auth-registry/callback/notion`;
		this.scopes = ['read_content', 'insert_content', 'update_content'];
		this.authEndpoint = 'https://api.notion.com/v1/oauth/authorize';
		this.tokenEndpoint = 'https://api.notion.com/v1/oauth/token';
	}

	/**
	 * Initiates OAuth flow for Notion
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
					service: 'notion',
				})
			).toString('base64');

			// Build authorization URL
			const authParams = new URLSearchParams({
				client_id,
				response_type: 'code',
				owner: 'user',
				redirect_uri: this.redirectUri,
				state,
			});

			const authUrl = `${this.authEndpoint}?${authParams.toString()}`;

			console.log(`🔐 Generated Notion OAuth URL for instance ${instanceId}`);

			return {
				authUrl,
				state,
				instanceId,
			};
		} catch (error) {
			console.error('Failed to initiate Notion OAuth flow:', error);
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
			const tokenResponse = await fetch(this.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
					'Notion-Version': '2022-06-28',
				},
				body: JSON.stringify({
					grant_type: 'authorization_code',
					code,
					redirect_uri: this.redirectUri,
				}),
			});

			if (!tokenResponse.ok) {
				const errorData = await tokenResponse.json().catch(() => ({}));
				throw new Error(`Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${JSON.stringify(errorData)}`);
			}

			const tokens = /** @type {{access_token: string, refresh_token?: string, expires_in?: number}} */ (await tokenResponse.json());

			if (!tokens.access_token) {
				throw new Error('Failed to obtain access token');
			}

			console.log(`✅ Notion OAuth callback successful for instance ${instanceId}`);

			return {
				success: true,
				tokens: {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expires_in: tokens.expires_in || 3600,
					scope: this.scopes.join(' '),
				},
			};
		} catch (error) {
			console.error('Notion OAuth callback failed:', error);
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

			const refreshResponse = await fetch(this.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
					'Notion-Version': '2022-06-28',
				},
				body: JSON.stringify({
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
				}),
			});

			if (!refreshResponse.ok) {
				const errorData = await refreshResponse.json().catch(() => ({}));
				throw new Error(`Token refresh failed: ${refreshResponse.status} ${refreshResponse.statusText} - ${JSON.stringify(errorData)}`);
			}

			const tokens = /** @type {{access_token: string, refresh_token?: string, expires_in?: number}} */ (await refreshResponse.json());

			return {
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token || refreshToken,
				expires_in: tokens.expires_in || 3600,
			};
		} catch (error) {
			console.error('Failed to refresh Notion OAuth token:', error);
			throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
}

module.exports = NotionOAuthHandler;