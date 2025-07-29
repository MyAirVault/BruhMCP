/**
 * Credential validation for Notion MCP service
 * Updated to support OAuth Bearer token authentication
 */

const { BaseValidator, createValidationResult  } = require('../../../services/validation/baseValidator');
const { validateBearerToken  } = require('../utils/oauthValidation');
const { Logger  } = require('../utils/validation');

/**
 * Credentials object for OAuth authentication
 * @typedef {Object} OAuthCredentials
 * @property {string} auth_type - Authentication type ('oauth' or 'api_key')
 * @property {string} [client_id] - OAuth client ID (required for oauth)
 * @property {string} [client_secret] - OAuth client secret (required for oauth)
 * @property {string} [access_token] - Access token (optional for oauth)
 * @property {string} [refresh_token] - Refresh token (optional for oauth)
 * @property {string} [api_key] - API key (required for api_key auth type)
 */

/**
 * Validate Notion Bearer token by making a test request
 * @param {string} bearerToken - OAuth Bearer token to validate
 * @returns {Promise<{valid: boolean, error?: string, user?: Object}>} Validation result
 */
async function validateNotionBearerToken(bearerToken) {
	try {
		// Basic format validation
		if (!bearerToken || typeof bearerToken !== 'string') {
			return {
				valid: false,
				error: 'Invalid Bearer token format',
			};
		}

		// Test the Bearer token by making a request to the current user endpoint
		// validateBearerToken throws on error, returns TokenValidationResult on success
		const validation = await validateBearerToken(bearerToken);

		// If we reach here, validation succeeded (no error thrown)
		Logger.log('Bearer token validation successful');
		return {
			valid: true,
			user: {
				id: validation.userId,
				name: validation.workspaceName,
				type: 'bot',
				avatarUrl: ''
			},
		};
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		Logger.error('Credential validation error:', err);
		
		// Handle specific error types from validateBearerToken
		const errorMessage = error instanceof Error ? error.message : String(error);
		
		if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
			return {
				valid: false,
				error: 'Invalid Bearer token: Unauthorized access to Notion API',
			};
		} else if (errorMessage.includes('403')) {
			return {
				valid: false,
				error: 'Bearer token lacks necessary permissions',
			};
		} else if (errorMessage.includes('429')) {
			return {
				valid: false,
				error: 'Rate limit exceeded during validation. Please try again later.',
			};
		} else {
			return {
				valid: false,
				error: `Validation error: ${errorMessage}`,
			};
		}
	}
}

/**
 * Validate instance credentials structure
 * @param {OAuthCredentials} credentials - Credentials object
 * @returns {boolean} True if valid structure
 */
function validateCredentialStructure(credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return false;
	}

	const creds = /** @type {Record<string, any>} */ (credentials);

	// For OAuth authentication, we need client_id and client_secret
	if (creds.auth_type === 'oauth') {
		return (
			creds.client_id &&
			creds.client_secret &&
			typeof creds.client_id === 'string' &&
			typeof creds.client_secret === 'string'
		);
	}

	// For legacy API key authentication (deprecated)
	if (creds.auth_type === 'api_key') {
		return creds.api_key && typeof creds.api_key === 'string';
	}

	return false;
}

/**
 * Extract OAuth credentials from credentials object
 * @param {Object} credentials - Credentials object
 * @returns {Object|null} OAuth credentials or null if not found
 */
function extractOAuthCredentials(credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return null;
	}

	const creds = /** @type {Record<string, any>} */ (credentials);

	if (creds.auth_type === 'oauth') {
		return {
			clientId: creds.client_id,
			clientSecret: creds.client_secret,
			accessToken: creds.access_token,
			refreshToken: creds.refresh_token,
		};
	}

	// For legacy API key authentication (deprecated)
	if (creds.auth_type === 'api_key' && creds.api_key) {
		return {
			accessToken: creds.api_key,
		};
	}

	return null;
}

/**
 * Validate credentials and extract OAuth info
 * @param {Object} credentials - Credentials object
 * @returns {Promise<{valid: boolean, oauthCredentials?: Object, error?: string}>} Validation result
 */
