/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Create new MCP instance with multi-tenant support
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function createMCP(req: Request, res: Response): Promise<void | import("express").Response<any, Record<string, any>>>;
/**
 * Validate credentials against external service (optional)
 * This can be called before instance creation for real-time validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function validateMCPCredentials(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=createMCP.d.ts.map