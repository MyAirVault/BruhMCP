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
declare function isValidTokenFormat(token: string, tokenType?: string): boolean;
/**
 * Check if token has expired
 * @param {number|Date|string} expiresAt - Expiration time
 * @returns {boolean} Whether token has expired
 */
declare function isTokenExpired(expiresAt: number | Date | string): boolean;
/**
 * Calculate token lifetime
 * @param {number} expiresIn - Seconds until expiration
 * @returns {Date} Expiration date
 */
declare function calculateTokenExpiry(expiresIn: number): Date;
//# sourceMappingURL=oauthValidation.d.ts.map