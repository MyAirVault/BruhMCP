/**
 * @fileoverview Base OAuth Provider
 * Common functionality shared across all OAuth providers
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [field] - Field that failed validation
 * @property {string[]} [errors] - Array of error messages
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {number} [expires_in] - Token expiration time in seconds
 * @property {string} [token_type] - Token type (usually 'Bearer')
 * @property {string} [scope] - Granted scopes
 */

/**
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} [name] - User display name
 * @property {string} [given_name] - User first name
 * @property {string} [surname] - User last name
 */

/**
 * @typedef {Object} AuthParams
 * @property {string} client_id - OAuth Client ID
 * @property {string[]} [scopes] - Required OAuth scopes
 * @property {string} state - State parameter for security
 * @property {string} redirect_uri - Redirect URI after authorization
 */

/**
 * @typedef {Object} ExchangeParams
 * @property {string} code - Authorization code from callback
 * @property {string} client_id - OAuth Client ID
 * @property {string} client_secret - OAuth Client Secret
 * @property {string} redirect_uri - Redirect URI used in authorization
 */

/**
 * @typedef {Object} RefreshParams
 * @property {string} refresh_token - Refresh token
 * @property {string} client_id - OAuth Client ID
 * @property {string} client_secret - OAuth Client Secret
 */

/**
 * Base OAuth Provider class
 */
export class baseOAuth {
  /**
   * @param {string} providerName - Name of the OAuth provider
   */
  constructor(providerName) {
    /** @type {string} */
    this.providerName = providerName;
    /** @type {string|null} */
    this.authUrl = null;
    /** @type {string|null} */
    this.tokenUrl = null;
    /** @type {string|null} */
    this.userInfoUrl = null;
    /** @type {string|null} */
    this.revokeUrl = null;
  }

  /**
   * Validate OAuth credentials format (to be implemented by subclasses)
   * @param {string} clientId - OAuth Client ID
   * @param {string} clientSecret - OAuth Client Secret
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validateCredentials(clientId, clientSecret) {
    throw new Error('validateCredentials must be implemented by subclass');
  }

  /**
   * Generate OAuth authorization URL (to be implemented by subclasses)
   * @param {AuthParams} params - Authorization parameters
   * @returns {Promise<string>} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    throw new Error('generateAuthorizationUrl must be implemented by subclass');
  }

  /**
   * Exchange authorization code for tokens (to be implemented by subclasses)
   * @param {ExchangeParams} params - Exchange parameters
   * @returns {Promise<TokenResponse>} Token response
   */
  async exchangeAuthorizationCode(params) {
    throw new Error('exchangeAuthorizationCode must be implemented by subclass');
  }

  /**
   * Refresh access token (to be implemented by subclasses)
   * @param {RefreshParams} params - Refresh parameters
   * @returns {Promise<TokenResponse>} New token response
   */
  async refreshAccessToken(params) {
    throw new Error('refreshAccessToken must be implemented by subclass');
  }

  /**
   * Validate token scopes (to be implemented by subclasses)
   * @param {TokenResponse} tokens - Token response
   * @returns {Promise<ValidationResult>} Scope validation result
   */
  async validateTokenScopes(tokens) {
    throw new Error('validateTokenScopes must be implemented by subclass');
  }

  /**
   * Get user information (to be implemented by subclasses)
   * @param {string} accessToken - Access token
   * @returns {Promise<UserInfo>} User information
   */
  async getUserInfo(accessToken) {
    throw new Error('getUserInfo must be implemented by subclass');
  }

  /**
   * Revoke OAuth token (to be implemented by subclasses)
   * @param {string} token - Token to revoke
   * @returns {Promise<boolean>} True if revocation was successful
   */
  async revokeToken(token) {
    throw new Error('revokeToken must be implemented by subclass');
  }

  /**
   * Common error handler for OAuth API calls
   * @param {Response} response - Fetch response
   * @param {string} operation - Operation name for error context
   * @returns {Promise<any>} Parsed response or throws error
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
   * @param {Record<string, any>} params - Parameters to validate
   * @param {string[]} required - Required parameter names
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
   * @param {TokenResponse} tokens - Token response
   * @returns {ValidationResult} Validation result
   */
  validateTokenResponse(tokens) {
    /** @type {ValidationResult} */
    const validation = {
      valid: true,
      errors: []
    };

    if (!tokens.access_token) {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
      validation.errors.push('Missing access_token');
    }

    if (tokens.expires_in && (!Number.isInteger(tokens.expires_in) || tokens.expires_in <= 0)) {
      validation.valid = false;
      if (!validation.errors) validation.errors = [];
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
   * @returns {{authUrl: string|null, tokenUrl: string|null, userInfoUrl: string|null, revokeUrl: string|null}} Provider URLs
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