// @ts-check
import { testAPICredentials } from '../../services/credentialValidationService.js';

/**
 * Validate OAuth credentials for different providers
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function validateOAuthCredentials(req, res) {
	try {
		const { service, credentials } = req.body;

		if (!service || !credentials) {
			return res.status(400).json({
				success: false,
				error: 'Service and credentials are required',
				details: {
					field: !service ? 'service' : 'credentials',
					reason: 'Missing required field'
				}
			});
		}

		const result = {
			valid: false,
			api_info: null,
			error_code: null,
			error_message: null,
			details: null,
		};

		// Use modular validation system
		try {
			const testResult = /** @type {any} */ (await testAPICredentials(service, credentials, false));
			
			if (testResult.valid) {
				result.valid = true;
				result.api_info = testResult.api_info;
			} else {
				result.error_code = testResult.error_code;
				result.error_message = testResult.error_message;
				result.details = testResult.details;
			}
		} catch (/** @type {any} */ error) {
			console.error('OAuth validation error:', error);
			result.error_code = 'VALIDATION_ERROR';
			result.error_message = 'Failed to validate OAuth credentials';
			result.details = {
				error: error.message,
			};
		}

		// Return appropriate status code based on validation result
		if (result.valid) {
			res.status(200).json(result);
		} else {
			res.status(400).json(result);
		}

	} catch (error) {
		console.error('OAuth validation controller error:', error);
		res.status(500).json({
			valid: false,
			api_info: null,
			error_code: 'INTERNAL_ERROR',
			error_message: 'Internal server error during OAuth validation',
			details: {
				error: error.message,
			},
		});
	}
}