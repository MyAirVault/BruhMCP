/**
 * Request authentication token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function requestToken(req: import("express").Request, res: import("express").Response): Promise<void | import("express").Response<any, Record<string, any>>>;
/**
 * Verify authentication token and create session
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function verifyToken(req: import("express").Request, res: import("express").Response): Promise<void | import("express").Response<any, Record<string, any>>>;
/**
 * Get current user information
 * @param {import('express').Request & { user: { id: string; email: string } }} req
 * @param {import('express').Response} res
 */
export function getCurrentUser(req: import("express").Request & {
    user: {
        id: string;
        email: string;
    };
}, res: import("express").Response): Promise<void | import("express").Response<any, Record<string, any>>>;
/**
 * Get current user's plan summary with usage information
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getUserPlan(req: import("express").Request, res: import("express").Response): Promise<void | import("express").Response<any, Record<string, any>>>;
/**
 * Logout user and clear authentication cookie
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
export function logout(_req: import("express").Request, res: import("express").Response): Promise<void | import("express").Response<any, Record<string, any>>>;
export type AuthRequestTokenResult = import("../types/auth.d.ts").AuthRequestTokenResult;
export type AuthVerifyTokenResult = import("../types/auth.d.ts").AuthVerifyTokenResult;
//# sourceMappingURL=authController.d.ts.map