/**
 * Credential validation for Notion MCP service
 * Updated to support OAuth Bearer token authentication
 */

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
