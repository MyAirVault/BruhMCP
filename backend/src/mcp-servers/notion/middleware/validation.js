/**
 * Validation utilities for Notion OAuth credential authentication
 * Handles instance ID format validation and instance status checks
 */

import './types.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Validate instance ID format using UUID v4 regex
 * @param {string} instanceId - The instance ID to validate
 * @returns {boolean} True if valid UUID v4 format
 */
export function isValidInstanceId(instanceId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(instanceId);
}

/**
 * Create error response for invalid instance ID format
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The invalid instance ID
 * @returns {void} Express response
 */
export function createInstanceIdValidationError(res, instanceId) {
  return ErrorResponses.invalidInput(res, 'Invalid instance ID format', {
    instanceId,
    metadata: {
      expectedFormat: 'UUID v4'
    }
  });
}

/**
 * Validate instance exists and is not null
 * @param {import('./types.js').DatabaseInstance | null | undefined} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceExists(instance, res, instanceId) {
  if (!instance) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.notFound(res, 'Instance', {
        instanceId,
        metadata: {
          service: 'notion'
        }
      })
    };
  }
  
  return { isValid: true };
}

/**
 * Validate service is active
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateServiceActive(instance, res, instanceId) {
  if (!instance.service_active) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.serviceUnavailable(res, 'Notion service is currently disabled', {
        instanceId,
        metadata: {
          service: 'notion'
        }
      })
    };
  }
  
  return { isValid: true };
}

/**
 * Validate instance status is not inactive or expired
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceStatus(instance, res, instanceId) {
  if (instance.status === 'inactive') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance is paused', {
        instanceId,
        metadata: {
          status: instance.status
        }
      })
    };
  }

  if (instance.status === 'expired') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance has expired', {
        instanceId,
        metadata: {
          status: instance.status
        }
      })
    };
  }
  
  return { isValid: true };
}

/**
 * Validate instance has not expired based on expires_at
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstanceNotExpired(instance, res, instanceId) {
  if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance has expired', {
        instanceId,
        expiresAt: instance.expires_at
      })
    };
  }
  
  return { isValid: true };
}

/**
 * Validate OAuth credentials are properly configured
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateOAuthCredentials(instance, res, instanceId) {
  if (instance.auth_type !== 'oauth' || !instance.client_id || !instance.client_secret) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.internal(res, 'Invalid OAuth credentials configuration', {
        instanceId,
        metadata: {
          authType: instance.auth_type
        }
      })
    };
  }
  
  return { isValid: true };
}

/**
 * Comprehensive instance validation
 * @param {import('./types.js').DatabaseInstance | null | undefined} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {boolean} requireOAuth - Whether OAuth validation is required
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
export function validateInstance(instance, res, instanceId, requireOAuth = true) {
  // Check if instance exists
  const existsResult = validateInstanceExists(instance, res, instanceId);
  if (!existsResult.isValid) {
    return existsResult;
  }

  // TypeScript assertion: instance is not null after validation
  const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

  // Check service is active
  const activeResult = validateServiceActive(validInstance, res, instanceId);
  if (!activeResult.isValid) {
    return activeResult;
  }

  // Check instance status
  const statusResult = validateInstanceStatus(validInstance, res, instanceId);
  if (!statusResult.isValid) {
    return statusResult;
  }

  // Check expiration
  const expirationResult = validateInstanceNotExpired(validInstance, res, instanceId);
  if (!expirationResult.isValid) {
    return expirationResult;
  }

  // Check OAuth credentials if required
  if (requireOAuth) {
    const oauthResult = validateOAuthCredentials(validInstance, res, instanceId);
    if (!oauthResult.isValid) {
      return oauthResult;
    }
  }

  return { isValid: true };
}

export default {
  isValidInstanceId,
  createInstanceIdValidationError,
  validateInstanceExists,
  validateServiceActive,
  validateInstanceStatus,
  validateInstanceNotExpired,
  validateOAuthCredentials,
  validateInstance
};