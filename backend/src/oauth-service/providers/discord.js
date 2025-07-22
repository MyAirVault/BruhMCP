/**
 * @fileoverview Discord OAuth Provider Implementation
 * Handles Discord OAuth 2.0 flows for Discord application integrations
 */

import { baseOAuth } from './base-oauth.js';

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
class DiscordOAuth extends baseOAuth {
  constructor() {
    super('discord');
    this.authUrl = 'https://discord.com/api/oauth2/authorize';
    this.tokenUrl = 'https://discord.com/api/oauth2/token';
    this.userInfoUrl = 'https://discord.com/api/users/@me';
    this.revokeUrl = 'https://discord.com/api/oauth2/token/revoke';
  }

  /**
   * Validate Discord OAuth credentials format
   * @param {string} clientId - Discord OAuth Client ID
   * @param {string} clientSecret - Discord OAuth Client Secret
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
      // Discord Client ID format: 18-19 digit snowflake
      const discordIdRegex = /^\d{18,19}$/;
      if (!discordIdRegex.test(clientId)) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Invalid Discord Client ID format - must be 18-19 digits');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Discord Client Secret format validation
      if (clientSecret.length < 30 || clientSecret.length > 40) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Discord Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors ? validation.errors.join(', ') : undefined,
      field: validation.valid ? undefined : 'credentials'
    };
  }

  /**
   * Generate Discord OAuth authorization URL
   * @param {import('./base-oauth.js').AuthParams} params - Authorization parameters
   * @returns {Promise<string>} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default Discord scopes if none provided
    const defaultScopes = [
      'identify',
      'email',
      'guilds',
      'guilds.members.read'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      prompt: 'consent' // Force consent screen
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Discord OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {import('./base-oauth.js').ExchangeParams} params - Exchange parameters
   * @returns {Promise<DiscordTokenResponse>} Token response
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

    console.log(`🔄 Exchanging authorization code for Discord tokens`);

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

      console.log(`✅ Discord tokens obtained successfully (expires in ${tokens.expires_in || 604800} seconds)`);

      /** @type {DiscordTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 604800, // Default 7 days
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Discord token exchange failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Discord token exchange failed: ${err.message}`);
    }
  }

  /**
   * Refresh Discord access token using refresh token
   * @param {import('./base-oauth.js').RefreshParams} params - Refresh parameters
   * @returns {Promise<DiscordTokenResponse>} New token response
   */
  async refreshAccessToken(params) {
    const { refresh_token, client_id, client_secret } = params;

    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id,
      client_secret
    };

    console.log(`🔄 Refreshing Discord access token`);

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

      console.log(`✅ Discord access token refreshed successfully (expires in ${tokens.expires_in || 604800} seconds)`);

      /** @type {DiscordTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token,
        expires_in: tokens.expires_in || 604800,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Discord token refresh failed:', error);
      
      const err = error instanceof Error ? error : new Error(String(error));
      // Add specific error handling for Discord OAuth errors
      // @ts-ignore - Checking custom property
      if (err.code === 'invalid_grant') {
        throw new Error('invalid_grant: The provided authorization grant is invalid, expired, or revoked');
      // @ts-ignore - Checking custom property
      } else if (err.code === 'invalid_client') {
        throw new Error('invalid_client: Client authentication failed');
      }
      
      throw new Error(`Discord token refresh failed: ${err.message}`);
    }
  }

  /**
   * Validate Discord token scopes
   * @param {DiscordTokenResponse} tokens - Token response
   * @returns {Promise<import('./base-oauth.js').ValidationResult>} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { scope } = tokens;

    // Required scopes for Discord
    const requiredScopes = [
      'identify',
      'email'
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
        error: `Token missing required Discord scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ Discord token scopes validated successfully`);

    return {
      valid: true,
      scopes: tokenScopes,
      required: requiredScopes
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Discord access token
   * @returns {Promise<DiscordUserInfo>} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Discord user info`);

    try {
      const response = await fetch(this.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      /** @type {any} */
      const userInfo = await response.json();

      console.log(`✅ Retrieved Discord user info for: ${userInfo.username}${userInfo.discriminator ? '#' + userInfo.discriminator : ''}`);

      /** @type {DiscordUserInfo} */
      const userInfoResponse = {
        id: userInfo.id,
        username: userInfo.username,
        discriminator: userInfo.discriminator,
        global_name: userInfo.global_name,
        avatar: userInfo.avatar,
        email: userInfo.email,
        verified: userInfo.verified,
        locale: userInfo.locale,
        mfa_enabled: userInfo.mfa_enabled,
        premium_type: userInfo.premium_type,
        public_flags: userInfo.public_flags,
        flags: userInfo.flags,
        banner: userInfo.banner,
        accent_color: userInfo.accent_color
      };
      
      return userInfoResponse;

    } catch (error) {
      console.error('Failed to get Discord user info:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Discord user info retrieval failed: ${err.message}`);
    }
  }

  /**
   * Revoke Discord OAuth token
   * @param {string} token - Token to revoke (access or refresh token)
   * @returns {Promise<boolean>} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Discord OAuth token`);

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

      console.log(`✅ Discord token revoked successfully`);
      return true;

    } catch (error) {
      console.error('Discord token revocation failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Discord token revocation failed: ${err.message}`);
    }
  }
}

export const discordOAuth = new DiscordOAuth();