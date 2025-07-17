/**
 * Slack OAuth Provider Implementation
 * Handles Slack OAuth 2.0 v2 flows for Slack workspace integrations
 */

import { baseOAuth } from './base-oauth.js';

/**
 * Slack OAuth Provider class
 */
class SlackOAuth extends baseOAuth {
  constructor() {
    super('slack');
    this.authUrl = 'https://slack.com/oauth/v2/authorize';
    this.tokenUrl = 'https://slack.com/api/oauth.v2.access';
    this.userInfoUrl = 'https://slack.com/api/users.info';
    this.revokeUrl = 'https://slack.com/api/auth.revoke';
  }

  /**
   * Validate Slack OAuth credentials format
   * @param {string} clientId - Slack OAuth Client ID
   * @param {string} clientSecret - Slack OAuth Client Secret
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
      // Slack Client ID format: starts with number followed by dot and more numbers
      const slackClientIdRegex = /^\d+\.\d+$/;
      if (!slackClientIdRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid Slack Client ID format - must be in format "number.number"');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Slack Client Secret format validation
      if (clientSecret.length < 30 || clientSecret.length > 40) {
        validation.valid = false;
        validation.errors.push('Slack Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate Slack OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - Slack OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes
   * @param {string} params.state - State parameter for security
   * @param {string} params.redirect_uri - Redirect URI after authorization
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default Slack scopes if none provided
    const defaultScopes = [
      'channels:read',
      'chat:write',
      'users:read',
      'users:read.email'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(','), // Slack uses comma-separated scopes
      state
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Slack OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - Slack OAuth Client ID
   * @param {string} params.client_secret - Slack OAuth Client Secret
   * @param {string} params.redirect_uri - Redirect URI used in authorization
   * @returns {Object} Token response
   */
  async exchangeAuthorizationCode(params) {
    const { code, client_id, client_secret, redirect_uri } = params;

    const tokenData = {
      code,
      client_id,
      client_secret,
      redirect_uri
    };

    console.log(`🔄 Exchanging authorization code for Slack tokens`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Token exchange failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            errorMessage = `Token exchange failed: ${errorJson.error}`;
          }
        } catch (parseError) {
          // Use the default error message
        }
        
        throw new Error(errorMessage);
      }

      const tokens = await response.json();
      
      // Validate Slack response format
      if (!tokens.ok) {
        throw new Error(`Slack API error: ${tokens.error || 'Unknown error'}`);
      }

      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Slack tokens obtained successfully for team: ${tokens.team?.name || 'Unknown'}`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 43200, // Default 12 hours
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope,
        team: tokens.team,
        enterprise: tokens.enterprise,
        is_enterprise_install: tokens.is_enterprise_install,
        authed_user: tokens.authed_user,
        bot_user_id: tokens.bot_user_id
      };

    } catch (error) {
      console.error('Slack token exchange failed:', error);
      throw new Error(`Slack token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh Slack access token using refresh token
   * @param {Object} params - Refresh parameters
   * @param {string} params.refresh_token - Slack refresh token
   * @param {string} params.client_id - Slack OAuth Client ID
   * @param {string} params.client_secret - Slack OAuth Client Secret
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

    console.log(`🔄 Refreshing Slack access token`);

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `Token refresh failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            errorMessage = `Token refresh failed: ${errorJson.error}`;
          }
        } catch (parseError) {
          // Use the default error message
        }
        
        throw new Error(errorMessage);
      }

      const tokens = await response.json();
      
      // Validate Slack response format
      if (!tokens.ok) {
        throw new Error(`Slack API error: ${tokens.error || 'Unknown error'}`);
      }

      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Slack access token refreshed successfully`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token,
        expires_in: tokens.expires_in || 43200,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Slack token refresh failed:', error);
      throw new Error(`Slack token refresh failed: ${error.message}`);
    }
  }

  /**
   * Validate Slack token scopes
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { scope } = tokens;

    // Required scopes for Slack
    const requiredScopes = [
      'channels:read',
      'chat:write',
      'users:read'
    ];

    if (!scope) {
      return {
        valid: false,
        error: 'No scopes provided in token response'
      };
    }

    const tokenScopes = scope.split(',');
    const hasRequiredScopes = requiredScopes.some(requiredScope => 
      tokenScopes.includes(requiredScope)
    );

    if (!hasRequiredScopes) {
      return {
        valid: false,
        error: `Token missing required Slack scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ Slack token scopes validated successfully`);

    return {
      valid: true,
      scopes: tokenScopes,
      required: requiredScopes
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Slack access token
   * @param {string} userId - Slack user ID (optional, defaults to token owner)
   * @returns {Object} User information
   */
  async getUserInfo(accessToken, userId = null) {
    console.log(`👤 Fetching Slack user info`);

    try {
      const params = new URLSearchParams({
        token: accessToken
      });

      if (userId) {
        params.append('user', userId);
      }

      const response = await fetch(`${this.userInfoUrl}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();

      if (!userInfo.ok) {
        throw new Error(`Slack API error: ${userInfo.error || 'Unknown error'}`);
      }

      console.log(`✅ Retrieved Slack user info for: ${userInfo.user?.name || userInfo.user?.id}`);

      return {
        id: userInfo.user.id,
        name: userInfo.user.name,
        real_name: userInfo.user.real_name,
        email: userInfo.user.profile?.email,
        image: userInfo.user.profile?.image_192,
        team_id: userInfo.user.team_id,
        is_admin: userInfo.user.is_admin,
        is_owner: userInfo.user.is_owner,
        is_bot: userInfo.user.is_bot,
        deleted: userInfo.user.deleted
      };

    } catch (error) {
      console.error('Failed to get Slack user info:', error);
      throw new Error(`Slack user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke Slack OAuth token
   * @param {string} token - Token to revoke
   * @returns {boolean} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Slack OAuth token`);

    try {
      const response = await fetch(this.revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({ token })
      });

      if (!response.ok) {
        throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(`Slack API error: ${result.error || 'Unknown error'}`);
      }

      console.log(`✅ Slack token revoked successfully`);
      return true;

    } catch (error) {
      console.error('Slack token revocation failed:', error);
      throw new Error(`Slack token revocation failed: ${error.message}`);
    }
  }
}

export const slackOAuth = new SlackOAuth();