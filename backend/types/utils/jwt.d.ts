/**
 * Generate JWT token for user
 * @param {import('../types/index.js').User} user
 * @returns {string} JWT token
 */
export function generateJWT(user: import('../types/index.js').User): string;
/**
 * Verify JWT token
 * @param {string} token
 * @returns {any} Decoded payload or null
 */
export function verifyJWT(token: string): any;
//# sourceMappingURL=jwt.d.ts.map
