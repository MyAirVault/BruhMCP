export default SlackOAuthHandler;
export type AuthCredentials = import("../../../services/mcp-auth-registry/types/authTypes.js").AuthCredentials;
export type OAuthFlowResult = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthFlowResult;
export type OAuthCallbackResult = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthCallbackResult;
export type SlackOAuthResponse = {
    /**
     * - Whether the request was successful
     */
    ok: boolean;
    /**
     * - OAuth access token
     */
    access_token?: string | undefined;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token scopes
     */
    scope?: string | undefined;
    /**
     * - Team information
     */
    team?: {
        /**
         * - Team ID
         */
        id: string;
    } | undefined;
    /**
     * - Error message if request failed
     */
    error?: string | undefined;
};
export type SlackTokenData = {
    /**
     * - OAuth access token
     */
    access_token: string;
    /**
     * - OAuth refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in: number;
    /**
     * - Team ID
     */
    team_id: string;
};
export type SlackOAuthTokens = {
    /**
     * - Access token
     */
    access_token?: string | undefined;
    /**
     * - Refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Token expiration in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Team ID (Slack-specific)
     */
    team_id?: string | undefined;
};
export type SlackOAuthCallbackResult = {
    /**
     * - Whether callback was successful
     */
    success: boolean;
    /**
     * - Error message if callback failed
     */
    error?: string | undefined;
    /**
     * - OAuth tokens if successful
     */
    tokens?: SlackOAuthTokens | undefined;
};
export type StateData = {
    /**
     * - MCP instance ID
     */
    instanceId: string;
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Timestamp when state was created
     */
    timestamp: number;
    /**
     * - Service name
     */
    service: string;
};
export type MCPInstance = {
    /**
     * - OAuth client ID
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret
     */
    client_secret?: string | undefined;
};
/**
 * Slack OAuth Handler Class
 * Implements OAuth 2.0 flow for Slack service
 */
declare class SlackOAuthHandler {
    redirectUri: string;
    scopes: string[];
    /**
     * Initiates OAuth flow for Slack
     * @param {string} instanceId - MCP instance ID
     * @param {string} userId - User ID for authentication
     * @param {AuthCredentials} credentials - OAuth credentials (client_id, client_secret)
     * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
     */
    initiateFlow(instanceId: string, userId: string, credentials: AuthCredentials): Promise<OAuthFlowResult>;
    /**
     * Handles OAuth callback and exchanges code for tokens
     * @param {string} code - OAuth authorization code
     * @param {string} state - OAuth state parameter
     * @returns {Promise<SlackOAuthCallbackResult>} Callback processing result
     */
    handleCallback(code: string, state: string): Promise<SlackOAuthCallbackResult>;
    /**
     * Refreshes OAuth tokens
     * @param {string} refreshToken - Refresh token
     * @param {AuthCredentials} credentials - OAuth credentials
     * @returns {Promise<SlackTokenData>} New tokens
     */
    refreshToken(refreshToken: string, credentials: AuthCredentials): Promise<SlackTokenData>;
}
//# sourceMappingURL=oauthHandler.d.ts.map