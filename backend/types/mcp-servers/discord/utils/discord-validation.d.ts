/**
 * Validates a Discord Bearer token by making an API call
 * @param {string} token - The Bearer token to validate
 * @returns {Promise<Object>} Validation result
 */
export function validateDiscordToken(token: string): Promise<Object>;
/**
 * Validates Bearer token format without making API calls
 * @param {string} token - The Bearer token to validate
 * @returns {Object} Format validation result
 */
export function validateTokenFormat(token: string): Object;
/**
 * Sanitizes token for logging (replaces most characters with *)
 * @param {string} token - The token to sanitize
 * @returns {string} Sanitized token
 */
export function sanitizeTokenForLogging(token: string): string;
//# sourceMappingURL=discord-validation.d.ts.map