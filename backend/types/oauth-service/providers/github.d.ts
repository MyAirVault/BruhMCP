export const githubOAuth: GitHubOAuth;
export type GitHubTokenResponse = {
    /**
     * - Access token
     */
    access_token: string;
    /**
     * - Refresh token (rarely used by GitHub)
     */
    refresh_token?: string | undefined;
    /**
     * - Expiration time in seconds
     */
    expires_in?: number | undefined;
    /**
     * - Token type
     */
    token_type?: string | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
export type GitHubUserInfo = {
    /**
     * - GitHub user ID
     */
    id: string;
    /**
     * - GitHub username
     */
    login: string;
    /**
     * - Display name
     */
    name?: string | undefined;
    /**
     * - User email
     */
    email?: string | undefined;
    /**
     * - Avatar URL
     */
    avatar_url?: string | undefined;
    /**
     * - Profile URL
     */
    html_url?: string | undefined;
    /**
     * - Company
     */
    company?: string | undefined;
    /**
     * - Location
     */
    location?: string | undefined;
    /**
     * - Bio
     */
    bio?: string | undefined;
    /**
     * - Public repositories count
     */
    public_repos?: number | undefined;
    /**
     * - Public gists count
     */
    public_gists?: number | undefined;
    /**
     * - Followers count
     */
    followers?: number | undefined;
    /**
     * - Following count
     */
    following?: number | undefined;
    /**
     * - Account creation date
     */
    created_at?: string | undefined;
    /**
     * - Last update date
     */
    updated_at?: string | undefined;
};
export type GitHubError = {
    /**
     * - Error code
     */
    error: string;
    /**
     * - Error description
     */
    error_description: string;
};
/**
 * @typedef {Object} GitHubTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token (rarely used by GitHub)
 * @property {number} [expires_in] - Expiration time in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 */
/**
 * @typedef {Object} GitHubUserInfo
 * @property {string} id - GitHub user ID
 * @property {string} login - GitHub username
 * @property {string} [name] - Display name
 * @property {string} [email] - User email
 * @property {string} [avatar_url] - Avatar URL
 * @property {string} [html_url] - Profile URL
 * @property {string} [company] - Company
 * @property {string} [location] - Location
 * @property {string} [bio] - Bio
 * @property {number} [public_repos] - Public repositories count
 * @property {number} [public_gists] - Public gists count
 * @property {number} [followers] - Followers count
 * @property {number} [following] - Following count
 * @property {string} [created_at] - Account creation date
 * @property {string} [updated_at] - Last update date
 */
/**
 * @typedef {Object} GitHubError
 * @property {string} error - Error code
 * @property {string} error_description - Error description
 */
/**
 * GitHub OAuth Provider class
 * @extends {baseOAuth}
 */
declare class GitHubOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=github.d.ts.map