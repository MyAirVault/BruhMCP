/**
 * Notion OAuth Provider Implementation
 * Handles Notion OAuth 2.0 flows for Notion workspace integrations
 */

import { baseOAuth } from './base-oauth.js';

/**
 * Notion OAuth Provider class
 */
class NotionOAuth extends baseOAuth {
  constructor() {
    super('notion');
    this.authUrl = 'https://api.notion.com/v1/oauth/authorize';
    this.tokenUrl = 'https://api.notion.com/v1/oauth/token';
    this.userInfoUrl = 'https://api.notion.com/v1/users/me';
    this.revokeUrl = null; // Notion doesn't have a token revocation endpoint
  }

  /**
   * Validate Notion OAuth credentials format
   * @param {string} clientId - Notion OAuth Client ID
   * @param {string} clientSecret - Notion OAuth Client Secret
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
      // Notion Client ID format: UUID-like format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid Notion Client ID format - must be a UUID');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Notion Client Secret format validation
      if (clientSecret.length < 30 || clientSecret.length > 100) {
        validation.valid = false;
        validation.errors.push('Notion Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate Notion OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - Notion OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes (not used by Notion)
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
      owner: 'user' // Notion-specific parameter
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Notion OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - Notion OAuth Client ID
   * @param {string} params.client_secret - Notion OAuth Client Secret
   * @param {string} params.redirect_uri - Redirect URI used in authorization
   * @returns {Object} Token response
   */
  async exchangeAuthorizationCode(params) {
    const { code, client_id, client_secret, redirect_uri } = params;

    const tokenData = {
      grant_type: 'authorization_code',
      code,
      redirect_uri
    };

    console.log(`🔄 Exchanging authorization code for Notion tokens`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
        },
        body: JSON.stringify(tokenData)
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

      console.log(`✅ Notion tokens obtained successfully (permanent access)`);

      return {
        access_token: tokens.access_token,
        refresh_token: null, // Notion tokens don't expire
        expires_in: null, // Notion tokens don't expire
        token_type: tokens.token_type || 'Bearer',
        scope: null, // Notion uses workspace permissions instead
        workspace_id: tokens.workspace_id,
        workspace_name: tokens.workspace_name,
        workspace_icon: tokens.workspace_icon,
        bot_id: tokens.bot_id,
        owner: tokens.owner
      };

    } catch (error) {
      console.error('Notion token exchange failed:', error);
      throw new Error(`Notion token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh Notion access token (not needed - tokens don't expire)
   * @param {Object} params - Refresh parameters
   * @returns {Object} Token response
   */
  async refreshAccessToken(params) {
    // Notion tokens don't expire, so no refresh is needed
    console.log(`ℹ️  Notion tokens don't expire - no refresh needed`);
    
    return {
      access_token: params.access_token,
      refresh_token: null,
      expires_in: null,
      token_type: 'Bearer',
      scope: null
    };
  }

  /**
   * Validate Notion token scopes (not applicable - uses workspace permissions)
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    // Notion uses workspace-level permissions instead of scopes
    console.log(`✅ Notion uses workspace permissions - no scope validation needed`);

    return {
      valid: true,
      scopes: ['workspace_access'],
      required: ['workspace_access']
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Notion access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Notion user info`);

    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();

      console.log(`✅ Retrieved Notion user info for: ${userInfo.name || userInfo.id}`);

      return {
        id: userInfo.id,
        name: userInfo.name,
        avatar_url: userInfo.avatar_url,
        type: userInfo.type,
        person: userInfo.person
      };

    } catch (error) {
      console.error('Failed to get Notion user info:', error);
      throw new Error(`Notion user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke Notion OAuth token (not supported by Notion)
   * @param {string} token - Token to revoke
   * @returns {boolean} False - revocation not supported
   */
  async revokeToken(token) {
    console.log(`🔒 Notion doesn't support token revocation`);
    
    // Notion doesn't have a token revocation endpoint
    // Tokens can only be revoked by the user in the Notion workspace settings
    console.log(`ℹ️  Notion token revocation not supported - user must revoke in workspace settings`);
    return false;
  }
}

export const notionOAuth = new NotionOAuth();