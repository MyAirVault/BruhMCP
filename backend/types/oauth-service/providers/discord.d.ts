export const discordOAuth: DiscordOAuth;
export type DiscordTokenResponse = {
    /**
     * - Access token
     */
    access_token: string;
    /**
     * - Refresh token
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
export type DiscordUserInfo = {
    /**
     * - Discord user ID
     */
    id: string;
    /**
     * - Discord username
     */
    username: string;
    /**
     * - Discord discriminator (deprecated)
     */
    discriminator?: string | undefined;
    /**
     * - Global display name
     */
    global_name?: string | undefined;
    /**
     * - Avatar hash
     */
    avatar?: string | undefined;
    /**
     * - User email
     */
    email?: string | undefined;
    /**
     * - Email verification status
     */
    verified?: boolean | undefined;
    /**
     * - User locale
     */
    locale?: string | undefined;
    /**
     * - MFA enabled status
     */
    mfa_enabled?: boolean | undefined;
    /**
     * - Nitro subscription type
     */
    premium_type?: number | undefined;
    /**
     * - Public flags
     */
    public_flags?: number | undefined;
    /**
     * - User flags
     */
    flags?: number | undefined;
    /**
     * - Banner hash
     */
    banner?: string | undefined;
    /**
     * - Accent color
     */
    accent_color?: number | undefined;
};
export type DiscordError = {
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
 * @typedef {Object} DiscordTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {number} [expires_in] - Expiration time in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 */
/**
 * @typedef {Object} DiscordUserInfo
 * @property {string} id - Discord user ID
 * @property {string} username - Discord username
 * @property {string} [discriminator] - Discord discriminator (deprecated)
 * @property {string} [global_name] - Global display name
 * @property {string} [avatar] - Avatar hash
 * @property {string} [email] - User email
 * @property {boolean} [verified] - Email verification status
 * @property {string} [locale] - User locale
 * @property {boolean} [mfa_enabled] - MFA enabled status
 * @property {number} [premium_type] - Nitro subscription type
 * @property {number} [public_flags] - Public flags
 * @property {number} [flags] - User flags
 * @property {string} [banner] - Banner hash
 * @property {number} [accent_color] - Accent color
 */
/**
 * @typedef {Object} DiscordError
 * @property {string} error - Error code
 * @property {string} error_description - Error description
 */
/**
 * Discord OAuth Provider class
 * @extends {baseOAuth}
 */
declare class DiscordOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Get user information using access token
     * @param {string} accessToken - Discord access token
     * @returns {Promise<DiscordUserInfo>} User information
     */
    getUserInfo(accessToken: string): Promise<DiscordUserInfo>;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=discord.d.ts.map