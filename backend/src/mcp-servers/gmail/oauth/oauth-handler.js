/**
 * @fileoverview Gmail OAuth Handler
 * Implements OAuth flow for Gmail MCP service
 */

// @ts-ignore
const { google } = require('googleapis');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/auth-types.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/auth-types.js').OAuthCallbackResult} OAuthCallbackResult
 */

/**
 * Gmail OAuth Handler Class
 * Implements OAuth 2.0 flow for Gmail service
 */
class GmailOAuthHandler {
    constructor() {
        this.redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/v1/auth-registry/callback/gmail`;
        this.scopes = [
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
    }

    /**
     * Initiates OAuth flow for Gmail
     * @param {string} instanceId - MCP instance ID
     * @param {AuthCredentials} credentials - OAuth credentials (client_id, client_secret)
     * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
     */
    async initiateFlow(instanceId, credentials) {
        try {
            const { client_id, client_secret } = credentials;

            if (!client_id || !client_secret) {
                throw new Error('Missing required OAuth credentials: client_id and client_secret');
            }

            // Create OAuth2 client
            const oauth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                this.redirectUri
            );

            // Generate state parameter with instance ID
            const state = Buffer.from(JSON.stringify({
                instanceId,
                timestamp: Date.now(),
                service: 'gmail'
            })).toString('base64');

            // Generate authorization URL
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.scopes,
                state,
                prompt: 'consent' // Force consent screen to get refresh token
            });

            console.log(`🔐 Generated Gmail OAuth URL for instance ${instanceId}`);

            return {
                authUrl,
                state,
                instanceId
            };
        } catch (error) {
            console.error('Failed to initiate Gmail OAuth flow:', error);
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
            const { instanceId } = stateData;

            if (!instanceId) {
                throw new Error('Invalid state: missing instance ID');
            }

            // Get stored credentials for this instance
            const { getMCPInstanceById } = require('../../../db/queries/mcpInstances/crud.js');
            // We don't have userId in the state, so we'll pass an empty string
            // The function will still return the instance if it exists
            const instance = await getMCPInstanceById(instanceId, '');
            
            if (!instance || !instance.client_id || !instance.client_secret) {
                throw new Error('Instance not found or missing credentials');
            }

            const { client_id, client_secret } = { client_id: instance.client_id, client_secret: instance.client_secret };

            // Create OAuth2 client
            const oauth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                this.redirectUri
            );

            // Exchange code for tokens
            const { tokens } = await oauth2Client.getTokens(code);

            if (!tokens.access_token) {
                throw new Error('Failed to obtain access token');
            }

            console.log(`✅ Gmail OAuth callback successful for instance ${instanceId}`);

            return {
                success: true,
                tokens: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
                    scope: this.scopes.join(' ')
                }
            };
        } catch (error) {
            console.error('Gmail OAuth callback failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'OAuth callback failed'
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

            const oauth2Client = new google.auth.OAuth2(
                client_id,
                client_secret,
                this.redirectUri
            );

            oauth2Client.setCredentials({
                refresh_token: refreshToken
            });

            const { credentials: newTokens } = await oauth2Client.refreshAccessToken();

            return {
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token || refreshToken,
                expires_in: newTokens.expiry_date ? Math.floor((newTokens.expiry_date - Date.now()) / 1000) : 3600
            };
        } catch (error) {
            console.error('Failed to refresh Gmail OAuth token:', error);
            throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

module.exports = GmailOAuthHandler;