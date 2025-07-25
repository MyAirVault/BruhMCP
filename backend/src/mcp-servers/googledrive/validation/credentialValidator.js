/**
 * Credential validation utilities for Google Drive MCP service
 * Validates OAuth credentials and token formats
 */

import { BaseValidator, createValidationResult } from '../../../services/validation/baseValidator.js';

/**
 * OAuth credentials interface
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {string} [refreshToken] - OAuth Refresh Token (optional)
 * @property {string} [accessToken] - OAuth Access Token (optional)
 */

/**
 * Validation result interface
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [message] - Success message if validation passed
 * @property {Object} [details] - Additional validation details
 */

/**
 * Token validation result interface
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {Object} [details] - Token validation details
 */

/**
 * Validate OAuth 2.0 credentials for Google Drive
 * @param {OAuthCredentials} credentials - OAuth credentials to validate
 * @returns {Promise<ValidationResult>} Validation result
 */
export async function validateCredentials(credentials) {
  const { clientId, clientSecret, refreshToken, accessToken } = credentials;
  
  // Validate required fields
  if (!clientId || !clientSecret) {
    return {
      valid: false,
      error: 'Client ID and Client Secret are required',
      details: {
        missingFields: {
          clientId: !clientId,
          clientSecret: !clientSecret
        }
      }
    };
  }

  // Validate Client ID format (Google OAuth Client ID format)
  const clientIdRegex = /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;
  if (!clientIdRegex.test(clientId)) {
    return {
      valid: false,
      error: 'Invalid Client ID format',
      details: {
        expected: 'Google OAuth Client ID format: {numbers}-{string}.apps.googleusercontent.com'
      }
    };
  }

  // Validate Client Secret format (Google OAuth Client Secret format)
  if (clientSecret.length < 24) {
    return {
      valid: false,
      error: 'Client Secret appears to be too short',
      details: {
        expected: 'Google OAuth Client Secret should be at least 24 characters'
      }
    };
  }

  // Validate tokens if provided
  if (accessToken) {
    const tokenValidation = validateAccessToken(accessToken);
    if (!tokenValidation.valid) {
      return {
        valid: false,
        error: 'Invalid access token format',
        details: tokenValidation.details
      };
    }
  }

  if (refreshToken) {
    const tokenValidation = validateRefreshToken(refreshToken);
    if (!tokenValidation.valid) {
      return {
        valid: false,
        error: 'Invalid refresh token format',
        details: tokenValidation.details
      };
    }
  }

  // OAuth credentials format is valid
  return {
    valid: true,
    message: 'Credentials validated successfully',
    details: {
      clientId,
      hasRefreshToken: !!refreshToken,
      hasAccessToken: !!accessToken
    }
  };
}

/**
 * Validate OAuth access token format
 * @param {string} accessToken - Access token to validate
 * @returns {TokenValidationResult} Validation result
 */
export function validateAccessToken(accessToken) {
  if (!accessToken) {
    return {
      valid: false,
      details: { error: 'Access token is required' }
    };
  }

  // Google OAuth access tokens are typically 128+ characters
  if (accessToken.length < 50) {
    return {
      valid: false,
      details: { 
        error: 'Access token appears to be too short',
        expected: 'Google OAuth access tokens are typically 50+ characters'
      }
    };
  }

  // Check for basic token format (alphanumeric, dots, hyphens, underscores)
  const tokenRegex = /^[A-Za-z0-9._-]+$/;
  if (!tokenRegex.test(accessToken)) {
    return {
      valid: false,
      details: {
        error: 'Access token contains invalid characters',
        expected: 'Should contain only alphanumeric characters, dots, hyphens, and underscores'
      }
    };
  }

  return {
    valid: true,
    details: {
      length: accessToken.length,
      format: 'valid'
    }
  };
}

/**
 * Validate OAuth refresh token format
 * @param {string} refreshToken - Refresh token to validate
 * @returns {TokenValidationResult} Validation result
 */
export function validateRefreshToken(refreshToken) {
  if (!refreshToken) {
    return {
      valid: false,
      details: { error: 'Refresh token is required' }
    };
  }

  // Google OAuth refresh tokens are typically shorter than access tokens
  if (refreshToken.length < 30) {
    return {
      valid: false,
      details: { 
        error: 'Refresh token appears to be too short',
        expected: 'Google OAuth refresh tokens are typically 30+ characters'
      }
    };
  }

  // Check for basic token format
  const tokenRegex = /^[A-Za-z0-9._/-]+$/;
  if (!tokenRegex.test(refreshToken)) {
    return {
      valid: false,
      details: {
        error: 'Refresh token contains invalid characters',
        expected: 'Should contain only alphanumeric characters, dots, hyphens, underscores, and forward slashes'
      }
    };
  }

  return {
    valid: true,
    details: {
      length: refreshToken.length,
      format: 'valid'
    }
  };
}

/**
 * Validate Google Drive scopes
 * @param {string[]} scopes - Array of OAuth scopes
 * @returns {ValidationResult} Validation result
 */
export function validateScopes(scopes) {
  if (!Array.isArray(scopes)) {
    return {
      valid: false,
      error: 'Scopes must be an array'
    };
  }

  const validScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.photos.readonly',
    'https://www.googleapis.com/auth/drive.scripts',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));

  if (invalidScopes.length > 0) {
    return {
      valid: false,
      error: 'Invalid scopes detected',
      details: {
        invalidScopes,
        validScopes
      }
    };
  }

  // Check for minimum required scopes
  const requiredScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const hasRequiredScopes = requiredScopes.every(scope => 
    scopes.includes(scope) || scopes.includes('https://www.googleapis.com/auth/drive')
  );

  if (!hasRequiredScopes) {
    return {
      valid: false,
      error: 'Missing required scopes',
      details: {
        requiredScopes,
        providedScopes: scopes
      }
    };
  }

  return {
    valid: true,
    details: {
      scopeCount: scopes.length,
      scopes
    }
  };
}

