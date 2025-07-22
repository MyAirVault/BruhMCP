/**
 * Generate JWT token for user
 * @param {{id: string, email: string}} user
 * @returns {string} JWT token
 */
export function generateJWT(user: {
    id: string;
    email: string;
}): string;
/**
 * Verify JWT token
 * @param {string} token
 * @returns {any} Decoded payload or null
 */
export function verifyJWT(token: string): any;
//# sourceMappingURL=jwt.d.ts.map