async function validateAndExtractCredentials(credentials) {
	try {
		// Validate structure
		if (!validateCredentialStructure(/** @type {OAuthCredentials} */ (credentials))) {
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

		const creds = /** @type {Record<string, any>} */ (credentials);

		// For OAuth, we validate the structure but not the tokens here
		// Token validation happens during authentication middleware
		if (creds.auth_type === 'oauth') {
			return {
				valid: true,
				oauthCredentials,
			};
		}

		// For legacy API key validation
		const oauthCreds = /** @type {Record<string, any>} */ (oauthCredentials);
		if (creds.auth_type === 'api_key' && oauthCredentials && oauthCreds.accessToken) {
			const validation = await validateNotionBearerToken(String(oauthCreds.accessToken));
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		Logger.error('Credential validation error:', { message: errorMessage });
		return {
			valid: false,
			error: `Credential validation failed: ${errorMessage}`,
		};
	}
}

/**
 * OAuth credentials for Notion validator
 * @typedef {Object} NotionOAuthCredentials
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 */

/**
 * Bearer token credentials for Notion validator
 * @typedef {Object} NotionBearerTokenCredentials
 * @property {string} [bearer_token] - Bearer token
 * @property {string} [access_token] - Access token
 * @property {string} [api_key] - API key
 */

/**
 * Notion OAuth validator
 */
class NotionOAuthValidator extends BaseValidator {
  constructor() {
    super('notion', 'oauth');
  }

  /**
   * Validate Notion OAuth credentials format
   * @param {Object} credentials - Credentials to validate
   * @param {string} credentials.client_id - OAuth client ID
   * @param {string} credentials.client_secret - OAuth client secret
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
   * @param {Object} credentials - Credentials to test
   * @param {string} credentials.client_id - OAuth client ID
   * @param {string} credentials.client_secret - OAuth client secret
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
   * Service information for OAuth
   * @typedef {Object} NotionOAuthServiceInfo
   * @property {string} service - Service name
   * @property {string} auth_type - Authentication type
   * @property {string} validation_type - Validation type
   * @property {boolean} requires_oauth_flow - Whether OAuth flow is required
   * @property {string[]} permissions - Available permissions
   */

  /**
   * Get Notion service information
   * @param {NotionOAuthCredentials} _credentials - Validated credentials
   * @returns {NotionOAuthServiceInfo} Service information
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
   * @param {NotionBearerTokenCredentials} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    const creds = /** @type {Record<string, any>} */ (credentials);
    const token = creds.bearer_token || creds.access_token || creds.api_key;
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
   * @param {NotionBearerTokenCredentials} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    const creds = /** @type {Record<string, any>} */ (credentials);
    const token = creds.bearer_token || creds.access_token || creds.api_key;
    
    try {
      const validation = await validateNotionBearerToken(String(token || ''));
      if (validation.valid) {
        return createValidationResult(true, null, null, {
          service: 'Notion API',
          auth_type: creds.api_key ? 'api_key' : 'bearer_token',
          validation_type: 'api_test',
          user: validation.user,
          permissions: ['read', 'write'],
        });
      } else {
        return createValidationResult(false, validation.error || 'Invalid token', 'token');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return createValidationResult(false, `Failed to test Notion token: ${errorMessage}`, 'token');
    }
  }

  /**
   * Service information for Bearer token
   * @typedef {Object} NotionBearerTokenServiceInfo
   * @property {string} service - Service name
   * @property {string} auth_type - Authentication type
   * @property {string} validation_type - Validation type
   * @property {string[]} permissions - Available permissions
   */

  /**
   * Get Notion service information
   * @param {NotionBearerTokenCredentials} _credentials - Validated credentials
   * @returns {NotionBearerTokenServiceInfo} Service information
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
 * @param {OAuthCredentials|NotionBearerTokenCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createNotionValidator(credentials) {
  const creds = /** @type {Record<string, any>} */ (credentials);
  if (credentials && creds.client_id && creds.client_secret) {
    return new NotionOAuthValidator();
  } else if (credentials && (creds.bearer_token || creds.access_token || creds.api_key)) {
    return new NotionBearerTokenValidator();
  } else {
    throw new Error('Invalid Notion credentials format - must provide OAuth credentials or bearer token');
  }
}

module.exports = createNotionValidator;
