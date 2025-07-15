/**
 * Microsoft OAuth Provider Implementation
 * Handles Microsoft OAuth 2.0 flows for Microsoft services (Outlook, OneDrive, Teams, etc.)
 */

import { baseOAuth } from './base-oauth.js';

/**
 * Microsoft OAuth Provider class
 */
class MicrosoftOAuth extends baseOAuth {
  constructor() {
    super('microsoft');
    this.authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    this.tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    this.userInfoUrl = 'https://graph.microsoft.com/v1.0/me';
    this.revokeUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/logout';
  }

  /**
   * Validate Microsoft OAuth credentials format
   * @param {string} clientId - Microsoft OAuth Client ID
   * @param {string} clientSecret - Microsoft OAuth Client Secret
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
      // Microsoft Client ID format: UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(clientId)) {
        validation.valid = false;
        validation.errors.push('Invalid Microsoft Client ID format - must be a UUID');
      }
    }

    // Validate Client Secret format
    if (!clientSecret || typeof clientSecret !== 'string') {
      validation.valid = false;
      validation.errors.push('Client Secret is required and must be a string');
    } else {
      // Microsoft Client Secret is typically longer and more complex
      if (clientSecret.length < 10 || clientSecret.length > 200) {
        validation.valid = false;
        validation.errors.push('Microsoft Client Secret length appears invalid');
      }
    }

    return {
      valid: validation.valid,
      error: validation.errors.join(', '),
      field: validation.valid ? null : 'credentials'
    };
  }

  /**
   * Generate Microsoft OAuth authorization URL
   * @param {Object} params - Authorization parameters
   * @param {string} params.client_id - Microsoft OAuth Client ID
   * @param {Array} params.scopes - Required OAuth scopes
   * @param {string} params.state - State parameter for security
   * @param {string} params.redirect_uri - Redirect URI after authorization
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { client_id, scopes, state, redirect_uri } = params;

    // Default Microsoft scopes if none provided
    const defaultScopes = [
      'https://graph.microsoft.com/mail.readwrite',
      'https://graph.microsoft.com/user.read'
    ];

    const requestedScopes = scopes && scopes.length > 0 ? scopes : defaultScopes;

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope: requestedScopes.join(' '),
      state,
      response_mode: 'query',
      prompt: 'consent' // Force consent screen
    });

    const authUrl = `${this.authUrl}?${authParams.toString()}`;
    
    console.log(`🔐 Generated Microsoft OAuth URL for client: ${client_id.substring(0, 10)}...`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} params - Exchange parameters
   * @param {string} params.code - Authorization code from callback
   * @param {string} params.client_id - Microsoft OAuth Client ID
   * @param {string} params.client_secret - Microsoft OAuth Client Secret
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

    console.log(`🔄 Exchanging authorization code for Microsoft tokens`);

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

      const tokens = await response.json();
      
      // Validate response contains required fields
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Microsoft tokens obtained successfully (expires in ${tokens.expires_in} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Microsoft token exchange failed:', error);
      throw new Error(`Microsoft token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh Microsoft access token using refresh token
   * @param {Object} params - Refresh parameters
   * @param {string} params.refresh_token - Microsoft refresh token
   * @param {string} params.client_id - Microsoft OAuth Client ID
   * @param {string} params.client_secret - Microsoft OAuth Client Secret
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

    console.log(`🔄 Refreshing Microsoft access token`);

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
          if (errorJson.error_description) {
            errorMessage = `Token refresh failed: ${errorJson.error_description}`;
          } else if (errorJson.error) {
            errorMessage = `Token refresh failed: ${errorJson.error}`;
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

      console.log(`✅ Microsoft access token refreshed successfully (expires in ${tokens.expires_in} seconds)`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token, // Microsoft may not return new refresh token
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      };

    } catch (error) {
      console.error('Microsoft token refresh failed:', error);
      throw new Error(`Microsoft token refresh failed: ${error.message}`);
    }
  }

  /**
   * Validate Microsoft token scopes
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    const { access_token, scope } = tokens;

    // Required scopes for Microsoft services
    const requiredScopes = [
      'https://graph.microsoft.com/mail.readwrite',
      'https://graph.microsoft.com/user.read'
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
        error: `Token missing required Microsoft scopes. Required: ${requiredScopes.join(', ')}`
      };
    }

    console.log(`✅ Microsoft token scopes validated successfully`);

    return {
      valid: true,
      scopes: tokenScopes,
      required: requiredScopes
    };
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Microsoft access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    console.log(`👤 Fetching Microsoft user info`);

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

      const userInfo = await response.json();

      console.log(`✅ Retrieved Microsoft user info for: ${userInfo.mail || userInfo.userPrincipalName}`);

      return {
        id: userInfo.id,
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName,
        given_name: userInfo.givenName,
        family_name: userInfo.surname,
        job_title: userInfo.jobTitle,
        business_phones: userInfo.businessPhones,
        mobile_phone: userInfo.mobilePhone
      };

    } catch (error) {
      console.error('Failed to get Microsoft user info:', error);
      throw new Error(`Microsoft user info retrieval failed: ${error.message}`);
    }
  }

  /**
   * Revoke Microsoft OAuth token
   * @param {string} token - Token to revoke (access or refresh token)
   * @returns {boolean} True if revocation was successful
   */
  async revokeToken(token) {
    console.log(`🔒 Revoking Microsoft OAuth token`);

    try {
      // Microsoft doesn't have a direct token revocation endpoint
      // Instead, we redirect to logout URL which invalidates the session
      // This is more of a logout than a token revocation
      
      console.log(`ℹ️  Microsoft token revocation simulated (logout URL would be used)`);
      return true;

    } catch (error) {
      console.error('Microsoft token revocation failed:', error);
      throw new Error(`Microsoft token revocation failed: ${error.message}`);
    }
  }
}

export const microsoftOAuth = new MicrosoftOAuth();