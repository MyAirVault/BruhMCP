/**
 * @fileoverview Validation utilities for Google Sheets middleware
 * Handles instance ID and instance validation
 */

/// <reference path="./types.js" />

import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Validate instance ID format (UUID v4)
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} Whether instance ID is valid
 */
export function isValidInstanceId(instanceId) {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(instanceId);
}

/**
 * Create instance ID validation error response
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Invalid instance ID
 * @returns {any} Error response
 */
export function createInstanceIdValidationError(res, instanceId) {
	return ErrorResponses.badRequest(res, 'Invalid instance ID format', {
		instanceId
	});
}

/**
 * Validate database instance
 * @param {import('./types.js').DatabaseInstance|null} instance - Database instance
 * @param {import('./types.js').ExpressResponse} res - Express response object
 * @param {string} instanceId - Instance ID
 * @param {boolean} [checkOAuth=false] - Whether to check OAuth configuration
 * @returns {import('./types.js').ValidationResult} Validation result
 */
export function validateInstance(instance, res, instanceId, checkOAuth = false) {
	// Check if instance exists
	if (!instance) {
		return {
			isValid: false,
			errorResponse: ErrorResponses.notFound(res, 'Instance', {
				instanceId
			})
		};
	}

	// Validate service is active
	if (!instance.service_active) {
		return {
			isValid: false,
			errorResponse: ErrorResponses.serviceUnavailable(res, 'Google Sheets service is currently disabled', {
				instanceId
			})
		};
	}

	// Validate instance status
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

	// Check expiration time
	if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
		return {
			isValid: false,
			errorResponse: ErrorResponses.forbidden(res, 'Instance has expired', {
				instanceId
			})
		};
	}

	// Validate OAuth credentials if requested
	if (checkOAuth) {
		if (instance.auth_type !== 'oauth' || !instance.client_id || !instance.client_secret) {
			return {
				isValid: false,
				errorResponse: ErrorResponses.internal(res, 'Invalid OAuth credentials configuration', {
					instanceId
				})
			};
		}
	}

	return { isValid: true };
}