/**
 * @fileoverview Validation utilities for Google Drive OAuth middleware
 */

/// <reference path="./types.js" />

import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Validates if a string is a valid UUID v4
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} Whether the instance ID is valid
 */
export function isValidInstanceId(instanceId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(instanceId);
}

/**
 * Creates an error response for invalid instance ID
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - The invalid instance ID
 * @returns {void}
 */
export function createInstanceIdValidationError(res, instanceId) {
  return ErrorResponses.badRequest(res, 'Invalid instance ID format', {
    instanceId,
    expectedFormat: 'UUID v4'
  });
}

/**
 * Validates database instance and creates appropriate error responses
 * @param {import('./types.js').DatabaseInstance|null} instance - Database instance
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Instance ID
 * @param {boolean} requireOAuth - Whether OAuth completion is required
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateInstance(instance, res, instanceId, requireOAuth = true) {
  if (!instance) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.notFound(res, 'Instance', {
        instanceId,
        service: 'googledrive'
      })
    };
  }

  // Validate service is active
  if (!instance.service_active) {
    return {
      isValid: false,
      errorResponse: ErrorResponses.serviceUnavailable(res, 'Google Drive service is currently disabled', {
        instanceId,
        service: 'googledrive'
      })
    };
  }

  // Validate instance status
  if (instance.status === 'inactive') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.forbidden(res, 'Instance is paused', {
        instanceId,
        status: instance.status
      })
    };
  }

  // Check OAuth status
  if (requireOAuth && instance.oauth_status !== 'completed') {
    return {
      isValid: false,
      errorResponse: ErrorResponses.unauthorized(res, 'OAuth authentication required', {
        instanceId,
        oauthStatus: instance.oauth_status,
        message: 'Please complete OAuth authentication before using this instance'
      })
    };
  }

  return { isValid: true };
}

/**
 * Validates request body for JSON-RPC requests
 * @param {any} body - Request body
 * @returns {boolean} Whether the body is valid
 */
export function isValidJsonRpcRequest(body) {
  return body && 
         typeof body === 'object' && 
         body.jsonrpc === '2.0' && 
         (body.id !== undefined) &&
         typeof body.method === 'string';
}

/**
 * Creates an error response for invalid JSON-RPC request
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} message - Error message
 * @returns {void}
 */
export function createJsonRpcError(res, message) {
  res.status(400).json({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32600,
      message: 'Invalid Request',
      data: { details: message }
    }
  });
}