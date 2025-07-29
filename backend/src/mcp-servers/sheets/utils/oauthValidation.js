/**
 * @fileoverview OAuth validation utilities for Google Sheets
 * Handles token validation and format checking
 */

/**
 * Validate OAuth token format
 * @param {string} token - Token to validate
 * @param {string} tokenType - Type of token (access or refresh)
 * @returns {boolean} Whether token is valid
 */
function isValidTokenFormat(token, tokenType = 'access') {
	if (!token || typeof token !== 'string') {
		return false;
	}

	// Google OAuth tokens have specific characteristics
	if (tokenType === 'access') {
		// Access tokens are typically longer
		return token.length >= 50;
	} else if (tokenType === 'refresh') {
		// Refresh tokens are typically shorter but still substantial
		return token.length >= 30;
	}

	return false;
}

/**
 * Check if token has expired
 * @param {number|Date|string} expiresAt - Expiration time
 * @returns {boolean} Whether token has expired
 */
function isTokenExpired(expiresAt) {
	if (!expiresAt) {
		return true;
	}

	const expiry = typeof expiresAt === 'number' ? expiresAt : new Date(expiresAt).getTime();
	return expiry <= Date.now();
}

/**
 * Calculate token lifetime
 * @param {number} expiresIn - Seconds until expiration
 * @returns {Date} Expiration date
 */
function calculateTokenExpiry(expiresIn) {
	return new Date(Date.now() + (expiresIn * 1000));
}