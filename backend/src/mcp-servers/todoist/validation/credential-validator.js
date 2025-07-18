/**
 * Credential validation for Todoist MCP service
 * Supports OAuth 2.0 authentication
 */

import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import { validateBearerToken } from '../utils/oauth-validation.js';

/**
 * Todoist OAuth validator
 */
class TodoistOAuthValidator extends BaseValidator {
  constructor() {
    super('todoist', 'oauth');
  }

  /**
   * Validate Todoist OAuth credentials format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    // Check for OAuth credentials (both camelCase and snake_case)
    const clientId = credentials.clientId || credentials.client_id;
    const clientSecret = credentials.clientSecret || credentials.client_secret;

    if (!clientId) {
      return createValidationResult(false, 'Client ID is required', 'clientId');
    }

    if (!clientSecret) {
      return createValidationResult(false, 'Client Secret is required', 'clientSecret');
    }

    // Basic validation for OAuth credentials
    if (typeof clientId !== 'string' || clientId.length < 10) {
      return createValidationResult(false, 'Invalid Client ID format', 'clientId');
    }

    if (typeof clientSecret !== 'string' || clientSecret.length < 10) {
      return createValidationResult(false, 'Invalid Client Secret format', 'clientSecret');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Todoist OAuth credentials
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    // OAuth credentials cannot be tested without the full OAuth flow
    return createValidationResult(true, null, null, {
      service: 'Todoist API',
      auth_type: 'oauth',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      message: 'OAuth credentials validated. User needs to complete OAuth flow to obtain access token.',
      scopes: ['task:add', 'data:read', 'data:write', 'data:delete', 'project:delete'],
    });
  }

  /**
   * Get Todoist service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Todoist API',
      auth_type: 'oauth',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      permissions: ['read', 'write', 'manage'],
      scopes: ['task:add', 'data:read', 'data:write', 'data:delete', 'project:delete'],
    };
  }
}

/**
 * Todoist Bearer Token validator
 */
class TodoistBearerTokenValidator extends BaseValidator {
  constructor() {
    super('todoist', 'bearer_token');
  }

  /**
   * Validate Todoist Bearer token format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    // Check for Bearer token or access token
    const token = credentials.bearer_token || credentials.access_token || credentials.bearerToken || credentials.accessToken;
    if (!token) {
      return createValidationResult(false, 'Bearer token or access token is required', 'token');
    }

    if (typeof token !== 'string' || token.length < 20) {
      return createValidationResult(false, 'Invalid token format', 'token');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Todoist Bearer token (OAuth flow - no API test needed)
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // For OAuth flow, format validation is sufficient
    // API testing would require actual OAuth flow completion
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    // Return success with OAuth flow message
    return createValidationResult(true, null, null, {
      service: 'Todoist API',
      auth_type: 'bearer_token',
      validation_type: 'format_validation',
      requires_oauth_flow: true,
      message: 'Token format validated. Full OAuth flow required for API access.',
      permissions: ['read', 'write', 'manage'],
    });
  }

  /**
   * Get Todoist service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Todoist API',
      auth_type: 'bearer_token',
      validation_type: 'format_validation',
      permissions: ['read', 'write', 'manage'],
    };
  }
}

/**
 * Todoist validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createTodoistValidator(credentials) {
  const clientId = credentials?.clientId || credentials?.client_id;
  const clientSecret = credentials?.clientSecret || credentials?.client_secret;
  const token = credentials?.bearer_token || credentials?.access_token || credentials?.bearerToken || credentials?.accessToken;

  if (clientId && clientSecret) {
    return new TodoistOAuthValidator();
  } else if (token) {
    return new TodoistBearerTokenValidator();
  } else {
    throw new Error('Invalid Todoist credentials format - must provide OAuth credentials or bearer token');
  }
}

export default createTodoistValidator;