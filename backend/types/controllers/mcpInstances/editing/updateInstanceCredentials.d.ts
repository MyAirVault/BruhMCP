/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Update MCP instance credentials with validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function updateInstanceCredentials(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
/**
 * Validate credentials only (without updating database)
 * Useful for testing credentials before committing to update
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function validateInstanceCredentialsOnly(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=updateInstanceCredentials.d.ts.map