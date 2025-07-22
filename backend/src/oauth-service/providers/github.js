/**
 * @fileoverview GitHub OAuth Provider Implementation
 * Handles GitHub OAuth 2.0 flows for GitHub API integrations
 */

import { baseOAuth } from './base-oauth.js';

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
      // GitHub Client ID format: alphanumeric, typically 20 characters
      const githubIdRegex = /^[a-zA-Z0-9]{20}$/;
      if (!githubIdRegex.test(clientId)) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Invalid GitHub Client ID format - must be 20 alphanumeric characters');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // GitHub Client Secret format validation
      if (clientSecret.length < 40 || clientSecret.length > 40) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('GitHub Client Secret must be exactly 40 characters');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors ? validation.errors.join(', ') : undefined,
      field: validation.valid ? undefined : 'credentials'
    };
  }

  /**
   * Generate GitHub OAuth authorization URL
   * @param {import('./base-oauth.js').AuthParams} params - Authorization parameters
   * @returns {Promise<string>} Authorization URL
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
   * @param {import('./base-oauth.js').ExchangeParams} params - Exchange parameters
   * @returns {Promise<GitHubTokenResponse>} Token response
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

      /** @type {any} */
      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      // GitHub doesn't return expires_in by default, tokens don't expire
      console.log(`✅ GitHub tokens obtained successfully (no expiration)`);

      /** @type {GitHubTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_in: tokens.expires_in || null, // GitHub tokens don't expire by default
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('GitHub token exchange failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`GitHub token exchange failed: ${err.message}`);
    }
  }

  /**
   * Refresh GitHub access token (GitHub tokens don't expire by default)
   * @param {import('./base-oauth.js').RefreshParams} params - Refresh parameters
   * @returns {Promise<GitHubTokenResponse>} Token response
   */
  async refreshAccessToken(params) {
    // GitHub tokens don't expire by default, so no refresh is typically needed
    console.log(`ℹ️  GitHub tokens don't expire by default - no refresh needed`);
    
    /** @type {GitHubTokenResponse} */
    const tokenResponse = {
      access_token: params.refresh_token, // Use refresh_token as access_token since GitHub doesn't typically refresh
      refresh_token: undefined,
      expires_in: undefined,
      token_type: 'Bearer',
      scope: undefined
    };
    
    return tokenResponse;
  }

  /**
   * Validate GitHub token scopes
   * @param {GitHubTokenResponse} tokens - Token response
   * @returns {Promise<import('./base-oauth.js').ValidationResult>} Scope validation result
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
      error: undefined,
      field: undefined
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - GitHub access token
   * @returns {Promise<import('./base-oauth.js').UserInfo>} User information
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

      /** @type {any} */
      const userInfo = await response.json();

      console.log(`✅ Retrieved GitHub user info for: ${userInfo.login}`);

      /** @type {import('./base-oauth.js').UserInfo} */
      const userInfoResponse = {
        id: String(userInfo.id), // Convert GitHub ID to string to match UserInfo interface
        email: userInfo.email || '',
        name: userInfo.name,
        given_name: userInfo.name, // GitHub doesn't have separate given_name, use name
        surname: undefined // GitHub doesn't provide separate surname
      };
      
      return userInfoResponse;

    } catch (error) {
      console.error('Failed to get GitHub user info:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`GitHub user info retrieval failed: ${err.message}`);
    }
  }

  /**
   * Revoke GitHub OAuth token (manual process)
   * @param {string} _token - Token to revoke (unused - GitHub doesn't support API revocation)
   * @returns {Promise<boolean>} False - revocation requires manual action
   */
  async revokeToken(_token) {
    console.log(`🔒 GitHub token revocation requires manual action`);
    
    // GitHub doesn't provide an API endpoint for token revocation
    // Users must manually revoke tokens at https://github.com/settings/connections/applications
    console.log(`ℹ️  GitHub token revocation not supported via API - user must revoke manually at ${this.revokeUrl}`);
    return false;
  }
}

export const githubOAuth = new GitHubOAuth();