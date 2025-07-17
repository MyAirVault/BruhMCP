/**
 * Discord Token Validation Utilities
 * Validates Discord Bearer tokens for OAuth users
 */

import { DiscordAPI } from '../api/discord-api.js';

/**
 * Validates a Discord Bearer token by making an API call
 * @param {string} token - The Bearer token to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateDiscordToken(token) {
	try {
		if (!token || typeof token !== 'string') {
			return {
				valid: false,
				error: 'Invalid token format',
				tokenType: 'bearer',
			};
		}

		// Basic format validation
		if (token.length < 10) {
			return {
				valid: false,
				error: 'Bearer token too short',
				tokenType: 'bearer',
			};
		}

		// Create API instance for validation
		const api = new DiscordAPI(token);

		// Validate token by getting current user
		const userResult = await api.getCurrentUser();

		if (!userResult.success) {
			return {
				valid: false,
				error: userResult.error || 'Token validation failed',
				tokenType: 'bearer',
				statusCode: userResult.statusCode,
			};
		}

		// Token is valid
		return {
			valid: true,
			tokenType: 'bearer',
			userId: userResult.data?.id || null,
			username: userResult.data?.username || null,
			discriminator: userResult.data?.discriminator || null,
			bot: userResult.data?.bot || false,
		};
	} catch (error) {
		console.error('Discord token validation error:', error);
		return {
			valid: false,
			error: error.message || 'Validation error',
			tokenType: 'bearer',
		};
	}
}

/**
 * Validates Bearer token format without making API calls
 * @param {string} token - The Bearer token to validate
 * @returns {Object} Format validation result
 */
export function validateTokenFormat(token) {
	if (!token || typeof token !== 'string') {
		return {
			valid: false,
			error: 'Token must be a non-empty string',
			tokenType: 'bearer',
		};
	}

	// Bearer tokens should be at least 10 characters
	if (token.length < 10) {
		return {
			valid: false,
			error: 'Bearer token too short',
			tokenType: 'bearer',
		};
	}

	// Bearer tokens should not contain spaces
	if (token.includes(' ')) {
		return {
			valid: false,
			error: 'Bearer token should not contain spaces',
			tokenType: 'bearer',
		};
	}

	return {
		valid: true,
		tokenType: 'bearer',
	};
}

/**
 * Sanitizes token for logging (replaces most characters with *)
 * @param {string} token - The token to sanitize
 * @returns {string} Sanitized token
 */
export function sanitizeTokenForLogging(token) {
	if (!token || typeof token !== 'string') {
		return '[INVALID_TOKEN]';
	}

	if (token.length <= 8) {
		return '*'.repeat(token.length);
	}

	// Show first 4 and last 4 characters
	const start = token.substring(0, 4);
	const end = token.substring(token.length - 4);
	const middle = '*'.repeat(Math.max(0, token.length - 8));

	return `${start}${middle}${end}`;
}
