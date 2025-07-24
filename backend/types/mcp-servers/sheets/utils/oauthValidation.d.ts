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
export function isValidTokenFormat(token: string, tokenType?: string): boolean;
/**
 * Check if token has expired
 * @param {number|Date|string} expiresAt - Expiration time
 * @returns {boolean} Whether token has expired
 */
export function isTokenExpired(expiresAt: number | Date | string): boolean;
/**
 * Calculate token lifetime
 * @param {number} expiresIn - Seconds until expiration
 * @returns {Date} Expiration date
 */
export function calculateTokenExpiry(expiresIn: number): Date;
//# sourceMappingURL=oauthValidation.d.ts.map