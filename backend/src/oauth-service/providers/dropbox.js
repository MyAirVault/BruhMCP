/**
 * Dropbox OAuth Provider Implementation
 * Handles Dropbox OAuth 2.0 flows for Dropbox API integrations
 */

import { baseOAuth } from './base-oauth.js';

/**
 * Dropbox OAuth Provider class
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
   * @returns {Object} Validation result
   */
  async validateCredentials(clientId, clientSecret) {
    const validation = {
      valid: true,
      errors: []
    };

    // Validate Client ID format
    if (!clientId || typeof clientId !== 'string') {
      validation.valid = false;
      validation.errors.push('Client ID is required and must be a string');
    } else {
      // Dropbox Client ID format: alphanumeric, typically 15 characters
      const dropboxIdRegex = /^[a-zA-Z0-9]{10,20}$/;
      if (!dropboxIdRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid Dropbox Client ID format - must be 10-20 alphanumeric characters');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Dropbox Client Secret format validation
      if (clientSecret.length < 15 || clientSecret.length > 20) {
        validation.valid = false;
        validation.errors.push('Dropbox Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate Dropbox OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - Dropbox OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes (not used by Dropbox)
   * @param {string} params.state - State parameter for security
   * @param {string} params.redirect_uri - Redirect URI after authorization
   * @returns {string} Authorization URL
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
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - Dropbox OAuth Client ID
   * @param {string} params.client_secret - Dropbox OAuth Client Secret
   * @param {string} params.redirect_uri - Redirect URI used in authorization
   * @returns {Object} Token response
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

      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Dropbox tokens obtained successfully (expires in ${tokens.expires_in || 14400} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 14400, // Default 4 hours
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || 'files.metadata.write files.content.write',
        account_id: tokens.account_id,
        uid: tokens.uid
      };

    } catch (error) {
      console.error('Dropbox token exchange failed:', error);
      throw new Error(`Dropbox token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh Dropbox access token using refresh token
   * @param {Object} params - Refresh parameters
   * @param {string} params.refresh_token - Dropbox refresh token
   * @param {string} params.client_id - Dropbox OAuth Client ID
   * @param {string} params.client_secret - Dropbox OAuth Client Secret
   * @returns {Object} New token response
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
        error.code = errorCode;
        error.status = response.status;
        throw error;
      }

      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Dropbox access token refreshed successfully (expires in ${tokens.expires_in || 14400} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token,
        expires_in: tokens.expires_in || 14400,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Dropbox token refresh failed:', error);
      
      // Add specific error handling for Dropbox OAuth errors
      if (error.code === 'invalid_grant') {
        throw new Error('invalid_grant: The provided authorization grant is invalid, expired, or revoked');
      } else if (error.code === 'invalid_client') {
        throw new Error('invalid_client: Client authentication failed');
      }
      
      throw new Error(`Dropbox token refresh failed: ${error.message}`);
    }
  }

  /**
   * Validate Dropbox token scopes (Dropbox uses implicit permissions)
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
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
   * @returns {Object} User information
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

      const userInfo = await response.json();

      console.log(`✅ Retrieved Dropbox user info for: ${userInfo.email}`);

      return {
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

    } catch (error) {
      console.error('Failed to get Dropbox user info:', error);
      throw new Error(`Dropbox user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke Dropbox OAuth token
   * @param {string} token - Token to revoke
   * @returns {boolean} True if revocation was successful
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
      throw new Error(`Dropbox token revocation failed: ${error.message}`);
    }
  }
}

export const dropboxOAuth = new DropboxOAuth();