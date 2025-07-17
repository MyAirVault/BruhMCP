/**
 * GitHub OAuth Provider Implementation
 * Handles GitHub OAuth 2.0 flows for GitHub API integrations
 */

import { baseOAuth } from './base-oauth.js';

/**
 * GitHub OAuth Provider class
 */
class GitHubOAuth extends baseOAuth {
  constructor() {
    super('github');
    this.authUrl = 'https://github.com/login/oauth/authorize';
    this.tokenUrl = 'https://github.com/login/oauth/access_token';
    this.userInfoUrl = 'https://api.github.com/user';
    this.revokeUrl = 'https://github.com/settings/connections/applications'; // Manual revocation only
  }

  /**
   * Validate GitHub OAuth credentials format
   * @param {string} clientId - GitHub OAuth Client ID
   * @param {string} clientSecret - GitHub OAuth Client Secret
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
      // GitHub Client ID format: alphanumeric, typically 20 characters
      const githubIdRegex = /^[a-zA-Z0-9]{20}$/;
      if (!githubIdRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid GitHub Client ID format - must be 20 alphanumeric characters');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // GitHub Client Secret format validation
      if (clientSecret.length < 40 || clientSecret.length > 40) {
        validation.valid = false;
        validation.errors.push('GitHub Client Secret must be exactly 40 characters');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate GitHub OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - GitHub OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes
   * @param {string} params.state - State parameter for security
   * @param {string} params.redirect_uri - Redirect URI after authorization
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default GitHub scopes if none provided
    const defaultScopes = [
      'repo',
      'user:email',
      'read:user',
      'write:repo_hook',
      'read:org'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      allow_signup: 'true'
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated GitHub OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - GitHub OAuth Client ID
   * @param {string} params.client_secret - GitHub OAuth Client Secret
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

    console.log(`🔄 Exchanging authorization code for GitHub tokens`);

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

      // GitHub doesn't return expires_in by default, tokens don't expire
      console.log(`✅ GitHub tokens obtained successfully (no expiration)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_in: tokens.expires_in || null, // GitHub tokens don't expire by default
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('GitHub token exchange failed:', error);
      throw new Error(`GitHub token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh GitHub access token (GitHub tokens don't expire by default)
   * @param {Object} params - Refresh parameters
   * @returns {Object} Token response
   */
  async refreshAccessToken(params) {
    // GitHub tokens don't expire by default, so no refresh is typically needed
    console.log(`ℹ️  GitHub tokens don't expire by default - no refresh needed`);
    
    return {
      access_token: params.access_token,
      refresh_token: null,
      expires_in: null,
      token_type: 'Bearer',
      scope: params.scope
    };
  }

  /**
   * Validate GitHub token scopes
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { scope } = tokens;

    // Required scopes for GitHub
    const requiredScopes = [
      'repo',
      'user:email'
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
        error: `Token missing required GitHub scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ GitHub token scopes validated successfully`);

    return {
      valid: true,
      scopes: tokenScopes,
      required: requiredScopes
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - GitHub access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching GitHub user info`);

    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'MinimCP-OAuth-Service/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      const userInfo = await response.json();

      console.log(`✅ Retrieved GitHub user info for: ${userInfo.login}`);

      return {
        id: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        email: userInfo.email,
        avatar_url: userInfo.avatar_url,
        html_url: userInfo.html_url,
        company: userInfo.company,
        location: userInfo.location,
        bio: userInfo.bio,
        public_repos: userInfo.public_repos,
        public_gists: userInfo.public_gists,
        followers: userInfo.followers,
        following: userInfo.following,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at
      };

    } catch (error) {
      console.error('Failed to get GitHub user info:', error);
      throw new Error(`GitHub user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke GitHub OAuth token (manual process)
   * @param {string} token - Token to revoke
   * @returns {boolean} False - revocation requires manual action
   */
  async revokeToken(token) {
    console.log(`🔒 GitHub token revocation requires manual action`);
    
    // GitHub doesn't provide an API endpoint for token revocation
    // Users must manually revoke tokens at https://github.com/settings/connections/applications
    console.log(`ℹ️  GitHub token revocation not supported via API - user must revoke manually at ${this.revokeUrl}`);
    return false;
  }
}

export const githubOAuth = new GitHubOAuth();