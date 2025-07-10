/**
 * Request authentication token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function requestToken(req: import("express").Request, res: import("express").Response): Promise<import("express").Response<any, Record<string, any>>>;
/**
 * Verify authentication token and create session
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function verifyToken(req: import("express").Request, res: import("express").Response): Promise<import("express").Response<any, Record<string, any>>>;
/**
 * Get current user information
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getCurrentUser(req: import("express").Request, res: import("express").Response): Promise<import("express").Response<any, Record<string, any>>>;
/**
 * Logout user and clear authentication cookie
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function logout(_req: import("express").Request, res: import("express").Response): Promise<import("express").Response<any, Record<string, any>>>;
//# sourceMappingURL=authController.d.ts.map