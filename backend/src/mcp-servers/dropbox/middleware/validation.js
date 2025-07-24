/**
 * Request validation utilities for Dropbox OAuth endpoints
 * Handles parameter sanitization, format checking, and CSRF protection
 */

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID v4
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate instance ID format
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} True if valid instance ID
 */
export function validateInstanceId(instanceId) {
  return typeof instanceId === 'string' && isValidUUID(instanceId);
}

/**
 * Validate OAuth credentials format
 * @param {Object} credentials - Credentials to validate
 * @param {string} credentials.clientId - OAuth client ID
 * @param {string} credentials.clientSecret - OAuth client secret
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateOAuthCredentials(credentials) {
  if (!credentials || typeof credentials !== 'object') {
    return { valid: false, error: 'Credentials must be an object' };
  }

  const { clientId, clientSecret } = credentials;

  if (!clientId || typeof clientId !== 'string') {
    return { valid: false, error: 'Client ID is required and must be a string' };
  }

  if (!clientSecret || typeof clientSecret !== 'string') {
    return { valid: false, error: 'Client Secret is required and must be a string' };
  }

  // Basic format validation for Dropbox client IDs (they should be alphanumeric)
  if (!/^[a-zA-Z0-9]+$/.test(clientId)) {
    return { valid: false, error: 'Client ID format is invalid' };
  }

  if (clientSecret.length < 10) {
    return { valid: false, error: 'Client Secret appears to be too short' };
  }

  return { valid: true };
}

/**
 * Validate OAuth state parameter for CSRF protection
 * @param {string} state - State parameter to validate
 * @returns {{valid: boolean, error?: string, data?: Object}} Validation result
 */
export function validateOAuthState(state) {
  if (!state || typeof state !== 'string') {
    return { valid: false, error: 'State parameter is required' };
  }

  try {
    // Decode base64 state
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const stateData = JSON.parse(decoded);

    // Validate required fields
    if (!stateData.instanceId || !validateInstanceId(stateData.instanceId)) {
      return { valid: false, error: 'Invalid instance ID in state' };
    }

    if (!stateData.userId || typeof stateData.userId !== 'string') {
      return { valid: false, error: 'Invalid user ID in state' };
    }

    if (!stateData.timestamp || typeof stateData.timestamp !== 'number') {
      return { valid: false, error: 'Invalid timestamp in state' };
    }

    if (stateData.service !== 'dropbox') {
      return { valid: false, error: 'Invalid service in state' };
    }

    // Check timestamp (state should not be older than 1 hour)
    const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    if (Date.now() - stateData.timestamp > maxAge) {
      return { valid: false, error: 'State parameter has expired' };
    }

    return { valid: true, data: stateData };
  } catch (error) {
    return { valid: false, error: 'Invalid state parameter format' };
  }
}

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {number} [maxLength=255] - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 255) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove control characters and limit length
  return input
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate authorization code format
 * @param {string} code - Authorization code to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAuthorizationCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Authorization code is required' };
  }

  // Dropbox authorization codes are typically long alphanumeric strings
  if (code.length < 10 || code.length > 512) {
    return { valid: false, error: 'Authorization code length is invalid' };
  }

  // Should only contain URL-safe characters
  if (!/^[a-zA-Z0-9\-_=]+$/.test(code)) {
    return { valid: false, error: 'Authorization code contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate refresh token format
 * @param {string} refreshToken - Refresh token to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateRefreshToken(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    return { valid: false, error: 'Refresh token is required' };
  }

  // Dropbox refresh tokens are typically long alphanumeric strings
  if (refreshToken.length < 20 || refreshToken.length > 512) {
    return { valid: false, error: 'Refresh token length is invalid' };
  }

  // Should only contain URL-safe characters
  if (!/^[a-zA-Z0-9\-_=]+$/.test(refreshToken)) {
    return { valid: false, error: 'Refresh token contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate access token format
 * @param {string} accessToken - Access token to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') {
    return { valid: false, error: 'Access token is required' };
  }

  // Dropbox access tokens are typically long alphanumeric strings
  if (accessToken.length < 20 || accessToken.length > 512) {
    return { valid: false, error: 'Access token length is invalid' };
  }

  // Should only contain URL-safe characters
  if (!/^[a-zA-Z0-9\-_=]+$/.test(accessToken)) {
    return { valid: false, error: 'Access token contains invalid characters' };
  }

  return { valid: true };
}