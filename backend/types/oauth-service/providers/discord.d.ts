export const discordOAuth: DiscordOAuth;
/**
 * Discord OAuth Provider class
 */
declare class DiscordOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Generate Discord OAuth authorization URL
     * @param {Object} params - Authorization parameters
     * @param {string} params.client_id - Discord OAuth Client ID
     * @param {Array} params.scopes - Required OAuth scopes
     * @param {string} params.state - State parameter for security
     * @param {string} params.redirect_uri - Redirect URI after authorization
     * @returns {string} Authorization URL
     */
    generateAuthorizationUrl(params: {
        client_id: string;
        scopes: any[];
        state: string;
        redirect_uri: string;
    }): string;
    /**
     * Exchange authorization code for tokens
     * @param {Object} params - Exchange parameters
     * @param {string} params.code - Authorization code from callback
     * @param {string} params.client_id - Discord OAuth Client ID
     * @param {string} params.client_secret - Discord OAuth Client Secret
     * @param {string} params.redirect_uri - Redirect URI used in authorization
     * @returns {Object} Token response
     */
    exchangeAuthorizationCode(params: {
        code: string;
        client_id: string;
        client_secret: string;
        redirect_uri: string;
    }): Object;
    /**
     * Refresh Discord access token using refresh token
     * @param {Object} params - Refresh parameters
     * @param {string} params.refresh_token - Discord refresh token
     * @param {string} params.client_id - Discord OAuth Client ID
     * @param {string} params.client_secret - Discord OAuth Client Secret
     * @returns {Object} New token response
     */
    refreshAccessToken(params: {
        refresh_token: string;
        client_id: string;
        client_secret: string;
    }): Object;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=discord.d.ts.map