/**
 * Validation utilities for OAuth credential authentication
 * Handles instance ID format validation and instance status checks
 */

require('./types.js');
const { ErrorResponses  } = require('../../../utils/errorResponse');

/**
 * Validate instance ID format using UUID v4 regex
 * @param {string} instanceId - The instance ID to validate
 * @returns {boolean} True if valid UUID v4 format
 */
function isValidInstanceId(instanceId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(instanceId);
}

/**
 * Create error response for invalid instance ID format
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The invalid instance ID
 * @returns {void} Express response
 */
function createInstanceIdValidationError(res, instanceId) {
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
function validateInstanceExists(instance, res, instanceId) {
  if (!instance) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.notFound(res, 'Instance', {
        instanceId
      })
    };
  }
  
  return { isValid: true, errorResponse: undefined };
}

/**
 * Validate service is active for the instance
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
function validateServiceActive(instance, res, instanceId) {
  if (!instance.service_active) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.serviceUnavailable(res, 'Reddit service is currently disabled', {
        instanceId
      })
    };
  }
  
  return { isValid: true, errorResponse: undefined };
}

/**
 * Validate instance status is not inactive or expired
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
function validateInstanceStatus(instance, res, instanceId) {
  if (instance.status === 'inactive') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance is paused', {
        instanceId
      })
    };
  }

  if (instance.status === 'expired') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance has expired', {
        instanceId
      })
    };
  }
  
  return { isValid: true, errorResponse: undefined };
}

/**
 * Validate instance has not expired based on expiration timestamp
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
function validateInstanceNotExpired(instance, res, instanceId) {
  if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance has expired', {
        instanceId,
        expiresAt: instance.expires_at
      })
    };
  }
  
  return { isValid: true, errorResponse: undefined };
}

/**
 * Validate OAuth credentials configuration
 * @param {import('./types.js').DatabaseInstance} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
function validateOAuthCredentials(instance, res, instanceId) {
  if (instance.auth_type !== 'oauth' || !instance.client_id || !instance.client_secret) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.internal(res, 'Invalid OAuth credentials configuration', {
        instanceId
      })
    };
  }
  
  return { isValid: true, errorResponse: undefined };
}

/**
 * Perform complete instance validation chain
 * @param {import('./types.js').DatabaseInstance | null | undefined} instance - Database instance object
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {boolean} [requireOAuth] - Whether to validate OAuth credentials
 * @returns {import('./types.js').InstanceValidationResult} Validation result
 */
function validateInstance(instance, res, instanceId, requireOAuth = true) {
  // Check if instance exists
  const existsValidation = validateInstanceExists(instance, res, instanceId);
  if (!existsValidation.isValid) {
    return existsValidation;
  }

  // TypeScript assertion: instance is defined after existence validation
  const validInstance = /** @type {import('./types.js').DatabaseInstance} */ (instance);

  // Check if service is active
  const serviceValidation = validateServiceActive(validInstance, res, instanceId);
  if (!serviceValidation.isValid) {
    return serviceValidation;
  }

  // Check instance status
  const statusValidation = validateInstanceStatus(validInstance, res, instanceId);
  if (!statusValidation.isValid) {
    return statusValidation;
  }

  // Check expiration
  const expirationValidation = validateInstanceNotExpired(validInstance, res, instanceId);
  if (!expirationValidation.isValid) {
    return expirationValidation;
  }

  // Check OAuth credentials if required
  if (requireOAuth) {
    const oauthValidation = validateOAuthCredentials(validInstance, res, instanceId);
    if (!oauthValidation.isValid) {
      return oauthValidation;
    }
  }

  return { isValid: true, errorResponse: undefined };
}