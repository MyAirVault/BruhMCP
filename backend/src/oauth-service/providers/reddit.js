/**
 * Reddit OAuth Provider Implementation
 * Handles Reddit OAuth 2.0 flows for Reddit API integrations
 */

import { baseOAuth } from './base-oauth.js';

/**
 * Reddit OAuth Provider class
 */
class RedditOAuth extends baseOAuth {
  constructor() {
    super('reddit');
    this.authUrl = 'https://www.reddit.com/api/v1/authorize';
    this.tokenUrl = 'https://www.reddit.com/api/v1/access_token';
    this.userInfoUrl = 'https://oauth.reddit.com/api/v1/me';
    this.revokeUrl = 'https://www.reddit.com/api/v1/revoke_token';
  }

  /**
   * Validate Reddit OAuth credentials format
   * @param {string} clientId - Reddit OAuth Client ID
   * @param {string} clientSecret - Reddit OAuth Client Secret
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
      // Reddit Client ID format: alphanumeric with hyphens and underscores
      const redditIdRegex = /^[a-zA-Z0-9_-]{14,22}$/;
      if (!redditIdRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid Reddit Client ID format - must be 14-22 alphanumeric characters with hyphens/underscores');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Reddit Client Secret format validation
      if (clientSecret.length < 20 || clientSecret.length > 40) {
        validation.valid = false;
        validation.errors.push('Reddit Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate Reddit OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - Reddit OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes
   * @param {string} params.state - State parameter for security
   * @param {string} params.redirect_uri - Redirect URI after authorization
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default Reddit scopes if none provided
    const defaultScopes = [
      'identity',
      'read',
      'submit',
      'vote',
      'save'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      duration: 'permanent' // Request permanent access for refresh token
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Reddit OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - Reddit OAuth Client ID
   * @param {string} params.client_secret - Reddit OAuth Client Secret
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

    console.log(`🔄 Exchanging authorization code for Reddit tokens`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
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

      console.log(`✅ Reddit tokens obtained successfully (expires in ${tokens.expires_in} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 3600, // Default 1 hour
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Reddit token exchange failed:', error);
      throw new Error(`Reddit token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh Reddit access token using refresh token
   * @param {Object} params - Refresh parameters
   * @param {string} params.refresh_token - Reddit refresh token
   * @param {string} params.client_id - Reddit OAuth Client ID
   * @param {string} params.client_secret - Reddit OAuth Client Secret
   * @returns {Object} New token response
   */
  async refreshAccessToken(params) {
    const { refresh_token, client_id, client_secret } = params;

    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token
    };

    console.log(`🔄 Refreshing Reddit access token`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
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

      console.log(`✅ Reddit access token refreshed successfully (expires in ${tokens.expires_in} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token,
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Reddit token refresh failed:', error);
      
      // Add specific error handling for Reddit OAuth errors
      if (error.code === 'invalid_grant') {
        throw new Error('invalid_grant: The provided authorization grant is invalid, expired, or revoked');
      } else if (error.code === 'invalid_request') {
        throw new Error('invalid_request: The request is missing a required parameter or is otherwise malformed');
      }
      
      throw new Error(`Reddit token refresh failed: ${error.message}`);
    }
  }

  /**
   * Validate Reddit token scopes
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { scope } = tokens;

    // Required scopes for Reddit
    const requiredScopes = [
      'identity',
      'read'
    ];

    if (!scope) {
      return {
        valid: false,
        error: 'No scopes provided in token response'
      };
    }

    const tokenScopes = scope.split(' ');
    const hasRequiredScopes = requiredScopes.some(requiredScope => 
      tokenScopes.includes(requiredScope)
    );

    if (!hasRequiredScopes) {
      return {
        valid: false,
        error: `Token missing required Reddit scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ Reddit token scopes validated successfully`);

    return {
      valid: true,
      scopes: tokenScopes,
      required: requiredScopes
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Reddit access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Reddit user info`);

    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();

      console.log(`✅ Retrieved Reddit user info for: ${userInfo.name}`);

      return {
        id: userInfo.id,
        name: userInfo.name,
        created_utc: userInfo.created_utc,
        link_karma: userInfo.link_karma,
        comment_karma: userInfo.comment_karma,
        total_karma: userInfo.total_karma,
        is_employee: userInfo.is_employee,
        is_mod: userInfo.is_mod,
        is_gold: userInfo.is_gold,
        has_verified_email: userInfo.has_verified_email,
        over_18: userInfo.over_18,
        subreddit: userInfo.subreddit,
        icon_img: userInfo.icon_img,
        pref_show_snoovatar: userInfo.pref_show_snoovatar
      };

    } catch (error) {
      console.error('Failed to get Reddit user info:', error);
      throw new Error(`Reddit user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke Reddit OAuth token
   * @param {string} token - Token to revoke (access or refresh token)
   * @returns {boolean} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Reddit OAuth token`);

    try {
      const response = await fetch(this.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        },
        body: new URLSearchParams({
          token,
          token_type_hint: 'access_token'
        })
      });

      if (!response.ok) {
        throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Reddit token revoked successfully`);
      return true;

    } catch (error) {
      console.error('Reddit token revocation failed:', error);
      throw new Error(`Reddit token revocation failed: ${error.message}`);
    }
  }
}

export const redditOAuth = new RedditOAuth();