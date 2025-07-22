/**
 * @fileoverview Dropbox OAuth Provider Implementation
 * Handles Dropbox OAuth 2.0 flows for Dropbox API integrations
 */

import { baseOAuth } from './base-oauth.js';

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
class DropboxOAuth extends baseOAuth {
  constructor() {
    super('dropbox');
    this.authUrl = 'https://www.dropbox.com/oauth2/authorize';
    this.tokenUrl = 'https://api.dropboxapi.com/oauth2/token';
    this.userInfoUrl = 'https://api.dropboxapi.com/2/users/get_current_account';
    this.revokeUrl = 'https://api.dropboxapi.com/2/auth/token/revoke';
  }

  /**
   * Validate Dropbox OAuth credentials format
   * @param {string} clientId - Dropbox OAuth Client ID
   * @param {string} clientSecret - Dropbox OAuth Client Secret
   * @returns {Promise<import('./base-oauth.js').ValidationResult>} Validation result
   */
  async validateCredentials(clientId, clientSecret) {
    /** @type {import('./base-oauth.js').ValidationResult} */
    const validation = {
      valid: true,
      errors: []
    };

    // Validate Client ID format
    if (!clientId || typeof clientId !== 'string') {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Client ID is required and must be a string');
    } else {
      // Dropbox Client ID format: alphanumeric, typically 15 characters
      const dropboxIdRegex = /^[a-zA-Z0-9]{10,20}$/;
      if (!dropboxIdRegex.test(clientId)) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Invalid Dropbox Client ID format - must be 10-20 alphanumeric characters');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Dropbox Client Secret format validation
      if (clientSecret.length < 15 || clientSecret.length > 20) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Dropbox Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors ? validation.errors.join(', ') : undefined,
      field: validation.valid ? undefined : 'credentials'
    };
  }

  /**
   * Generate Dropbox OAuth authorization URL
   * @param {import('./base-oauth.js').AuthParams} params - Authorization parameters
   * @returns {Promise<string>} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, state, redirect_uri } = params;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      state,
      token_access_type: 'offline', // Request offline access for refresh tokens
      force_reapprove: 'false',
      disable_signup: 'false'
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Dropbox OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {import('./base-oauth.js').ExchangeParams} params - Exchange parameters
   * @returns {Promise<DropboxTokenResponse>} Token response
   */
  async exchangeAuthorizationCode(params) {
    const { code, client_id, client_secret, redirect_uri } = params;

    const tokenData = {
      grant_type: 'authorization_code',
      code,
      client_id,
      client_secret,
      redirect_uri
    };

    console.log(`🔄 Exchanging authorization code for Dropbox tokens`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Token exchange failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error_description) {
            errorMessage = `Token exchange failed: ${errorJson.error_description}`;
          } else if (errorJson.error) {
            errorMessage = `Token exchange failed: ${errorJson.error}`;
          }
        } catch (parseError) {
          // Use the default error message
        }
        
        throw new Error(errorMessage);
      }

      /** @type {any} */
      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Dropbox tokens obtained successfully (expires in ${tokens.expires_in || 14400} seconds)`);

      /** @type {DropboxTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 14400, // Default 4 hours
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || 'files.metadata.write files.content.write',
        account_id: tokens.account_id,
        uid: tokens.uid
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Dropbox token exchange failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Dropbox token exchange failed: ${err.message}`);
    }
  }

  /**
   * Refresh Dropbox access token using refresh token
   * @param {import('./base-oauth.js').RefreshParams} params - Refresh parameters
   * @returns {Promise<DropboxTokenResponse>} New token response
   */
  async refreshAccessToken(params) {
    const { refresh_token, client_id, client_secret } = params;

    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id,
      client_secret
    };

    console.log(`🔄 Refreshing Dropbox access token`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Token refresh failed: ${response.status} ${response.statusText}`;
        let errorCode = null;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error_description) {
            errorMessage = `Token refresh failed: ${errorJson.error_description}`;
            errorCode = errorJson.error;
          } else if (errorJson.error) {
            errorMessage = `Token refresh failed: ${errorJson.error}`;
            errorCode = errorJson.error;
          }
        } catch (parseError) {
          // Use the default error message
        }
        
        const error = new Error(errorMessage);
        // @ts-ignore - Adding custom properties to Error
        error.code = errorCode;
        // @ts-ignore - Adding custom properties to Error  
        error.status = response.status;
        throw error;
      }

      /** @type {any} */
      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Dropbox access token refreshed successfully (expires in ${tokens.expires_in || 14400} seconds)`);

      /** @type {DropboxTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token,
        expires_in: tokens.expires_in || 14400,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Dropbox token refresh failed:', error);
      
      const err = error instanceof Error ? error : new Error(String(error));
      // Add specific error handling for Dropbox OAuth errors
      // @ts-ignore - Checking custom property
      if (err.code === 'invalid_grant') {
        throw new Error('invalid_grant: The provided authorization grant is invalid, expired, or revoked');
      // @ts-ignore - Checking custom property
      } else if (err.code === 'invalid_client') {
        throw new Error('invalid_client: Client authentication failed');
      }
      
      throw new Error(`Dropbox token refresh failed: ${err.message}`);
    }
  }

  /**
   * Validate Dropbox token scopes (Dropbox uses implicit permissions)
   * @param {DropboxTokenResponse} tokens - Token response
   * @returns {Promise<import('./base-oauth.js').ValidationResult>} Scope validation result
   */
  async validateTokenScopes(tokens) {
    // Dropbox uses implicit permissions based on the app's configuration
    // rather than explicit scopes like other providers
    console.log(`✅ Dropbox uses implicit permissions - no scope validation needed`);

    return {
      valid: true,
      scopes: ['files.metadata.write', 'files.content.write', 'account_info.read'],
      required: ['files.metadata.write', 'files.content.write']
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Dropbox access token
   * @returns {Promise<DropboxUserInfo>} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Dropbox user info`);

    try {
      const response = await fetch(this.userInfoUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        },
        body: JSON.stringify(null)
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      /** @type {any} */
      const userInfo = await response.json();

      console.log(`✅ Retrieved Dropbox user info for: ${userInfo.email}`);

      /** @type {DropboxUserInfo} */
      const userInfoResponse = {
        account_id: userInfo.account_id,
        email: userInfo.email,
        name: userInfo.name?.display_name,
        given_name: userInfo.name?.given_name,
        surname: userInfo.name?.surname,
        familiar_name: userInfo.name?.familiar_name,
        abbreviated_name: userInfo.name?.abbreviated_name,
        locale: userInfo.locale,
        referral_link: userInfo.referral_link,
        is_paired: userInfo.is_paired,
        account_type: userInfo.account_type?.['.tag'],
        root_info: userInfo.root_info,
        profile_photo_url: userInfo.profile_photo_url,
        country: userInfo.country
      };
      
      return userInfoResponse;

    } catch (error) {
      console.error('Failed to get Dropbox user info:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Dropbox user info retrieval failed: ${err.message}`);
    }
  }

  /**
   * Revoke Dropbox OAuth token
   * @param {string} token - Token to revoke
   * @returns {Promise<boolean>} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Dropbox OAuth token`);

    try {
      const response = await fetch(this.revokeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        },
        body: JSON.stringify(null)
      });

      if (!response.ok) {
        throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Dropbox token revoked successfully`);
      return true;

    } catch (error) {
      console.error('Dropbox token revocation failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Dropbox token revocation failed: ${err.message}`);
    }
  }
}

export const dropboxOAuth = new DropboxOAuth();