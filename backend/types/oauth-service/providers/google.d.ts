export const googleOAuth: GoogleOAuth;
export type GoogleTokenResponse = {
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
export type GoogleUserInfo = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - Display name
     */
    name?: string | undefined;
    /**
     * - First name
     */
    given_name?: string | undefined;
    /**
     * - Last name
     */
    family_name?: string | undefined;
    /**
     * - Profile picture URL
     */
    picture?: string | undefined;
    /**
     * - User locale
     */
    locale?: string | undefined;
    /**
     * - Whether email is verified
     */
    verified_email?: boolean | undefined;
};
export type GoogleError = {
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
 * @typedef {Object} GoogleTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {number} [expires_in] - Expiration time in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 */
/**
 * @typedef {Object} GoogleUserInfo
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - Display name
 * @property {string} [given_name] - First name
 * @property {string} [family_name] - Last name
 * @property {string} [picture] - Profile picture URL
 * @property {string} [locale] - User locale
 * @property {boolean} [verified_email] - Whether email is verified
 */
/**
 * @typedef {Object} GoogleError
 * @property {string} error - Error code
 * @property {string} error_description - Error description
 */
/**
 * Google OAuth Provider class
 * @extends {baseOAuth}
 */
declare class GoogleOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    tokenInfoUrl: string;
    revokeUrl: string;
    /**
     * Get user information using access token
     * @param {string} accessToken - Google access token
     * @returns {Promise<GoogleUserInfo>} User information
     */
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=google.d.ts.map