/**
 * Base OAuth Provider
 * Common functionality shared across all OAuth providers
 */

/**
 * Base OAuth Provider class
 */
export class baseOAuth {
  constructor(providerName) {
    this.providerName = providerName;
    this.authUrl = null;
    this.tokenUrl = null;
    this.userInfoUrl = null;
    this.revokeUrl = null;
  }

  /**
   * Validate OAuth credentials format (to be implemented by subclasses)
   * @param {string} clientId - OAuth Client ID
   * @param {string} clientSecret - OAuth Client Secret
   * @returns {Object} Validation result
   */
  async validateCredentials(clientId, clientSecret) {
    throw new Error('validateCredentials must be implemented by subclass');
  }

  /**
   * Generate OAuth authorization URL (to be implemented by subclasses)
   * @param {Object} params - Authorization parameters
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    throw new Error('generateAuthorizationUrl must be implemented by subclass');
  }

  /**
   * Exchange authorization code for tokens (to be implemented by subclasses)
   * @param {Object} params - Exchange parameters
   * @returns {Object} Token response
   */
  async exchangeAuthorizationCode(params) {
    throw new Error('exchangeAuthorizationCode must be implemented by subclass');
  }

  /**
   * Refresh access token (to be implemented by subclasses)
   * @param {Object} params - Refresh parameters
   * @returns {Object} New token response
   */
  async refreshAccessToken(params) {
    throw new Error('refreshAccessToken must be implemented by subclass');
  }

  /**
   * Validate token scopes (to be implemented by subclasses)
   * @param {Object} tokens - Token response
   * @returns {Object} Scope validation result
   */
  async validateTokenScopes(tokens) {
    throw new Error('validateTokenScopes must be implemented by subclass');
  }

  /**
   * Get user information (to be implemented by subclasses)
   * @param {string} accessToken - Access token
   * @returns {Object} User information
   */
  async getUserInfo(accessToken) {
    throw new Error('getUserInfo must be implemented by subclass');
  }

  /**
   * Revoke OAuth token (to be implemented by subclasses)
   * @param {string} token - Token to revoke
   * @returns {boolean} True if revocation was successful
   */
  async revokeToken(token) {
    throw new Error('revokeToken must be implemented by subclass');
  }

  /**
   * Common error handler for OAuth API calls
   * @param {Response} response - Fetch response
   * @param {string} operation - Operation name for error context
   * @returns {Object} Parsed response or throws error
   */
  async handleApiResponse(response, operation) {
    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `${operation} failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error_description) {
          errorMessage = `${operation} failed: ${errorJson.error_description}`;
        } else if (errorJson.error) {
          errorMessage = `${operation} failed: ${errorJson.error}`;
        }
      } catch (parseError) {
        // Use the default error message
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Common validation for required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} required - Required parameter names
   * @throws {Error} If required parameters are missing
   */
  validateRequiredParams(params, required) {
    const missing = required.filter(param => !params[param]);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  /**
   * Common token validation
   * @param {Object} tokens - Token response
   * @returns {Object} Validation result
   */
  validateTokenResponse(tokens) {
    const validation = {
      valid: true,
      errors: []
    };

    if (!tokens.access_token) {
      validation.valid = false;
      validation.errors.push('Missing access_token');
    }

    if (tokens.expires_in && (!Number.isInteger(tokens.expires_in) || tokens.expires_in <= 0)) {
      validation.valid = false;
      validation.errors.push('Invalid expires_in value');
    }

    return validation;
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    return this.providerName;
  }

  /**
   * Get provider URLs
   * @returns {Object} Provider URLs
   */
  getProviderUrls() {
    return {
      authUrl: this.authUrl,
      tokenUrl: this.tokenUrl,
      userInfoUrl: this.userInfoUrl,
      revokeUrl: this.revokeUrl
    };
  }
}