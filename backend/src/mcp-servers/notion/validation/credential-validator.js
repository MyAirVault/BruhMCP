/**
 * Credential validation for Notion MCP service
 * Updated to support OAuth Bearer token authentication
 */

import { BaseValidator, createValidationResult } from '../../../services/validation/baseValidator.js';
import { validateBearerToken } from '../utils/oauth-validation.js';
import { NotionService } from '../api/notion-api.js';
import { Logger } from '../utils/logger.js';

/**
 * Validate Notion Bearer token by making a test request
 * @param {string} bearerToken - OAuth Bearer token to validate
 * @returns {Promise<{valid: boolean, error?: string, user?: Object}>} Validation result
 */
export async function validateNotionBearerToken(bearerToken) {
	try {
		// Basic format validation
		if (!bearerToken || typeof bearerToken !== 'string') {
			return {
				valid: false,
				error: 'Invalid Bearer token format',
			};
		}

		// Test the Bearer token by making a request to the current user endpoint
		const validation = await validateBearerToken(bearerToken);

		if (validation.isValid) {
			Logger.log('Bearer token validation successful');
			return {
				valid: true,
				user: validation.user,
			};
		} else {
			Logger.error('Bearer token validation failed:', validation.error);

			// Parse the error to provide meaningful feedback
			if (validation.errorType === 'INVALID_TOKEN') {
				return {
					valid: false,
					error: 'Invalid Bearer token: Unauthorized access to Notion API',
				};
			} else if (validation.statusCode === 403) {
				return {
					valid: false,
					error: 'Bearer token lacks necessary permissions',
				};
			} else if (validation.statusCode === 429) {
				return {
					valid: false,
					error: 'Rate limit exceeded during validation. Please try again later.',
				};
			} else {
				return {
					valid: false,
					error: `Bearer token validation failed: ${validation.error}`,
				};
			}
		}
	} catch (error) {
		Logger.error('Credential validation error:', error);
		return {
			valid: false,
			error: `Validation error: ${error.message}`,
		};
	}
}

/**
 * Validate instance credentials structure
 * @param {Object} credentials - Credentials object
 * @returns {boolean} True if valid structure
 */
export function validateCredentialStructure(credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return false;
	}

	// For OAuth authentication, we need client_id and client_secret
	if (credentials.auth_type === 'oauth') {
		return (
			credentials.client_id &&
			credentials.client_secret &&
			typeof credentials.client_id === 'string' &&
			typeof credentials.client_secret === 'string'
		);
	}

	// For legacy API key authentication (deprecated)
	if (credentials.auth_type === 'api_key') {
		return credentials.api_key && typeof credentials.api_key === 'string';
	}

	return false;
}

/**
 * Extract OAuth credentials from credentials object
 * @param {Object} credentials - Credentials object
 * @returns {Object|null} OAuth credentials or null if not found
 */
export function extractOAuthCredentials(credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return null;
	}

	if (credentials.auth_type === 'oauth') {
		return {
			clientId: credentials.client_id,
			clientSecret: credentials.client_secret,
			accessToken: credentials.access_token,
			refreshToken: credentials.refresh_token,
		};
	}

	// For legacy API key authentication (deprecated)
	if (credentials.auth_type === 'api_key' && credentials.api_key) {
		return {
			accessToken: credentials.api_key,
		};
	}

	return null;
}

/**
 * Validate credentials and extract OAuth info
 * @param {Object} credentials - Credentials object
 * @returns {Promise<{valid: boolean, oauthCredentials?: Object, error?: string}>} Validation result
 */
export async function validateAndExtractCredentials(credentials) {
	try {
		// Validate structure
		if (!validateCredentialStructure(credentials)) {
			return {
				valid: false,
				error: 'Invalid credentials structure. Expected OAuth credentials with client_id and client_secret',
			};
		}

		// Extract OAuth credentials
		const oauthCredentials = extractOAuthCredentials(credentials);
		if (!oauthCredentials) {
			return {
				valid: false,
				error: 'Could not extract OAuth credentials from credentials object',
			};
		}

		// For OAuth, we validate the structure but not the tokens here
		// Token validation happens during authentication middleware
		if (credentials.auth_type === 'oauth') {
			return {
				valid: true,
				oauthCredentials,
			};
		}

		// For legacy API key validation
		if (credentials.auth_type === 'api_key' && oauthCredentials.accessToken) {
			const validation = await validateNotionBearerToken(oauthCredentials.accessToken);
			if (!validation.valid) {
				return validation;
			}
			return {
				valid: true,
				oauthCredentials,
			};
		}

		return {
			valid: false,
			error: 'Unsupported authentication type',
		};
	} catch (error) {
		Logger.error('Credential validation error:', error);
		return {
			valid: false,
			error: `Credential validation failed: ${error.message}`,
		};
	}
}

/**
 * Notion OAuth validator
 */
class NotionOAuthValidator extends BaseValidator {
  constructor() {
    super('notion', 'oauth');
  }

  /**
   * Validate Notion OAuth credentials format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    // Check for OAuth credentials
    if (credentials.client_id && credentials.client_secret) {
      return createValidationResult(true, null, null, this.getServiceInfo(credentials));
    }

    return createValidationResult(false, 'OAuth credentials require client_id and client_secret', 'credentials');
  }

  /**
   * Test Notion OAuth credentials
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    // OAuth credentials cannot be tested without the full OAuth flow
    return createValidationResult(true, null, null, {
      service: 'Notion API',
      auth_type: 'oauth',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      message: 'OAuth credentials validated. User needs to complete OAuth flow to obtain access token.',
    });
  }

  /**
   * Get Notion service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Notion API',
      auth_type: 'oauth',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      permissions: ['read', 'write', 'manage'],
    };
  }
}

/**
 * Notion Bearer Token validator
 */
class NotionBearerTokenValidator extends BaseValidator {
  constructor() {
    super('notion', 'bearer_token');
  }

  /**
   * Validate Notion Bearer token format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    const token = credentials.bearer_token || credentials.access_token || credentials.api_key;
    if (!token) {
      return createValidationResult(false, 'Bearer token, access token, or API key is required', 'token');
    }

    if (typeof token !== 'string' || token.trim() === '') {
      return createValidationResult(false, 'Token must be a non-empty string', 'token');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Notion Bearer token against actual API
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    const token = credentials.bearer_token || credentials.access_token || credentials.api_key;
    
    try {
      const validation = await validateNotionBearerToken(token);
      if (validation.valid) {
        return createValidationResult(true, null, null, {
          service: 'Notion API',
          auth_type: credentials.api_key ? 'api_key' : 'bearer_token',
          validation_type: 'api_test',
          user: validation.user,
          permissions: ['read', 'write'],
        });
      } else {
        return createValidationResult(false, validation.error || 'Invalid token', 'token');
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to test Notion token: ${error.message}`, 'token');
    }
  }

  /**
   * Get Notion service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Notion API',
      auth_type: 'bearer_token',
      validation_type: 'format_validation',
      permissions: ['read', 'write'],
    };
  }
}

/**
 * Notion validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createNotionValidator(credentials) {
  if (credentials && credentials.client_id && credentials.client_secret) {
    return new NotionOAuthValidator();
  } else if (credentials && (credentials.bearer_token || credentials.access_token || credentials.api_key)) {
    return new NotionBearerTokenValidator();
  } else {
    throw new Error('Invalid Notion credentials format - must provide OAuth credentials or bearer token');
  }
}

export default createNotionValidator;
