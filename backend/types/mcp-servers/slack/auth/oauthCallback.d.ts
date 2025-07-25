export type CallbackResult = {
    /**
     * - Whether callback processing succeeded
     */
    success: boolean;
    /**
     * - Human readable message
     */
    message: string;
    /**
     * - OAuth tokens if successful
     */
    tokens?: {
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
         * - Slack team ID
         */
        team_id?: string | undefined;
    } | undefined;
};
/**
 * @typedef {Object} CallbackResult
 * @property {boolean} success - Whether callback processing succeeded
 * @property {string} message - Human readable message
 * @property {Object} [tokens] - OAuth tokens if successful
 * @property {string} [tokens.access_token] - Access token
 * @property {string} [tokens.refresh_token] - Refresh token
 * @property {number} [tokens.expires_in] - Token expiration in seconds
 * @property {string} [tokens.scope] - Token scope
 * @property {string} [tokens.team_id] - Slack team ID
 */
/**
 * Handles OAuth callback for Slack service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<CallbackResult>} Callback processing result
 */
export function oauthCallback(code: string, state: string): Promise<CallbackResult>;
//# sourceMappingURL=oauthCallback.d.ts.map