/**
 * Instance configuration interface
 * @typedef {Object} InstanceConfig
 * @property {string} instanceId - Instance UUID
 * @property {string} userId - User UUID
 * @property {string} serviceName - Service name
 * @property {OAuthCredentials} credentials - OAuth credentials
 */

/**
 * Validate instance configuration
 * @param {InstanceConfig} config - Instance configuration
 * @returns {ValidationResult} Validation result
 */
export function validateInstanceConfig(config) {
  const { instanceId, userId, serviceName, credentials } = config;
  
  const errors = [];

  // Validate instance ID (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!instanceId || !uuidRegex.test(instanceId)) {
    errors.push('Invalid instance ID format (expected UUID)');
  }

  // Validate user ID (UUID format)
  if (!userId || !uuidRegex.test(userId)) {
    errors.push('Invalid user ID format (expected UUID)');
  }

  // Validate service name
  if (serviceName !== 'googledrive') {
    errors.push('Invalid service name (expected "googledrive")');
  }

  // Validate credentials
  if (!credentials) {
    errors.push('Credentials are required');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
      details: {
        instanceId: instanceId || 'missing',
        userId: userId || 'missing',
        serviceName: serviceName || 'missing',
        hasCredentials: !!credentials
      }
    };
  }

  return {
    valid: true,
    details: {
      instanceId,
      userId,
      serviceName,
      hasCredentials: true
    }
  };
}

/**
 * Google Drive OAuth validator
 */
class GoogleDriveOAuthValidator extends BaseValidator {
  constructor() {
    super('googledrive', 'oauth');
  }

  /**
   * Mixed credentials interface (supports both camelCase and snake_case)
   * @typedef {Object} MixedCredentials
   * @property {string} [clientId] - OAuth Client ID (camelCase)
   * @property {string} [client_id] - OAuth Client ID (snake_case)
   * @property {string} [clientSecret] - OAuth Client Secret (camelCase)
   * @property {string} [client_secret] - OAuth Client Secret (snake_case)
   * @property {string} [refreshToken] - OAuth Refresh Token (camelCase)
   * @property {string} [refresh_token] - OAuth Refresh Token (snake_case)
   * @property {string} [accessToken] - OAuth Access Token (camelCase)
   * @property {string} [access_token] - OAuth Access Token (snake_case)
   */

  /**
   * Validate Google Drive OAuth credentials format
   * @param {MixedCredentials} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    // Check for OAuth credentials (support both camelCase and snake_case)
    const clientId = credentials.clientId || credentials.client_id;
    const clientSecret = credentials.clientSecret || credentials.client_secret;

    if (!clientId) {
      return createValidationResult(false, 'Client ID is required', 'clientId');
    }

    if (!clientSecret) {
      return createValidationResult(false, 'Client Secret is required', 'clientSecret');
    }

    // Validate Client ID format (Google OAuth Client ID format)
    const clientIdRegex = /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;
    if (!clientIdRegex.test(clientId)) {
      return createValidationResult(false, 'Invalid Client ID format. Expected Google OAuth Client ID format: {numbers}-{string}.apps.googleusercontent.com', 'clientId');
    }

    // Validate Client Secret format
    if (clientSecret.length < 24) {
      return createValidationResult(false, 'Client Secret appears to be too short. Google OAuth Client Secret should be at least 24 characters', 'clientSecret');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Google Drive OAuth credentials against actual API
   * @param {MixedCredentials} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // First validate basic format
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    // Convert to expected format for validateCredentials function
    const clientId = credentials.clientId || credentials.client_id;
    const clientSecret = credentials.clientSecret || credentials.client_secret;
    
    if (!clientId || !clientSecret) {
      return createValidationResult(false, 'Client ID and Client Secret are required', 'credentials');
    }
    
    const creds = {
      clientId,
      clientSecret,
      refreshToken: credentials.refreshToken || credentials.refresh_token,
      accessToken: credentials.accessToken || credentials.access_token
    };

    try {
      const validation = await validateCredentials(creds);
      
      if (validation.valid) {
        return createValidationResult(true, null, null, {
          service: 'Google Drive API',
          auth_type: 'oauth',
          validation_type: 'api_test',
          requires_oauth_flow: true,
          details: validation.details,
        });
      } else {
        return createValidationResult(false, validation.error, 'credentials');
      }
    } catch (error) {
      const err = /** @type {Error} */ (error);
      return createValidationResult(false, `Failed to test Google Drive OAuth credentials: ${err.message}`, 'credentials');
    }
  }

  /**
   * Get Google Drive service information
   * @param {MixedCredentials} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Google Drive API',
      auth_type: 'oauth',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      permissions: ['read', 'write', 'manage'],
    };
  }
}

/**
 * Google Drive validator factory
 * @param {MixedCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createGoogleDriveValidator(credentials) {
  if (credentials && (credentials.clientId || credentials.client_id)) {
    return new GoogleDriveOAuthValidator();
  } else {
    throw new Error('Invalid Google Drive credentials format - must provide clientId or client_id');
  }
}

export default createGoogleDriveValidator;