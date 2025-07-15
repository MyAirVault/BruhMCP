/**
 * Token Exchange - Handles OAuth token exchange operations
 * Stateless service that exchanges refresh tokens and credentials for access tokens
 */

import { googleOAuth } from '../providers/google.js';
import { microsoftOAuth } from '../providers/microsoft.js';

/**
 * Token Exchange class for handling token operations
 */
class TokenExchange {
  constructor() {
    this.providers = {
      google: googleOAuth,
      microsoft: microsoftOAuth
    };
  }

  /**
   * Exchange refresh token for new access token
   * @param {Object} params - Token exchange parameters
   * @param {string} params.provider - OAuth provider name
   * @param {string} params.refresh_token - Refresh token
   * @param {string} params.client_id - OAuth client ID
   * @param {string} params.client_secret - OAuth client secret
   * @returns {Object} New token response
   */
  async exchangeRefreshToken(params) {
    const { provider, refresh_token, client_id, client_secret } = params;

    const oauthProvider = this.providers[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Validate credentials format
    const validation = await oauthProvider.validateCredentials(client_id, client_secret);
    if (!validation.valid) {
      throw new Error(`Invalid credentials: ${validation.error}`);
    }

    console.log(`🔄 Refreshing token for ${provider}`);

    try {
      // Exchange refresh token for new access token
      const tokens = await oauthProvider.refreshAccessToken({
        refresh_token,
        client_id,
        client_secret
      });

      // Validate token response
      if (!tokens.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      console.log(`✅ Token refreshed successfully for ${provider}`);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refresh_token, // Some providers don't return new refresh token
        expires_in: tokens.expires_in || 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope,
        expires_at: Date.now() + (tokens.expires_in * 1000)
      };

    } catch (error) {
      console.error(`❌ Token refresh failed for ${provider}:`, error);
      
      // Enhanced error handling for common OAuth errors
      if (error.message.includes('invalid_grant')) {
        throw new Error('Refresh token is invalid or expired - user may need to re-authorize');
      } else if (error.message.includes('invalid_client')) {
        throw new Error('Invalid OAuth client credentials');
      } else if (error.message.includes('invalid_request')) {
        throw new Error('Invalid token refresh request format');
      }
      
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Exchange credentials for new tokens (fallback method)
   * @param {Object} params - Credential exchange parameters
   * @param {string} params.provider - OAuth provider name
   * @param {string} params.client_id - OAuth client ID
   * @param {string} params.client_secret - OAuth client secret
   * @param {Array} params.scopes - Required OAuth scopes
   * @returns {Object} Token response
   */
  async exchangeCredentials(params) {
    const { provider, client_id, client_secret, scopes } = params;

    const oauthProvider = this.providers[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Validate credentials format
    const validation = await oauthProvider.validateCredentials(client_id, client_secret);
    if (!validation.valid) {
      throw new Error(`Invalid credentials: ${validation.error}`);
    }

    console.log(`🔐 Exchanging credentials for ${provider}`);

    try {
      // This would typically require a full OAuth flow
      // For now, this is a placeholder for credential-based token exchange
      throw new Error('Credential exchange requires full OAuth flow - use authorization code flow instead');

    } catch (error) {
      console.error(`❌ Credential exchange failed for ${provider}:`, error);
      throw new Error(`Credential exchange failed: ${error.message}`);
    }
  }

  /**
   * Validate token format and structure
   * @param {Object} tokens - Token response
   * @returns {Object} Validation result
   */
  validateTokenResponse(tokens) {
    const requiredFields = ['access_token'];
    const optionalFields = ['refresh_token', 'expires_in', 'token_type', 'scope'];

    const validation = {
      valid: true,
      errors: []
    };

    // Check required fields
    for (const field of requiredFields) {
      if (!tokens[field]) {
        validation.valid = false;
        validation.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate token format
    if (tokens.access_token && typeof tokens.access_token !== 'string') {
      validation.valid = false;
      validation.errors.push('access_token must be a string');
    }

    // Validate expires_in
    if (tokens.expires_in && (!Number.isInteger(tokens.expires_in) || tokens.expires_in <= 0)) {
      validation.valid = false;
      validation.errors.push('expires_in must be a positive integer');
    }

    // Validate token_type
    if (tokens.token_type && !['Bearer', 'bearer'].includes(tokens.token_type)) {
      validation.valid = false;
      validation.errors.push('token_type must be "Bearer"');
    }

    return validation;
  }

  /**
   * Format token response for consistent output
   * @param {Object} tokens - Raw token response
   * @param {string} provider - OAuth provider name
   * @returns {Object} Formatted token response
   */
  formatTokenResponse(tokens, provider) {
    const validation = this.validateTokenResponse(tokens);
    
    if (!validation.valid) {
      throw new Error(`Invalid token response: ${validation.errors.join(', ')}`);
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_in: tokens.expires_in || 3600,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope || null,
      expires_at: Date.now() + ((tokens.expires_in || 3600) * 1000),
      provider,
      issued_at: Date.now()
    };
  }

  /**
   * Check if token is expired or will expire soon
   * @param {Object} tokenData - Token data with expiration info
   * @param {number} bufferMinutes - Minutes before expiry to consider token as expired
   * @returns {boolean} True if token is expired or will expire soon
   */
  isTokenExpired(tokenData, bufferMinutes = 5) {
    if (!tokenData || !tokenData.expires_at) {
      return true;
    }

    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;
    const expiresSoon = tokenData.expires_at - now < bufferMs;

    if (expiresSoon) {
      const minutesLeft = Math.floor((tokenData.expires_at - now) / 60000);
      console.log(`⏰ Token expires in ${minutesLeft} minutes (considering expired due to ${bufferMinutes}min buffer)`);
    }

    return expiresSoon;
  }

  /**
   * Get supported providers
   * @returns {Array} List of supported providers
   */
  getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if provider is supported
   * @param {string} provider - Provider name
   * @returns {boolean} Whether provider is supported
   */
  isProviderSupported(provider) {
    return this.providers.hasOwnProperty(provider);
  }
}

export const tokenExchange = new TokenExchange();