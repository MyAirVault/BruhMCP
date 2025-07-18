export const githubOAuth: GitHubOAuth;
/**
 * GitHub OAuth Provider class
 */
declare class GitHubOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Generate GitHub OAuth authorization URL
     * @param {Object} params - Authorization parameters
     * @param {string} params.client_id - GitHub OAuth Client ID
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
     * @param {string} params.client_id - GitHub OAuth Client ID
     * @param {string} params.client_secret - GitHub OAuth Client Secret
     * @param {string} params.redirect_uri - Redirect URI used in authorization
     * @returns {Object} Token response
     */
    exchangeAuthorizationCode(params: {
        code: string;
        client_id: string;
        client_secret: string;
        redirect_uri: string;
    }): Object;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=github.d.ts.map