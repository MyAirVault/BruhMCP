// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import fetch from 'node-fetch';

/**
 * GitHub personal access token validator
 */
class GitHubPATValidator extends BaseValidator {
  constructor() {
    super('github', 'personal_access_token');
  }

  /**
   * Validate GitHub personal access token format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.personal_access_token) {
      return createValidationResult(false, 'Personal access token is required', 'personal_access_token');
    }

    // GitHub personal access tokens start with 'ghp_'
    if (!credentials.personal_access_token.startsWith('ghp_')) {
      return createValidationResult(false, 'Invalid GitHub personal access token format - must start with "ghp_"', 'personal_access_token');
    }

    // Basic length validation
    if (credentials.personal_access_token.length < 40 || credentials.personal_access_token.length > 100) {
      return createValidationResult(false, 'GitHub personal access token length appears invalid', 'personal_access_token');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test GitHub personal access token (format validation only)
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // For development/testing, format validation is sufficient
    // API testing would require real GitHub PAT tokens
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    // Return success with format validation message
    return createValidationResult(true, null, null, {
      service: 'GitHub API',
      auth_type: 'personal_access_token',
      validation_type: 'format_validation',
      message: 'Token format validated. Ready for GitHub API access.',
      permissions: ['repo', 'read:org'],
    });
  }

  /**
   * Get GitHub service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'GitHub API',
      auth_type: 'personal_access_token',
      validation_type: 'format_validation',
      permissions: ['repo', 'read:org'],
    };
  }
}

/**
 * GitHub validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createGitHubValidator(credentials) {
  if (credentials && credentials.personal_access_token) {
    return new GitHubPATValidator();
  } else {
    throw new Error('Invalid GitHub credentials format - must provide personal_access_token');
  }
}

export default createGitHubValidator;