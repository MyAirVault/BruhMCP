/**
 * Generate JWT token for user
 * @param {import('../types/index.js').User} user
 */
export function generateJWT(user: import('../types/index.js').User): never;
/**
 * Verify JWT token
 * @param {string} token
 */
export function verifyJWT(token: string): string | jwt.JwtPayload | null;
import jwt from 'jsonwebtoken';
//# sourceMappingURL=jwt.d.ts.map
