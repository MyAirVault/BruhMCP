/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export function hashPassword(password: string): Promise<string>;
/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Password match result
 */
export function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Validate password strength
 * @param {string} password - Plain text password
 * @returns {Object} Validation result with isValid and errors
 */
export function validatePasswordStrength(password: string): Object;
/**
 * Generate random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} Generated password
 */
export function generateRandomPassword(length?: number): string;
//# sourceMappingURL=password.d.ts.map