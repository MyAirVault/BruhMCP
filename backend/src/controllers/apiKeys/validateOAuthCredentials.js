// @ts-check
import { testAPICredentials } from '../../services/credentialValidationService.js';

/**
 * Validate OAuth credentials for different providers
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function validateOAuthCredentials(req, res) {
	try {
		const { service, credentials } = req.body;

		if (!service || !credentials) {
			res.status(400).json({
				success: false,
				error: 'Service and credentials are required',
				details: {
					field: !service ? 'service' : 'credentials',
					reason: 'Missing required field'
				}
			});
			return;
		}

		/** @type {{ valid: boolean, api_info: any, error_code: string | null, error_message: string | null, details: any }} */
		const result = {
			valid: false,
			api_info: null,
			error_code: null,
			error_message: null,
			details: null,
		};

		// Use modular validation system
		try {
			/** @type {{ valid: boolean, api_info: any, error_code: string, error_message: string, details: any }} */
			const testResult = await testAPICredentials(service, credentials, false);
			
			if (testResult.valid) {
				result.valid = true;
				result.api_info = testResult.api_info;
			} else {
				result.error_code = testResult.error_code;
				result.error_message = testResult.error_message;
				result.details = testResult.details;
			}
		} catch (/** @type {unknown} */ error) {
			console.error('OAuth validation error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			result.error_code = 'VALIDATION_ERROR';
			result.error_message = 'Failed to validate OAuth credentials';
			result.details = {
				error: errorMessage,
			};
		}

		// Return appropriate status code based on validation result
		if (result.valid) {
			res.status(200).json(result);
			return;
		} else {
			res.status(400).json(result);
			return;
		}

	} catch (/** @type {unknown} */ error) {
		console.error('OAuth validation controller error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		res.status(500).json({
			valid: false,
			api_info: null,
			error_code: 'INTERNAL_ERROR',
			error_message: 'Internal server error during OAuth validation',
			details: {
				error: errorMessage,
			},
		});
		return;
	}
}