/**
 * @fileoverview Google OAuth Provider Implementation
 * Handles Google OAuth 2.0 flows for Google services (Gmail, Drive, Calendar, etc.)
 */

import { baseOAuth } from './base-oauth.js';

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
class GoogleOAuth extends baseOAuth {
  constructor() {
    super('google');
    this.authUrl = 'https://accounts.google.com/o/oauth2/auth';
    this.tokenUrl = 'https://oauth2.googleapis.com/token';
    this.userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
    this.tokenInfoUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
    this.revokeUrl = 'https://oauth2.googleapis.com/revoke';
  }

  /**
   * Validate Google OAuth credentials format
   * @param {string} clientId - Google OAuth Client ID
   * @param {string} clientSecret - Google OAuth Client Secret
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
      // Google Client ID format: ends with .apps.googleusercontent.com
      if (!clientId.endsWith('.apps.googleusercontent.com')) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Invalid Google Client ID format - must end with .apps.googleusercontent.com');
      }
      
      // Basic length validation
      if (clientId.length < 20 || clientId.length > 100) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Google Client ID length appears invalid');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Google Client Secret is typically 24 characters
      if (clientSecret.length < 20 || clientSecret.length > 50) {
        validation.valid = false;
        if (!validation.errors) validation.errors = [];
        validation.errors.push('Google Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors ? validation.errors.join(', ') : undefined,
      field: validation.valid ? undefined : 'credentials'
    };
  }

  /**
   * Generate Google OAuth authorization URL
   * @param {import('./base-oauth.js').AuthParams} params - Authorization parameters
   * @returns {Promise<string>} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default Gmail scopes if none provided
    const defaultScopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to ensure refresh token
      include_granted_scopes: 'true'
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Google OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {import('./base-oauth.js').ExchangeParams} params - Exchange parameters
   * @returns {Promise<GoogleTokenResponse>} Token response
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

    console.log(`🔄 Exchanging authorization code for Google tokens`);

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

      console.log(`✅ Google tokens obtained successfully (expires in ${tokens.expires_in || 3600} seconds)`);

      /** @type {GoogleTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Google token exchange failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Google token exchange failed: ${err.message}`);
    }
  }

  /**
   * Refresh Google access token using refresh token
   * @param {import('./base-oauth.js').RefreshParams} params - Refresh parameters
   * @returns {Promise<GoogleTokenResponse>} New token response
   */
  async refreshAccessToken(params) {
    const { refresh_token, client_id, client_secret } = params;

    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id,
      client_secret
    };

    console.log(`🔄 Refreshing Google access token`);

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
        
        // Add specific error codes for better error handling
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

      // Validate token scope for Gmail
      if (tokens.scope) {
        /** @type {GoogleTokenResponse} */
        const tokenForValidation = tokens;
        const scopeValidation = await this.validateTokenScopes(tokenForValidation);
        if (!scopeValidation.valid) {
          console.warn(`⚠️  Token scope validation warning: ${scopeValidation.error || 'Unknown validation error'}`);
        }
      }

      console.log(`✅ Google access token refreshed successfully (expires in ${tokens.expires_in || 3600} seconds)`);

      /** @type {GoogleTokenResponse} */
      const tokenResponse = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token, // Google may not return new refresh token
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };
      
      return tokenResponse;

    } catch (error) {
      console.error('Google token refresh failed:', error);
      
      const err = error instanceof Error ? error : new Error(String(error));
      // Add specific error handling for Google OAuth errors
      // @ts-ignore - Checking custom property
      if (err.code === 'invalid_grant') {
        throw new Error('invalid_grant: The provided authorization grant is invalid, expired, revoked, or does not match the redirection URI');
      // @ts-ignore - Checking custom property
      } else if (err.code === 'invalid_client') {
        throw new Error('invalid_client: Client authentication failed');
      // @ts-ignore - Checking custom property
      } else if (err.code === 'invalid_request') {
        throw new Error('invalid_request: The request is missing a required parameter or is otherwise malformed');
      }
      
      throw new Error(`Google token refresh failed: ${err.message}`);
    }
  }

  /**
   * Validate Google token scopes
   * @param {GoogleTokenResponse} tokens - Token response
   * @returns {Promise<import('./base-oauth.js').ValidationResult>} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { scope } = tokens;

    // Required scopes for Gmail
    const requiredScopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email'
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
        error: `Token missing required Gmail scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ Google token scopes validated successfully`);

    return {
      valid: true
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Google access token
   * @returns {Promise<GoogleUserInfo>} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Google user info`);

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

      console.log(`✅ Retrieved Google user info for: ${userInfo.email}`);

      /** @type {GoogleUserInfo} */
      const userInfoResponse = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture,
        locale: userInfo.locale,
        verified_email: userInfo.verified_email
      };
      
      return userInfoResponse;

    } catch (error) {
      console.error('Failed to get Google user info:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Google user info retrieval failed: ${err.message}`);
    }
  }

  /**
   * Revoke Google OAuth token
   * @param {string} token - Token to revoke (access or refresh token)
   * @returns {Promise<boolean>} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Google OAuth token`);

    try {
      const response = await fetch(`${this.revokeUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Google token revoked successfully`);
      return true;

    } catch (error) {
      console.error('Google token revocation failed:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(`Google token revocation failed: ${err.message}`);
    }
  }
}

export const googleOAuth = new GoogleOAuth();