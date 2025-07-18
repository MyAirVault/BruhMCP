/**
 * Credential validation for Todoist MCP service
 * Supports OAuth 2.0 authentication
 */

import { validateBearerToken } from '../utils/oauth-validation.js';

/**
 * Create a validator instance for the validation registry
 * @param {Object} credentials - Credentials to validate
 * @returns {Object} Validator instance with validateFormat and testCredentials methods
 */
export default function createTodoistValidator(credentials) {
  return {
    /**
     * Validate credential format
     * @param {Object} creds - Credentials to validate
     * @returns {Promise<{valid: boolean, error?: string, field?: string, service_info?: Object}>}
     */
    async validateFormat(creds) {
      // Check if credentials is a valid object
      if (!creds || typeof creds !== 'object') {
        return {
          valid: false,
          error: 'Credentials must be a valid object',
          field: 'credentials'
        };
      }

      // Check for OAuth credentials (both camelCase and snake_case)
      const clientId = creds.clientId || creds.client_id;
      const clientSecret = creds.clientSecret || creds.client_secret;

      if (clientId && clientSecret) {
        // Basic validation for OAuth credentials
        if (typeof clientId !== 'string' || clientId.length < 10) {
          return {
            valid: false,
            error: 'Invalid Client ID format',
            field: 'clientId'
          };
        }

        if (typeof clientSecret !== 'string' || clientSecret.length < 10) {
          return {
            valid: false,
            error: 'Invalid Client Secret format',
            field: 'clientSecret'
          };
        }

        return {
          valid: true,
          service_info: {
            service: 'todoist',
            auth_type: 'oauth',
            requires_oauth_flow: true,
            scopes: ['task:add', 'data:read', 'data:write', 'data:delete', 'project:delete']
          }
        };
      }

      // Check for Bearer token or access token
      const token = creds.bearer_token || creds.access_token || creds.bearerToken || creds.accessToken;
      if (token) {
        if (typeof token !== 'string' || token.length < 20) {
          return {
            valid: false,
            error: 'Invalid token format',
            field: creds.bearer_token ? 'bearer_token' : (creds.access_token ? 'access_token' : 'token')
          };
        }

        return {
          valid: true,
          service_info: {
            service: 'todoist',
            auth_type: 'bearer_token'
          }
        };
      }

      return {
        valid: false,
        error: 'Invalid credentials format. Expected OAuth credentials (client_id and client_secret) or bearer_token/access_token',
        field: 'credentials'
      };
    },

    /**
     * Test credentials with actual API
     * @param {Object} creds - Credentials to test
     * @returns {Promise<{valid: boolean, error?: string, field?: string, service_info?: Object}>}
     */
    async testCredentials(creds) {
      // For OAuth credentials without token, we can't test without the full OAuth flow
      const clientId = creds.clientId || creds.client_id;
      const clientSecret = creds.clientSecret || creds.client_secret;
      const token = creds.bearer_token || creds.access_token || creds.bearerToken || creds.accessToken;

      if (clientId && clientSecret && !token) {
        return {
          valid: true,
          service_info: {
            service: 'todoist',
            auth_type: 'oauth',
            requires_oauth_flow: true,
            message: 'OAuth credentials validated. User needs to complete OAuth flow to obtain access token.',
            scopes: ['task:add', 'data:read', 'data:write', 'data:delete', 'project:delete']
          }
        };
      }

      // Test Bearer token or access token
      if (token) {
        try {
          const validation = await validateBearerToken(token);
          return {
            valid: true,
            service_info: {
              service: 'todoist',
              auth_type: 'bearer_token',
              user: {
                id: validation.user_id,
                email: validation.email,
                full_name: validation.full_name,
                timezone: validation.timezone,
                lang: validation.lang
              }
            }
          };
        } catch (error) {
          return {
            valid: false,
            error: `Token validation failed: ${error.message}`,
            field: creds.bearer_token ? 'bearer_token' : (creds.access_token ? 'access_token' : 'token')
          };
        }
      }

      return {
        valid: false,
        error: 'No valid credentials provided for testing',
        field: 'credentials'
      };
    }
  };
}