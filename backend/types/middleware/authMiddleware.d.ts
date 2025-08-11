/**
 * Legacy requireAuth middleware for backward compatibility
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireAuth: typeof authenticateToken;
/**
 * Legacy authenticate middleware for backward compatibility
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate: typeof authenticateToken;
import { authenticateToken } from "./auth.js";
export { authenticateToken };
//# sourceMappingURL=authMiddleware.d.ts.map