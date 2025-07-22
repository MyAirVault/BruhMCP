export const dropboxOAuth: DropboxOAuth;
export type DropboxTokenResponse = {
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
    /**
     * - Dropbox account ID
     */
    account_id?: string | undefined;
    /**
     * - User ID
     */
    uid?: string | undefined;
};
export type DropboxUserInfo = {
    /**
     * - Dropbox account ID
     */
    account_id: string;
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
    surname?: string | undefined;
    /**
     * - Familiar name
     */
    familiar_name?: string | undefined;
    /**
     * - Abbreviated name
     */
    abbreviated_name?: string | undefined;
    /**
     * - User locale
     */
    locale?: string | undefined;
    /**
     * - Referral link
     */
    referral_link?: string | undefined;
    /**
     * - Whether account is paired
     */
    is_paired?: boolean | undefined;
    /**
     * - Account type
     */
    account_type?: string | undefined;
    /**
     * - Root info
     */
    root_info?: any;
    /**
     * - Profile photo URL
     */
    profile_photo_url?: string | undefined;
    /**
     * - Country
     */
    country?: string | undefined;
};
export type DropboxError = {
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
 * @typedef {Object} DropboxTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {number} [expires_in] - Expiration time in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 * @property {string} [account_id] - Dropbox account ID
 * @property {string} [uid] - User ID
 */
/**
 * @typedef {Object} DropboxUserInfo
 * @property {string} account_id - Dropbox account ID
 * @property {string} email - User email
 * @property {string} [name] - Display name
 * @property {string} [given_name] - First name
 * @property {string} [surname] - Last name
 * @property {string} [familiar_name] - Familiar name
 * @property {string} [abbreviated_name] - Abbreviated name
 * @property {string} [locale] - User locale
 * @property {string} [referral_link] - Referral link
 * @property {boolean} [is_paired] - Whether account is paired
 * @property {string} [account_type] - Account type
 * @property {any} [root_info] - Root info
 * @property {string} [profile_photo_url] - Profile photo URL
 * @property {string} [country] - Country
 */
/**
 * @typedef {Object} DropboxError
 * @property {string} error - Error code
 * @property {string} error_description - Error description
 */
/**
 * Dropbox OAuth Provider class
 * @extends {baseOAuth}
 */
declare class DropboxOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Exchange authorization code for tokens
     * @param {import('./base-oauth.js').ExchangeParams} params - Exchange parameters
     * @returns {Promise<DropboxTokenResponse>} Token response
     */
    exchangeAuthorizationCode(params: import("./base-oauth.js").ExchangeParams): Promise<DropboxTokenResponse>;
    /**
     * Refresh Dropbox access token using refresh token
     * @param {import('./base-oauth.js').RefreshParams} params - Refresh parameters
     * @returns {Promise<DropboxTokenResponse>} New token response
     */
    refreshAccessToken(params: import("./base-oauth.js").RefreshParams): Promise<DropboxTokenResponse>;
    /**
     * Validate Dropbox token scopes (Dropbox uses implicit permissions)
     * @param {DropboxTokenResponse} tokens - Token response
     * @returns {Promise<import('./base-oauth.js').ValidationResult>} Scope validation result
     */
    validateTokenScopes(tokens: DropboxTokenResponse): Promise<import("./base-oauth.js").ValidationResult>;
    /**
     * Get user information using access token
     * @param {string} accessToken - Dropbox access token
     * @returns {Promise<DropboxUserInfo>} User information
     */
    getUserInfo(accessToken: string): Promise<DropboxUserInfo>;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=dropbox.d.ts.map